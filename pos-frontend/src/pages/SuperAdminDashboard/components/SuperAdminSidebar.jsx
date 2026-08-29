import React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { logout } from "../../../Redux Toolkit/features/user/userThunks";
import {
  LayoutDashboard,
  Store,
  Download,
  Settings,
  FileText,
  IndianRupee,
  Clock,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { Button } from "../../../components/ui/button";

const navLinks = [
  {
    name: "Dashboard",
    path: "/super-admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Stores",
    path: "/super-admin/stores",
    icon: Store,
  },
  {
    name: "Subscription Plans",
    path: "/super-admin/subscriptions",
    icon: FileText,
  },
  {
    name: "Pending Requests",
    path: "/super-admin/requests",
    icon: Clock,
  },
  {
    name: "Commissions",
    path: "/super-admin/commissions",
    icon: IndianRupee,
  },
  {
    name: "Exports",
    path: "/super-admin/exports",
    icon: Download,
  },
  {
    name: "Settings",
    path: "/super-admin/settings",
    icon: Settings,
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

  return (
    <aside className="h-full w-64 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col py-5 px-4 shadow-sm select-none">
      {/* Brand Header */}
      <div className="mb-6 px-2 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-xs">
          <Store className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-sidebar-foreground block">
            NexPOS
          </span>
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
            Super Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : "text-sidebar-foreground/60"}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile / Logout */}
      <div className="pt-4 mt-auto border-t border-sidebar-border/80">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-2.5 h-10 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/40"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}