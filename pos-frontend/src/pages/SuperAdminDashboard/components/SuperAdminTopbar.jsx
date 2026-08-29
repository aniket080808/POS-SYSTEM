import React from "react";
import { useSelector } from "react-redux";
import { Bell, User, Search, Shield } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import NotificationPanel from "./NotificationPanel";
import { useWebSocket } from "../../../hooks/useWebSocket";

export default function SuperAdminTopbar() {
  const { userProfile } = useSelector((state) => state.user);
  const { unreadCount } = useSelector((state) => state.notification);
  
  useWebSocket();

  return (
    <header className="bg-card/90 backdrop-blur-md border-b border-border px-6 py-3.5 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>Platform Administration</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                <Shield className="w-3 h-3" />
                Root Role
              </span>
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Multi-store oversight, tenant approvals, and global subscription control
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <NotificationPanel>
            <Button variant="ghost" size="icon" className="relative cursor-pointer h-9 w-9 rounded-xl">
              <Bell className="w-4 h-4 text-foreground/80" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>
          </NotificationPanel>
          
          {/* User Profile Badge */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-foreground leading-tight">
                {userProfile?.fullName || "Super Admin"}
              </p>
              <p className="text-[11px] text-muted-foreground font-mono leading-tight">
                {userProfile?.email || "admin@nexpos.com"}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
              {(userProfile?.fullName || "SA").slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
 