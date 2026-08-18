import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState, LoadingState, PageHeader, PaginationBar } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteProduct, useProducts } from "@/hooks/useCatalog";
import { usePermissions } from "@/hooks/usePermissions";
import { ApiError } from "@/lib/api";
import { formatPkr } from "@/lib/utils";
import type { Availability, ProductStatus } from "@/types/api";

const AVAILABILITY_LABEL: Record<Availability, string> = {
  IN_STOCK: "In stock",
  LOW_STOCK: "Low stock",
  OUT_OF_STOCK: "Sold out",
  PRE_ORDER: "Pre-order",
};

export function ProductListPage() {
  const { canCreate, canUpdate, canDelete } = usePermissions();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ProductStatus | "">("");
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const products = useProducts({
    q,
    page,
    limit: 20,
    status: status || undefined,
  });
  const remove = useDeleteProduct();

  async function handleDelete() {
    if (!pendingId) return;
    try {
      await remove.mutateAsync(pendingId);
      toast.success("Piece removed from the edit.");
      setPendingId(null);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not delete this piece.";
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        description="Pieces in the HOORAIN edit. Stock changes belong on the inventory ledger, not on this form after create."
        action={
          canCreate ? (
            <Button asChild>
              <Link to="/products/new">Add product</Link>
            </Button>
          ) : null
        }
      />
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          setQ(String(form.get("q") ?? ""));
          setStatus(String(form.get("status") ?? "") as ProductStatus | "");
          setPage(1);
        }}
      >
        <Input name="q" placeholder="Search name, SKU, fabric" className="max-w-xs" defaultValue={q} />
        <NativeSelect name="status" className="w-40" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </NativeSelect>
        <Button type="submit" variant="outline" disabled={products.isFetching}>
          {products.isFetching ? "Searching" : "Search"}
        </Button>
      </form>
      {products.isLoading ? (
        <LoadingState title="Loading products" body="Fetching pieces in the edit." />
      ) : products.isError ? (
        <EmptyState title="Could not load products" body="The edit could not be fetched. Try again in a moment." />
      ) : !products.data?.data.length ? (
        <EmptyState
          title="The edit is empty"
          body="Add unstitched lawn, pret, and festive pieces. Brands are catalogue labels only."
          action={canCreate ? { to: "/products/new", label: "Add product" } : undefined}
        />
      ) : (
        <div className="border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Piece</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.data.data.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <p>{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.fabric ?? "Fabric unset"}</p>
                    </div>
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.brand.name}</TableCell>
                  <TableCell>{formatPkr(product.price)}</TableCell>
                  <TableCell>
                    {product.available_stock}{" "}
                    <span className="text-xs text-muted-foreground">
                      {AVAILABILITY_LABEL[product.availability]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === "ACTIVE" ? "secondary" : "outline"}>{product.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/products/${product.id}`}>{canUpdate ? "Edit" : "View"}</Link>
                    </Button>
                    {canDelete ? (
                      <Button variant="ghost" size="sm" onClick={() => setPendingId(product.id)}>
                        Delete
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <PaginationBar page={page} limit={20} total={products.data?.total ?? 0} onPage={setPage} />
      <ConfirmDialog
        open={Boolean(pendingId)}
        title="Remove this piece?"
        body="If it is already on an order, archive it instead. Hard delete is only for pieces that have never been sold."
        pending={remove.isPending}
        onOpenChange={(open) => {
          if (!open) setPendingId(null);
        }}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
