import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Calendar, Loader2 } from "lucide-react";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { PRIMARY_CHART_COLOR } from "@/utils/chartColors";
import { getDailySales, getMonthlySales } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";

export default function SalesTrend({
  dailySales = [],
  weeklySales = [],
  monthlySales = [],
  loading = false,
}) {
  const dispatch = useDispatch();
  const { store } = useSelector((state) => state.store);
  const { userProfile } = useSelector((state) => state.user);
  const {
    dailySales: reduxDaily = [],
    monthlySales: reduxMonthly = [],
    loading: reduxLoading,
  } = useSelector((state) => state.storeAnalytics);

  const [timeframe, setTimeframe] = useState("daily");
  const { format: formatCurrency, symbol: currencySymbol } = useCurrencyFormatter();

  const effectiveDaily = dailySales?.length ? dailySales : reduxDaily;
  const effectiveMonthly = monthlySales?.length ? monthlySales : reduxMonthly;
  const effectiveLoading = loading || reduxLoading;

  useEffect(() => {
    const adminId = store?.storeAdmin?.id || userProfile?.id;
    if (adminId) {
      if (timeframe === "daily" && (!effectiveDaily || effectiveDaily.length === 0)) {
        dispatch(getDailySales(adminId));
      } else if (timeframe === "monthly" && (!effectiveMonthly || effectiveMonthly.length === 0)) {
        dispatch(getMonthlySales(adminId));
      }
    }
  }, [timeframe, store?.storeAdmin?.id, userProfile?.id, dispatch]);

  const getChartData = () => {
    switch (timeframe) {
      case "weekly":
        return (weeklySales || []).map((item) => ({
          date: item.week || item.label || item.date || "Week",
          sales: item.totalSales || item.sales || 0,
        }));
      case "monthly":
        return (effectiveMonthly || []).map((item) => ({
          date: item.month || item.label || item.date || "Month",
          sales: item.totalSales || item.sales || 0,
        }));
      case "daily":
      default:
        return (effectiveDaily || []).map((item) => ({
          date: item.day || item.label || (item.date ? new Date(item.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Day"),
          sales: item.totalSales || item.sales || 0,
        }));
    }
  };

  const chartData = getChartData();
  const totalSalesInPeriod = chartData.reduce((sum, item) => sum + item.sales, 0);

  return (
    <Card className="flex flex-col border-border shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/60">
        <div>
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#F5A623]" />
            Sales Trend
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Total sales in period:{" "}
            <span className="font-mono font-bold text-foreground">
              {formatCurrency(totalSalesInPeriod)}
            </span>
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-28 h-8 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-6 flex-1">
        {effectiveLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-2">
            <Loader2 className="w-7 h-7 animate-spin text-[#F5A623]" />
            <p className="text-xs text-muted-foreground">Calculating sales trend...</p>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="storeSalesTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A623" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#F5A623" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4DFD3" />
                <XAxis
                  dataKey="date"
                  stroke="#8C877D"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#8C877D"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${currencySymbol}${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E4DFD3",
                    borderRadius: "0.75rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: "12px",
                    color: "#262422",
                  }}
                  formatter={(value) => [formatCurrency(value), "Sales"]}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#F5A623"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#storeSalesTrendGradient)"
                  dot={{ fill: "#F5A623", stroke: "#FFFFFF", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#F5A623" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-3 bg-secondary rounded-2xl text-muted-foreground/60 mb-2">
              <TrendingUp className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-foreground">No sales data available</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Transactions will automatically populate this revenue trend.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
