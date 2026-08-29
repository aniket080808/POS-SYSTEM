import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, User, Store } from "lucide-react";
import { Button } from "../../../components/ui/button";
import NotificationPanel from "../../SuperAdminDashboard/components/NotificationPanel";
import { fetchUnreadCount } from "../../../Redux Toolkit/features/notification/notificationThunks";
import { useWebSocket } from "../../../hooks/useWebSocket";

export default function StoreTopbar() {
  const dispatch = useDispatch();
  const { unreadCount } = useSelector((state) => state.notification);
  const { userProfile } = useSelector((state) => state.user);
  const { store } = useSelector((state) => state.store);

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

  return (
    <header className="bg-card border-b border-border/80 px-6 py-3.5 shrink-0 shadow-2xs">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent-foreground flex items-center justify-center font-bold">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground leading-none">
              {store?.brand || store?.brandName || "Store Management Portal"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Inventory management, branch synchronization, and sales telemetry
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
                {userProfile?.fullName || "Store Administrator"}
              </p>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                {userProfile?.email || "admin@store.local"}
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