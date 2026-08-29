import React from "react";
import { useSelector } from "react-redux";
import { Bell, User, Search, ShieldCheck } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import NotificationPanel from "./NotificationPanel";
import { useWebSocket } from "../../../hooks/useWebSocket";

export default function SuperAdminTopbar() {
  const { userProfile } = useSelector((state) => state.user);
  const { unreadCount } = useSelector((state) => state.notification);

  useWebSocket();

  return (
    <header className="bg-card border-b border-border/80 px-6 py-3.5 shrink-0 shadow-2xs">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground leading-none">
              Super Admin Console
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Platform-wide operations & merchant network governance
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
              <p className="text-xs font-bold text-foreground leading-none">
                {userProfile?.fullName || "Super Administrator"}
              </p>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                {userProfile?.email || "admin@nexpos.local"}
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