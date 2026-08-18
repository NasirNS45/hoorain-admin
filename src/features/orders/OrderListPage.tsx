import { useState } from "react";
import { Link, useSearchParams } from "react-router";
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
import { useOrders } from "@/hooks/useOrders";
import { cn, formatPkr } from "@/lib/utils";

const GROUPS = ["all", "pending", "confirmed", "processing", "delivered", "cancelled"] as const;

type OrderGroup = (typeof GROUPS)[number];

const COPY: Record<OrderGroup, { label: string; description: string; empty: string }> = {
  all: {
    label: "All",
    description:
      "Prepaid orders from the storefront. Payment is card via Safepay. JazzCash and EasyPaisa are coming soon.",
    empty: "No orders yet. When a shopper pays on Safepay, the order will appear here.",
  },
  pending: {
    label: "Pending",
    description: "Unpaid checkouts waiting on Safepay. Stock is reserved until pay or cancel.",
    empty: "No unpaid orders. Abandoned Safepay sessions will land here until they are cancelled.",
  },
  confirmed: {
    label: "Confirmed",
    description: "Paid orders ready to pack. Payment already confirmed them.",
    empty: "No paid orders yet. Successful Safepay checkouts will list here.",
  },
  processing: {
    label: "Processing",
    description: "Packed, ready, and out for delivery.",
    empty: "Nothing is being packed or delivered right now.",
  },
  delivered: {
    label: "Delivered",
    description: "Completed deliveries and their PKR totals.",
    empty: "No delivered orders yet.",
  },
  cancelled: {
    label: "Cancelled",
    description: "Cancelled checkouts and returned pieces.",
    empty: "No cancelled or returned orders.",
  },
};

function parseGroup(value: string | null): OrderGroup {
  if (value && GROUPS.includes(value as OrderGroup)) return value as OrderGroup;
  return "all";
}

export function OrderListPage() {
  const [params, setParams] = useSearchParams();
  const group = parseGroup(params.get("status"));
  const copy = COPY[group];
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const orders = useOrders({
    q,
    page,
    limit: 20,
    status: group === "all" ? undefined : group,
  });

  function setGroup(next: OrderGroup) {
    const nextParams = new URLSearchParams(params);
    if (next === "all") nextParams.delete("status");
    else nextParams.set("status", next);
    setParams(nextParams, { replace: true });
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Orders" title="Orders" description={copy.description} />
      <div className="flex flex-wrap gap-1 border-b border-border">
        {GROUPS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setGroup(item)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm",
              group === item
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {COPY[item].label}
          </button>
        ))}
      </div>
      <form
        className="flex max-w-md gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          setQ(String(form.get("q") ?? ""));
          setPage(1);
        }}
      >
        <Input name="q" placeholder="Search order, name, or phone" defaultValue={q} />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>
      {orders.isError ? (
        <EmptyState title="Could not load orders" body="The order list could not be fetched." />
      ) : !orders.data?.data.length ? (
        <EmptyState title="No orders" body={copy.empty} />
      ) : (
        <div className="border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.data.data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <p>{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">{order.fulfillment}</p>
                  </TableCell>
                  <TableCell>
                    <p>{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                  </TableCell>
                  <TableCell>{formatPkr(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{order.payment_status}</Badge>{" "}
                    <span className="text-xs text-muted-foreground">{order.payment_method}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/orders/${order.id}`}>Open</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <PaginationBar page={page} limit={20} total={orders.data?.total ?? 0} onPage={setPage} />
    </div>
  );
}
