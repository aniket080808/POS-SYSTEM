import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Clock } from "lucide-react";
import { getRecentOrdersByBranch } from "@/Redux Toolkit/features/order/orderThunks";
import { getStatusColor } from "../../../utils/getStatusColor";
import { formatDateTime } from "../../../utils/formateDate";

const RecentOrders = () => {
  const dispatch = useDispatch();
  const branchId = useSelector((state) => state.branch.branch?.id);
  const { recentOrders, loading } = useSelector((state) => state.order);

  useEffect(() => {
    if (branchId) {
      dispatch(getRecentOrdersByBranch(branchId));
    }
  }, [branchId, dispatch]);

  const ordersList = Array.isArray(recentOrders) ? recentOrders : [];

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Recent Orders
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Latest transactions at this branch</p>
        </div>
      </CardHeader>
      <CardContent>
        {loading && ordersList.length === 0 ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/50">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : ordersList.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Cashier</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersList.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-semibold text-xs text-foreground">#{order.id}</TableCell>
                    <TableCell className="text-sm">
                      <div className="font-medium text-foreground">
                        {order.customer?.fullName || order.customerName || "Walk-in Customer"}
                      </div>
                      {order.customer?.phone && (
                        <div className="text-[11px] text-muted-foreground">{order.customer.phone}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {order.cashierName || (order.cashierId ? `Cashier #${order.cashierId}` : "-")}
                    </TableCell>
                    <TableCell className="font-semibold text-sm text-foreground">
                      ₹{((order.totalAmount || order.amount || 0)).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)} variant="secondary">
                        {order.status || 'COMPLETED'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {order.createdAt ? formatDateTime(order.createdAt) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center justify-center">
            <Clock className="w-10 h-10 mb-2 opacity-20" />
            <p className="font-medium">No recent orders found</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              New orders processed at the POS counter will show up here in real time.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOrders;