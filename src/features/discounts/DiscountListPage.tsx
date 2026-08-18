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
import { useDeleteDiscount, useDiscounts } from "@/hooks/useDiscounts";
import { usePermissions } from "@/hooks/usePermissions";
import { ApiError } from "@/lib/api";
import { formatPkr } from "@/lib/utils";
import type { Discount } from "@/types/api";

function valueLabel(discount: Discount) {
  if (discount.discount_type === "PERCENTAGE") {
    return `${Number(discount.value)}%`;
  }
  return formatPkr(discount.value);
}

function windowLabel(discount: Discount) {
  if (!discount.starts_at && !discount.ends_at) return "Open";
  const start = discount.starts_at ? new Date(discount.starts_at).toLocaleDateString("en-PK") : "Open";
  const end = discount.ends_at ? new Date(discount.ends_at).toLocaleDateString("en-PK") : "Open";
  return `${start} to ${end}`;
}

function scopeLabel(discount: Discount) {
  if (discount.product_ids.length === 0 && discount.collection_ids.length === 0) {
    return "Store-wide";
  }
  const parts: string[] = [];
  if (discount.product_ids.length) parts.push(`${discount.product_ids.length} pieces`);
  if (discount.collection_ids.length) parts.push(`${discount.collection_ids.length} collections`);
  return parts.join(", ");
}

export function DiscountListPage() {
  const { canCreate, canUpdate, canDelete } = usePermissions();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const discounts = useDiscounts({ q, page, limit: 20 });
  const remove = useDeleteDiscount();

  async function handleDelete() {
    if (!pendingId) return;
    try {
      await remove.mutateAsync(pendingId);
      toast.success("Campaign removed.");
      setPendingId(null);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not delete this campaign.";
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Marketing"
        title="Discounts"
        description="Automatic sale campaigns. The storefront shows the lowest matching selling price. Campaigns do not stack, and stored catalogue prices stay unchanged."
        action={
          canCreate ? (
            <Button asChild>
              <Link to="/discounts/new">Add campaign</Link>
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
        <Input name="q" placeholder="Search campaigns" defaultValue={q} />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>
      {discounts.isError ? (
        <EmptyState
          title="Could not load discounts"
          body="Sale campaigns could not be fetched. Try again in a moment."
        />
      ) : !discounts.data?.data.length ? (
        <EmptyState
          title="No sale campaigns yet"
          body="Add a percentage or fixed PKR campaign. Leave products and collections empty for a store-wide sale."
          action={canCreate ? { to: "/discounts/new", label: "Add campaign" } : undefined}
        />
      ) : (
        <div className="border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Window</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.data.data.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell>{discount.name}</TableCell>
                  <TableCell>
                    {discount.discount_type === "PERCENTAGE" ? "Percentage" : "Fixed amount"}
                  </TableCell>
                  <TableCell>{valueLabel(discount)}</TableCell>
                  <TableCell>{windowLabel(discount)}</TableCell>
                  <TableCell>{scopeLabel(discount)}</TableCell>
                  <TableCell>
                    <Badge variant={discount.is_active ? "secondary" : "outline"}>
                      {discount.is_active ? "Active" : "Off"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canUpdate ? (
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/discounts/${discount.id}`}>Edit</Link>
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <Button variant="ghost" size="sm" onClick={() => setPendingId(discount.id)}>
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
        total={discounts.data?.total ?? 0}
        onPage={setPage}
      />
      <ConfirmDialog
        open={Boolean(pendingId)}
        title="Remove this campaign?"
        body="The stored catalogue prices stay the same. Live sale prices stop applying as soon as the campaign is gone."
        pending={remove.isPending}
        onOpenChange={(open) => {
          if (!open) setPendingId(null);
        }}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
