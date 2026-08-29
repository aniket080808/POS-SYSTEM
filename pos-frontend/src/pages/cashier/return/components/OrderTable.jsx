import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "../../order/data";
import { useSelector } from "react-redux";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const OrderTable = ({ handleSelectOrder }) => {
  const {
    orders = [],
    loading,
    error
  } = useSelector((state) => state.order);
  const { format: formatCurrency } = useCurrencyFormatter();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    const term = searchTerm.toLowerCase();
    return orders.filter((order) => {
      const orderIdMatch = String(order.id).includes(term);
      const customerNameMatch = order.customer?.fullName?.toLowerCase().includes(term);
      const customerPhoneMatch = order.customer?.phone?.includes(term);
      return orderIdMatch || customerNameMatch || customerPhoneMatch;
    });
  }, [orders, searchTerm]);

  const paginatedOrders = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;

  return (
    <div className="w-full p-4 flex flex-col space-y-4 h-full">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Order ID, customer name, phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            className="pl-9"
          />
        </div>
        <div className="text-xs text-muted-foreground ml-auto">
          Showing {filteredOrders.length} order{filteredOrders.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 border rounded-lg overflow-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
            <span>Loading orders...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-destructive">
            <span>{error}</span>
          </div>
        ) : paginatedOrders.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date / Time</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => {
                const isRefunded = order.status === "REFUNDED";
                return (
                  <TableRow key={order.id} className={isRefunded ? "opacity-70 bg-muted/30" : ""}>
                    <TableCell className="font-semibold">#{order.id}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{order.customer?.fullName || "Walk-in Customer"}</p>
                        {order.customer?.phone && (
                          <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>{order.paymentType || "CASH"}</TableCell>
                    <TableCell>
                      <Badge variant={isRefunded ? "destructive" : "outline"}>
                        {order.status || "COMPLETED"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        disabled={isRefunded}
                        variant={isRefunded ? "secondary" : "default"}
                        onClick={() => handleSelectOrder(order)}
                      >
                        {isRefunded ? "Already Refunded" : "Select for Return"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
            <Search className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="font-medium">No orders found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try searching by a different Order ID or customer phone number
            </p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredOrders.length > pageSize && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={(currentPage + 1) * pageSize >= filteredOrders.length}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTable;

