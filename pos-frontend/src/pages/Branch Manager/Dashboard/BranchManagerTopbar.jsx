import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Bell, User, Store, Menu, ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NotificationPanel from "../../SuperAdminDashboard/components/NotificationPanel";
import { fetchUnreadCount } from "@/Redux Toolkit/features/notification/notificationThunks";
import { getRoleDisplayName } from "@/utils/userRole";
import { useWebSocket } from "@/hooks/useWebSocket";
import BranchCommandPalette from "./BranchCommandPalette";

export default function BranchManagerTopbar({ onOpenMobileMenu }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userProfile } = useSelector((state) => state.user);
  const { branch } = useSelector((state) => state.branch);
  const { unreadCount } = useSelector((state) => state.notification);
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
    <header className="bg-card border-b border-border/70 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-2">
        {/* Mobile Hamburger Drawer Trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileMenu}
          className="md:hidden -ml-2 mr-1 h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-[#F5A623]" />
          <h1 className="text-base font-bold text-foreground">
            {branch ? branch.name : "Branch Dashboard"}
          </h1>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-xs text-muted-foreground transition-all cursor-pointer w-52 lg:w-60 justify-between"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="truncate">Search orders, stock...</span>
          </span>
          <kbd className="px-1.5 py-0.5 rounded bg-card border border-border font-mono text-[10px] font-bold">
            Ctrl K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
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

        {/* Quick Action: Launch POS Cashier Terminal */}
        <Button
          onClick={() => navigate("/cashier")}
          size="sm"
          className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 shadow-xs cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          POS Terminal
        </Button>

        {/* Real Notification Bell with NotificationPanel Popover */}
        <NotificationPanel>
          <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl">
            <Bell className="h-4 w-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute 1.5 top-1.5 right-1.5 bg-destructive text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
        </NotificationPanel>

        {/* User Profile & Role Info */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-border/60">
          <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-xs text-foreground">
            {userProfile?.fullName?.[0] || <User className="h-4 w-4 text-muted-foreground" />}
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-foreground">
                {userProfile?.fullName || roleName}
              </p>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-bold uppercase tracking-wider">
                {roleName}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[160px]">
              {userProfile?.email || "branch@store.com"}
            </p>
          </div>
        </div>
      </div>

      {/* Global Branch Command Palette Modal */}
      <BranchCommandPalette open={commandOpen} setOpen={setCommandOpen} />
    </header>
  );
}