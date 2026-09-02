import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Download, BarChart2, TrendingUp, Users, Package, Wallet } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, PieChart as RPieChart, Pie, Cell, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import * as XLSX from "xlsx";
import { useToast } from "@/components/ui/use-toast";
import {
  getDailySalesChart,
  getPaymentBreakdown,
  getCategoryWiseSalesBreakdown,
  getTopCashiersByRevenue,
} from "@/Redux Toolkit/features/branchAnalytics/branchAnalyticsThunks";
import { CHART_PALETTE, PRIMARY_CHART_COLOR, getChartColor } from "@/utils/chartColors";
import { getLocalDateString } from "@/utils/formateDate";

const Reports = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { branch } = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);
  const branchId = branch?.id || userProfile?.branchId || userProfile?.branch?.id;
  const {
    dailySales,
    paymentBreakdown,
    categorySales,
    topCashiers,
  } = useSelector((state) => state.branchAnalytics);

  const [reportRange, setReportRange] = useState("all");

  useEffect(() => {
    if (branchId) {
      dispatch(getDailySalesChart({ branchId }));
      const date = reportRange === "today" ? getLocalDateString() : null;
      dispatch(getPaymentBreakdown({ branchId, date }));
      dispatch(getCategoryWiseSalesBreakdown({ branchId, date }));
      dispatch(getTopCashiersByRevenue(branchId));
    }
  }, [branchId, reportRange, dispatch]);

  const salesData =
    dailySales?.map((item) => ({
      date: item.date,
      sales: item.totalSales || 0,
    })) || [];

  const paymentData =
    paymentBreakdown?.map((item) => ({
      name: item.type || item.paymentMethod || "Other",
      value: item.totalAmount || 0,
      percentage: item.percentage || 0,
      count: item.transactionCount || 0,
    })) || [];

  const categoryData =
    categorySales?.map((item) => ({
      name: item.categoryName || "General",
      value: item.totalSales || 0,
      quantitySold: item.quantitySold || 0,
    })) || [];

  const cashierData =
    topCashiers?.map((item) => ({
      name: item.cashierName || `Staff #${item.cashierId}`,
      sales: item.totalRevenue || 0,
    })) || [];

  const exportSalesToExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(
        salesData.map((s) => ({ Date: s.date, "Total Sales (₹)": s.sales }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sales Summary");
      XLSX.writeFile(wb, `Branch_Sales_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast({
        title: "Report Exported",
        description: "Branch sales spreadsheet downloaded.",
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "Failed to create Excel file.",
        variant: "destructive",
      });
    }
  };

  const chartConfig = {
    sales: {
      label: "Revenue",
      color: PRIMARY_CHART_COLOR,
    },
    value: {
      label: "Volume",
      color: PRIMARY_CHART_COLOR,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Branch Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sales trends, payment methods, category performance, and staff analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-xl border border-border/60">
            <Button
              variant={reportRange === "today" ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs px-3 rounded-lg font-semibold"
              onClick={() => setReportRange("today")}
            >
              Today
            </Button>
            <Button
              variant={reportRange === "all" ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs px-3 rounded-lg font-semibold"
              onClick={() => setReportRange("all")}
            >
              All-Time
            </Button>
          </div>
          <Button onClick={exportSalesToExcel} className="gap-2 font-bold bg-[#F5A623] text-[#262422] hover:bg-[#E09214] h-8 text-xs px-3">
            <Download className="w-3.5 h-3.5" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="bg-secondary/60 p-1 rounded-2xl border border-border">
          <TabsTrigger value="sales" className="text-xs gap-2 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> Sales Trend
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs gap-2 font-semibold">
            <Wallet className="w-3.5 h-3.5" /> Payment Methods
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-xs gap-2 font-semibold">
            <Package className="w-3.5 h-3.5" /> Category Sales
          </TabsTrigger>
          <TabsTrigger value="staff" className="text-xs gap-2 font-semibold">
            <Users className="w-3.5 h-3.5" /> Cashier Performance
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Sales Trend */}
        <TabsContent value="sales">
          <Card className="border-border shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base">Sales Trend (Last 7 Days)</CardTitle>
              <CardDescription className="text-xs">Daily gross sales recorded at this branch</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {salesData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <XAxis dataKey="date" stroke="#8C877D" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis
                        stroke="#8C877D"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `₹${v}`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card border border-border rounded-xl p-2.5 shadow-lg text-xs">
                                <p className="text-muted-foreground text-[10px]">{payload[0].payload.date}</p>
                                <p className="font-mono font-bold text-sm text-[#8C5800] mt-0.5">
                                  ₹{payload[0].value.toLocaleString("en-IN")}
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
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-xs text-muted-foreground font-semibold">
                  No sales history available.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Payment Methods */}
        <TabsContent value="payments">
          <Card className="border-border shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base">Payment Methods</CardTitle>
              <CardDescription className="text-xs">Total sales by payment method (Cash, UPI, Card)</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {paymentData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentData}>
                      <XAxis dataKey="name" stroke="#8C877D" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#8C877D" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card border border-border rounded-xl p-2.5 shadow-lg text-xs">
                                <p className="font-bold text-foreground">{payload[0].payload.name}</p>
                                <p className="font-mono text-[#8C5800] mt-0.5 font-bold">
                                  ₹{Number(payload[0].value || 0).toLocaleString("en-IN")} ({payload[0].payload.percentage}%)
                                </p>
                                <p className="text-[10px] text-muted-foreground font-mono">
                                  {payload[0].payload.count} transactions
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {paymentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getChartColor(index)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-xs text-muted-foreground font-semibold">
                  No payment data available for this period.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Category Sales */}
        <TabsContent value="categories">
          <Card className="border-border shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base">Category Sales</CardTitle>
              <CardDescription className="text-xs">Sales distribution across product categories</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {categoryData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getChartColor(index)}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card border border-border rounded-xl p-2.5 shadow-lg text-xs">
                                <p className="font-bold text-foreground">{payload[0].payload.name}</p>
                                <p className="font-mono text-[#8C5800] mt-0.5 font-bold">
                                  ₹{Number(payload[0].value || 0).toLocaleString("en-IN")}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-mono">
                                  {payload[0].payload.quantitySold} units sold
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </RPieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-xs text-muted-foreground font-semibold">
                  No category sales recorded.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Cashier Performance */}
        <TabsContent value="staff">
          <Card className="border-border shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base">Cashier Performance</CardTitle>
              <CardDescription className="text-xs">Total sales processed by cashier</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {cashierData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={cashierData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <XAxis type="number" stroke="#8C877D" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                      <YAxis dataKey="name" type="category" stroke="#8C877D" fontSize={11} tickLine={false} axisLine={false} width={100} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card border border-border rounded-xl p-2.5 shadow-lg text-xs">
                                <p className="font-bold text-foreground">{payload[0].payload.name}</p>
                                <p className="font-mono text-[#8C5800] mt-0.5 font-bold">
                                  ₹{payload[0].value.toLocaleString("en-IN")} Total Sales
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="sales" radius={[0, 6, 6, 0]}>
                        {cashierData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getChartColor(index)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-xs text-muted-foreground font-semibold">
                  No staff sales recorded.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;