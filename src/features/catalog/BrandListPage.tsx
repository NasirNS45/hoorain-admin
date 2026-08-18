import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState, PageHeader, PaginationBar } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBrands, useDeleteBrand } from "@/hooks/useCatalog";
import { usePermissions } from "@/hooks/usePermissions";
import { ApiError } from "@/lib/api";

export function BrandListPage() {
  const { canCreate, canUpdate, canDelete } = usePermissions();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const brands = useBrands({ q, page, limit: 20 });
  const remove = useDeleteBrand();

  async function handleDelete() {
    if (!pendingId) return;
    try {
      await remove.mutateAsync(pendingId);
      toast.success("Brand removed from the catalogue.");
      setPendingId(null);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not delete this brand.";
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Brands"
        description="Catalogue labels only. HOORAIN is not an official retailer or authorised seller of these names."
        action={
          canCreate ? (
            <Button asChild>
              <Link to="/brands/new">Add brand</Link>
            </Button>
          ) : null
        }
      />
      <form
        className="flex max-w-md gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          setQ(String(form.get("q") ?? ""));
          setPage(1);
        }}
      >
        <Input name="q" placeholder="Search brands" defaultValue={q} />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>
      {brands.isError ? (
        <EmptyState title="Could not load brands" body="The catalogue labels could not be fetched. Try again in a moment." />
      ) : !brands.data?.data.length ? (
        <EmptyState
          title="No brands in the edit"
          body="Add catalogue labels such as Bonanza or Sapphire. These names describe the piece, not an affiliation."
          action={canCreate ? { to: "/brands/new", label: "Add brand" } : undefined}
        />
      ) : (
        <div className="border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.data.data.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>{brand.name}</TableCell>
                  <TableCell>{brand.slug}</TableCell>
                  <TableCell>
                    <Badge variant={brand.is_active ? "secondary" : "outline"}>
                      {brand.is_active ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canUpdate ? (
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/brands/${brand.id}`}>Edit</Link>
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <Button variant="ghost" size="sm" onClick={() => setPendingId(brand.id)}>
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
      <PaginationBar
        page={page}
        limit={20}
        total={brands.data?.total ?? 0}
        onPage={setPage}
      />
      <ConfirmDialog
        open={Boolean(pendingId)}
        title="Remove this brand?"
        body="Only empty brands can be deleted. If pieces still use this label, move them first."
        pending={remove.isPending}
        onOpenChange={(open) => {
          if (!open) setPendingId(null);
        }}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
