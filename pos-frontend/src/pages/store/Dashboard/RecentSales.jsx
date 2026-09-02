import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag, ArrowUpRight } from "lucide-react";
import { getRecentSales } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useToast } from "@/components/ui/use-toast";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { useDateFormatter } from "@/utils/dateUtils";

const RecentSales = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrencyFormatter();
  const { recentSales, loading } = useSelector((state) => state.storeAnalytics);
  const { store } = useSelector((state) => state.store);
  const { userProfile } = useSelector((state) => state.user);

  const adminId = store?.storeAdmin?.id || userProfile?.id;

  useEffect(() => {
    if (adminId && (!recentSales || recentSales.length === 0)) {
      fetchRecentSales();
    }
  }, [adminId]);

  const fetchRecentSales = async () => {
    try {
      if (!adminId) return;
      await dispatch(getRecentSales(adminId)).unwrap();
    } catch (err) {
      console.error("Recent sales fetch error:", err);
      toast({
        description: err || "Failed to load recent sales.",
        duration: 5000,
      });
    }
  };

  const { format: formatStoreDate } = useDateFormatter();

  // Format date as relative ("Today", "Yesterday", or formatted date)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (d1, d2) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";

    return formatStoreDate(date);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <CardDescription className="text-xs">
              Latest sales logged across all branches
            </CardDescription>
          </div>
          <div className="p-2 bg-secondary rounded-xl text-muted-foreground">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-secondary/30 animate-pulse"
              >
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-muted rounded"></div>
                  <div className="h-3 w-20 bg-muted rounded"></div>
                </div>
                <div className="h-5 w-20 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : recentSales && recentSales.length > 0 ? (
          <div className="space-y-2.5">
            {recentSales.map((sale, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card hover:bg-secondary/40 transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-foreground">
                    {sale.branchName || "Main Branch"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(sale.date)} • Cashier #{sale.cashierId || "1"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-foreground font-mono">
                    {formatCurrency(sale.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 bg-secondary rounded-2xl text-muted-foreground/60 mb-2">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-foreground">No recent sales yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Completed transactions will appear here automatically
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSales;