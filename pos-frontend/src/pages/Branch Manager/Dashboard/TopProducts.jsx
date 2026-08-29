import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Package, Sparkles } from "lucide-react";
import { getTopProductsByQuantity } from "@/Redux Toolkit/features/branchAnalytics/branchAnalyticsThunks";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

const TopProducts = () => {
  const dispatch = useDispatch();
  const branchId = useSelector((state) => state.branch.branch?.id);
  const { topProducts, loading } = useSelector((state) => state.branchAnalytics);

  useEffect(() => {
    if (branchId) {
      dispatch(getTopProductsByQuantity(branchId));
    }
  }, [branchId, dispatch]);

  const data = topProducts?.map((item) => ({
    name: item.productName,
    value: item.quantitySold || 0,
    percentage: item.percentage || 0,
  })) || [];

  const totalSold = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Top Products
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalSold > 0 ? `${totalSold} total units sold across top items` : "Ranking by units sold"}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (!topProducts || topProducts.length === 0) ? (
          <div className="h-[280px] flex items-center justify-center">
            <Skeleton className="h-44 w-44 rounded-full" />
          </div>
        ) : data.length > 0 && totalSold > 0 ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
            <div className="h-[220px] w-full md:w-1/2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border text-popover-foreground rounded-lg p-2.5 shadow-lg text-xs">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-primary font-bold mt-0.5">{item.value} units ({item.percentage}%)</p>
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
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full md:w-1/2 space-y-2">
              {data.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-2 max-w-[65%] truncate">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="font-medium text-foreground truncate">{item.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-foreground">{item.value} sold</span>
                    <span className="text-muted-foreground ml-1.5">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center justify-center">
            <Package className="w-10 h-10 mb-2 opacity-20" />
            <p className="font-medium">No product sales recorded yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Top selling products will appear here once orders are placed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopProducts;
