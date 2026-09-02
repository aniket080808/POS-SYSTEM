import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
} from "lucide-react";
import { formatDateTime } from "../../../utils/formateDate";

const OrdersTable = ({
  orders = [],
  loading,
  searchTerm = "",
  onViewDetails,
  onPrintInvoice,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    if (!searchTerm || searchTerm.trim() === "") return orders;

    const term = searchTerm.toLowerCase().trim();
    return orders.filter((order) => {
      const idMatch = String(order.id).toLowerCase().includes(term);
      const customerMatch =
        (order.customer?.fullName || order.customer?.name || "")
          .toLowerCase()
          .includes(term);
      const cashierMatch =
        (order.cashier?.fullName || order.cashier?.name || "")
          .toLowerCase()
          .includes(term);
      return idMatch || customerMatch || cashierMatch;
    });
  }, [orders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Cashier</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-xs font-semibold text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin inline-block mr-2 text-[#B8860B]" />
                  Loading branch order records...
                </TableCell>
              </TableRow>
            ) : paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-xs font-semibold text-muted-foreground">
                  No orders found matching the filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs font-bold text-foreground">
                    #{order.id}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground">
                    {order.customer?.fullName || order.customer?.name || "Walk-in Guest"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {order.cashier?.fullName || order.cashier?.name || "Staff"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {order.createdAt ? formatDateTime(order.createdAt) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-[10px] font-bold">
                      {order.paymentType || "CASH"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono font-bold text-xs text-foreground">
                    ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "COMPLETED"
                          ? "active"
                          : order.status === "CANCELLED"
                          ? "error"
                          : "warning"
                      }
                      className="text-[10px] font-bold"
                    >
                      {order.status || "COMPLETED"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => onViewDetails(order.id)}
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                        onClick={() => onPrintInvoice(order.id)}
                        title="Print / Export Receipt"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Items per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-18 text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-muted-foreground font-mono pl-2">
              Showing {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredOrders.length)} of {filteredOrders.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-mono text-xs text-muted-foreground px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;