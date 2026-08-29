import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NotificationPanel from "../../SuperAdminDashboard/components/NotificationPanel";
import { fetchUnreadCount } from "@/Redux Toolkit/features/notification/notificationThunks";
import { getRoleDisplayName } from "@/utils/userRole";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function BranchManagerTopbar() {
  const dispatch = useDispatch();
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

  return (
    <header className="bg-card border-b px-6 py-4 flex items-center justify-between shadow-xs">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {branch ? branch.name : "Branch Dashboard"}
        </h1>
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

      <div className="flex items-center gap-3">
        
        {/* Real Notification Bell with NotificationPanel Popover */}
        <NotificationPanel>
          <Button variant="ghost" size="icon" className="relative cursor-pointer">
            <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
        </NotificationPanel>

        {/* User Profile & Role Info */}
        <div className="flex items-center gap-3 pl-2 border-l border-border">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="hidden md:block">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">
                {userProfile?.fullName || roleName}
              </p>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-semibold uppercase tracking-wider">
                {roleName}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{userProfile?.email || "user@example.com"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}