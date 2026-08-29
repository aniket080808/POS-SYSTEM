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
import { Download, FileText, Lock, BadgeDollarSign, Calendar } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useNavigate } from "react-router";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function Reports() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { format: formatCurrency, symbol: currencySymbol } = useCurrencyFormatter();
  const { userProfile } = useSelector((state) => state.user);
  const { monthlySales, salesByCategory, loading } = useSelector((state) => state.storeAnalytics);
  const { statusResponse } = useSelector((state) => state.storeSubscription);

  const [dateRange, setDateRange] = React.useState("ALL");

  const currentPlan = statusResponse?.currentPlan;
  const isAdvancedReportsEnabled = Boolean(currentPlan?.enableAdvancedReports);

  const fetchReportsData = React.useCallback(async () => {
    if (!userProfile?.id) return;
    try {
      await Promise.all([
        dispatch(getMonthlySales(userProfile.id)).unwrap(),
        dispatch(getSalesByCategory(userProfile.id)).unwrap(),
      ]);
    } catch (err) {
      console.error("Reports data fetch error:", err);
      if (err && typeof err === 'object' && err.error === 'ADVANCED_REPORTS_NOT_AVAILABLE') {
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
  }, [dispatch, userProfile?.id, toast]);

  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

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

      XLSX.writeFile(wb, `POS_Store_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast({ title: "Success", description: "Report exported to Excel/CSV successfully" });
    } catch (err) {
      toast({ title: "Export Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      // Title & Header
      doc.setFontSize(18);
      doc.setTextColor(16, 185, 129); // Emerald accent
      doc.text("POS System - Analytics & Reports", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 28);
      doc.text(`Store Admin: ${userProfile?.fullName || 'Store Owner'}`, 14, 34);

      // Section 1: Monthly Sales
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59);
      doc.text("Monthly Sales Trends", 14, 46);

      autoTable(doc, {
        startY: 50,
        head: [["Month", `Total Revenue (${currencySymbol})`]],
        body: salesData.map(item => [item.name, formatCurrency(item.sales)]),
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] }
      });

      // Section 2: Category Breakdown
      const finalY = doc.lastAutoTable.finalY || 100;
      doc.setFontSize(13);
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
      doc.save(`POS_Store_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast({ title: "Success", description: "Direct PDF report downloaded successfully" });
    } catch (err) {
      console.error("PDF generation error:", err);
      toast({ title: "PDF Export Failed", description: err.message, variant: "destructive" });
    }
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px] text-xs">
              <Calendar className="w-3.5 h-3.5 mr-1 text-gray-500" />
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Time</SelectItem>
              <SelectItem value="TODAY">Today</SelectItem>
              <SelectItem value="THIS_WEEK">This Week</SelectItem>
              <SelectItem value="THIS_MONTH">This Month</SelectItem>
              <SelectItem value="LAST_30_DAYS">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Export CSV/Excel
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportPDF} className="text-xs">
            <FileText className="w-3.5 h-3.5 mr-1 text-blue-600" /> Print / PDF
          </Button>
        </div>
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