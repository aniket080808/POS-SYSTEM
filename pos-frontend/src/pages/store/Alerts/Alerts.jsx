import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '@/components/ui/badge';
import InactiveCashierTable from './InactiveCashierTable';
import LowStockProductTable from './LowStockProductTable';
import NoSaleTodayBranchTable from './NoSaleTodayBranchTable';
import RefundSpikeTable from './RefundSpikeTable';
import { useDispatch, useSelector } from 'react-redux';
import { getStoreAlerts } from '../../../Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks';
import { Bell, AlertTriangle, UserX, AlertOctagon, TrendingDown } from 'lucide-react';

const Alerts = () => {
  const dispatch = useDispatch();
  const { storeAlerts } = useSelector((state) => state.storeAnalytics || {});
  const user = useSelector((state) => state.user?.userProfile);

  useEffect(() => {
    if (user?.id) {
      dispatch(getStoreAlerts(user.id));
    }
  }, [dispatch, user?.id]);

  const inactiveCount = storeAlerts?.inactiveCashiers?.length || 0;
  const lowStockCount = storeAlerts?.lowStockAlerts?.length || 0;
  const noSalesCount = storeAlerts?.noSalesToday?.length || 0;
  const refundCount = storeAlerts?.refundSpikeAlerts?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Operational Alerts & Monitoring</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Automated feeds flagging operational anomalies, inventory thresholds, and transaction deviations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inactive Cashiers */}
        <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/60 py-3.5 px-6 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <UserX className="w-4 h-4 text-amber-500" />
              <CardTitle className="text-sm font-bold text-foreground">Inactive Terminal Shifts</CardTitle>
            </div>
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${
                inactiveCount > 0
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {inactiveCount} {inactiveCount === 1 ? 'Cashier' : 'Cashiers'}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <InactiveCashierTable />
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/60 py-3.5 px-6 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <CardTitle className="text-sm font-bold text-foreground">Critical Low Stock Thresholds</CardTitle>
            </div>
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${
                lowStockCount > 0
                  ? "bg-destructive/10 text-destructive border-destructive/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {lowStockCount} {lowStockCount === 1 ? 'Product' : 'Products'}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <LowStockProductTable />
          </CardContent>
        </Card>

        {/* No Sale Today */}
        <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/60 py-3.5 px-6 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-sky-500" />
              <CardTitle className="text-sm font-bold text-foreground">Dormant Branch Locations</CardTitle>
            </div>
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${
                noSalesCount > 0
                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {noSalesCount} {noSalesCount === 1 ? 'Branch' : 'Branches'}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <NoSaleTodayBranchTable />
          </CardContent>
        </Card>

        {/* Refund Spike */}
        <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/60 py-3.5 px-6 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-destructive" />
              <CardTitle className="text-sm font-bold text-foreground">Refund & Void Anomalies</CardTitle>
            </div>
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${
                refundCount > 0
                  ? "bg-destructive/10 text-destructive border-destructive/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {refundCount} {refundCount === 1 ? 'Alert' : 'Alerts'}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <RefundSpikeTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Alerts;