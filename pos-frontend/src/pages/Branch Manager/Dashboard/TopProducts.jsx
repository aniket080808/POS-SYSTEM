import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Flame } from "lucide-react";
import { getTopProductsByQuantity } from "@/Redux Toolkit/features/branchAnalytics/branchAnalyticsThunks";

const CHART_PALETTE = ["#F5A623", "#F97316", "#E05D44", "#D97706", "#8C877D"];

const TopProducts = () => {
  const dispatch = useDispatch();
  const branchId = useSelector((state) => state.branch.branch?.id);
  const { topProducts, loading } = useSelector((state) => state.branchAnalytics);

  useEffect(() => {
    if (branchId) {
      dispatch(getTopProductsByQuantity(branchId));
    }
  }, [branchId, dispatch]);

  const data =
    topProducts?.map((item) => ({
      name: item.productName,
      value: item.quantitySold || 0,
      percentage: item.percentage || 0,
    })) || [];

  const totalSold = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-border shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#F5A623]" />
            Best Selling Items
          </CardTitle>
          <CardDescription className="text-xs">
            {totalSold > 0 ? `${totalSold} total items sold` : "Top selling products by volume"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {loading && (!topProducts || topProducts.length === 0) ? (
          <div className="h-[240px] flex items-center justify-center">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>
        ) : data.length > 0 && totalSold > 0 ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="h-[220px] w-full md:w-1/2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-card border border-border rounded-xl p-2.5 shadow-lg text-xs">
                            <p className="font-bold text-foreground">{item.name}</p>
                            <p className="text-[#8C5800] font-mono mt-0.5 font-bold">
                              {item.value} sold ({item.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full md:w-1/2 space-y-2">
              {data.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-xl bg-secondary/30 text-xs border border-border/50"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CHART_PALETTE[index % CHART_PALETTE.length] }}
                    />
                    <span className="font-medium text-foreground truncate">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-foreground shrink-0">{item.value} sold</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground font-semibold">
            No product sales recorded yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopProducts;
