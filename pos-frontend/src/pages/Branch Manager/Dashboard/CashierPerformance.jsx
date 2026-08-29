import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Users, Award } from "lucide-react";
import { getTopCashiersByRevenue } from "@/Redux Toolkit/features/branchAnalytics/branchAnalyticsThunks";

const CashierPerformance = () => {
  const dispatch = useDispatch();
  const branchId = useSelector((state) => state.branch.branch?.id);
  const { topCashiers, loading } = useSelector((state) => state.branchAnalytics);

  useEffect(() => {
    if (branchId) {
      dispatch(getTopCashiersByRevenue(branchId));
    }
  }, [branchId, dispatch]);

  const data = topCashiers?.map((item) => ({
    name: item.cashierName || `Cashier #${item.cashierId}`,
    sales: item.totalRevenue || 0,
  })) || [];

  const hasCashierSales = data.some((item) => item.sales > 0);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Top Cashiers by Revenue
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Ranking of staff performance</p>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (!topCashiers || topCashiers.length === 0) ? (
          <div className="h-[250px] flex flex-col justify-center gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-6 w-full rounded-md" />
              </div>
            ))}
          </div>
        ) : data.length > 0 && hasCashierSales ? (
          <div className="h-[250px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border text-popover-foreground rounded-lg p-2.5 shadow-lg text-xs">
                          <p className="font-semibold">{d.name}</p>
                          <p className="text-primary font-bold mt-0.5">₹{d.sales.toLocaleString('en-IN')} Total Revenue</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="currentColor"
                  radius={[0, 4, 4, 0]}
                  className="fill-primary hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center justify-center">
            <Users className="w-10 h-10 mb-2 opacity-20" />
            <p className="font-medium">No cashier sales recorded</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Cashier revenue rankings will appear here as orders are rung up.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashierPerformance;