import React, { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InactiveCashierTable from "./InactiveCashierTable";
import LowStockProductTable from "./LowStockProductTable";
import NoSaleTodayBranchTable from "./NoSaleTodayBranchTable";
import RefundSpikeTable from "./RefundSpikeTable";
import { useDispatch, useSelector } from "react-redux";
import { getStoreAlerts } from "../../../Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { AlertCircle, UserX, AlertTriangle, Store, RotateCcw } from "lucide-react";

const Alerts = () => {
  const dispatch = useDispatch();
  const { storeAlerts } = useSelector((state) => state.storeAnalytics);
  const { store } = useSelector((state) => state.store);
  const user = useSelector((state) => state.user.userProfile);

  const adminId = store?.storeAdmin?.id || user?.id;

  useEffect(() => {
    if (adminId) {
      dispatch(getStoreAlerts(adminId));
    }
  }, [dispatch, adminId]);

  const inactiveCount = storeAlerts?.inactiveCashiers?.length || 0;
  const lowStockCount = storeAlerts?.lowStockAlerts?.length || 0;
  const noSalesCount = storeAlerts?.noSalesToday?.length || 0;
  const refundCount = storeAlerts?.refundSpikeAlerts?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Operational Anomalies & Store Alerts
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Real-time automated surveillance feeds flagging low stock thresholds, inactive counters, and refund spikes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inactive Cashiers */}
        <Card className="min-h-96">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserX className="w-4 h-4 text-[#B8860B]" />
                <CardTitle className="text-base">Inactive Cashier Accounts</CardTitle>
              </div>
              <Badge variant={inactiveCount > 0 ? "error" : "active"} className="text-xs font-mono">
                {inactiveCount} {inactiveCount === 1 ? "Cashier" : "Cashiers"}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Staff accounts that haven't signed into POS terminal within scheduled shift window
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <InactiveCashierTable />
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="min-h-96">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#B8860B]" />
                <CardTitle className="text-base">Low Stock Threshold Warnings</CardTitle>
              </div>
              <Badge variant={lowStockCount > 0 ? "warning" : "active"} className="text-xs font-mono">
                {lowStockCount} {lowStockCount === 1 ? "SKU" : "SKUs"}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Catalog products with inventory quantities at or below critical reorder limits
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <LowStockProductTable />
          </CardContent>
        </Card>

        {/* No Sale Today */}
        <Card className="min-h-96">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#B8860B]" />
                <CardTitle className="text-base">Branches with Zero Daily Sales</CardTitle>
              </div>
              <Badge variant={noSalesCount > 0 ? "error" : "active"} className="text-xs font-mono">
                {noSalesCount} {noSalesCount === 1 ? "Branch" : "Branches"}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Registered branch workstations with no checkout orders processed today
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <NoSaleTodayBranchTable />
          </CardContent>
        </Card>

        {/* Refund Spike */}
        <Card className="min-h-96">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#B8860B]" />
                <CardTitle className="text-base">Refund & Till Reversal Spikes</CardTitle>
              </div>
              <Badge variant={refundCount > 0 ? "error" : "active"} className="text-xs font-mono">
                {refundCount} {refundCount === 1 ? "Alert" : "Alerts"}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Unusual transaction refund rates or high-value cashier reversals
            </CardDescription>
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