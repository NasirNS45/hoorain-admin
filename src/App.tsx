import { Navigate, Route, Routes } from "react-router";
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
import { HomepagePage } from "@/features/content/HomepagePage";
import { HeroPage } from "@/features/content/HeroPage";
import { SectionsPage } from "@/features/content/SectionsPage";
import { CustomerDetailPage } from "@/features/customers/CustomerDetailPage";
import { CustomerListPage } from "@/features/customers/CustomerListPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { DiscountFormPage } from "@/features/discounts/DiscountFormPage";
import { DiscountListPage } from "@/features/discounts/DiscountListPage";
import { AdjustmentsPage } from "@/features/inventory/AdjustmentsPage";
import { StockPage } from "@/features/inventory/StockPage";
import { OrderDetailPage } from "@/features/orders/OrderDetailPage";
import { OrderListPage } from "@/features/orders/OrderListPage";
import { PoliciesPage } from "@/features/store/PoliciesPage";
import { ShippingPage } from "@/features/store/ShippingPage";
import { SocialPage } from "@/features/store/SocialPage";
import { StoreSettingsPage } from "@/features/store/StoreSettingsPage";
import { AuditPage } from "@/features/system/AuditPage";
import { UserFormPage } from "@/features/system/UserFormPage";
import { UserListPage } from "@/features/system/UserListPage";
import { useCurrentUser } from "@/hooks/useAuth";
import { getAccessToken } from "@/lib/api";

function LoginGate() {
  const hasToken = Boolean(getAccessToken());
  const me = useCurrentUser();
  if (hasToken && me.data) return <Navigate to="/" replace />;
  return <LoginPage />;
}

export function App() {
  return (
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
        <Route path="/orders/pending" element={<OrderListPage group="pending" />} />
        <Route path="/orders/confirmed" element={<OrderListPage group="confirmed" />} />
        <Route path="/orders/processing" element={<OrderListPage group="processing" />} />
        <Route path="/orders/delivered" element={<OrderListPage group="delivered" />} />
        <Route path="/orders/cancelled" element={<OrderListPage group="cancelled" />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/content/homepage" element={<HomepagePage />} />
        <Route path="/content/hero" element={<HeroPage />} />
        <Route path="/content/sections" element={<SectionsPage />} />
        <Route path="/store/settings" element={<StoreSettingsPage />} />
        <Route path="/store/shipping" element={<ShippingPage />} />
        <Route path="/store/policies" element={<PoliciesPage />} />
        <Route path="/store/social" element={<SocialPage />} />
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
  );
}
