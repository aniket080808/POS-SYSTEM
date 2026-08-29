import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import { getRecentSales } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useToast } from "@/components/ui/use-toast";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { formatDate } from "@/utils/dateUtils";

const RecentSales = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrencyFormatter();
  const { recentSales, loading } = useSelector((state) => state.storeAnalytics);
  const { userProfile } = useSelector((state) => state.user);

  const fetchRecentSales = useCallback(async () => {
    if (!userProfile?.id) return;
    try {
      await dispatch(getRecentSales(userProfile.id)).unwrap();
    } catch (err) {
      console.error("Recent sales fetch error:", err);
      toast({
        description: err || "Failed to load recent sales.",
        duration: 5000,
      });
    }
  }, [dispatch, userProfile?.id, toast]);

  useEffect(() => {
    fetchRecentSales();
  }, [fetchRecentSales]);

  return (
    <Card className="rounded-2xl border border-border/80 shadow-2xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-foreground">
          Recent Completed Sales
        </CardTitle>
        <CardDescription className="text-xs">
          Latest point-of-sale transactions across branch registers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl border border-border/40 animate-pulse"
              >
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : recentSales && recentSales.length > 0 ? (
          <div className="space-y-2.5">
            {recentSales.slice(0, 6).map((sale, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {sale.branchName || "Main Branch"}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {formatDate(sale.date)}
                  </p>
                </div>
                <p className="text-xs font-extrabold text-foreground font-mono">
                  {formatCurrency(sale.amount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">No recent transaction orders recorded.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSales;