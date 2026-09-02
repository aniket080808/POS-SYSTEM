import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag } from "lucide-react";
import { getRecentOrdersByBranch } from "@/Redux Toolkit/features/order/orderThunks";
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
    <Card className="border-border shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#F5A623]" />
            Recent Orders
          </CardTitle>
          <CardDescription className="text-xs">Latest orders at this branch</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {loading && ordersList.length === 0 ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/50">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : ordersList.length > 0 ? (
          <div className="border border-border rounded-2xl bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Cashier</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersList.slice(0, 5).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      #{order.id}
                    </TableCell>
                    <TableCell className="text-xs text-foreground font-medium truncate max-w-[120px]">
                      {order.customerName || order.customer?.fullName || "Walk-in Guest"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[100px]">
                      {order.cashierName || order.cashier?.fullName || "Staff"}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={order.status === "COMPLETED" ? "active" : "warning"}
                        className="text-[10px] font-bold"
                      >
                        {order.status || "COMPLETED"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-[11px] font-mono text-muted-foreground">
                      {order.createdAt ? formatDateTime(order.createdAt) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground font-semibold">
            No recent orders found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOrders;