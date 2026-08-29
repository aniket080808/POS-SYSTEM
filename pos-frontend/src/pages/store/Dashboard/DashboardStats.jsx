import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Store, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { getStoreOverview } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useToast } from "@/components/ui/use-toast";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const DashboardStats = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrencyFormatter();
  const { storeOverview, loading } = useSelector((state) => state.storeAnalytics);
  const { userProfile } = useSelector((state) => state.user);

  const fetchStoreOverview = useCallback(async () => {
    if (!userProfile?.id) return;
    try {
      await dispatch(getStoreOverview(userProfile.id)).unwrap();
    } catch (err) {
      console.error("Store overview fetch error:", err);
      toast({
        description: err || "Failed to load store overview data.",
        duration: 5000,
      });
    }
  }, [dispatch, userProfile?.id, toast]);

  useEffect(() => {
    fetchStoreOverview();
  }, [fetchStoreOverview]);

  const formatChange = (current, previous) => {
    if (!previous || previous === 0) return "+0%";
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  const stats = [
    {
      title: "Total Gross Sales",
      value: formatCurrency(storeOverview?.totalSales || 0),
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
      subText: formatChange(storeOverview?.totalSales, storeOverview?.previousPeriodSales) + " vs prior period",
      subTextClass: formatChange(storeOverview?.totalSales, storeOverview?.previousPeriodSales).startsWith("+")
        ? "text-emerald-600 font-bold"
        : "text-red-500 font-bold",
      badgeBg: "bg-emerald-50 text-emerald-600",
      loading: loading,
    },
    {
      title: "Branch Outlets",
      value: storeOverview?.totalBranches || 0,
      icon: <Store className="w-5 h-5 text-accent" />,
      subText: "Active physical stores",
      subTextClass: "text-muted-foreground",
      badgeBg: "bg-amber-50 text-amber-600",
      loading: loading,
    },
    {
      title: "Catalog Products",
      value: storeOverview?.totalProducts || 0,
      icon: <ShoppingCart className="w-5 h-5 text-primary" />,
      subText: "Master inventory SKUs",
      subTextClass: "text-muted-foreground",
      badgeBg: "bg-primary/10 text-primary",
      loading: loading,
    },
    {
      title: "Staff & Cashiers",
      value: storeOverview?.totalEmployees || 0,
      icon: <Users className="w-5 h-5 text-primary" />,
      subText: "Active branch operators",
      subTextClass: "text-muted-foreground",
      badgeBg: "bg-primary/10 text-primary",
      loading: loading,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="rounded-2xl border border-border/80 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-extrabold tracking-tight mt-1 text-foreground font-mono">
                  {stat.loading ? (
                    <div className="h-8 w-24 bg-muted rounded-lg animate-pulse" />
                  ) : (
                    stat.value
                  )}
                </h3>
                <div className={`text-xs mt-1 ${stat.subTextClass}`}>
                  {stat.loading ? (
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  ) : (
                    stat.subText
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-xl font-bold ${stat.badgeBg}`}>
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;