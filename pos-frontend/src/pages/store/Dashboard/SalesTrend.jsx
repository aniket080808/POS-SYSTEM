import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Calendar, Loader2 } from "lucide-react";
import {
  getSalesTrends,
  getDailySales,
} from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useToast } from "@/components/ui/use-toast";
import {
  AreaChart,
  Area,
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
    (state) => state.storeAnalytics || {}
  );
  const { userProfile } = useSelector((state) => state.user || {});
  const [period, setPeriod] = useState("daily");

  useEffect(() => {
    if (userProfile?.id) {
      fetchSalesData();
    }
  }, [userProfile, period]);

  const fetchSalesData = async () => {
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
  };

  // Get chart data based on period
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
    <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold text-foreground">Revenue & Sales Velocity</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Historical transaction performance trends</CardDescription>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32 h-8 text-xs rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              <SelectItem value="daily">Daily View</SelectItem>
              <SelectItem value="weekly">Weekly View</SelectItem>
              <SelectItem value="monthly">Monthly View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="mt-2 text-xs text-muted-foreground">Loading sales curve...</p>
            </div>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="storeSalesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="currentColor"
                  className="text-[11px] text-muted-foreground font-mono"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="currentColor"
                  className="text-[11px] text-muted-foreground font-mono"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${currencySymbol}${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card, #ffffff)",
                    borderColor: "var(--border, #e2e8f0)",
                    borderRadius: "0.75rem",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                  formatter={(value) => [formatCurrency(value), "Sales Revenue"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--color-primary, #6366f1)"
                  strokeWidth={2.5}
                  fill="url(#storeSalesGradient)"
                  dot={{ fill: "var(--color-primary, #6366f1)", strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, fill: "var(--color-primary, #6366f1)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
            <TrendingUp className="w-10 h-10 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-semibold text-foreground">No trend data available</p>
            <p className="text-[11px]">Sales transaction data will render here once processed.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesTrend;

