import { useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';
import { offlineDb } from '@/utils/offlineDb';
import { playScanBeep } from '@/utils/audioUtils';
import { toast } from 'sonner';

/**
 * Actively tests real internet / network reachability.
 * Uses a zero-byte 204 endpoint probe with cache-busting to bypass false-positive
 * virtual adapters (WSL, Hyper-V, loopback) and captive portals.
 */
export const checkRealConnectivity = async () => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    await fetch(`https://www.google.com/generate_204?_t=${Date.now()}`, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return true;
  } catch (_err) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      await fetch(`https://httpbin.org/status/204?_t=${Date.now()}`, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return true;
    } catch (_fallbackErr) {
      return false;
    }
  }
};

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshPendingCount = useCallback(async () => {
    try {
      const pending = await offlineDb.getPendingOfflineOrders();
      setPendingCount(pending.length);
    } catch (e) {
      console.warn('Failed to read offline orders queue', e);
    }
  }, []);

  const syncPendingOrders = useCallback(async () => {
    if (isSyncing) return;
    try {
      const pending = await offlineDb.getPendingOfflineOrders();
      if (!pending || pending.length === 0) {
        setPendingCount(0);
        return;
      }

      setIsSyncing(true);
      const res = await api.post('/api/orders/bulk-sync', pending);
      if (res.status === 200 || res.status === 201) {
        await offlineDb.clearPendingOrders();
        setPendingCount(0);
        playScanBeep();
        toast.success(`Synced ${pending.length} offline bills to store server! 🚀`, {
          description: 'All offline sales records have been reconciled successfully.',
        });
      }
    } catch (err) {
      console.error('Offline sync failed', err);
      toast.error('Sync failed: will retry when connection stabilizes.');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  const evaluateStatus = useCallback(async () => {
    const online = await checkRealConnectivity();
    setIsOnline((prev) => {
      if (prev !== online) {
        if (online) {
          toast.success('Connection restored! 🟢 Syncing queued offline bills...');
          syncPendingOrders();
        } else {
          toast.warning('Network disconnected! 🔴 Switched to Offline Billing Mode.', {
            description: 'You can continue creating bills. They will auto-sync when online.',
          });
        }
      }
      return online;
    });
  }, [syncPendingOrders]);

  useEffect(() => {
    refreshPendingCount();
    evaluateStatus();

    const handleOnline = () => {
      evaluateStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Network disconnected! 🔴 Switched to Offline Billing Mode.', {
        description: 'You can continue creating bills. They will auto-sync when online.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('focus', handleOnline);

    // Fast 3-second heartbeat probe for instant offline/online status transition
    const intervalId = setInterval(() => {
      evaluateStatus();
      refreshPendingCount();
    }, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleOnline);
      clearInterval(intervalId);
    };
  }, [evaluateStatus, refreshPendingCount]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    syncPendingOrders,
    refreshPendingCount,
  };
};

