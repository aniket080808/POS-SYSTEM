import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, UserCircle, Search, Store as StoreIcon, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "../../../components/theme-toggle";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import NotificationPanel from "../../SuperAdminDashboard/components/NotificationPanel";
import { fetchUnreadCount } from "../../../Redux Toolkit/features/notification/notificationThunks";
import { useWebSocket } from "../../../hooks/useWebSocket";

export default function StoreTopbar() {
  const dispatch = useDispatch();
  const { unreadCount } = useSelector((state) => state.notification || {});
  const { userProfile } = useSelector((state) => state.user || {});
  const { store } = useSelector((state) => state.store || {});

  useWebSocket();

  // Fetch unread count on mount and poll every 30 seconds
  useEffect(() => {
    if (localStorage.getItem("jwt")) {
      dispatch(fetchUnreadCount());

      const interval = setInterval(() => {
        dispatch(fetchUnreadCount());
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [dispatch]);

  const isStoreAdmin = userProfile?.role === "ROLE_STORE_ADMIN";
  const roleLabel = isStoreAdmin ? "Store Admin" : "Store Manager";

  return (
    <header className="w-full h-16 bg-card/80 backdrop-blur-md border-b border-border/80 flex items-center px-4 sm:px-6 justify-between shadow-2xs z-10 shrink-0">
      {/* Store context badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <StoreIcon className="w-4 h-4" />
          </div>
          <span className="font-bold text-xs text-foreground tracking-tight hidden sm:inline">
            {store?.brand || "Merchant Workspace"}
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 rounded-md hidden md:inline-flex">
          {roleLabel}
        </Badge>
      </div>

      {/* Right controls: Theme Toggle, Notifications, User */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Theme Toggle (Preserved per Condition A) */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationPanel>
          <button className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </NotificationPanel>

        {/* Profile Avatar / User Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-border/60">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
            {userProfile?.fullName?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-foreground leading-tight">{userProfile?.fullName || "Store Admin"}</p>
            <p className="text-[10px] text-muted-foreground font-mono leading-tight">{userProfile?.email || "admin@store.com"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}