import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, UserCircle, Search } from "lucide-react";
import { ThemeToggle } from "../../../components/theme-toggle";
import { Input } from "../../../components/ui/input";
import NotificationPanel from "../../SuperAdminDashboard/components/NotificationPanel";
import { fetchUnreadCount } from "../../../Redux Toolkit/features/notification/notificationThunks";

export default function StoreTopbar() {
  const dispatch = useDispatch();
  const { unreadCount } = useSelector((state) => state.notification);
  const { userProfile } = useSelector((state) => state.user);

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

  return (
    <header className="w-full h-16 bg-background border-b flex items-center px-6 justify-between shadow-sm">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        {/* <h1 className="storeName text-primary text-3xl">{store.store?.brand}</h1> */}
        <Input placeholder="Search..." className="w-full" />
      </div>

      {/* Right side: Notifications & Profile */}
      <div className="flex items-center gap-6">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationPanel>
          <button className="relative cursor-pointer">
            <Bell className="text-muted-foreground w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </NotificationPanel>

        {/* Profile Dropdown */}
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
            <UserCircle className="w-6 h-6" />
          </span>
          <span className="font-medium text-foreground">
            {userProfile?.fullName || "Store Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}