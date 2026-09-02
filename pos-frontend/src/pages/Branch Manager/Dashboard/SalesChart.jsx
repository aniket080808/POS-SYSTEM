import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp } from "lucide-react";
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

  const data =
    analytics?.dailySales?.map((item) => ({
      name: new Date(item.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      fullDate: item.date,
      sales: item.totalSales || 0,
    })) || [];

  const totalPeriodSales = data.reduce((sum, item) => sum + item.sales, 0);
  const hasSales = data.some((item) => item.sales > 0);

  return (
    <Card className="border-border shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#F5A623]" />
            Sales Trend
          </CardTitle>
          <CardDescription className="text-xs">
            Total sales for last {days} days:{" "}
            <span className="font-mono font-bold text-foreground">
              ₹{totalPeriodSales.toLocaleString("en-IN")}
            </span>
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-xl border border-border/60">
          {[7, 14, 30].map((d) => (
            <Button
              key={d}
              variant={days === d ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs px-2.5 rounded-lg font-semibold"
              onClick={() => setDays(d)}
            >
              {d}D
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {analytics?.loading && (!data || data.length === 0) ? (
          <div className="h-[260px] flex items-center justify-center">
            <Skeleton className="h-full w-full rounded-2xl" />
          </div>
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#8C877D" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#8C877D"
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
                        <div className="bg-card border border-border rounded-xl p-2.5 shadow-lg text-xs">
                          <p className="text-muted-foreground text-[10px]">{d.fullDate}</p>
                          <p className="font-mono font-bold text-sm text-[#8C5800] mt-0.5">
                            ₹{d.sales.toLocaleString("en-IN")}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="sales" fill="#F5A623" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {!hasSales && !analytics?.loading && (
              <p className="text-center text-xs text-muted-foreground mt-2">
                No orders recorded in the selected {days}-day period.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesChart;