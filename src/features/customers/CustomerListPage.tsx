import { useState } from "react";
import { Link } from "react-router";
import { EmptyState, PageHeader, PaginationBar } from "@/components/PageHeader";
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
import { useCustomers } from "@/hooks/useOrders";
import { formatPkr } from "@/lib/utils";

export function CustomerListPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const customers = useCustomers({ q, page, limit: 20 });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customers"
        title="Customers"
        description="Phone-first records created at prepaid checkout. Phone is the identity and cannot be changed here."
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
        <Input name="q" placeholder="Search name or phone" defaultValue={q} />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>
      {customers.isError ? (
        <EmptyState title="Could not load customers" body="Customer records could not be fetched." />
      ) : !customers.data?.data.length ? (
        <EmptyState
          title="No customers yet"
          body="A customer record is created when someone pays for an order, or starts checkout."
        />
      ) : (
        <div className="border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.data.data.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.total_orders}</TableCell>
                  <TableCell>{formatPkr(customer.total_spent)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/customers/${customer.id}`}>Open</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <PaginationBar page={page} limit={20} total={customers.data?.total ?? 0} onPage={setPage} />
    </div>
  );
}
