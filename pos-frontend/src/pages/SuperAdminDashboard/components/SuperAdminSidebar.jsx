import React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { logout } from "../../../Redux Toolkit/features/user/userThunks";
import {
  LayoutDashboard,
  Store,
  FileText,
  Clock,
  IndianRupee,
  Download,
  Settings,
  LogOut,
  ShoppingCart,
  ShieldAlert,
} from "lucide-react";
import { Button } from "../../../components/ui/button";

const navLinks = [
  {
    name: "Dashboard",
    path: "/super-admin/dashboard",
    matchPaths: ["/super-admin", "/super-admin/dashboard"],
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    name: "Stores Directory",
    path: "/super-admin/stores",
    matchPaths: ["/super-admin/stores"],
    icon: <Store className="w-4 h-4" />,
  },
  {
    name: "Pending Requests",
    path: "/super-admin/requests",
    matchPaths: ["/super-admin/requests"],
    icon: <Clock className="w-4 h-4" />,
  },
  {
    name: "Subscription Plans",
    path: "/super-admin/subscriptions",
    matchPaths: ["/super-admin/subscriptions"],
    icon: <FileText className="w-4 h-4" />,
  },
  {
    name: "Commissions",
    path: "/super-admin/commissions",
    matchPaths: ["/super-admin/commissions"],
    icon: <IndianRupee className="w-4 h-4" />,
  },
  {
    name: "Data Exports",
    path: "/super-admin/exports",
    matchPaths: ["/super-admin/exports"],
    icon: <Download className="w-4 h-4" />,
  },
  {
    name: "System Settings",
    path: "/super-admin/settings",
    matchPaths: ["/super-admin/settings"],
    icon: <Settings className="w-4 h-4" />,
  },
];

export default function SuperAdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  const isLinkActive = (link) => {
    if (link.path === "/super-admin/dashboard") {
      return location.pathname === "/super-admin" || location.pathname === "/super-admin/dashboard";
    }
    return location.pathname.startsWith(link.path);
  };

  return (
    <aside className="h-full w-64 shrink-0 bg-[#18181b] border-r border-zinc-800 flex flex-col py-5 px-3 shadow-xl z-20 text-zinc-100">
      {/* Brand Header */}
      <div className="px-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-accent text-accent-foreground rounded-xl flex items-center justify-center font-bold shadow-xs">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white">NexPOS</span>
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Platform Governance</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-1 space-y-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-3 py-1.5">
          Core Management
        </div>
        {navLinks.map((link) => {
          const active = isLinkActive(link);
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-semibold group ${
                active
                  ? "bg-accent text-accent-foreground shadow-xs font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/80"
              }`}
            >
              <span className={active ? "text-accent-foreground" : "text-zinc-400 group-hover:text-zinc-200"}>
                {link.icon}
              </span>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
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