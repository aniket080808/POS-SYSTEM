import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } from '../../../Redux Toolkit/features/notification/notificationThunks';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Trash2, CheckCircle, Info, AlertTriangle, AlertCircle, Check } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { Input } from '../../../components/ui/input';

const PriorityIcon = ({ priority }) => {
  switch (priority) {
    case 'INFO': return <Info className="text-blue-500 w-5 h-5" />;
    case 'WARNING': return <AlertTriangle className="text-yellow-500 w-5 h-5" />;
    case 'ERROR': return <AlertCircle className="text-red-500 w-5 h-5" />;
    case 'SUCCESS': return <CheckCircle className="text-green-500 w-5 h-5" />;
    default: return <Bell className="text-gray-500 w-5 h-5" />;
  }
};

export default function NotificationPanel({ children }) {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector(state => state.notification);
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

  const filteredNotifications = notifications.filter(n => 
    n.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
    n.message.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4 mt-2" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        
        <div className="flex px-4 py-2 space-x-2 border-b">
          <Button variant={activeTab === 'ALL' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('ALL')}>All</Button>
          <Button variant={activeTab === 'UNREAD' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('UNREAD')}>Unread</Button>
        </div>
        
        <div className="p-2 border-b">
          <Input 
            placeholder="Search..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
          />
        </div>

        <ScrollArea className="h-[300px]">
          {loading && notifications.length === 0 ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center">
              <Bell className="w-10 h-10 mb-2 opacity-20" />
              <p>No notifications found</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`relative group flex items-start gap-3 p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}
                >
                  <PriorityIcon priority={notif.priority} />
                  <div className="flex-1 cursor-pointer" onClick={() => {
                      if (!notif.read) dispatch(markAsRead(notif.id));
                      if (notif.actionUrl) window.location.href = notif.actionUrl;
                    }}>
                    <h5 className={`text-sm ${!notif.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                      {notif.title}
                    </h5>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground mt-2 block">
                      {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 flex flex-col gap-1">
                    {!notif.read && (
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => dispatch(markAsRead(notif.id))}>
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => dispatch(deleteNotification(notif.id))}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="p-2 border-t flex justify-between bg-muted/20">
            <Button variant="ghost" size="sm" className="text-xs w-1/2" onClick={() => dispatch(markAllAsRead())}>
              Mark all read
            </Button>
            <Button variant="ghost" size="sm" className="text-xs w-1/2 text-red-500 hover:text-red-600" onClick={() => dispatch(deleteAllNotifications())}>
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
