import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } from '../../../Redux Toolkit/features/notification/notificationThunks';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Trash2, CheckCircle2, Info, AlertTriangle, AlertCircle, Check, Search } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { Input } from '../../../components/ui/input';

const PriorityIcon = ({ priority }) => {
  switch (priority) {
    case 'INFO': return <Info className="text-sky-500 dark:text-sky-400 w-4 h-4 shrink-0" />;
    case 'WARNING': return <AlertTriangle className="text-amber-500 dark:text-amber-400 w-4 h-4 shrink-0" />;
    case 'ERROR': return <AlertCircle className="text-destructive w-4 h-4 shrink-0" />;
    case 'SUCCESS': return <CheckCircle2 className="text-emerald-500 dark:text-emerald-400 w-4 h-4 shrink-0" />;
    default: return <Bell className="text-muted-foreground w-4 h-4 shrink-0" />;
  }
};

export default function NotificationPanel({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications = [], unreadCount = 0, loading } = useSelector(state => state.notification || {});
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, UNREAD
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (open) {
      dispatch(fetchNotifications({ page: 0, size: 20, unreadOnly: activeTab === 'UNREAD' }));
    }
  }, [open, activeTab, dispatch]);

  const filteredNotifications = (notifications || []).filter(n => 
    (n.title || '').toLowerCase().includes(debouncedSearch.toLowerCase()) || 
    (n.message || '').toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-84 p-0 mr-4 mt-2 rounded-2xl bg-card border-border shadow-md overflow-hidden" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/80 bg-card">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-xs text-foreground">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="warning" className="text-[10px] px-1.5 py-0 h-4 rounded-full font-bold">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg border border-border/60">
            <Button
              variant={activeTab === 'ALL' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('ALL')}
              className="h-6 text-[10px] px-2 rounded-md font-semibold"
            >
              All
            </Button>
            <Button
              variant={activeTab === 'UNREAD' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('UNREAD')}
              className="h-6 text-[10px] px-2 rounded-md font-semibold"
            >
              Unread
            </Button>
          </div>
        </div>
        
        <div className="p-2 border-b border-border/60 bg-muted/20">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search notifications..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 pl-8 text-xs rounded-lg"
            />
          </div>
        </div>

        <ScrollArea className="h-[300px]">
          {loading && notifications.length === 0 ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex space-x-3 items-start">
                  <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-3/4 rounded" />
                    <Skeleton className="h-2.5 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs flex flex-col items-center justify-center">
              <Bell className="w-8 h-8 mb-2 opacity-30 text-muted-foreground" />
              <p className="font-semibold text-foreground">No alerts found</p>
              <p className="text-[11px]">You're caught up with all notifications.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/60">
              {filteredNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`relative group flex items-start gap-3 p-3.5 transition-colors ${!notif.read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/40'}`}
                >
                  <PriorityIcon priority={notif.priority} />
                  <div className="flex-1 cursor-pointer min-w-0 pr-4" onClick={() => {
                      if (!notif.read) dispatch(markAsRead(notif.id));
                      if (notif.actionUrl) {
                        setOpen(false);
                        navigate(notif.actionUrl);
                      }
                    }}>
                    <h5 className={`text-xs truncate ${!notif.read ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                      {notif.title}
                    </h5>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground/80 mt-1.5 block font-mono">
                      {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2.5 flex items-center gap-1">
                    {!notif.read && (
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-emerald-500/10 text-emerald-600" title="Mark Read" onClick={() => dispatch(markAsRead(notif.id))}>
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-destructive/10 text-destructive" title="Dismiss" onClick={() => dispatch(deleteNotification(notif.id))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="p-2 border-t border-border/80 flex items-center justify-between bg-muted/30">
            <Button variant="ghost" size="sm" className="text-[11px] h-7 font-semibold text-muted-foreground hover:text-foreground" onClick={() => dispatch(markAllAsRead())}>
              Mark all read
            </Button>
            <Button variant="ghost" size="sm" className="text-[11px] h-7 font-semibold text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => dispatch(deleteAllNotifications())}>
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

