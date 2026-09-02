import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Bell, User, Search, Store as StoreIcon, Menu, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "../../../components/ui/input";
import NotificationPanel from "../../SuperAdminDashboard/components/NotificationPanel";
import { fetchUnreadCount } from "../../../Redux Toolkit/features/notification/notificationThunks";
import { useWebSocket } from "../../../hooks/useWebSocket";
import { Badge } from "@/components/ui/badge";
import { getRoleDisplayName } from "@/utils/userRole";
import StoreCommandPalette from "./StoreCommandPalette";

export default function StoreTopbar({ onOpenMobileMenu }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { unreadCount } = useSelector((state) => state.notification);
  const { userProfile } = useSelector((state) => state.user);
  const { store } = useSelector((state) => state.store);
  const [commandOpen, setCommandOpen] = useState(false);

  useWebSocket();

  // Bind global shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const roleName = getRoleDisplayName(userProfile?.role);
  const storeName = store?.brand || store?.storeName || userProfile?.store?.brand || "Store Portal";

  return (
    <header className="w-full h-16 bg-card border-b border-border flex items-center px-4 sm:px-6 justify-between sticky top-0 z-20">
      {/* Store Identity & Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Drawer Trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileMenu}
          className="md:hidden -ml-1 mr-0.5 h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
          <StoreIcon className="w-5 h-5 text-[#B8860B]" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground tracking-tight line-clamp-1">
            {storeName}
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Store Administration
          </p>
        </div>
      </div>

      {/* Center: Quick Command Search Trigger */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-xs text-muted-foreground transition-all cursor-pointer w-56 lg:w-64 justify-between"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="truncate">Search products, SKUs...</span>
          </span>
          <kbd className="px-1.5 py-0.5 rounded bg-card border border-border font-mono text-[10px] font-bold">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right side: POS terminal trigger, Search icon, Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Launch POS terminal shortcut */}
        <Button
          onClick={() => navigate("/cashier")}
          size="sm"
          className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 shadow-xs cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          POS Terminal
        </Button>

        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCommandOpen(true)}
          className="md:hidden h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </Button>

        {/* Notifications Popover */}
        <NotificationPanel>
          <button
            type="button"
            className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-destructive text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </NotificationPanel>

        {/* Profile Card */}
        <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-border">
          <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center font-bold text-sm text-foreground">
            {userProfile?.fullName ? userProfile.fullName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground">
                {userProfile?.fullName || "Store Admin"}
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {roleName}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">
              {userProfile?.email || "admin@store.com"}
            </p>
          </div>
        </div>
      </div>

      {/* Global Store Command Palette */}
      <StoreCommandPalette open={commandOpen} setOpen={setCommandOpen} />
    </header>
  );
}