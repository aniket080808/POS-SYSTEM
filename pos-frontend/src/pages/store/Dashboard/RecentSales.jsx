import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag, Store, Calendar, ArrowUpRight } from "lucide-react";
import { getRecentSales } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useToast } from "@/components/ui/use-toast";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const RecentSales = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrencyFormatter();
  const { recentSales, loading } = useSelector((state) => state.storeAnalytics || {});
  const { userProfile } = useSelector((state) => state.user || {});

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
    <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden h-full flex flex-col">
      <CardHeader className="p-4 sm:p-5 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-foreground">Recent Branch Transactions</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Latest orders logged across all registers</CardDescription>
          </div>
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 flex-1">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-32 rounded-lg" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
                <Skeleton className="h-4 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        ) : recentSales && recentSales.length > 0 ? (
          <div className="divide-y divide-border/60">
            {recentSales.map((sale, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 hover:bg-muted/30 -mx-2 px-2 rounded-xl transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Store className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <p className="text-xs font-bold text-foreground">{sale.branchName || "Main Branch"}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(sale.date)}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-foreground">
                    {formatCurrency(sale.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-semibold text-foreground">No recent sales records</p>
            <p className="text-[11px]">Orders placed at terminals will appear here in real-time.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSales;