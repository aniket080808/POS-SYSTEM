import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { 
  getMonthlySales, 
  getSalesByCategory 
} from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useToast } from "@/components/ui/use-toast";
import { BadgeDollarSign, Lock } from "lucide-react";
import { useNavigate } from "react-router";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function Reports() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userProfile } = useSelector((state) => state.user);
  const { monthlySales, salesByCategory, loading } = useSelector((state) => state.storeAnalytics);
  const { statusResponse } = useSelector((state) => state.storeSubscription);

  const currentPlan = statusResponse?.currentPlan;
  const isAdvancedReportsEnabled = Boolean(currentPlan?.enableAdvancedReports);

  useEffect(() => {
    if (userProfile?.id) {
      fetchReportsData();
    }
  }, [userProfile]);

  const fetchReportsData = async () => {
    try {
      await Promise.all([
        dispatch(getMonthlySales(userProfile.id)).unwrap(),
        dispatch(getSalesByCategory(userProfile.id)).unwrap(),
      ]);
    } catch (err) {
      console.error("Reports data fetch error:", err);
      // Check if it's the feature-not-enabled error from backend
      if (err && typeof err === 'object' && err.error === 'ADVANCED_REPORTS_NOT_AVAILABLE') {
        // Frontend gating should already prevent this, but handle gracefully
        toast({
          description: "Advanced reports require a plan upgrade.",
          duration: 5000,
        });
        return;
      }
      toast({
        description: err || "Failed to load reports data.",
        duration: 5000,
      });
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const salesData = monthlySales?.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', year: '2-digit' }),
    sales: item.totalAmount
  })) || [];

  const categoryData = salesByCategory?.map(item => ({
    name: item.categoryName,
    value: item.totalSales
  })) || [];

  const salesConfig = {
    sales: {
      label: "Sales",
      color: "#10b981",
    },
  };

  const categoryConfig = categoryData.reduce((config, item) => {
    config[item.name] = {
      label: item.name,
      color: COLORS[categoryData.indexOf(item) % COLORS.length],
    };
    return config;
  }, {});

  // Show locked state if advanced reports are not enabled on the plan
  if (!isAdvancedReportsEnabled) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 via-background to-amber-100/30 p-8 shadow-md">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-8">
            <div className="p-4 bg-amber-100 rounded-full text-amber-600">
              <Lock className="w-10 h-10" />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Advanced Reports Locked</h2>
              <p className="text-muted-foreground text-sm">
                Your current plan does not include advanced reports. Upgrade your subscription to unlock detailed sales trends, category breakdowns, and more.
              </p>
            </div>
            <Button onClick={() => navigate('/store/upgrade')} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
              <BadgeDollarSign className="w-4 h-4 mr-2" /> Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading chart data...</p>
                </div>
              </div>
            ) : salesData.length > 0 ? (
              <ChartContainer config={salesConfig}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={salesData}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          formatter={(value) => [formatCurrency(value), "Sales"]}
                        />
                      )}
                    />
                    <Bar
                      dataKey="sales"
                      fill="currentColor"
                      radius={[4, 4, 0, 0]}
                      className="fill-emerald-500"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">No sales data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading chart data...</p>
                </div>
              </div>
            ) : categoryData.length > 0 ? (
              <ChartContainer config={categoryConfig}>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          formatter={(value) => [formatCurrency(value), "Sales"]}
                        />
                      )}
                    />
                    <ChartLegend
                      content={({ payload }) => (
                        <ChartLegendContent payload={payload} />
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">No category data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

     
    </div>
  );
}