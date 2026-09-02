import React from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OfflineStatusBar = () => {
  const { isOnline, pendingCount, isSyncing, syncPendingOrders } = useOfflineSync();

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Wifi className="w-3.5 h-3.5" />
          <span>Online</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-medium animate-pulse">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline POS Mode</span>
        </div>
      )}

      {pendingCount > 0 && (
        <Button
          size="sm"
          variant="outline"
          onClick={syncPendingOrders}
          disabled={!isOnline || isSyncing}
          className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>
            {pendingCount} Queued {isSyncing ? 'Syncing...' : 'Sync'}
          </span>
        </Button>
      )}
    </div>
  );
};

export default OfflineStatusBar;
