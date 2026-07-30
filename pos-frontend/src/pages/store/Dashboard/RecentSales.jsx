import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import { getRecentSales } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useToast } from "@/components/ui/use-toast";

const RecentSales = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { recentSales, loading } = useSelector((state) => state.storeAnalytics);
  const { userProfile } = useSelector((state) => state.user);

  useEffect(() => {
    if (userProfile?.id) {
      fetchRecentSales();
    }
  }, [userProfile]);

  const fetchRecentSales = async () => {
    try {
      await dispatch(getRecentSales(userProfile.id)).unwrap();
    } catch (err) {
      console.error("Recent sales fetch error:", err);
      toast({
        description: err || "Failed to load recent sales.",
        duration: 5000,
      });
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format date as relative ("Today", "Yesterday", or formatted date)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (d1, d2) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Recent Sales</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : recentSales && recentSales.length > 0 ? (
          <div className="space-y-4">
            {recentSales.map((sale, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{sale.branchName}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(sale.date)}
                  </p>
                </div>
                <p className="font-semibold">{formatCurrency(sale.amount)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <ShoppingBag className="w-16 h-16 text-emerald-500 mx-auto" />
              <p className="mt-2 text-gray-500">No recent sales yet</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSales;