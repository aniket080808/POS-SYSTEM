import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NotificationPanel from "../../SuperAdminDashboard/components/NotificationPanel";
import { fetchUnreadCount } from "@/Redux Toolkit/features/notification/notificationThunks";
import { getRoleDisplayName } from "@/utils/userRole";
import { useSidebar } from "../../../context/hooks/useSidebar";
import { useWebSocket } from "@/hooks/useWebSocket";
import OfflineStatusBar from "@/components/common/OfflineStatusBar";
import {

  Menu,
  Bell,
  User,
  Store as StoreIcon,
  Zap,
  ArrowLeft,
} from "lucide-react";

const POSHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    "Main Branch Station";

  return (
    <header className="bg-card border-b border-border/70 px-4 py-2 flex items-center justify-between shadow-2xs sticky top-0 z-20 shrink-0 h-12">
      {/* Left: Sidebar Toggle (Mobile) + Branch Title */}
      <div className="flex items-center gap-2.5">
        <Button
          variant="outline"
          size="icon"
          className="md:hidden h-8 w-8 rounded-xl border-border hover:bg-secondary cursor-pointer shadow-2xs shrink-0"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-3.5 w-3.5 text-foreground" />
        </Button>

        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-1.5 truncate">
            <StoreIcon className="h-3.5 w-3.5 text-[#B8860B]" />
            {branchDisplayName}
          </h1>
          <Badge variant="active" className="text-[9px] font-mono font-bold px-1.5 py-0.2">
            LIVE
          </Badge>
        </div>
      </div>

      {/* Center: Keyboard Shortcuts Bar */}
      <div className="hidden lg:flex items-center gap-1 bg-secondary/60 border border-border/60 px-2.5 py-1 rounded-xl">
        <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
          <Zap className="h-2.5 w-2.5 text-[#B8860B]" /> Keys:
        </span>
        <Badge variant="secondary" className="text-[9px] font-mono font-bold px-1.5 py-0.2">
          F1 Search
        </Badge>
        <Badge variant="secondary" className="text-[9px] font-mono font-bold px-1.5 py-0.2">
          F2 Customer
        </Badge>
        <Badge variant="secondary" className="text-[9px] font-mono font-bold px-1.5 py-0.2">
          F3 Disc
        </Badge>
        <Badge variant="secondary" className="text-[9px] font-mono font-bold px-1.5 py-0.2">
          F4 Hold
        </Badge>
        <Badge variant="secondary" className="text-[9px] font-mono font-bold px-1.5 py-0.2">
          F8 Recall
        </Badge>
        <Badge variant="active" className="text-[9px] font-mono font-bold px-1.5 py-0.2">
          Ctrl+Enter Pay
        </Badge>
      </div>

      {/* Right: Notifications, Offline Status, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <OfflineStatusBar />

        {/* Exit POS Terminal back to Admin/Manager */}

        {userProfile?.role && userProfile.role !== "ROLE_BRANCH_CASHIER" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (userProfile.role.includes("STORE")) navigate("/store/dashboard");
              else if (userProfile.role.includes("BRANCH")) navigate("/branch/dashboard");
              else navigate("/super-admin/dashboard");
            }}
            className="h-9 text-xs font-bold gap-1.5 border-amber-500/40 text-[#8C5800] bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Exit Terminal
          </Button>
        )}

        {/* Real Notification Bell with NotificationPanel Popover */}
        <NotificationPanel>
          <Button variant="ghost" size="icon" className="relative cursor-pointer h-9 w-9 rounded-xl">
            <Bell className="h-4 w-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute 1.5 top-1.5 right-1.5 bg-[#7A331E] text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
        </NotificationPanel>

        {/* User Profile & Role Info */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-border/60">
          <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-xs text-foreground">
            {userProfile?.fullName ? userProfile.fullName.charAt(0).toUpperCase() : <User className="h-4 w-4 text-muted-foreground" />}
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-foreground truncate max-w-[130px]">
                {userProfile?.fullName || "Cashier"}
              </p>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-bold uppercase tracking-wider">
                {roleName || "Cashier"}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px]">
              {userProfile?.email || "cashier@pos.com"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default POSHeader;
