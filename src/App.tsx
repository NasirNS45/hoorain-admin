import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/features/auth/LoginPage";
import { BrandFormPage } from "@/features/catalog/BrandFormPage";
import { BrandListPage } from "@/features/catalog/BrandListPage";
import { CategoryFormPage } from "@/features/catalog/CategoryFormPage";
import { CategoryListPage } from "@/features/catalog/CategoryListPage";
import { CollectionFormPage } from "@/features/catalog/CollectionFormPage";
import { CollectionListPage } from "@/features/catalog/CollectionListPage";
import { ProductFormPage } from "@/features/catalog/ProductFormPage";
import { ProductListPage } from "@/features/catalog/ProductListPage";
import { CustomerDetailPage } from "@/features/customers/CustomerDetailPage";
import { CustomerListPage } from "@/features/customers/CustomerListPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { DiscountFormPage } from "@/features/discounts/DiscountFormPage";
import { DiscountListPage } from "@/features/discounts/DiscountListPage";
import { AdjustmentsPage } from "@/features/inventory/AdjustmentsPage";
import { StockPage } from "@/features/inventory/StockPage";
import { OrderDetailPage } from "@/features/orders/OrderDetailPage";
import { OrderListPage } from "@/features/orders/OrderListPage";
import { AuditPage } from "@/features/system/AuditPage";
import { UserFormPage } from "@/features/system/UserFormPage";
import { UserListPage } from "@/features/system/UserListPage";
import { queryClient, useAccessToken, useCurrentUser } from "@/hooks/useAuth";
import { subscribeSessionExpired } from "@/lib/api";

function SessionExpiredBridge() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    return subscribeSessionExpired(() => {
      queryClient.clear();
      if (location.pathname !== "/login") {
        navigate("/login", { replace: true });
      }
    });
  }, [navigate, location.pathname]);

  return null;
}

function LoginGate() {
  const token = useAccessToken();
  const me = useCurrentUser();
  if (token && me.data) return <Navigate to="/" replace />;
  return <LoginPage />;
}

export function App() {
  return (
    <>
      <SessionExpiredBridge />
      <Routes>
        <Route path="/login" element={<LoginGate />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:id" element={<ProductFormPage />} />
          <Route path="/categories" element={<CategoryListPage />} />
          <Route path="/categories/new" element={<CategoryFormPage />} />
          <Route path="/categories/:id" element={<CategoryFormPage />} />
          <Route path="/brands" element={<BrandListPage />} />
          <Route path="/brands/new" element={<BrandFormPage />} />
          <Route path="/brands/:id" element={<BrandFormPage />} />
          <Route path="/collections" element={<CollectionListPage />} />
          <Route path="/collections/new" element={<CollectionFormPage />} />
          <Route path="/collections/:id" element={<CollectionFormPage />} />
          <Route path="/inventory" element={<StockPage />} />
          <Route path="/inventory/adjustments" element={<AdjustmentsPage />} />
          <Route path="/orders" element={<OrderListPage />} />
          <Route path="/orders/pending" element={<Navigate to="/orders?status=pending" replace />} />
          <Route path="/orders/confirmed" element={<Navigate to="/orders?status=confirmed" replace />} />
          <Route path="/orders/processing" element={<Navigate to="/orders?status=processing" replace />} />
          <Route path="/orders/delivered" element={<Navigate to="/orders?status=delivered" replace />} />
          <Route path="/orders/cancelled" element={<Navigate to="/orders?status=cancelled" replace />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/customers" element={<CustomerListPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/discounts" element={<DiscountListPage />} />
          <Route path="/discounts/new" element={<DiscountFormPage />} />
          <Route path="/discounts/:id" element={<DiscountFormPage />} />
          <Route path="/system/users" element={<UserListPage />} />
          <Route path="/system/users/new" element={<UserFormPage />} />
          <Route path="/system/users/:id" element={<UserFormPage />} />
          <Route path="/system/audit" element={<AuditPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
