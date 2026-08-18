import { Navigate, Outlet, useLocation } from "react-router";
import { AdminLayout } from "@/layouts/AdminLayout";
import { SessionLoader } from "@/components/loading";
import { useAccessToken, useCurrentUser } from "@/hooks/useAuth";

export function ProtectedRoute() {
  const location = useLocation();
  const token = useAccessToken();
  const { isLoading, isError, data } = useCurrentUser();

  if (!token) {
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
