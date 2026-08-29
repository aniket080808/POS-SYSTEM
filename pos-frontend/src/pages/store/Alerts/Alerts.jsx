import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '@/components/ui/badge';
import InactiveCashierTable from './InactiveCashierTable';
import LowStockProductTable from './LowStockProductTable';
import NoSaleTodayBranchTable from './NoSaleTodayBranchTable';
import RefundSpikeTable from './RefundSpikeTable';
import { useDispatch, useSelector } from 'react-redux';
import { getStoreAlerts } from '../../../Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks';

const Alerts = () => {
  const dispatch = useDispatch();
  const { storeAlerts } = useSelector((state) => state.storeAnalytics);
  const user = useSelector((state) => state.user.userProfile);

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Alerts & Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time automated feeds flagging operational anomalies, inventory thresholds, and cash drawer activities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inactive Cashiers */}
        <Card className="min-h-96">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-bold">Inactive Cashiers</CardTitle>
            <Badge variant={inactiveCount > 0 ? "destructive" : "secondary"}>
              {inactiveCount} {inactiveCount === 1 ? 'Cashier' : 'Cashiers'}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <InactiveCashierTable />
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="min-h-96">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-bold">Low Stock Alerts</CardTitle>
            <Badge variant={lowStockCount > 0 ? "destructive" : "secondary"}>
              {lowStockCount} {lowStockCount === 1 ? 'Product' : 'Products'}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <LowStockProductTable />
          </CardContent>
        </Card>

        {/* No Sale Today */}
        <Card className="min-h-96">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-bold">No Sale Today</CardTitle>
            <Badge variant={noSalesCount > 0 ? "destructive" : "secondary"}>
              {noSalesCount} {noSalesCount === 1 ? 'Branch' : 'Branches'}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <NoSaleTodayBranchTable />
          </CardContent>
        </Card>

        {/* Refund Spike */}
        <Card className="min-h-96">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-bold">Refund Spike Alerts</CardTitle>
            <Badge variant={refundCount > 0 ? "destructive" : "secondary"}>
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