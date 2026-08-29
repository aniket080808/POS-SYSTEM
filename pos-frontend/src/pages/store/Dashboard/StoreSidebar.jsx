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
  Building,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useToast } from "../../../components/ui/use-toast";
import { getRoleDisplayName } from "../../../utils/userRole";

const navLinks = [
  {
    name: "Dashboard",
    path: "/store/dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    requiresSubscription: false,
  },
  {
    name: "Store Profile",
    path: "/store/stores",
    icon: <Building className="w-4 h-4" />,
    requiresSubscription: true,
  },
  {
    name: "Branch Outlets",
    path: "/store/branches",
    icon: <Store className="w-4 h-4" />,
    requiresSubscription: true,
  },
  {
    name: "Product Catalog",
    path: "/store/products",
    icon: <ShoppingCart className="w-4 h-4" />,
    requiresSubscription: true,
  },
  {
    name: "Categories",
    path: "/store/categories",
    icon: <Tag className="w-4 h-4" />,
    requiresSubscription: true,
  },
  {
    name: "Employee Roster",
    path: "/store/employees",
    icon: <Users className="w-4 h-4" />,
    requiresSubscription: true,
  },
  {
    name: "Operational Alerts",
    path: "/store/alerts",
    icon: <Truck className="w-4 h-4" />,
    requiresSubscription: true,
  },
  {
    name: "Sales Orders",
    path: "/store/sales",
    icon: <BarChart2 className="w-4 h-4" />,
    requiresSubscription: true,
  },
  {
    name: "Analytics & Reports",
    path: "/store/reports",
    icon: <FileText className="w-4 h-4" />,
    requiresSubscription: true,
  },
  {
    name: "Subscription Plans",
    path: "/store/upgrade",
    icon: <BadgeDollarSign className="w-4 h-4" />,
    requiresSubscription: false,
  },
  {
    name: "Settings",
    path: "/store/settings",
    icon: <Settings className="w-4 h-4" />,
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

  const isStoreAdmin = userProfile?.role === "ROLE_STORE_ADMIN";
  const roleName = getRoleDisplayName(userProfile?.role);
  const regStatus = statusResponse?.registrationStatus || store?.status || "PENDING";
  const subStatus = statusResponse?.subscriptionStatus || "NONE";
  const isFullyActive = regStatus === "ACTIVE" && subStatus === "ACTIVE";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  const handleNavClick = (e, link) => {
    if (link.requiresSubscription && !isFullyActive && isStoreAdmin) {
      e.preventDefault();
      toast({
        title: "Module Gated",
        description: "Active store registration and subscription are required to access this module.",
        variant: "destructive",
      });
      navigate("/store/upgrade");
    }
  };

  const visibleNavLinks = navLinks.filter(
    (link) => link.name !== "Subscription Plans" || isStoreAdmin
  );

  return (
    <aside className="h-full w-64 shrink-0 bg-[#18181b] border-r border-zinc-800 flex flex-col py-5 px-3 shadow-xl z-20 text-zinc-100">
      {/* Brand & Store Name Header */}
      <div className="px-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-accent text-accent-foreground rounded-xl flex items-center justify-center font-bold shadow-xs shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white truncate">
                {store?.brand || store?.brandName || "NexPOS"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/30 truncate">
                {roleName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-1 space-y-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-3 py-1.5">
          Store Operations
        </div>
        {visibleNavLinks.map((link) => {
          const isLocked = isStoreAdmin && link.requiresSubscription && !isFullyActive;
          const isActivePath =
            link.path === "/store/dashboard"
              ? location.pathname === "/store" || location.pathname === "/store/dashboard"
              : location.pathname.startsWith(link.path);

          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={(e) => handleNavClick(e, link)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs font-semibold group ${
                isActivePath
                  ? "bg-accent text-accent-foreground shadow-xs font-bold"
                  : isLocked
                  ? "text-zinc-400 hover:bg-zinc-800/40 cursor-not-allowed"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/80"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={
                    isActivePath
                      ? "text-accent-foreground"
                      : isLocked
                      ? "text-zinc-400"
                      : "text-zinc-400 group-hover:text-zinc-200"
                  }
                >
                  {link.icon}
                </span>
                <span className="truncate">{link.name}</span>
              </div>
              {isLocked && <Lock className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Sign Out */}
      <div className="pt-3 mt-auto border-t border-zinc-800 px-1">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-xs font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-950/30 rounded-xl h-10 px-3 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2 text-zinc-400" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
