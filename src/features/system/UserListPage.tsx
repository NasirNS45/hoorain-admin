import { useState } from "react";
import { Link } from "react-router";
import { EmptyState, LoadingState, PageHeader, PaginationBar } from "@/components/PageHeader";
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
import { usePermissions } from "@/hooks/usePermissions";
import { useAdminUsers } from "@/hooks/useUsers";
import type { AdminRole } from "@/types/api";

const ROLE_LABEL: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  MANAGER: "Manager",
  STAFF: "Staff",
};

export function UserListPage() {
  const { canReadUsers, canManageUsers } = usePermissions();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const users = useAdminUsers({ q, page, limit: 20 });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Admin users"
        description="Deactivate accounts instead of deleting them. The last active super admin cannot be turned off."
        action={
          canManageUsers ? (
            <Button asChild>
              <Link to="/system/users/new">Add user</Link>
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
        <Input name="q" placeholder="Search name or email" defaultValue={q} />
        <Button type="submit" variant="outline" disabled={users.isFetching}>
          {users.isFetching ? "Searching" : "Search"}
        </Button>
      </form>
      {users.isLoading ? (
        <LoadingState title="Loading admin users" body="Fetching editor accounts." />
      ) : !canReadUsers || users.isError ? (
        <EmptyState
          title="Could not load admin users"
          body="You need users.read to view this list."
        />
      ) : !users.data?.data.length ? (
        <EmptyState
          title="No admin users"
          body="Create an editor with STAFF, MANAGER, ADMIN, or SUPER_ADMIN."
          action={canManageUsers ? { to: "/system/users/new", label: "Add user" } : undefined}
        />
      ) : (
        <div className="border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.data.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{ROLE_LABEL[user.role]}</TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "secondary" : "outline"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canReadUsers ? (
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/system/users/${user.id}`}>
                          {canManageUsers ? "Edit" : "Open"}
                        </Link>
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <PaginationBar page={page} limit={20} total={users.data?.total ?? 0} onPage={setPage} />
    </div>
  );
}
