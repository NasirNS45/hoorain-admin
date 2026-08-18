import { Navigate, Outlet, useLocation } from "react-router";
import { AdminLayout } from "@/layouts/AdminLayout";
import { useCurrentUser } from "@/hooks/useAuth";
import { getAccessToken } from "@/lib/api";

export function ProtectedRoute() {
  const location = useLocation();
  const hasToken = Boolean(getAccessToken());
  const { isLoading, isError, data } = useCurrentUser();

  if (!hasToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading HOORAIN admin
      </div>
    );
  }

  if (isError || !data) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
