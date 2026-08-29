import React from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IndianRupee, ShoppingBag, Users, Package, TrendingUp, TrendingDown, Minus } from "lucide-react";

const TodayOverview = () => {
  const { todayOverview, loading } = useSelector((state) => state.branchAnalytics);

  const formatGrowth = (val) => {
    if (val === undefined || val === null || isNaN(val)) return "0.0%";
    const sign = val > 0 ? "+" : "";
    return `${sign}${Number(val).toFixed(1)}%`;
  };

  const getGrowthBadge = (val, isLowStock = false) => {
    if (val === undefined || val === null || isNaN(val) || val === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Minus className="w-3 h-3" /> 0.0% vs yesterday
        </span>
      );
    }
    const isPositive = val > 0;
    // For low stock items, positive growth (more low stock items) is actually negative/warning
    const isGood = isLowStock ? !isPositive : isPositive;

    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium ${isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {formatGrowth(val)} vs yesterday
      </span>
    );
  };

  if (loading && !todayOverview) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Today's Sales",
      value: `₹${(todayOverview?.totalSales || 0).toLocaleString('en-IN')}`,
      icon: <IndianRupee className="w-6 h-6 text-primary" />,
      growthBadge: getGrowthBadge(todayOverview?.salesGrowth),
      emptyHint: todayOverview?.totalSales === 0 ? "No sales recorded yet today" : null
    },
    {
      title: "Orders Today",
      value: todayOverview?.ordersToday || 0,
      icon: <ShoppingBag className="w-6 h-6 text-primary" />,
      growthBadge: getGrowthBadge(todayOverview?.orderGrowth),
      emptyHint: todayOverview?.ordersToday === 0 ? "0 orders completed today" : null
    },
    {
      title: "Active Cashiers",
      value: todayOverview?.activeCashiers || 0,
      icon: <Users className="w-6 h-6 text-primary" />,
      growthBadge: (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
          {todayOverview?.activeCashiers > 0 ? "Currently on active shift" : "No cashiers on shift"}
        </span>
      ),
      emptyHint: null
    },
    {
      title: "Low Stock Items",
      value: todayOverview?.lowStockItems || 0,
      icon: <Package className="w-6 h-6 text-primary" />,
      growthBadge: (
        <span className={`inline-flex items-center gap-1 text-xs font-medium ${(todayOverview?.lowStockItems || 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
          {(todayOverview?.lowStockItems || 0) > 0 ? `${todayOverview.lowStockItems} items below threshold` : "All items well stocked"}
        </span>
      ),
      emptyHint: null
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">{kpi.value}</h3>
                <div className="pt-1">
                  {kpi.growthBadge}
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                {kpi.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TodayOverview;