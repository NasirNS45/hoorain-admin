import { useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "@/components/PageHeader";
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
import { useCustomer, useUpdateCustomer } from "@/hooks/useOrders";
import { usePermissions } from "@/hooks/usePermissions";
import { ApiError } from "@/lib/api";
import { formatPkr } from "@/lib/utils";
import type { CustomerAdmin } from "@/types/api";

function CustomerEditForm({ customer }: { customer: CustomerAdmin }) {
  const { canUpdateCustomers } = usePermissions();
  const update = useUpdateCustomer();
  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email ?? "");

  async function handleSave() {
    try {
      await update.mutateAsync({ id: customer.id, name, email });
      toast.success("Customer updated.");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not update this customer.";
      toast.error(message);
    }
  }

  return (
    <form
      className="space-y-3 border border-border bg-card p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSave();
      }}
    >
      <h2 className="font-display text-2xl">Details</h2>
      <label className="block text-sm">
        Name
        <Input
          className="mt-1"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={!canUpdateCustomers}
        />
      </label>
      <label className="block text-sm">
        Email
        <Input
          className="mt-1"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={!canUpdateCustomers}
        />
      </label>
      <p className="text-sm text-muted-foreground">Phone is identity and stays {customer.phone}.</p>
      {canUpdateCustomers ? (
        <Button type="submit" disabled={update.isPending}>
          Save
        </Button>
      ) : null}
    </form>
  );
}

export function CustomerDetailPage() {
  const { id } = useParams();
  const customerQuery = useCustomer(id);
  const customer = customerQuery.data;

  if (customerQuery.isError) {
    return <EmptyState title="Customer not found" body="This customer could not be loaded." />;
  }
  if (!customer) {
    return <EmptyState title="Loading customer" body="Fetching the phone-first customer record." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Customers" title={customer.name} description={customer.phone} />
      <section className="grid gap-4 lg:grid-cols-2">
        <CustomerEditForm key={customer.id} customer={customer} />
        <div className="border border-border bg-card p-5 text-sm">
          <h2 className="font-display text-2xl">Totals</h2>
          <p className="mt-3">Paid orders: {customer.total_orders}</p>
          <p>Spent: {formatPkr(customer.total_spent)}</p>
          <div className="mt-4 space-y-2">
            {customer.addresses.length ? (
              customer.addresses.map((address) => (
                <p key={address.id} className="text-muted-foreground">
                  {[address.address, address.area, address.city, address.postal_code].filter(Boolean).join(", ")}
                </p>
              ))
            ) : (
              <p className="text-muted-foreground">No saved address.</p>
            )}
          </div>
        </div>
      </section>
      <div className="border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {customer.orders.length ? (
              customer.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.order_number}</TableCell>
                  <TableCell>{formatPkr(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/orders/${order.id}`}>Open</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  No orders for this customer yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
