import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NotificationPanel from "../../SuperAdminDashboard/components/NotificationPanel";
import { fetchUnreadCount } from "@/Redux Toolkit/features/notification/notificationThunks";
import { getRoleDisplayName } from "@/utils/userRole";
import { useSidebar } from "../../../context/hooks/useSidebar";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  Menu,
  Bell,
  User,
  Store as StoreIcon,
  Zap,
} from "lucide-react";

const POSHeader = () => {
  const dispatch = useDispatch();
  const { setSidebarOpen } = useSidebar();
  const { userProfile } = useSelector((state) => state.user);
  const { branch } = useSelector((state) => state.branch);
  const { unreadCount } = useSelector((state) => state.notification);

  useWebSocket();

  useEffect(() => {
    if (localStorage.getItem("jwt")) {
      dispatch(fetchUnreadCount());
      const interval = setInterval(() => {
        dispatch(fetchUnreadCount());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [dispatch]);

  const roleName = getRoleDisplayName(userProfile?.role);
  const branchDisplayName =
    branch?.name ||
    userProfile?.branchName ||
    userProfile?.branch?.name ||
    "Main Branch";

  return (
    <header className="bg-card border-b px-5 py-3 flex items-center justify-between shadow-xs sticky top-0 z-20">
      {/* Left: Sidebar Toggle + Branch Title */}
      <div className="flex items-center gap-3.5">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-xl border-border hover:bg-muted cursor-pointer shadow-xs"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </Button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-foreground tracking-tight flex items-center gap-1.5">
              <StoreIcon className="h-4 w-4 text-accent" />
              {branchDisplayName}
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-accent/15 text-accent-foreground border border-accent/20">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              NexPOS Terminal
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("en-IN", {
              timeZone: "Asia/Kolkata",
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Center: Keyboard Shortcuts Bar (Desktop only) */}
      <div className="hidden lg:flex items-center gap-1.5 bg-muted/60 border border-border px-3 py-1.5 rounded-xl shadow-2xs">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Zap className="h-3.5 w-3.5 text-accent" /> Shortcuts:
        </span>
        <Badge variant="secondary" className="text-xs font-mono font-medium px-2 py-0.5 bg-card text-foreground border border-border">
          F1 Search
        </Badge>
        <Badge variant="secondary" className="text-xs font-mono font-medium px-2 py-0.5 bg-card text-foreground border border-border">
          F2 Discount
        </Badge>
        <Badge variant="secondary" className="text-xs font-mono font-medium px-2 py-0.5 bg-card text-foreground border border-border">
          F3 Customer
        </Badge>
        <Badge variant="secondary" className="text-xs font-mono font-medium px-2 py-0.5 bg-accent/20 text-accent-foreground border border-accent/30">
          Ctrl+Enter Pay
        </Badge>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-3">
        {/* Real Notification Bell with NotificationPanel Popover */}
        <NotificationPanel>
          <Button variant="ghost" size="icon" className="relative cursor-pointer h-9 w-9 rounded-xl hover:bg-muted">
            <Bell className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
        </NotificationPanel>

        {/* User Profile & Role Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-border">
          <div className="h-9 w-9 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground font-bold text-sm">
            {userProfile?.fullName ? userProfile.fullName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-foreground truncate max-w-[130px]">
                {userProfile?.fullName || "Cashier"}
              </p>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-bold uppercase tracking-wider bg-muted text-muted-foreground">
                {roleName || "Cashier"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
              {userProfile?.email || "cashier@pos.com"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default POSHeader;

