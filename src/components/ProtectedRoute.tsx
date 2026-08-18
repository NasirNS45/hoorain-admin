import { Navigate, Outlet, useLocation } from "react-router";
import { AdminLayout } from "@/layouts/AdminLayout";
import { SessionLoader } from "@/components/loading";
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
    return <SessionLoader />;
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
