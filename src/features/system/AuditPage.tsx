import { useState } from "react";
import { TableSkeleton } from "@/components/loading";
import { EmptyState, PageHeader, PaginationBar } from "@/components/PageHeader";
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
import { usePermissions } from "@/hooks/usePermissions";
import { useAdminUsers, useAuditLogs } from "@/hooks/useUsers";

export function AuditPage() {
  const { canReadUsers } = usePermissions();
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [adminUserId, setAdminUserId] = useState("");
  const [page, setPage] = useState(1);
  const users = useAdminUsers({ page: 1, limit: 100 });
  const logs = useAuditLogs({
    action,
    entity_type: entityType,
    admin_user_id: adminUserId,
    page,
    limit: 20,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Activity"
        description="Writes to products, inventory, orders, settings, content, discounts, and admin users. Passwords are never stored here."
      />
      <form
        className="grid gap-3 sm:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          setAction(String(form.get("action") ?? "").trim());
          setEntityType(String(form.get("entity_type") ?? "").trim());
          setAdminUserId(String(form.get("admin_user_id") ?? ""));
          setPage(1);
        }}
      >
        <Input name="action" placeholder="Action" defaultValue={action} />
        <Input name="entity_type" placeholder="Entity type" defaultValue={entityType} />
        <NativeSelect name="admin_user_id" defaultValue={adminUserId}>
          <option value="">All users</option>
          {(users.data?.data ?? []).map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </NativeSelect>
        <Button type="submit" variant="outline" pending={logs.isFetching}>
          {logs.isFetching ? "Filtering" : "Filter"}
        </Button>
      </form>
      {logs.isLoading ? (
        <TableSkeleton columns={["When", "Who", "Action", "Entity"]} />
      ) : !canReadUsers || logs.isError ? (
        <EmptyState
          title="Could not load activity"
          body="You need users.read to view the audit log."
        />
      ) : !logs.data?.data.length ? (
        <EmptyState
          title="No activity yet"
          body="Admin writes will appear here. Empty metadata is normal for simple changes."
        />
      ) : (
        <div className="border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Who</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.data.data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{new Date(row.created_at).toLocaleString("en-PK")}</TableCell>
                  <TableCell>{row.actor_name ?? row.actor_email ?? "System"}</TableCell>
                  <TableCell>{row.action}</TableCell>
                  <TableCell>
                    {row.entity_type}
                    {row.entity_id ? ` ${row.entity_id}` : ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <PaginationBar page={page} limit={20} total={logs.data?.total ?? 0} onPage={setPage} />
    </div>
  );
}
