import React, { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/Redux Toolkit/features/user/userThunks";
import { getRefundsByBranch } from "@/Redux Toolkit/features/refund/refundThunks";
import { getInventoryByBranch } from "@/Redux Toolkit/features/inventory/inventoryThunks";
import {
  LayoutDashboard,
  ShoppingBag,
  RotateCcw,
  CreditCard,
  Package,
  Users,
  UserCircle,
  FileText,
  Settings,
  LogOut,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRoleDisplayName } from "@/utils/userRole";
import NexPOSLogo from "@/components/common/NexPOSLogo";

const navLinks = [
  {
    name: "Overview",
    path: "/branch/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Orders",
    path: "/branch/orders",
    icon: ShoppingBag,
  },
  {
    name: "Returns",
    path: "/branch/refunds",
    icon: RotateCcw,
  },
  {
    name: "Transactions",
    path: "/branch/transactions",
    icon: CreditCard,
  },
  {
    name: "Stock",
    path: "/branch/inventory",
    icon: Package,
  },
  {
    name: "Staff",
    path: "/branch/employees",
    icon: Users,
  },
  {
    name: "Customers",
    path: "/branch/customers",
    icon: UserCircle,
  },
  {
    name: "Reports",
    path: "/branch/reports",
    icon: FileText,
  },
  {
    name: "Settings",
    path: "/branch/settings",
    icon: Settings,
  },
];

export default function BranchManagerSidebar({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { branch } = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);
  const { refundsByBranch = [] } = useSelector((state) => state.refund);
  const { inventories = [] } = useSelector((state) => state.inventory);

  const branchId = branch?.id || userProfile?.branchId || userProfile?.branch?.id;

  useEffect(() => {
    if (branchId) {
      dispatch(getRefundsByBranch({ branchId }));
      dispatch(getInventoryByBranch(branchId));

      const interval = setInterval(() => {
        dispatch(getRefundsByBranch({ branchId }));
      }, 45000);
      return () => clearInterval(interval);
    }
  }, [branchId, dispatch]);

  const lowStockCount = useMemo(() => {
    return (inventories || []).filter((item) => (item.quantity ?? 0) <= 5).length;
  }, [inventories]);

  const pendingRefundsCount = refundsByBranch?.length || 0;

  const roleName = getRoleDisplayName(userProfile?.role);

  const handleLogout = () => {
    onNavigate?.();
    dispatch(logout());
    navigate("/auth/login");
  };

  return (
    <aside className="h-full w-64 shrink-0 bg-card text-foreground border-r border-border flex flex-col py-5 px-3 select-none">
      {/* Brand Header */}
      <div className="px-3 mb-5">
        <NexPOSLogo
          size="sm"
          subtitle="Branch Console"
          onClick={() => {
            navigate("/branch/dashboard");
            onNavigate?.();
          }}
        />
      </div>

      {/* Branch Location Pill */}
      {branch && (
        <div className="mx-2 mb-4 p-3 bg-secondary/40 border border-border rounded-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <Store className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
            <span className="truncate">{branch.name}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate pl-5">
            {branch.address || "Main Store"}
          </p>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-1 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname.startsWith(link.path);

          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => onNavigate?.()}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 text-xs font-semibold ${
                isActive
                  ? "bg-[#F5A623] text-[#262422] font-bold shadow-xs"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#262422]" : "text-muted-foreground"}`} />
                <span className="truncate">{link.name}</span>
              </div>

              {/* Dynamic Badges */}
              {link.name === "Returns" && pendingRefundsCount > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full border shrink-0 ${
                    isActive
                      ? "bg-[#262422]/15 text-[#262422] border-[#262422]/30"
                      : "bg-rose-500/15 text-rose-600 border-rose-500/30"
                  }`}
                >
                  {pendingRefundsCount}
                </span>
              )}

              {link.name === "Stock" && lowStockCount > 0 && (
                <span
                  className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full border shrink-0 ${
                    isActive
                      ? "bg-[#262422]/15 text-[#262422] border-[#262422]/30"
                      : "bg-amber-500/15 text-amber-600 border-amber-500/30"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#262422]" : "bg-amber-500 animate-pulse"}`} />
                  {lowStockCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="pt-3 mt-auto border-t border-border px-1 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-secondary/40 border border-border/60 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#F5A623]/20 text-[#8C5800] flex items-center justify-center font-bold text-xs">
            {userProfile?.fullName?.[0] || "B"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-foreground truncate">{userProfile?.fullName || roleName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{userProfile?.email || "Branch Manager"}</p>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary h-9 justify-start px-3 gap-2 rounded-xl"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </Button>
      </div>
    </aside>
  );
}