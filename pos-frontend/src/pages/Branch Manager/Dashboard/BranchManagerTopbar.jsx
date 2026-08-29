import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, User, Store } from "lucide-react";
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
    <header className="bg-card border-b border-border/80 px-6 py-3.5 shrink-0 shadow-2xs">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent-foreground flex items-center justify-center font-bold">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground leading-none">
              {branch ? branch.name : "Branch Terminal Console"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("en-IN", {
                timeZone: "Asia/Kolkata",
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          {/* Notifications */}
          <NotificationPanel>
            <Button
              variant="outline"
              size="icon"
              className="relative h-9 w-9 rounded-xl border-border bg-card hover:bg-muted text-foreground cursor-pointer shadow-2xs"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>
          </NotificationPanel>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-border/80">
            <div className="text-right hidden sm:block">
              <div className="flex items-center justify-end gap-1.5">
                <p className="text-xs font-bold text-foreground leading-none">
                  {userProfile?.fullName || roleName}
                </p>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-semibold uppercase tracking-wider">
                  {roleName}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                {userProfile?.email || "branch@pos.local"}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-2xs">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}