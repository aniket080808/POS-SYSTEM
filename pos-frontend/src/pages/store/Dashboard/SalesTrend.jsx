import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  getSalesTrends,
  getDailySales,
} from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useToast } from "@/components/ui/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const SalesTrend = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { format: formatCurrency, symbol: currencySymbol } = useCurrencyFormatter();
  const { salesTrends, dailySales, loading } = useSelector(
    (state) => state.storeAnalytics
  );
  const { userProfile } = useSelector((state) => state.user);
  const [period, setPeriod] = useState("daily");

  const fetchSalesData = useCallback(async () => {
    if (!userProfile?.id) return;
    try {
      if (period === "daily") {
        await dispatch(getDailySales(userProfile.id)).unwrap();
      } else {
        await dispatch(
          getSalesTrends({ storeAdminId: userProfile.id, period })
        ).unwrap();
      }
    } catch (err) {
      console.error("Sales trend fetch error:", err);
      toast({
        description: err || "Failed to load sales trend data.",
        duration: 5000,
      });
    }
  }, [dispatch, userProfile?.id, period, toast]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  const getChartData = () => {
    if (period === "daily" && dailySales) {
      return dailySales.map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
          month: "short",
          day: "numeric",
        }),
        sales: item.totalAmount,
      }));
    } else if (salesTrends?.points) {
      return salesTrends.points.map((item) => ({
        date: item.date,
        sales: item.totalAmount,
      }));
    }
    return [];
  };

  const chartData = getChartData();

  return (
    <Card className="rounded-2xl border border-border/80 shadow-2xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Sales Revenue Velocity
            </CardTitle>
            <CardDescription className="text-xs">
              Periodic trend analysis across daily, weekly, and monthly periods
            </CardDescription>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily" className="text-xs">Daily</SelectItem>
              <SelectItem value="weekly" className="text-xs">Weekly</SelectItem>
              <SelectItem value="monthly" className="text-xs">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-56">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground">Loading sales data...</p>
            </div>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${currencySymbol}${value}`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), "Sales"]}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "0.75rem",
                  fontSize: "0.75rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#d97706"
                strokeWidth={2.5}
                dot={{ fill: "#d97706", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, fill: "#d97706" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-56 text-center">
            <TrendingUp className="w-10 h-10 text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">No sales trend points available for this period.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesTrend;
