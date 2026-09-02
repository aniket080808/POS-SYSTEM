import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Cell, Area, AreaChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DollarSign, Store, Users, CreditCard, Eye, Loader2, ArrowUpRight, ArrowDownRight, Download } from "lucide-react";
import * as XLSX from "xlsx";
import {
  getStoreOverview,
  getDailySales,
  getSalesByPaymentMethod,
} from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { getPaginatedOrders } from "@/Redux Toolkit/features/order/orderThunks";
import { useToast } from "@/components/ui/use-toast";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { Badge } from "@/components/ui/badge";
import { CHART_PALETTE, PRIMARY_CHART_COLOR, getChartColor } from "@/utils/chartColors";

export default function Sales() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { format: formatCurrency, symbol: currencySymbol } = useCurrencyFormatter();
  const { userProfile } = useSelector((state) => state.user);
  const { store } = useSelector((state) => state.store || {});
  const {
    storeOverview,
    dailySales,
    salesByPaymentMethod,
    loading,
  } = useSelector((state) => state.storeAnalytics);

  const [page, setPage] = useState(0);
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [ordersList, setOrdersList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);

  const adminId = store?.storeAdmin?.id || userProfile?.id;

  useEffect(() => {
    if (adminId) {
      fetchSalesData();
    }
  }, [adminId]);

  useEffect(() => {
    if (adminId) {
      fetchPaginatedOrders();
    }
  }, [adminId, page, paymentTypeFilter, statusFilter]);

  const fetchPaginatedOrders = async () => {
    if (!adminId) return;
    setTableLoading(true);
    try {
      const res = await dispatch(
        getPaginatedOrders({
          storeAdminId: adminId,
          page,
          size: 10,
          paymentType: paymentTypeFilter === "ALL" ? null : paymentTypeFilter,
          status: statusFilter === "ALL" ? null : statusFilter,
        })
      ).unwrap();

      if (res && res.content) {
        setOrdersList(res.content);
        setTotalPages(res.totalPages || 0);
        setTotalElements(res.totalElements || 0);
      } else if (Array.isArray(res)) {
        setOrdersList(res);
        setTotalPages(1);
        setTotalElements(res.length);
      }
    } catch (err) {
      console.error("Failed to load paginated orders", err);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchSalesData = async () => {
    if (!adminId) return;
    try {
      await Promise.all([
        dispatch(getStoreOverview(adminId)).unwrap(),
        dispatch(getDailySales(adminId)).unwrap(),
        dispatch(getSalesByPaymentMethod(adminId)).unwrap(),
      ]);
    } catch (err) {
      console.error("Sales data fetch error:", err);
    }
  };

  const handleExportOrders = () => {
    if (!ordersList || ordersList.length === 0) {
      toast({
        title: "No Transactions",
        description: "There are no transactions in the current table view to export.",
        variant: "destructive",
      });
      return;
    }
    try {
      const exportRows = ordersList.map((o) => ({
        "Receipt / Order ID": o.id || o.orderNumber || "",
        "Date & Time": o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN") : "",
        "Customer": o.customer?.fullName || o.customer?.name || "Walk-in Customer",
        "Branch": o.branch?.name || "Main Branch",
        "Cashier": o.cashier?.fullName || o.cashier?.name || "Counter Staff",
        "Payment Mode": o.paymentType || "CASH",
        "Subtotal": o.subtotal || o.totalAmount || 0,
        "Tax Amount": o.taxAmount || 0,
        "Discount": o.discount || 0,
        "Total Amount": o.totalAmount || 0,
        "Status": o.status || "COMPLETED",
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportRows);
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `Store_Transactions_${dateStr}.xlsx`);
      toast({
        title: "Transactions Exported",
        description: `Exported ${ordersList.length} transactions successfully.`,
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "Failed to generate transactions export.",
        variant: "destructive",
      });
    }
  };

  const dailySalesData =
    dailySales?.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      sales: item.totalAmount ?? item.totalSales ?? item.sales ?? 0,
    })) || [];

  const paymentMethodData =
    salesByPaymentMethod?.map((item) => ({
      name: item.type || item.paymentMethod || "Other",
      value: item.totalAmount ?? item.totalSales ?? 0,
    })) || [];

  const salesConfig = {
    sales: {
      label: "Revenue",
      color: PRIMARY_CHART_COLOR,
    },
  };

  const paymentConfig = {
    value: {
      label: "Collected",
      color: PRIMARY_CHART_COLOR,
    },
  };

  const formatChange = (current, previous) => {
    if (previous === undefined || previous === null || previous === 0) return "0.0%";
    const change = ((current - previous) / previous) * 100;
    const sign = change > 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sales & Transactions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Store revenue, payment methods, and recent customer orders
          </p>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today's Sales</p>
                <h3 className="text-2xl font-black text-foreground tracking-tight">
                  {loading && !storeOverview ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#F5A623]" />
                  ) : (
                    formatCurrency(storeOverview?.todaySales ?? storeOverview?.totalSales ?? 0)
                  )}
                </h3>
                <div className="text-[11px] font-semibold text-[#8C5800] mt-1 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3 text-[#F5A623]" />
                  {formatChange(storeOverview?.todaySales, storeOverview?.previousPeriodSales)} vs yesterday
                </div>
              </div>
              <div className="w-11 h-11 bg-secondary rounded-2xl flex items-center justify-center text-foreground shrink-0">
                <DollarSign className="w-5 h-5 text-[#F5A623]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-black text-foreground tracking-tight">
                  {loading && !storeOverview ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#F5A623]" />
                  ) : (
                    storeOverview?.todayOrders || storeOverview?.totalOrders || 0
                  )}
                </h3>
                <div className="text-[11px] font-semibold text-[#8C5800] mt-1 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3 text-[#F5A623]" />
                  {formatChange(storeOverview?.todayOrders, storeOverview?.previousPeriodOrders)} vs yesterday
                </div>
              </div>
              <div className="w-11 h-11 bg-secondary rounded-2xl flex items-center justify-center text-foreground shrink-0">
                <Store className="w-5 h-5 text-[#F5A623]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Branches</p>
                <h3 className="text-2xl font-black text-foreground tracking-tight">
                  {loading && !storeOverview ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#F5A623]" />
                  ) : (
                    storeOverview?.activeBranches ?? storeOverview?.totalBranches ?? 0
                  )}
                </h3>
                <p className="text-[11px] font-medium text-muted-foreground mt-1">
                  of {storeOverview?.totalBranches || 0} total branch locations
                </p>
              </div>
              <div className="w-11 h-11 bg-secondary rounded-2xl flex items-center justify-center text-foreground shrink-0">
                <Users className="w-5 h-5 text-[#F5A623]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Avg Order Value</p>
                <h3 className="text-2xl font-black text-foreground tracking-tight">
                  {loading && !storeOverview ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#F5A623]" />
                  ) : storeOverview?.todayOrders === 0 ? (
                    formatCurrency(0)
                  ) : (
                    formatCurrency(storeOverview?.averageOrderValue || 0)
                  )}
                </h3>
                <div className="text-[11px] font-semibold text-[#8C5800] mt-1">
                  {formatChange(storeOverview?.averageOrderValue, storeOverview?.previousPeriodAverageOrderValue)} vs prior period
                </div>
              </div>
              <div className="w-11 h-11 bg-secondary rounded-2xl flex items-center justify-center text-foreground shrink-0">
                <CreditCard className="w-5 h-5 text-[#F5A623]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Line/Area Chart */}
        <Card className="border-border shadow-2xs">
          <CardHeader className="pb-2 border-b border-border/60">
            <CardTitle className="text-base">Sales Trend (Last 7 Days)</CardTitle>
            <CardDescription className="text-xs">Daily sales across all store branches</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {dailySalesData.length > 0 ? (
              <ChartContainer config={salesConfig} className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailySalesData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <defs>
                      <linearGradient id="salesAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F5A623" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#F5A623" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#8C877D" fontSize={11} tickLine={false} axisLine={false} height={24} />
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
                          formatter={(val) => [formatCurrency(val), "Sales"]}
                        />
                      )}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#F5A623"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#salesAreaGradient)"
                      dot={{ r: 4, fill: "#F5A623", stroke: "#FFFFFF", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "#F5A623" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-xs text-muted-foreground font-semibold">
                No sales records available for this cycle.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Multi-Colored Payment Methods Bar Chart */}
        <Card className="border-border shadow-2xs">
          <CardHeader className="pb-2 border-b border-border/60">
            <CardTitle className="text-base">Payment Methods</CardTitle>
            <CardDescription className="text-xs">Total sales by payment method (Cash, UPI, Card)</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {paymentMethodData.length > 0 ? (
              <ChartContainer config={paymentConfig} className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentMethodData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <XAxis dataKey="name" stroke="#8C877D" fontSize={11} tickLine={false} axisLine={false} height={24} />
                    <YAxis
                      stroke="#8C877D"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${currencySymbol}${val}`}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          formatter={(val) => [formatCurrency(val), "Total"]}
                        />
                      )}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getChartColor(index)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-xs text-muted-foreground font-semibold">
                No payment distribution data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="border-border shadow-2xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Transactions</CardTitle>
              <CardDescription className="text-xs">
                Recent sales transactions across all branches
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={paymentTypeFilter}
                onValueChange={(val) => {
                  setPaymentTypeFilter(val);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-36 h-9 text-xs">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Payments</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-36 h-9 text-xs">
                  <SelectValue placeholder="Order Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportOrders}
                className="h-9 text-xs font-bold gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#B8860B]" />
                Export Orders (.xlsx)
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="border border-border rounded-2xl bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Cashier</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-xs text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#F5A623] mb-2" />
                      Loading sales transactions...
                    </TableCell>
                  </TableRow>
                ) : ordersList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-xs text-muted-foreground font-semibold">
                      No matching sales records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  ordersList.map((order) => (
                    <TableRow key={order.id} className="hover:bg-secondary/20">
                      <TableCell className="font-mono text-xs font-bold text-foreground">
                        #{order.id}
                      </TableCell>
                      <TableCell className="text-xs text-foreground font-medium truncate max-w-[140px]">
                        {order.customerName || order.customer?.fullName || "Walk-in Guest"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {order.branchName || order.branch?.name || "Main Store"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {order.cashierName || order.cashier?.fullName || "Staff"}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-bold uppercase text-foreground">
                        {order.paymentType || order.paymentMethod || "CASH"}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-foreground">
                        {formatCurrency(order.totalAmount || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "COMPLETED"
                              ? "active"
                              : order.status === "REFUNDED" || order.status === "CANCELLED"
                              ? "destructive"
                              : "warning"
                          }
                          className="text-[10px] font-bold"
                        >
                          {order.status || "COMPLETED"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setSelectedReceipt(order)}
                        >
                          <Eye className="w-4 h-4 text-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-muted-foreground">
                Showing {ordersList.length} of {totalElements} transactions
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  className="text-xs h-8"
                >
                  Previous
                </Button>
                <span className="text-xs font-mono text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  className="text-xs h-8"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={Boolean(selectedReceipt)} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader className="pb-3 border-b border-border/60">
            <DialogTitle className="text-base font-bold flex items-center justify-between">
              <span>Invoice #{selectedReceipt?.id}</span>
              <Badge variant="active" className="text-[10px]">
                {selectedReceipt?.status || "COMPLETED"}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4 text-xs pt-2">
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Customer</span>
                  <span className="font-semibold text-foreground">
                    {selectedReceipt.customerName || selectedReceipt.customer?.fullName || "Walk-in Guest"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Payment Method</span>
                  <span className="font-mono font-bold text-foreground uppercase">
                    {selectedReceipt.paymentType || selectedReceipt.paymentMethod || "CASH"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Branch</span>
                  <span className="font-semibold text-foreground">
                    {selectedReceipt.branchName || selectedReceipt.branch?.name || "Main Store"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Cashier</span>
                  <span className="font-semibold text-foreground">
                    {selectedReceipt.cashierName || selectedReceipt.cashier?.fullName || "Staff"}
                  </span>
                </div>
              </div>

              {selectedReceipt.items && selectedReceipt.items.length > 0 && (
                <div className="border border-border/60 rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/40">
                        <TableHead className="py-2 text-[11px]">Item</TableHead>
                        <TableHead className="py-2 text-center text-[11px]">Qty</TableHead>
                        <TableHead className="py-2 text-right text-[11px]">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedReceipt.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="py-2 text-xs font-medium">{item.productName || item.product?.name}</TableCell>
                          <TableCell className="py-2 text-center text-xs font-mono">{item.quantity}</TableCell>
                          <TableCell className="py-2 text-right text-xs font-mono font-bold">
                            {formatCurrency(item.totalPrice || item.price * item.quantity || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-border/60 font-bold text-sm">
                <span>Total Amount:</span>
                <span className="font-mono text-base">{formatCurrency(selectedReceipt.totalAmount || 0)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}