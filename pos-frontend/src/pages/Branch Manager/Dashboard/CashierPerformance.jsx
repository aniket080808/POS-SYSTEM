import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Users } from "lucide-react";
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

  const data =
    topCashiers?.map((item) => ({
      name: item.cashierName || `Cashier #${item.cashierId}`,
      sales: item.totalRevenue || 0,
    })) || [];

  const hasCashierSales = data.some((item) => item.sales > 0);

  return (
    <Card className="border-border shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-[#F5A623]" />
            Cashier Performance
          </CardTitle>
          <CardDescription className="text-xs">Sales by cashier</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {loading && (!topCashiers || topCashiers.length === 0) ? (
          <div className="h-[250px] flex flex-col justify-center gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-2xl" />
            ))}
          </div>
        ) : data.length > 0 && hasCashierSales ? (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#8C877D" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <YAxis dataKey="name" type="category" stroke="#8C877D" fontSize={11} tickLine={false} axisLine={false} width={90} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-card border border-border rounded-xl p-2.5 shadow-lg text-xs">
                          <p className="font-bold text-foreground">{d.name}</p>
                          <p className="font-mono text-[#8C5800] mt-0.5 font-bold">
                            ₹{d.sales.toLocaleString("en-IN")} Total Sales
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="sales" fill="#F5A623" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-xs text-muted-foreground font-semibold">
            No cashier sales recorded yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashierPerformance;