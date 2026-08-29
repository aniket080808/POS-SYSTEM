import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";
import { getDailySalesChart } from "@/Redux Toolkit/features/branchAnalytics/branchAnalyticsThunks";

const SalesChart = () => {
  const dispatch = useDispatch();
  const branchId = useSelector((state) => state.branch.branch?.id);
  const analytics = useSelector((state) => state.branchAnalytics);
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (branchId) {
      dispatch(getDailySalesChart({ branchId, days }));
    }
  }, [branchId, days, dispatch]);

  const data = analytics?.dailySales?.map((item) => ({
    name: new Date(item.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    fullDate: item.date,
    sales: item.totalSales || 0,
  })) || [];

  const totalPeriodSales = data.reduce((sum, item) => sum + item.sales, 0);
  const hasSales = data.some((item) => item.sales > 0);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Daily Sales Trend
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Total for last {days} days: <span className="font-semibold text-foreground">₹{totalPeriodSales.toLocaleString('en-IN')}</span>
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border">
          {[7, 14, 30].map((d) => (
            <Button
              key={d}
              variant={days === d ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => setDays(d)}
            >
              {d}D
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {analytics?.loading && (!data || data.length === 0) ? (
          <div className="h-[280px] flex items-center justify-center">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
        ) : (
          <div className="h-[280px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis
                  dataKey="name"
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
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border text-popover-foreground rounded-lg p-2.5 shadow-lg text-xs">
                          <p className="font-medium text-muted-foreground">{d.fullDate}</p>
                          <p className="font-bold text-sm text-primary mt-0.5">₹{d.sales.toLocaleString('en-IN')}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="currentColor"
                  radius={[4, 4, 0, 0]}
                  className="fill-primary hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
            {!hasSales && !analytics?.loading && (
              <p className="text-center text-xs text-muted-foreground mt-2">
                No order sales recorded in the last {days} days.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesChart;