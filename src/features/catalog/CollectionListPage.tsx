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
import { useCollections, useDeleteCollection } from "@/hooks/useCatalog";
import { usePermissions } from "@/hooks/usePermissions";
import { ApiError } from "@/lib/api";

export function CollectionListPage() {
  const { canCreate, canUpdate, canDelete } = usePermissions();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const collections = useCollections({ q, page, limit: 20 });
  const remove = useDeleteCollection();

  async function handleDelete() {
    if (!pendingId) return;
    try {
      await remove.mutateAsync(pendingId);
      toast.success("Collection removed.");
      setPendingId(null);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not delete this collection.";
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Collections"
        description="New Arrivals, The HOORAIN Edit, Summer Edit, Festive Edit, and Sale."
        action={
          canCreate ? (
            <Button asChild>
              <Link to="/collections/new">Add collection</Link>
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
        <Input name="q" placeholder="Search collections" defaultValue={q} />
        <Button type="submit" variant="outline" pending={collections.isFetching}>
          {collections.isFetching ? "Searching" : "Search"}
        </Button>
      </form>
      {collections.isLoading ? (
        <TableSkeleton columns={["Name", "Slug", "Status"]} />
      ) : collections.isError ? (
        <EmptyState title="Could not load collections" body="Try again in a moment." />
      ) : !collections.data?.data.length ? (
        <EmptyState
          title="No collections yet"
          body="Group pieces into New Arrivals, The HOORAIN Edit, Summer Edit, Festive Edit, or Sale."
          action={canCreate ? { to: "/collections/new", label: "Add collection" } : undefined}
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
              {collections.data.data.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell>{collection.name}</TableCell>
                  <TableCell>{collection.slug}</TableCell>
                  <TableCell>
                    <Badge variant={collection.is_active ? "secondary" : "outline"}>
                      {collection.is_active ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canUpdate ? (
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/collections/${collection.id}`}>Edit</Link>
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <Button variant="ghost" size="sm" onClick={() => setPendingId(collection.id)}>
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
      <PaginationBar page={page} limit={20} total={collections.data?.total ?? 0} onPage={setPage} />
      <ConfirmDialog
        open={Boolean(pendingId)}
        title="Remove this collection?"
        body="Pieces stay in the catalogue. They are only removed from this grouping."
        pending={remove.isPending}
        onOpenChange={(open) => {
          if (!open) setPendingId(null);
        }}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
