import { useCurrentUser } from "@/hooks/useAuth";

export function usePermissions() {
  const { data } = useCurrentUser();
  const permissions = data?.permissions ?? [];
  const can = (permission: string) => permissions.includes(permission);
  return {
    can,
    canRead: can("products.read"),
    canCreate: can("products.create"),
    canUpdate: can("products.update"),
    canDelete: can("products.delete"),
    canReadOrders: can("orders.read"),
    canUpdateOrders: can("orders.update"),
    canReadCustomers: can("customers.read"),
    canUpdateCustomers: can("customers.update"),
    canReadContent: can("content.read"),
    canUpdateContent: can("content.update"),
    canReadSettings: can("settings.read"),
    canUpdateSettings: can("settings.update"),
    canReadUsers: can("users.read"),
    canManageUsers: can("users.manage"),
  };
}
