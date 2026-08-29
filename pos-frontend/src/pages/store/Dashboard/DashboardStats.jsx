import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DollarSign, Store, ShoppingCart, Users, TrendingUp, IndianRupee } from "lucide-react";
import { getStoreOverview } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useToast } from "@/components/ui/use-toast";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { StatCard } from "@/components/ui/stat-card";

const DashboardStats = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrencyFormatter();
  const { storeOverview, loading } = useSelector((state) => state.storeAnalytics || {});
  const { userProfile } = useSelector((state) => state.user || {});

  useEffect(() => {
    if (userProfile?.id) {
      fetchStoreOverview();
    }
  }, [userProfile]);

  const fetchStoreOverview = async () => {
    try {
      await dispatch(getStoreOverview(userProfile.id)).unwrap();
    } catch (err) {
      console.error("Store overview fetch error:", err);
      toast({
        description: err || "Failed to load store overview data.",
        duration: 5000,
      });
    }
  };

  // Format percentage change
  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    const change = ((current - previous) / previous) * 100;
    return Number(change.toFixed(1));
  };

  const salesChange = getPercentageChange(storeOverview?.totalSales, storeOverview?.previousPeriodSales);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Gross Sales Volume"
        value={formatCurrency(storeOverview?.totalSales || 0)}
        change={salesChange}
        icon={IndianRupee}
        description="Compared to previous period"
        loading={loading}
      />
      <StatCard
        title="Active Branches"
        value={storeOverview?.totalBranches || 0}
        icon={Store}
        description="Operating retail locations"
        loading={loading}
      />
      <StatCard
        title="Catalog Products"
        value={storeOverview?.totalProducts || 0}
        icon={ShoppingCart}
        description="Active product SKUs in catalog"
        loading={loading}
      />
      <StatCard
        title="Staff & Employees"
        value={storeOverview?.totalEmployees || 0}
        icon={Users}
        description="Registered store personnel"
        loading={loading}
      />
    </div>
  );
};

export default DashboardStats;