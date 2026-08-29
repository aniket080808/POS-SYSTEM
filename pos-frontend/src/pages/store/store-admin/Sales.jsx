import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, BarChart, Bar } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  CreditCard, 
  DollarSign, 
  User, 
  Store, 
  Eye, 
  TrendingUp, 
  ShoppingBag, 
  Loader2, 
  Receipt,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  getStoreOverview, 
  getDailySales, 
  getSalesByPaymentMethod 
} from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { getPaginatedOrders } from "@/Redux Toolkit/features/order/orderThunks";
import { useToast } from "@/components/ui/use-toast";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { Badge } from "@/components/ui/badge";

export default function Sales() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { format: formatCurrency, symbol: currencySymbol } = useCurrencyFormatter();
  const { userProfile } = useSelector((state) => state.user || {});
  const { store } = useSelector((state) => state.store || {});
  const { 
    storeOverview, 
    dailySales, 
    salesByPaymentMethod, 
    loading 
  } = useSelector((state) => state.storeAnalytics || {});

  const [page, setPage] = useState(0);
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [ordersList, setOrdersList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => {
    if (userProfile?.id) {
      fetchSalesData();
    }
  }, [userProfile?.id]);

  useEffect(() => {
    if (userProfile?.id) {
      fetchPaginatedOrders();
    }
  }, [userProfile?.id, page, paymentTypeFilter, statusFilter]);

  const fetchPaginatedOrders = async () => {
    setTableLoading(true);
    try {
      const targetId = store?.id || userProfile?.store?.id || userProfile?.id;
      const res = await dispatch(getPaginatedOrders({
        storeAdminId: targetId,
        page,
        size: 10,
        paymentType: paymentTypeFilter,
        status: statusFilter
      })).unwrap();

      setOrdersList(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error("Failed to fetch order history:", err);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchSalesData = async () => {
    try {
      await Promise.all([
        dispatch(getStoreOverview(userProfile.id)).unwrap(),
        dispatch(getDailySales(userProfile.id)).unwrap(),
        dispatch(getSalesByPaymentMethod(userProfile.id)).unwrap(),
      ]);
    } catch (err) {
      console.error("Sales data fetch error:", err);
      if (!window.salesErrorShown) {
        window.salesErrorShown = true;
        toast({
          description: err || "Failed to load sales metrics.",
          duration: 5000,
        });
        setTimeout(() => { window.salesErrorShown = false; }, 5000);
      }
    }
  };

  const formatChange = (current, previous) => {
    if (current === undefined || current === null) return "+0%";
    if (!previous || previous === 0) {
      return current > 0 ? "+100%" : "+0%";
    }
    const diff = current - previous;
    const percentage = (diff / previous) * 100;
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`;
  };

  const formatCashierChange = (today, yesterday) => {
    if (today === undefined || yesterday === undefined || today === null || yesterday === null) {
      return "0 from yesterday";
    }
    if (today === yesterday) return "Same as yesterday";
    const diff = today - yesterday;
    return diff > 0 ? `+${diff} from yesterday` : `${diff} from yesterday`;
  };

  const dailySalesData = dailySales?.map(item => ({
    date: new Date(item.date)?.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' }),
    sales: item.totalAmount
  })) || [];

  const paymentMethodData = salesByPaymentMethod?.map(item => ({
    name: item.paymentMethod,
    value: item.totalAmount
  })) || [];

  const salesConfig = {
    sales: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
  };

  const paymentConfig = {
    value: {
      label: "Volume",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Sales & Transactions</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real-time transaction tracking, payment split analysis, and digital receipts.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Total Revenue</p>
                <h3 className="text-xl font-bold font-mono text-foreground mt-1">
                  {loading ? (
                    <div className="h-7 w-24 bg-muted animate-pulse rounded-lg"></div>
                  ) : (
                    formatCurrency(storeOverview?.totalSales || 0)
                  )}
                </h3>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{formatChange(storeOverview?.totalSales, storeOverview?.previousPeriodSales)} vs prev week</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Orders Today</p>
                <h3 className="text-xl font-bold font-mono text-foreground mt-1">
                  {loading ? (
                    <div className="h-7 w-16 bg-muted animate-pulse rounded-lg"></div>
                  ) : (
                    storeOverview?.todayOrders || 0
                  )}
                </h3>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-primary mt-1">
                  <ShoppingBag className="w-3 h-3" />
                  <span>{formatChange(storeOverview?.todayOrders, storeOverview?.yesterdayOrders)} vs yesterday</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Active Terminals</p>
                <h3 className="text-xl font-bold font-mono text-foreground mt-1">
                  {loading ? (
                    <div className="h-7 w-16 bg-muted animate-pulse rounded-lg"></div>
                  ) : (
                    storeOverview?.activeCashiers || 0
                  )}
                </h3>
                <div className="text-[11px] text-muted-foreground font-medium mt-1">
                  {formatCashierChange(storeOverview?.activeCashiers, storeOverview?.yesterdayActiveCashiers)}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Average Ticket</p>
                <h3 className="text-xl font-bold font-mono text-foreground mt-1">
                  {loading ? (
                    <div className="h-7 w-20 bg-muted animate-pulse rounded-lg"></div>
                  ) : storeOverview?.todayOrders === 0 ? (
                    formatCurrency(0)
                  ) : (
                    formatCurrency(storeOverview?.averageOrderValue || 0)
                  )}
                </h3>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{formatChange(storeOverview?.averageOrderValue, storeOverview?.previousPeriodAverageOrderValue)} vs avg</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/60 py-3.5 px-6">
            <CardTitle className="text-sm font-bold text-foreground">7-Day Sales Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-primary" /> Loading sales chart...
              </div>
            ) : dailySalesData.length > 0 ? (
              <ChartContainer config={salesConfig}>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={dailySalesData}>
                    <XAxis
                      dataKey="date"
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
                          formatter={(value) => [formatCurrency(value), "Sales"]}
                        />
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#10b981" }}
                      activeDot={{ r: 6, fill: "#10b981" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                No revenue recorded in this period.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/60 py-3.5 px-6">
            <CardTitle className="text-sm font-bold text-foreground">Payment Method Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-primary" /> Loading payment breakdown...
              </div>
            ) : paymentMethodData.length > 0 ? (
              <ChartContainer config={paymentConfig}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={paymentMethodData}>
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
                          formatter={(value) => [formatCurrency(value), "Volume"]}
                        />
                      )}
                    />
                    <Bar
                      dataKey="value"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                No transaction data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table Card */}
      <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/60 py-3.5 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-sm font-bold text-foreground">Sales Transaction Journal</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={paymentTypeFilter} onValueChange={(val) => { setPaymentTypeFilter(val); setPage(0); }}>
              <SelectTrigger className="w-[125px] h-8 text-xs rounded-xl">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs">
                <SelectItem value="ALL">All Tender</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(0); }}>
              <SelectTrigger className="w-[125px] h-8 text-xs rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs">
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/60">
                  <TableHead className="text-xs font-bold text-foreground py-3.5 pl-6">Invoice #</TableHead>
                  <TableHead className="text-xs font-bold text-foreground py-3.5">Timestamp</TableHead>
                  <TableHead className="text-xs font-bold text-foreground py-3.5">Branch</TableHead>
                  <TableHead className="text-xs font-bold text-foreground py-3.5">Cashier</TableHead>
                  <TableHead className="text-xs font-bold text-foreground py-3.5">Customer</TableHead>
                  <TableHead className="text-xs font-bold text-foreground py-3.5">Method</TableHead>
                  <TableHead className="text-xs font-bold text-foreground py-3.5">Net Amount</TableHead>
                  <TableHead className="text-xs font-bold text-foreground py-3.5">Status</TableHead>
                  <TableHead className="text-xs font-bold text-foreground py-3.5 pr-6 text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-xs text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin inline-block mr-2 text-primary" />
                      Loading sales transactions...
                    </TableCell>
                  </TableRow>
                ) : ordersList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-xs text-muted-foreground">
                      No transactions found matching the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  ordersList.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/30 transition-colors border-b border-border/40">
                      <TableCell className="pl-6 py-3.5 font-mono text-xs font-semibold text-foreground">
                        #{order.id}
                      </TableCell>
                      <TableCell className="py-3.5 text-xs text-muted-foreground">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : '—'}
                      </TableCell>
                      <TableCell className="py-3.5 font-medium text-xs text-foreground">
                        {order.branchName || order.branch?.name || 'Main Store'}
                      </TableCell>
                      <TableCell className="py-3.5 text-xs text-muted-foreground">
                        {order.cashierName || order.cashier?.fullName || 'Cashier'}
                      </TableCell>
                      <TableCell className="py-3.5 text-xs text-muted-foreground">
                        {order.customerName || order.customer?.fullName || 'Walk-in'}
                      </TableCell>
                      <TableCell className="py-3.5">
                        <Badge variant="outline" className="text-[10px] font-semibold bg-muted/60">
                          {order.paymentType || 'CASH'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3.5 font-bold font-mono text-xs text-foreground">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell className="py-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold ${
                            order.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {order.status || 'COMPLETED'}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary"
                          onClick={() => setSelectedReceipt(order)}
                          title="View Digital Receipt"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-border/60">
              <p className="text-xs text-muted-foreground">
                Page <span className="font-semibold text-foreground">{page + 1}</span> of <span className="font-semibold text-foreground">{totalPages}</span> ({totalElements} records)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0 || tableLoading}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="rounded-xl text-xs font-semibold h-8"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1 || tableLoading}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl text-xs font-semibold h-8"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Digital Receipt Modal */}
      <Dialog open={Boolean(selectedReceipt)} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl p-6">
          <DialogHeader>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary mx-auto mb-2">
              <Receipt className="w-5 h-5" />
            </div>
            <DialogTitle className="text-center font-bold text-base text-foreground">
              NexPOS Digital Receipt
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground">
              Invoice #{selectedReceipt?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4 text-xs pt-2">
              <div className="flex justify-between border-b border-border/60 pb-2.5 text-muted-foreground font-mono">
                <span>{new Date(selectedReceipt.createdAt).toLocaleString('en-IN')}</span>
                <span className="font-semibold text-foreground">{selectedReceipt.paymentType}</span>
              </div>
              <div className="space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-semibold text-foreground">{selectedReceipt.branchName || 'Main Store'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Terminal / Cashier:</span>
                  <span className="font-semibold text-foreground">{selectedReceipt.cashierName || 'Admin'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-semibold text-foreground">{selectedReceipt.customerName || 'Walk-in'}</span>
                </div>
              </div>

              {selectedReceipt.items && selectedReceipt.items.length > 0 && (
                <div className="border-t border-b border-border/60 py-3 space-y-2">
                  <p className="font-bold text-foreground">Items</p>
                  {selectedReceipt.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-muted-foreground">
                      <span className="text-foreground">{item.productName || item.product?.name || `SKU #${item.productId}`} <span className="text-muted-foreground font-mono">×{item.quantity}</span></span>
                      <span className="font-mono font-semibold text-foreground">{formatCurrency(item.price)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between font-bold text-sm pt-1">
                <span className="text-foreground">Total Settled:</span>
                <span className="font-mono text-primary text-base">{formatCurrency(selectedReceipt.totalAmount)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}