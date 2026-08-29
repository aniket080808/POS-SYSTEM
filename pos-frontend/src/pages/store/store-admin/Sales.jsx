import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Search, Filter, Calendar, Download, Plus, Edit, Trash2, CreditCard, DollarSign, User, Store, Eye } from "lucide-react";
import { 
  getStoreOverview, 
  getDailySales, 
  getSalesByPaymentMethod 
} from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { getPaginatedOrders } from "@/Redux Toolkit/features/order/orderThunks";
import { useToast } from "@/components/ui/use-toast";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

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
    loading 
  } = useSelector((state) => state.storeAnalytics);

  const [page, setPage] = useState(0);
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [ordersList, setOrdersList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);

  const fetchSalesData = useCallback(async () => {
    if (!userProfile?.id) return;
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
          description: err || "Failed to load some sales data.",
          duration: 5000,
        });
        setTimeout(() => { window.salesErrorShown = false; }, 5000);
      }
    }
  }, [dispatch, userProfile?.id, toast]);

  const fetchPaginatedOrders = useCallback(async () => {
    if (!userProfile?.id) return;
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
  }, [dispatch, store?.id, userProfile?.store?.id, userProfile?.id, page, paymentTypeFilter, statusFilter]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  useEffect(() => {
    fetchPaginatedOrders();
  }, [fetchPaginatedOrders]);

  // Format percentage change
  const formatChange = (current, previous) => {
    if (current === undefined || current === null) return "+0%";
    if (!previous || previous === 0) {
      return current > 0 ? "+100%" : "+0%";
    }
    const diff = current - previous;
    const percentage = (diff / previous) * 100;
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`;
  };

  // Format cashier comparison vs yesterday
  const formatCashierChange = (today, yesterday) => {
    if (today === undefined || yesterday === undefined || today === null || yesterday === null) {
      return "Same as yesterday";
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
      label: "Sales",
      color: "#10b981",
    },
  };

  const paymentConfig = {
    value: {
      label: "Amount",
      color: "#10b981",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Sales Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Sales</p>
                <h3 className="text-2xl font-bold mt-1">
                  {loading ? (
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    formatCurrency(storeOverview?.totalSales || 0)
                  )}
                </h3>
                <div className="text-xs text-emerald-500 mt-1">
                  {loading ? (
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    formatChange(storeOverview?.totalSales, storeOverview?.previousPeriodSales) + " from last week"
                  )}
                </div>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <DollarSign className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Orders Today</p>
                <h3 className="text-2xl font-bold mt-1">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    storeOverview?.todayOrders || 0
                  )}
                </h3>
                <div className="text-xs text-emerald-500 mt-1">
                  {loading ? (
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    formatChange(storeOverview?.todayOrders, storeOverview?.yesterdayOrders) + " from yesterday"
                  )}
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Store className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Cashiers</p>
                <h3 className="text-2xl font-bold mt-1">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    storeOverview?.activeCashiers || 0
                  )}
                </h3>
                <div className="text-xs text-gray-500 mt-1">
                  {loading ? (
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    formatCashierChange(storeOverview?.activeCashiers, storeOverview?.yesterdayActiveCashiers)
                  )}
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <User className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Order Value</p>
                <h3 className="text-2xl font-bold mt-1">
                  {loading ? (
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                  ) : storeOverview?.todayOrders === 0 ? (
                    formatCurrency(0)
                  ) : (
                    formatCurrency(storeOverview?.averageOrderValue || 0)
                  )}
                </h3>
                <div className="text-xs text-emerald-500 mt-1">
                  {loading ? (
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    formatChange(storeOverview?.averageOrderValue, storeOverview?.previousPeriodAverageOrderValue) + " from last week"
                  )}
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <CreditCard className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Sales (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading chart data...</p>
                </div>
              </div>
            ) : dailySalesData.length > 0 ? (
              <ChartContainer config={salesConfig}>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={dailySalesData}>
                    <XAxis
                      dataKey="date"
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
                      stroke="currentColor"
                      strokeWidth={2}
                      className="stroke-emerald-500"
                      activeDot={{ r: 8, fill: "#10b981" }}
                    />
                  </LineChart>
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
            <CardTitle className="text-lg">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading chart data...</p>
                </div>
              </div>
            ) : paymentMethodData.length > 0 ? (
              <ChartContainer config={paymentConfig}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={paymentMethodData}>
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
                      tickFormatter={(value) => `${currencySymbol}${value}`}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => (
                        <ChartTooltipContent
                          active={active}
                          payload={payload}
                          formatter={(value) => [formatCurrency(value), "Amount"]}
                        />
                      )}
                    />
                    <Bar
                      dataKey="value"
                      fill="currentColor"
                      radius={[4, 4, 0, 0]}
                      className="fill-emerald-500"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">No payment data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sales Transactions Order History Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold">Sales Transactions</CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            {/* Payment Method Filter */}
            <Select value={paymentTypeFilter} onValueChange={(val) => { setPaymentTypeFilter(val); setPage(0); }}>
              <SelectTrigger className="w-[140px] text-xs">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Payments</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(0); }}>
              <SelectTrigger className="w-[140px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full mr-2"></div>
                      Loading transactions...
                    </div>
                  </TableCell>
                </TableRow>
              ) : ordersList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No transactions found for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                ordersList.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs font-semibold">#{order.id}</TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium text-xs">{order.branchName || order.branch?.name || 'Main Branch'}</TableCell>
                    <TableCell className="text-xs">{order.cashierName || order.cashier?.fullName || 'Cashier'}</TableCell>
                    <TableCell className="text-xs">{order.customerName || order.customer?.fullName || 'Walk-in Customer'}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">
                        {order.paymentType || 'CASH'}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-700">{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status || 'COMPLETED'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => setSelectedReceipt(order)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
              <p className="text-xs text-gray-500">
                Showing Page <span className="font-medium">{page + 1}</span> of <span className="font-medium">{totalPages}</span> ({totalElements} total orders)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0 || tableLoading}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1 || tableLoading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Modal */}
      <Dialog open={Boolean(selectedReceipt)} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-center font-bold text-xl">Order Receipt #{selectedReceipt?.id}</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4 text-sm py-2">
              <div className="flex justify-between border-b pb-2 text-xs text-gray-500">
                <span>Date: {new Date(selectedReceipt.createdAt).toLocaleString('en-IN')}</span>
                <span>Payment: {selectedReceipt.paymentType}</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Branch: <span className="font-medium text-gray-900">{selectedReceipt.branchName || 'Main'}</span></p>
                <p className="text-xs text-gray-500">Cashier: <span className="font-medium text-gray-900">{selectedReceipt.cashierName || 'Admin'}</span></p>
                <p className="text-xs text-gray-500">Customer: <span className="font-medium text-gray-900">{selectedReceipt.customerName || 'Walk-in'}</span></p>
              </div>

              {selectedReceipt.items && selectedReceipt.items.length > 0 && (
                <div className="border-t border-b py-2 space-y-2">
                  <p className="font-semibold text-xs text-gray-700">Items Purchased</p>
                  {selectedReceipt.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span>{item.productName || item.product?.name || `Product #${item.productId}`} x{item.quantity}</span>
                      <span className="font-medium">{formatCurrency(item.price)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between font-bold text-base pt-2">
                <span>Total Paid:</span>
                <span className="text-emerald-700">{formatCurrency(selectedReceipt.totalAmount)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}