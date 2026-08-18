import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TableSkeleton } from "@/components/loading";
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
import { useCategories, useDeleteCategory } from "@/hooks/useCatalog";
import { usePermissions } from "@/hooks/usePermissions";
import { ApiError } from "@/lib/api";

export function CategoryListPage() {
  const { canCreate, canUpdate, canDelete } = usePermissions();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const categories = useCategories({ q, page, limit: 20 });
  const remove = useDeleteCategory();

  async function handleDelete() {
    if (!pendingId) return;
    try {
      await remove.mutateAsync(pendingId);
      toast.success("Category removed.");
      setPendingId(null);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not delete this category.";
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Unstitched, Pret, Festive, Accessories, and New In. Lawn is a fabric, not a category. New In is navigational."
        action={
          canCreate ? (
            <Button asChild>
              <Link to="/categories/new">Add category</Link>
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
        <Input name="q" placeholder="Search categories" defaultValue={q} />
        <Button type="submit" variant="outline" pending={categories.isFetching}>
          {categories.isFetching ? "Searching" : "Search"}
        </Button>
      </form>
      {categories.isLoading ? (
        <TableSkeleton columns={["Name", "Slug", "Status"]} />
      ) : categories.isError ? (
        <EmptyState title="Could not load categories" body="Try again in a moment." />
      ) : !categories.data?.data.length ? (
        <EmptyState
          title="No categories yet"
          body="Add Unstitched, Pret, Festive, Accessories, and New In so the edit can be browsed the way the storefront already is."
          action={canCreate ? { to: "/categories/new", label: "Add category" } : undefined}
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
              {categories.data.data.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>
                    <Badge variant={category.is_active ? "secondary" : "outline"}>
                      {category.is_active ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canUpdate ? (
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/categories/${category.id}`}>Edit</Link>
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <Button variant="ghost" size="sm" onClick={() => setPendingId(category.id)}>
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
      <PaginationBar page={page} limit={20} total={categories.data?.total ?? 0} onPage={setPage} />
      <ConfirmDialog
        open={Boolean(pendingId)}
        title="Remove this category?"
        body="Categories with pieces cannot be deleted. Move those pieces first. Lawn should stay a fabric on the product, not a category here."
        pending={remove.isPending}
        onOpenChange={(open) => {
          if (!open) setPendingId(null);
        }}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
