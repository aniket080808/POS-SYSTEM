import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../Redux Toolkit/features/user/userThunks";
import { getStoreAlerts } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import {
  LayoutDashboard,
  Store,
  Users,
  ShoppingCart,
  BarChart2,
  Settings,
  FileText,
  Tag,
  AlertTriangle,
  Lock,
  BadgeDollarSign,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useToast } from "../../../components/ui/use-toast";
import { getRoleDisplayName } from "../../../utils/userRole";
import NexPOSLogo from "@/components/common/NexPOSLogo";

const navLinks = [
  {
    name: "Dashboard",
    path: "/store/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    requiresSubscription: false,
  },
  {
    name: "Stores",
    path: "/store/stores",
    icon: <Store className="w-5 h-5" />,
    requiresSubscription: true,
  },
  {
    name: "Branches",
    path: "/store/branches",
    icon: <Store className="w-5 h-5" />,
    requiresSubscription: true,
  },
  {
    name: "Products",
    path: "/store/products",
    icon: <ShoppingCart className="w-5 h-5" />,
    requiresSubscription: true,
  },
  {
    name: "Categories",
    path: "/store/categories",
    icon: <Tag className="w-5 h-5" />,
    requiresSubscription: true,
  },
  {
    name: "Employees",
    path: "/store/employees",
    icon: <Users className="w-5 h-5" />,
    requiresSubscription: true,
  },
  {
    name: "Alerts",
    path: "/store/alerts",
    icon: <AlertTriangle className="w-5 h-5" />,
    requiresSubscription: true,
  },
  {
    name: "Sales",
    path: "/store/sales",
    icon: <BarChart2 className="w-5 h-5" />,
    requiresSubscription: true,
  },
  {
    name: "Reports",
    path: "/store/reports",
    icon: <FileText className="w-5 h-5" />,
    requiresSubscription: true,
  },
  {
    name: "Upgrade Plan",
    path: "/store/upgrade",
    icon: <BadgeDollarSign className="w-5 h-5" />,
    requiresSubscription: false,
  },
  {
    name: "Settings",
    path: "/store/settings",
    icon: <Settings className="w-5 h-5" />,
    requiresSubscription: false,
  },
];

export default function StoreSidebar({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { statusResponse } = useSelector((state) => state.storeSubscription);
  const { store } = useSelector((state) => state.store);
  const { userProfile } = useSelector((state) => state.user);
  const { storeAlerts } = useSelector((state) => state.storeAnalytics);

  const isSuperAdmin = userProfile?.role === "ROLE_ADMIN";
  const isStoreAdmin = userProfile?.role === "ROLE_STORE_ADMIN";
  const roleName = isSuperAdmin ? "Super Admin (Workspace)" : getRoleDisplayName(userProfile?.role);
  const regStatus = statusResponse?.registrationStatus || store?.status || "PENDING";
  const subStatus = statusResponse?.subscriptionStatus || "NONE";
  const isFullyActive = isSuperAdmin || (regStatus === "ACTIVE" && subStatus === "ACTIVE");

  const adminId = store?.storeAdmin?.id || userProfile?.id;

  // Poll alerts every 30s to keep low-stock badges in sync
  useEffect(() => {
    if (adminId && isFullyActive) {
      dispatch(getStoreAlerts(adminId));
      const interval = setInterval(() => {
        dispatch(getStoreAlerts(adminId));
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [dispatch, adminId, isFullyActive]);

  const lowStockCount = storeAlerts?.lowStockAlerts?.length || 0;
  const totalAlertsCount =
    lowStockCount +
    (storeAlerts?.inactiveCashiers?.length || 0) +
    (storeAlerts?.refundSpikeAlerts?.length || 0);

  const handleLogout = () => {
    onNavigate?.();
    dispatch(logout());
    navigate("/auth/login");
  };

  const handleNavClick = (e, link) => {
    if (!isSuperAdmin && link.requiresSubscription && !isFullyActive && isStoreAdmin) {
      e.preventDefault();
      toast({
        title: "Module Locked",
        description: "Active store registration and subscription required to access this module.",
        variant: "destructive",
      });
      navigate("/store/upgrade");
      onNavigate?.();
      return;
    }
    onNavigate?.();
  };

  const visibleNavLinks = navLinks.filter(
    (link) => (link.name !== "Upgrade Plan" || isStoreAdmin) && !(isSuperAdmin && link.name === "Upgrade Plan")
  );

  return (
    <aside className="h-full w-64 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col py-6 px-3 shadow-xs">
      {/* Brand & Role Header */}
      <div className="px-3 mb-6">
        <NexPOSLogo
          size="md"
          subtitle={roleName}
          onClick={() => {
            navigate("/store/dashboard");
            onNavigate?.();
          }}
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto space-y-1 pr-1">
        {visibleNavLinks.map((link) => {
          const isLocked = !isSuperAdmin && isStoreAdmin && link.requiresSubscription && !isFullyActive;
          const isActivePath = location.pathname.startsWith(link.path);

          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={(e) => handleNavClick(e, link)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActivePath
                  ? "bg-[#F3E6C4] text-foreground shadow-2xs font-bold"
                  : isLocked
                  ? "text-muted-foreground/50 hover:bg-secondary/60 cursor-not-allowed"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`transition-colors ${
                    isActivePath
                      ? "text-[#B8860B]"
                      : isLocked
                      ? "text-muted-foreground/40"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {link.icon}
                </span>
                <span>{link.name}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {link.name === "Alerts" && totalAlertsCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-destructive/15 text-destructive border border-destructive/30 animate-pulse">
                    {totalAlertsCount}
                  </span>
                )}
                {link.name === "Products" && lowStockCount > 0 && (
                  <span
                    className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-500/20"
                    title={`${lowStockCount} items low in stock`}
                  />
                )}
                {isLocked && <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Action */}
      <div className="pt-4 mt-auto border-t border-border/80 px-2">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start text-xs font-semibold h-10 rounded-xl gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
