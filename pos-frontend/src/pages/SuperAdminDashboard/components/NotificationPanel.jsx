import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../../../Redux Toolkit/features/notification/notificationThunks";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Trash2,
  Check,
  Info,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { ScrollArea } from "../../../components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { Input } from "../../../components/ui/input";

const PriorityIcon = ({ priority }) => {
  switch (priority) {
    case "WARNING":
      return <AlertTriangle className="text-[#B8860B] w-4 h-4 shrink-0 mt-0.5" />;
    case "ERROR":
      return <AlertCircle className="text-destructive w-4 h-4 shrink-0 mt-0.5" />;
    case "SUCCESS":
      return <Check className="text-emerald-600 dark:text-emerald-400 w-4 h-4 shrink-0 mt-0.5" />;
    case "INFO":
    default:
      return <Info className="text-muted-foreground w-4 h-4 shrink-0 mt-0.5" />;
  }
};

export default function NotificationPanel({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading } = useSelector(
    (state) => state.notification
  );
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (open) {
      dispatch(
        fetchNotifications({
          page: 0,
          size: 20,
          unreadOnly: activeTab === "UNREAD",
        })
      );
    }
  }, [open, activeTab, dispatch]);

  const filteredNotifications = notifications.filter(
    (n) =>
      n.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      n.message.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-84 sm:w-96 p-0 mr-4 mt-2 bg-card border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden z-50"
        align="end"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-secondary/50 shrink-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-foreground">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() => dispatch(markAllAsRead())}
              className="text-xs text-[#785600] dark:text-[#EED896] hover:underline font-semibold cursor-pointer transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Filter Tabs & Search */}
        <div className="p-2.5 border-b border-border/60 space-y-2 shrink-0 bg-card">
          <div className="flex rounded-xl bg-secondary p-0.5 border border-border/50">
            <button
              type="button"
              className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("ALL")}
            >
              All Alerts
            </button>
            <button
              type="button"
              className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "UNREAD"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("UNREAD")}
            >
              Unread
            </button>
          </div>
          <Input
            placeholder="Filter notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs bg-secondary/30"
          />
        </div>

        {/* Notifications List with dedicated height to allow internal scrolling */}
        <div className="h-72 w-full overflow-hidden flex flex-col bg-card">
          <ScrollArea className="h-full w-full">
            {loading && notifications.length === 0 ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="h-64 text-center text-muted-foreground text-xs flex flex-col items-center justify-center p-6">
                <Bell className="w-8 h-8 mb-2 opacity-30 text-muted-foreground" />
                <p className="font-semibold text-foreground">No alerts found</p>
                <p className="text-[11px] mt-0.5">Platform notifications will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60 pb-2">
                {filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`relative group flex items-start gap-3 p-3.5 hover:bg-secondary/40 transition-colors ${
                      !notif.read ? "bg-[#FDF6E2]/40 dark:bg-[#2A2312]/30" : ""
                    }`}
                  >
                    <PriorityIcon priority={notif.priority} />
                    <div
                      className="flex-1 cursor-pointer min-w-0"
                      onClick={() => {
                        if (!notif.read) dispatch(markAsRead(notif.id));
                        if (notif.actionUrl) {
                          setOpen(false);
                          navigate(notif.actionUrl);
                        }
                      }}
                    >
                      <h5
                        className={`text-xs ${
                          !notif.read
                            ? "font-bold text-foreground"
                            : "font-semibold text-muted-foreground"
                        }`}
                      >
                        {notif.title}
                      </h5>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground/80 mt-1 block font-mono">
                        {notif.createdAt
                          ? formatDistanceToNow(new Date(notif.createdAt), {
                              addSuffix: true,
                            })
                          : ""}
                      </span>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                      {!notif.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-md hover:bg-secondary text-muted-foreground"
                          onClick={() => dispatch(markAsRead(notif.id))}
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        onClick={() => dispatch(deleteNotification(notif.id))}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Footer (Always sits below the scroll list, completely non-overlapping) */}
        {notifications.length > 0 && (
          <div className="p-2 border-t border-border/70 bg-secondary/40 shrink-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10 w-full font-semibold rounded-xl gap-1.5 transition-colors cursor-pointer"
              onClick={() => dispatch(deleteAllNotifications())}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Alerts
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
