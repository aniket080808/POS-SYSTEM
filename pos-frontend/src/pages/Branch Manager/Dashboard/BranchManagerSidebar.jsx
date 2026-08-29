import React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/Redux Toolkit/features/user/userThunks";
import {
  LayoutDashboard,
  ShoppingBag,
  RefreshCw,
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

const navLinks = [
  {
    name: "Dashboard",
    path: "/branch/dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    name: "Orders History",
    path: "/branch/orders",
    icon: <ShoppingBag className="w-4 h-4" />,
  },
  {
    name: "Refund Approvals",
    path: "/branch/refunds",
    icon: <RefreshCw className="w-4 h-4" />,
  },
  {
    name: "Daily Transactions",
    path: "/branch/transactions",
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    name: "Branch Inventory",
    path: "/branch/inventory",
    icon: <Package className="w-4 h-4" />,
  },
  {
    name: "Staff Management",
    path: "/branch/employees",
    icon: <Users className="w-4 h-4" />,
  },
  {
    name: "Customer CRM",
    path: "/branch/customers",
    icon: <UserCircle className="w-4 h-4" />,
  },
  {
    name: "Branch Reports",
    path: "/branch/reports",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    name: "Branch Settings",
    path: "/branch/settings",
    icon: <Settings className="w-4 h-4" />,
  },
];

export default function BranchManagerSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { branch } = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);

  const roleName = getRoleDisplayName(userProfile?.role);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  return (
    <aside className="h-full w-64 shrink-0 bg-[#18181b] border-r border-zinc-800 flex flex-col py-5 px-3 shadow-xl z-20 text-zinc-100">
      {/* Brand Header */}
      <div className="px-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-accent text-accent-foreground rounded-xl flex items-center justify-center font-bold shadow-xs shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white truncate">
                NexPOS
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

      {/* Branch Info Badge */}
      {branch && (
        <div className="mx-1 mb-4 px-3 py-2.5 bg-zinc-800/70 border border-zinc-700/60 rounded-xl">
          <h3 className="text-xs font-bold text-white truncate">{branch.name}</h3>
          <p className="text-[11px] text-zinc-400 truncate mt-0.5">{branch.address}</p>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-1 space-y-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-3 py-1.5">
          Branch Control
        </div>
        {navLinks.map((link) => {
          const isActivePath =
            link.path === "/branch/dashboard"
              ? location.pathname === "/branch" || location.pathname === "/branch/dashboard"
              : location.pathname.startsWith(link.path);

          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold group ${
                isActivePath
                  ? "bg-accent text-accent-foreground shadow-xs font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/80"
              }`}
            >
              <span
                className={
                  isActivePath
                    ? "text-accent-foreground"
                    : "text-zinc-400 group-hover:text-zinc-200"
                }
              >
                {link.icon}
              </span>
              <span className="truncate">{link.name}</span>
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