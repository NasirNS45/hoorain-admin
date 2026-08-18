import { useState } from "react";
import { Link } from "react-router";
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
import { formatPkr } from "@/lib/utils";

const COPY: Record<string, { title: string; description: string; empty: string }> = {
  all: {
    title: "Orders",
    description: "Prepaid orders from the storefront. Payment is card via Safepay. JazzCash and EasyPaisa are coming soon.",
    empty: "No orders yet. When a shopper pays on Safepay, the order will appear here.",
  },
  pending: {
    title: "Pending orders",
    description: "Unpaid checkouts waiting on Safepay. Stock is reserved until pay or cancel.",
    empty: "No unpaid orders. Abandoned Safepay sessions will land here until they are cancelled.",
  },
  confirmed: {
    title: "Confirmed orders",
    description: "Paid orders ready to pack. Payment already confirmed them.",
    empty: "No paid orders yet. Successful Safepay checkouts will list here.",
  },
  processing: {
    title: "Processing orders",
    description: "Packed, ready, and out for delivery.",
    empty: "Nothing is being packed or delivered right now.",
  },
  delivered: {
    title: "Delivered orders",
    description: "Completed deliveries and their PKR totals.",
    empty: "No delivered orders yet.",
  },
  cancelled: {
    title: "Cancelled orders",
    description: "Cancelled checkouts and returned pieces.",
    empty: "No cancelled or returned orders.",
  },
};

export function OrderListPage({ group = "all" }: { group?: keyof typeof COPY }) {
  const copy = COPY[group];
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const orders = useOrders({
    q,
    page,
    limit: 20,
    status: group === "all" ? undefined : group,
  });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Orders" title={copy.title} description={copy.description} />
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
