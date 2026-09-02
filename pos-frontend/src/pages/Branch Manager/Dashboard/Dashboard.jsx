import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { RotateCcw, Store } from "lucide-react";
import SalesChart from "./SalesChart";
import TopProducts from "./TopProducts";
import CashierPerformance from "./CashierPerformance";
import RecentOrders from "./RecentOrders";
import { getTodayOverview, getPaymentBreakdown, getDailySalesChart, getTopProductsByQuantity, getTopCashiersByRevenue } from "@/Redux Toolkit/features/branchAnalytics/branchAnalyticsThunks";
import { getRecentOrdersByBranch } from "@/Redux Toolkit/features/order/orderThunks";
import { findBranchEmployees } from "@/Redux Toolkit/features/employee/employeeThunks";
import { getLocalDateString } from "@/utils/formateDate";
import PaymentBreakdown from "./PaymentBreakdown";
import TodayOverview from "./TodayOverview";
import BranchSettlementStrip from "./BranchSettlementStrip";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { branch } = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);
  const branchId = branch?.id || userProfile?.branchId || userProfile?.branch?.id;
  const [refreshing, setRefreshing] = useState(false);

  const loadAllData = () => {
    if (branchId) {
      setRefreshing(true);
      const today = getLocalDateString();
      Promise.all([
        dispatch(getTodayOverview(branchId)),
        dispatch(getPaymentBreakdown({ branchId, date: today })),
        dispatch(getDailySalesChart({ branchId, days: 7 })),
        dispatch(getTopProductsByQuantity(branchId)),
        dispatch(getTopCashiersByRevenue(branchId)),
        dispatch(getRecentOrdersByBranch(branchId)),
        dispatch(findBranchEmployees({ branchId })),
      ]).finally(() => {
        setRefreshing(false);
      });
    }
  };

  useEffect(() => {
    if (branchId) {
      loadAllData();
    }
  }, [branchId, dispatch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Branch Dashboard
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Store className="w-4 h-4 text-primary" />
            <span>{branch?.name || "Loading branch..."}</span>
            {branch?.branchCode && (
              <span className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                {branch.branchCode}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadAllData}
          disabled={refreshing}
          className="gap-2 self-start sm:self-auto"
        >
          <RotateCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* KPI Cards */}
      <TodayOverview />

      {/* Counter Settlement & Cash Drawer Strip */}
      <BranchSettlementStrip />
      
      {/* Payment Breakdown */}
      <PaymentBreakdown />
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesChart />
        <TopProducts />
      </div>

      {/* Staff & Orders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CashierPerformance />
        <RecentOrders />
      </div>
    </div>
  );
}