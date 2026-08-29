import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { 
  getMonthlySales, 
  getSalesByCategory 
} from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useToast } from "@/components/ui/use-toast";
import { Download, FileText, Lock, Sparkles, Calendar, Loader2, ArrowUpRight } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useNavigate } from "react-router";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const COLORS = ["#10b981", "#0284c7", "#6366f1", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function Reports() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { format: formatCurrency, symbol: currencySymbol } = useCurrencyFormatter();
  const { userProfile } = useSelector((state) => state.user || {});
  const { monthlySales, salesByCategory, loading } = useSelector((state) => state.storeAnalytics || {});
  const { statusResponse } = useSelector((state) => state.storeSubscription || {});

  const [dateRange, setDateRange] = React.useState("ALL");

  const currentPlan = statusResponse?.currentPlan;
  const isAdvancedReportsEnabled = Boolean(currentPlan?.enableAdvancedReports);

  useEffect(() => {
    if (userProfile?.id) {
      fetchReportsData();
    }
  }, [userProfile?.id]);

  const fetchReportsData = async () => {
    try {
      await Promise.all([
        dispatch(getMonthlySales(userProfile.id)).unwrap(),
        dispatch(getSalesByCategory(userProfile.id)).unwrap(),
      ]);
    } catch (err) {
      console.error("Reports data fetch error:", err);
      if (err && typeof err === 'object' && err.error === 'ADVANCED_REPORTS_NOT_AVAILABLE') {
        toast({
          description: "Advanced analytics require an upgraded NexPOS subscription tier.",
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

  const salesData = monthlySales?.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', year: '2-digit' }),
    sales: item.totalAmount
  })) || [];

  const categoryData = salesByCategory?.map(item => ({
    name: item.categoryName,
    value: item.totalSales
  })) || [];

  const handleExportCSV = () => {
    try {
      const salesSheetData = salesData.map(item => ({ "Month": item.name, [`Total Sales (${currencySymbol})`]: item.sales }));
      const categorySheetData = categoryData.map(item => ({ "Category": item.name, [`Total Sales (${currencySymbol})`]: item.value }));

      const wb = XLSX.utils.book_new();
      const wsSales = XLSX.utils.json_to_sheet(salesSheetData);
      const wsCategory = XLSX.utils.json_to_sheet(categorySheetData);

      XLSX.utils.book_append_sheet(wb, wsSales, "Monthly Sales");
      XLSX.utils.book_append_sheet(wb, wsCategory, "Category Breakdown");

      XLSX.writeFile(wb, `NexPOS_Store_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast({ title: "Report Exported", description: "Excel workbook downloaded successfully." });
    } catch (err) {
      toast({ title: "Export Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      // Title & Header
      doc.setFontSize(18);
      doc.setTextColor(16, 185, 129); // Emerald primary
      doc.text("NexPOS — Analytics & Performance Report", 14, 20);

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 28);
      doc.text(`Store Account: ${userProfile?.fullName || 'Store Owner'} | ID #${userProfile?.id || ''}`, 14, 34);

      // Section 1: Monthly Sales
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text("Monthly Revenue Trends", 14, 46);

      autoTable(doc, {
        startY: 50,
        head: [["Period / Month", `Total Revenue (${currencySymbol})`]],
        body: salesData.map(item => [item.name, formatCurrency(item.sales)]),
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] }
      });

      // Section 2: Category Breakdown
      const finalY = doc.lastAutoTable.finalY || 100;
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text("Sales Breakdown by Category", 14, finalY + 14);

      autoTable(doc, {
        startY: finalY + 18,
        head: [["Category Name", `Revenue (${currencySymbol})`]],
        body: categoryData.map(item => [item.name, formatCurrency(item.value)]),
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] }
      });

      // Direct PDF Download
      doc.save(`NexPOS_Store_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast({ title: "PDF Report Downloaded", description: "Document saved to your downloads." });
    } catch (err) {
      console.error("PDF generation error:", err);
      toast({ title: "PDF Export Failed", description: err.message, variant: "destructive" });
    }
  };

  const salesConfig = {
    sales: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
  };

  const categoryConfig = categoryData.reduce((config, item) => {
    config[item.name] = {
      label: item.name,
      color: COLORS[categoryData.indexOf(item) % COLORS.length],
    };
    return config;
  }, {});

  // Locked state banner if advanced reports are not included in subscription
  if (!isAdvancedReportsEnabled) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics & Reporting</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Store performance metrics, sales channels, and financial exports.
          </p>
        </div>

        <Card className="rounded-2xl border-border/80 shadow-2xs p-8">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4 py-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h2 className="text-lg font-bold text-foreground">Advanced Reports Locked</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your current plan does not include multi-dimensional sales reporting. Upgrade your subscription to unlock category breakdowns, PDF/Excel generation, and revenue trends.
              </p>
            </div>
            <Button
              onClick={() => navigate('/store/upgrade')}
              className="mt-2 rounded-xl text-xs font-semibold h-9 gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" /> Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics & Reporting</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Aggregated store performance, category distributions, and multi-format exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px] h-9 text-xs rounded-xl">
              <Calendar className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              <SelectItem value="ALL">All Time</SelectItem>
              <SelectItem value="TODAY">Today</SelectItem>
              <SelectItem value="THIS_WEEK">This Week</SelectItem>
              <SelectItem value="THIS_MONTH">This Month</SelectItem>
              <SelectItem value="LAST_30_DAYS">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="rounded-xl text-xs font-semibold h-9 gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export Excel
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="rounded-xl text-xs font-semibold h-9 gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/60 py-3.5 px-6">
            <CardTitle className="text-sm font-bold text-foreground">Monthly Revenue Trends</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Historical billing performance</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-primary" /> Loading monthly trends...
              </div>
            ) : salesData.length > 0 ? (
              <ChartContainer config={salesConfig}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={salesData}>
                    <XAxis
                      dataKey="name"
                      stroke="currentColor"
                      className="text-muted-foreground"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="currentColor"
                      className="text-muted-foreground"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${currencySymbol}${value}`}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          formatter={(value) => [formatCurrency(value), "Revenue"]}
                        />
                      )}
                    />
                    <Bar
                      dataKey="sales"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                No monthly sales records available.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/60 py-3.5 px-6">
            <CardTitle className="text-sm font-bold text-foreground">Revenue by Product Category</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Category contribution breakdown</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-primary" /> Loading category distribution...
              </div>
            ) : categoryData.length > 0 ? (
              <ChartContainer config={categoryConfig}>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={75}
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
              <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                No category sales recorded yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}