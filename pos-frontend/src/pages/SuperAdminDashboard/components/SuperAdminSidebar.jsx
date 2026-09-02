import React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { logout } from "../../../Redux Toolkit/features/user/userThunks";
import {
  LayoutDashboard,
  Store,
  FileText,
  Clock,
  Settings,
  Percent,
  Download,
  LogOut,
  ShieldAlert,
  MessageSquare,
  Activity,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import NexPOSLogo from "@/components/common/NexPOSLogo";

const navLinks = [
  {
    name: "Platform Overview",
    path: "/super-admin/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: "Registered Stores",
    path: "/super-admin/stores",
    icon: <Store className="w-5 h-5" />,
  },
  {
    name: "Store Requests",
    path: "/super-admin/requests",
    icon: <Clock className="w-5 h-5" />,
  },
  {
    name: "Subscription Plans",
    path: "/super-admin/subscriptions",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    name: "Customer Inquiries",
    path: "/super-admin/inquiries",
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    name: "Commissions",
    path: "/super-admin/commissions",
    icon: <Percent className="w-5 h-5" />,
  },
  {
    name: "Audit Trail",
    path: "/super-admin/audit-logs",
    icon: <Activity className="w-5 h-5" />,
  },
  {
    name: "Data Exports",
    path: "/super-admin/exports",
    icon: <Download className="w-5 h-5" />,
  },
  {
    name: "Platform Settings",
    path: "/super-admin/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

import api from "@/utils/api";

export default function SuperAdminSidebar({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [pendingInquiriesCount, setPendingInquiriesCount] = React.useState(0);

  React.useEffect(() => {
    const fetchCount = () => {
      api.get("/api/super-admin/contact-inquiries/pending-count")
        .then((res) => {
          const count = res.data?.data ?? res.data ?? 0;
          setPendingInquiriesCount(Number(count));
        })
        .catch(() => {});
    };

    fetchCount();
    const interval = setInterval(fetchCount, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
    onNavigate?.();
  };

  return (
    <aside className="h-full w-64 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col py-6 px-3 shadow-xs">
      {/* Brand Header */}
      <div className="px-3 mb-6">
        <NexPOSLogo size="md" subtitle="Super Administrator" onClick={() => { navigate("/super-admin/dashboard"); onNavigate?.(); }} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-1 pr-1">
        {navLinks.map((link) => {
          const isActivePath = location.pathname.startsWith(link.path);

          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => onNavigate?.()}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActivePath
                  ? "bg-[#F3E6C4] text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`transition-colors ${
                    isActivePath
                      ? "text-[#B8860B]"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {link.icon}
                </span>
                <span>{link.name}</span>
              </div>

              {link.name === "Customer Inquiries" && pendingInquiriesCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-[#B8860B] text-white shadow-xs animate-pulse">
                  {pendingInquiriesCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
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