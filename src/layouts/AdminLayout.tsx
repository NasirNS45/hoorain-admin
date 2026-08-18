import { NavLink, useLocation, useNavigate } from "react-router";
import {
  Bell,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string };
type NavGroup = { label: string; items: NavItem[] };

const NAV: (NavItem | NavGroup)[] = [
  { to: "/", label: "Dashboard" },
  {
    label: "Catalog",
    items: [
      { to: "/products", label: "Products" },
      { to: "/categories", label: "Categories" },
      { to: "/brands", label: "Brands" },
      { to: "/collections", label: "Collections" },
    ],
  },
  {
    label: "Inventory",
    items: [
      { to: "/inventory", label: "Stock" },
      { to: "/inventory/adjustments", label: "Adjustments" },
    ],
  },
  {
    label: "Orders",
    items: [
      { to: "/orders", label: "All Orders" },
      { to: "/orders/pending", label: "Pending" },
      { to: "/orders/confirmed", label: "Confirmed" },
      { to: "/orders/processing", label: "Processing" },
      { to: "/orders/delivered", label: "Delivered" },
      { to: "/orders/cancelled", label: "Cancelled" },
    ],
  },
  { to: "/customers", label: "Customers" },
  {
    label: "Content",
    items: [
      { to: "/content/homepage", label: "Homepage" },
      { to: "/content/hero", label: "Hero" },
      { to: "/content/sections", label: "Sections" },
    ],
  },
  {
    label: "Marketing",
    items: [{ to: "/discounts", label: "Discounts" }],
  },
  {
    label: "Store",
    items: [
      { to: "/store/settings", label: "Settings" },
      { to: "/store/shipping", label: "Shipping" },
      { to: "/store/policies", label: "Policies" },
      { to: "/store/social", label: "Social Links" },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/system/users", label: "Admin Users" },
      { to: "/system/audit", label: "Activity / Audit" },
    ],
  },
];

function isGroup(item: NavItem | NavGroup): item is NavGroup {
  return "items" in item;
}

function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <nav className="space-y-5 pb-4">
      {NAV.map((entry) => {
        if (!isGroup(entry)) {
          return (
            <NavLink
              key={entry.to}
              to={entry.to}
              end={entry.to === "/"}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-muted",
                  isActive && "bg-muted",
                )
              }
            >
              <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
              {!collapsed && entry.label}
            </NavLink>
          );
        }
        return (
          <div key={entry.label}>
            {!collapsed && (
              <p className="eyebrow px-3 pb-2 text-muted-foreground">{entry.label}</p>
            )}
            <div className="space-y-0.5">
              {entry.items.map((item) => {
                const exact = location.pathname === item.to;
                const nested = location.pathname.startsWith(`${item.to}/`);
                const siblingActive = entry.items.some(
                  (other) =>
                    other.to !== item.to &&
                    (location.pathname === other.to ||
                      location.pathname.startsWith(`${other.to}/`)),
                );
                const active = exact || (nested && !siblingActive);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "block px-3 py-1.5 text-[13px] hover:bg-muted",
                      active && "bg-muted",
                      collapsed && "text-center",
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    {collapsed ? item.label.slice(0, 1) : item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const initials = (user?.name ?? "H")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={cn(
          "hidden h-full min-h-0 border-r border-border bg-card lg:flex lg:flex-col",
          collapsed ? "w-[72px]" : "w-60",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3">
          {!collapsed && <span className="font-display text-2xl tracking-wide">HOORAIN</span>}
          <Button variant="ghost" size="icon" onClick={() => setCollapsed((value) => !value)}>
            <ChevronLeft className={cn("h-4 w-4", collapsed && "rotate-180")} />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-1 pt-4">
          <SidebarNav collapsed={collapsed} />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col overflow-hidden">
              <p className="mb-6 shrink-0 font-display text-2xl">HOORAIN</p>
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
                <SidebarNav collapsed={false} />
              </div>
            </SheetContent>
          </Sheet>
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search the edit, orders, customers" className="h-9 pl-9" disabled />
          </div>
          <Button variant="ghost" size="icon" className="ml-auto" disabled>
            <Bell className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="flex cursor-pointer items-center gap-2">
                <Avatar>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden text-left text-sm sm:block">
                  <span className="block leading-tight">{user?.name}</span>
                  <span className="block text-[11px] text-muted-foreground">{user?.role}</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout.mutate(undefined, {
                    onSettled: () => navigate("/login", { replace: true }),
                  });
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
