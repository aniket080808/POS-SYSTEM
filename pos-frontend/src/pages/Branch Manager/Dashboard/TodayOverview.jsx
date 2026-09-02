import React from "react";
import { useSelector } from "react-redux";
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

  const getGrowthBadge = (val) => {
    if (val === undefined || val === null || isNaN(val) || val === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
          <Minus className="w-3 h-3" /> 0.0% vs yesterday
        </span>
      );
    }
    const isPositive = val > 0;

    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8C5800]">
        {isPositive ? <TrendingUp className="w-3 h-3 text-[#F5A623]" /> : <TrendingDown className="w-3 h-3 text-destructive" />}
        {formatGrowth(val)} vs yesterday
      </span>
    );
  };

  if (loading && !todayOverview) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32 mb-1" />
            <Skeleton className="h-3 w-28" />
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Today's Sales",
      value: `₹${(todayOverview?.totalSales || 0).toLocaleString("en-IN")}`,
      icon: <IndianRupee className="w-5 h-5 text-[#F5A623]" />,
      growthBadge: getGrowthBadge(todayOverview?.salesGrowth),
    },
    {
      title: "Total Orders",
      value: todayOverview?.ordersToday || 0,
      icon: <ShoppingBag className="w-5 h-5 text-[#F5A623]" />,
      growthBadge: getGrowthBadge(todayOverview?.orderGrowth),
    },
    {
      title: "Active Cashiers",
      value: todayOverview?.activeCashiers || 0,
      icon: <Users className="w-5 h-5 text-[#F5A623]" />,
      growthBadge: (
        <span className="text-[11px] font-semibold text-muted-foreground">
          {todayOverview?.activeCashiers > 0 ? "Currently on shift" : "No active shifts"}
        </span>
      ),
    },
    {
      title: "Low Stock Items",
      value: todayOverview?.lowStockItems || 0,
      icon: <Package className="w-5 h-5 text-[#F5A623]" />,
      growthBadge: (
        <span className={`text-[11px] font-semibold ${(todayOverview?.lowStockItems || 0) > 0 ? "text-destructive" : "text-muted-foreground"}`}>
          {(todayOverview?.lowStockItems || 0) > 0 ? `${todayOverview.lowStockItems} items running low` : "Stock levels good"}
        </span>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="border-border shadow-2xs hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{kpi.title}</p>
                <h3 className="text-2xl font-black font-mono tracking-tight text-foreground">{kpi.value}</h3>
                <div className="pt-0.5">{kpi.growthBadge}</div>
              </div>
              <div className="w-11 h-11 bg-secondary/80 rounded-2xl flex items-center justify-center shrink-0">
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