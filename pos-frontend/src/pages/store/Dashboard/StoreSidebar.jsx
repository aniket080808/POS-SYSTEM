import React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../Redux Toolkit/features/user/userThunks";
import {
  LayoutDashboard,
  Store,
  Users,
  ShoppingCart,
  BarChart2,
  Settings,
  FileText,
  Tag,
  Truck,
  Lock,
  BadgeDollarSign,
  LogOut,
  Building2,
  Sparkles,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { useToast } from "../../../components/ui/use-toast";
import { getRoleDisplayName } from "../../../utils/userRole";

const navLinks = [
  {
    name: "Dashboard",
    path: "/store/dashboard",
    icon: LayoutDashboard,
    requiresSubscription: false,
  },
  {
    name: "Branches",
    path: "/store/branches",
    icon: Building2,
    requiresSubscription: true,
  },
  {
    name: "Products Catalog",
    path: "/store/products",
    icon: ShoppingCart,
    requiresSubscription: true,
  },
  {
    name: "Categories",
    path: "/store/categories",
    icon: Tag,
    requiresSubscription: true,
  },
  {
    name: "Staff & Employees",
    path: "/store/employees",
    icon: Users,
    requiresSubscription: true,
  },
  {
    name: "Low Stock & Alerts",
    path: "/store/alerts",
    icon: Truck,
    requiresSubscription: true,
  },
  {
    name: "Sales & Orders",
    path: "/store/sales",
    icon: BarChart2,
    requiresSubscription: true,
  },
  {
    name: "Reports & Exports",
    path: "/store/reports",
    icon: FileText,
    requiresSubscription: true,
  },
  {
    name: "Store Profile",
    path: "/store/stores",
    icon: Store,
    requiresSubscription: true,
  },
  {
    name: "Upgrade Plan",
    path: "/store/upgrade",
    icon: BadgeDollarSign,
    requiresSubscription: false,
  },
  {
    name: "Settings",
    path: "/store/settings",
    icon: Settings,
    requiresSubscription: false,
  },
];

export default function StoreSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { statusResponse } = useSelector((state) => state.storeSubscription);
  const { store } = useSelector((state) => state.store);
  const { userProfile } = useSelector((state) => state.user);

  const isStoreAdmin = userProfile?.role === 'ROLE_STORE_ADMIN';
  const roleTitle = isStoreAdmin ? "Store Admin" : "Store Manager";
  const regStatus = statusResponse?.registrationStatus || store?.status || 'PENDING';
  const subStatus = statusResponse?.subscriptionStatus || 'NONE';
  const isFullyActive = regStatus === 'ACTIVE' && subStatus === 'ACTIVE';

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  const handleNavClick = (e, link) => {
    if (link.requiresSubscription && !isFullyActive && isStoreAdmin) {
      e.preventDefault();
      toast({
        title: "Subscription Required",
        description: "Active store registration and subscription are required to access this module.",
        variant: "destructive",
      });
      navigate("/store/upgrade");
    }
  };

  const visibleNavLinks = navLinks.filter(
    (link) => link.name !== "Upgrade Plan" || isStoreAdmin
  );

  return (
    <aside className="h-full w-64 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col py-5 px-3 shadow-sm select-none">
      {/* Brand Header */}
      <div className="px-3 mb-6">
        <Link to="/store/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
            N
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-sidebar-foreground">NexPOS</div>
            <div className="text-[11px] font-medium text-sidebar-foreground/60">NexPOS — {roleTitle}</div>
          </div>
        </Link>
        {store?.brand && (
          <div className="mt-3 p-2 rounded-xl bg-sidebar-accent/50 border border-sidebar-border/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-sidebar-foreground truncate max-w-[140px]">{store.brand}</span>
            <Badge variant={isFullyActive ? "success" : "warning"} className="text-[9px] px-1.5 py-0 h-4">
              {isFullyActive ? "Active" : "Unverified"}
            </Badge>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto space-y-1 px-1">
        {visibleNavLinks.map((link) => {
          const Icon = link.icon;
          const isLocked = isStoreAdmin && link.requiresSubscription && !isFullyActive;
          const isActive = location.pathname.startsWith(link.path);

          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={(e) => handleNavClick(e, link)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-2xs font-bold"
                  : isLocked
                  ? "text-sidebar-foreground/40 hover:bg-sidebar-accent/40 cursor-not-allowed"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? "text-primary"
                      : isLocked
                      ? "text-sidebar-foreground/30"
                      : "text-sidebar-foreground/60 group-hover:text-primary"
                  }`}
                />
                <span>{link.name}</span>
              </div>
              {isLocked && <Lock className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="pt-3 mt-auto border-t border-sidebar-border px-1">
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-9 gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}

