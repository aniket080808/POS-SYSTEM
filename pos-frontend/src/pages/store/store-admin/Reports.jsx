import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import {
  getMonthlySales,
  getSalesByCategory,
} from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useToast } from "@/components/ui/use-toast";
import { Download, FileText, Lock, Calendar, Loader2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useNavigate } from "react-router";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { CHART_PALETTE, PRIMARY_CHART_COLOR, getChartColor } from "@/utils/chartColors";

export default function Reports() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { format: formatCurrency, symbol: currencySymbol } = useCurrencyFormatter();
  const { userProfile } = useSelector((state) => state.user);
  const { store } = useSelector((state) => state.store || {});
  const { monthlySales, salesByCategory, loading } = useSelector((state) => state.storeAnalytics);
  const { statusResponse } = useSelector((state) => state.storeSubscription);

  const [dateRange, setDateRange] = useState("ALL");

  const isSuperAdmin = userProfile?.role === "ROLE_ADMIN";
  const currentPlan = statusResponse?.currentPlan;
  const isAdvancedReportsEnabled = isSuperAdmin || Boolean(currentPlan?.enableAdvancedReports);
  const adminId = store?.storeAdmin?.id || userProfile?.id;

  useEffect(() => {
    if (adminId) {
      fetchReportsData();
    }
  }, [adminId]);

  const fetchReportsData = async () => {
    if (!adminId) return;
    try {
      await Promise.all([
        dispatch(getMonthlySales(adminId)).unwrap(),
        dispatch(getSalesByCategory(adminId)).unwrap(),
      ]);
    } catch (err) {
      console.error("Reports data fetch error:", err);
    }
  };

  const salesData =
    monthlySales?.map((item) => {
      let monthLabel = "Month";
      if (item.date) {
        const d = new Date(item.date);
        monthLabel = d.toLocaleDateString("en-IN", { month: "short" });
      } else if (item.month || item.label) {
        monthLabel = item.month || item.label;
      }
      return {
        name: monthLabel,
        sales: item.totalAmount ?? item.totalSales ?? item.sales ?? 0,
      };
    }) || [];

  const categoryData =
    salesByCategory?.map((item) => ({
      name: item.categoryName || item.name || "Category",
      value: item.totalSales ?? item.value ?? 0,
    })) || [];

  const salesConfig = {
    sales: {
      label: "Revenue",
      color: PRIMARY_CHART_COLOR,
    },
  };

  const categoryConfig = React.useMemo(() => {
    const config = {
      value: {
        label: "Revenue",
        color: PRIMARY_CHART_COLOR,
      },
    };
    categoryData.forEach((cat, index) => {
      config[cat.name] = {
        label: cat.name,
        color: getChartColor(index),
      };
    });
    return config;
  }, [categoryData]);

  const exportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      const wsMonthly = XLSX.utils.json_to_sheet(
        salesData.map((item) => ({
          Period: item.name,
          "Total Sales": item.sales,
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsMonthly, "Monthly Sales");

      const wsCategory = XLSX.utils.json_to_sheet(
        categoryData.map((item) => ({
          Category: item.name,
          "Total Revenue": item.value,
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsCategory, "Category Sales");

      XLSX.writeFile(wb, `Store_Sales_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);

      toast({
        title: "Excel Export Complete",
        description: "Your sales analytics spreadsheet was downloaded.",
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: err.message || "Failed to generate Excel file.",
        variant: "destructive",
      });
    }
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Store Sales & Category Analytics Report", 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 14, 30);

      doc.setFontSize(14);
      doc.text("1. Monthly Sales Breakdown", 14, 42);

      autoTable(doc, {
        startY: 46,
        head: [["Billing Month", "Total Sales"]],
        body: salesData.map((d) => [d.name, formatCurrency(d.sales)]),
        theme: "striped",
        headStyles: { fillColor: [38, 36, 34], textColor: [255, 255, 255] },
      });

      const nextY = doc.lastAutoTable.finalY + 12;
      doc.setFontSize(14);
      doc.text("2. Category Sales Distribution", 14, nextY);

      autoTable(doc, {
        startY: nextY + 4,
        head: [["Merchandise Category", "Sales Volume"]],
        body: categoryData.map((d) => [d.name, formatCurrency(d.value)]),
        theme: "striped",
        headStyles: { fillColor: [38, 36, 34], textColor: [255, 255, 255] },
      });

      doc.save(`Store_Sales_Report_${new Date().toISOString().slice(0, 10)}.pdf`);

      toast({
        title: "PDF Export Complete",
        description: "Your official sales PDF was generated.",
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: err.message || "Failed to generate PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sales Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monthly revenue breakdown, category sales, and analytics exports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40 h-9 text-xs">
              <Calendar className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Recorded Time</SelectItem>
              <SelectItem value="THIS_MONTH">Current Month</SelectItem>
              <SelectItem value="LAST_3_MONTHS">Past 3 Months</SelectItem>
              <SelectItem value="THIS_YEAR">Current Year</SelectItem>
            </SelectContent>
          </Select>

          {isAdvancedReportsEnabled ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportExcel} className="text-xs h-9 gap-1.5">
                <Download className="w-3.5 h-3.5" />
                Export Excel
              </Button>
              <Button size="sm" onClick={exportPDF} className="text-xs font-bold h-9 gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Export PDF
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => navigate("/store/upgrade")}
              className="text-xs font-bold h-9 gap-1.5 bg-[#F5A623] text-[#262422] hover:bg-[#E09214]"
            >
              <Lock className="w-3.5 h-3.5" />
              Unlock Advanced Exports
            </Button>
          )}
        </div>
      </div>

      {/* Subscription Tier Banner */}
      {!isAdvancedReportsEnabled && (
        <Card className="border-[#FAD074] bg-[#FFF8E7] shadow-2xs">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F5A623]/20 flex items-center justify-center text-[#8C5800] shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Advanced Reports & Custom Range Exports</p>
                <p className="text-[11px] text-muted-foreground">
                  Upgrade your subscription plan to unlock Excel, CSV, and PDF report downloads.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/store/upgrade")}
              className="text-xs font-bold h-8 shrink-0 bg-[#262422] text-white hover:bg-[#383532]"
            >
              View Plans
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Multi-Colored Bar Chart */}
        <Card className="border-border shadow-2xs">
          <CardHeader className="pb-2 border-b border-border/60">
            <CardTitle className="text-base">Monthly Sales</CardTitle>
            <CardDescription className="text-xs">Total sales by month</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {salesData.length > 0 ? (
              <ChartContainer config={salesConfig} className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <XAxis dataKey="name" stroke="#8C877D" fontSize={11} tickLine={false} axisLine={false} height={24} />
                    <YAxis
                      stroke="#8C877D"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${currencySymbol}${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          formatter={(val) => [formatCurrency(val), "Revenue"]}
                        />
                      )}
                    />
                    <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                      {salesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getChartColor(index)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-xs text-muted-foreground font-semibold">
                No monthly sales records available.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Sales Distribution Pie Chart */}
        <Card className="border-border shadow-2xs">
          <CardHeader className="pb-2 border-b border-border/60">
            <CardTitle className="text-base">Sales by Category</CardTitle>
            <CardDescription className="text-xs">Total sales across product categories</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {categoryData.length > 0 ? (
              <div className="flex flex-col items-center">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
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
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            return (
                              <div className="rounded-xl border border-border bg-card p-2.5 shadow-md text-xs">
                                <div className="font-bold text-foreground">{data.name}</div>
                                <div className="text-[#B8860B] font-mono font-bold text-sm mt-0.5">
                                  {formatCurrency(data.value)}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {categoryData.map((entry, index) => (
                    <div key={`legend-${index}`} className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: getChartColor(index) }}
                      />
                      <span className="truncate max-w-[120px]">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-xs text-muted-foreground font-semibold">
                No category sales recorded.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}