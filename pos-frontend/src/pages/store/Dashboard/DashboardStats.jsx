import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Store, ShoppingBag, Users, TrendingUp, TrendingDown } from "lucide-react";
import { getStoreOverview } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useToast } from "@/components/ui/use-toast";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const DashboardStats = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrencyFormatter();
  const { storeOverview, loading } = useSelector((state) => state.storeAnalytics);
  const { store } = useSelector((state) => state.store);
  const { userProfile } = useSelector((state) => state.user);

  const adminId = store?.storeAdmin?.id || userProfile?.id;

  useEffect(() => {
    if (adminId && !storeOverview) {
      fetchStoreOverview();
    }
  }, [adminId]);

  const fetchStoreOverview = async () => {
    try {
      if (!adminId) return;
      await dispatch(getStoreOverview(adminId)).unwrap();
    } catch (err) {
      console.error("Store overview fetch error:", err);
      toast({
        description: err || "Failed to load store overview data.",
        duration: 5000,
      });
    }
  };

  // Format percentage change
  const formatChange = (current, previous) => {
    if (!previous || previous === 0) return "+0%";
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  const isSalesPositive = (storeOverview?.totalSales || 0) >= (storeOverview?.previousPeriodSales || 0);

  const stats = [
    {
      title: "Total Sales",
      value: formatCurrency(storeOverview?.totalSales || 0),
      icon: <DollarSign className="w-5 h-5 text-[#B8860B]" />,
      iconBg: "bg-[#FDF6E2] border-[#EED896]",
      subText: `${formatChange(storeOverview?.totalSales, storeOverview?.previousPeriodSales)} from last period`,
      subTextClass: isSalesPositive ? "text-foreground font-semibold" : "text-destructive font-semibold",
      loading: loading,
    },
    {
      title: "Active Branches",
      value: storeOverview?.totalBranches || 0,
      icon: <Store className="w-5 h-5 text-[#262422]" />,
      iconBg: "bg-secondary border-border",
      subText: "Configured locations",
      subTextClass: "text-muted-foreground",
      loading: loading,
    },
    {
      title: "Catalog Products",
      value: storeOverview?.totalProducts || 0,
      icon: <ShoppingBag className="w-5 h-5 text-[#B8860B]" />,
      iconBg: "bg-[#FDF6E2] border-[#EED896]",
      subText: "Total active SKUs",
      subTextClass: "text-muted-foreground",
      loading: loading,
    },
    {
      title: "Active Staff",
      value: storeOverview?.totalEmployees || 0,
      icon: <Users className="w-5 h-5 text-[#262422]" />,
      iconBg: "bg-secondary border-border",
      subText: "Store & branch staff",
      subTextClass: "text-muted-foreground",
      loading: loading,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </p>
                <div className="text-2xl font-black text-foreground tracking-tight">
                  {stat.loading ? (
                    <div className="h-7 w-24 bg-muted animate-pulse rounded-lg mt-1"></div>
                  ) : (
                    stat.value
                  )}
                </div>
                <div className={`text-xs mt-1 flex items-center gap-1 ${stat.subTextClass}`}>
                  {stat.loading ? (
                    <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
                  ) : (
                    stat.subText
                  )}
                </div>
              </div>
              <div className={`p-2.5 rounded-xl border ${stat.iconBg} shadow-2xs`}>
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