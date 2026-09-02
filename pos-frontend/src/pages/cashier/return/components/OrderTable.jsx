import React, { useState, useMemo, useRef, useEffect } from "react";
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
import { Search, ChevronLeft, ChevronRight, RotateCcw, ScanLine, X } from "lucide-react";
import { formatDate, getStatusBadgeVariant } from "../../order/data";
import { useSelector } from "react-redux";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const OrderTable = ({ handleSelectOrder }) => {
  const {
    orders = [],
    loading,
  } = useSelector((state) => state.order);
  const { format: formatCurrency } = useCurrencyFormatter();
  const searchInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    const term = searchTerm.toLowerCase().replace("#", "").trim();
    return orders.filter((order) => {
      const orderIdMatch = String(order.id) === term || String(order.id).includes(term);
      const customerNameMatch = order.customer?.fullName?.toLowerCase().includes(term);
      const customerPhoneMatch = order.customer?.phone?.includes(term);
      return orderIdMatch || customerNameMatch || customerPhoneMatch;
    });
  }, [orders, searchTerm]);

  // If cashier scans receipt barcode and presses Enter, auto-open if exact match
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filteredOrders.length > 0) {
      e.preventDefault();
      handleSelectOrder(filteredOrders[0]);
    }
  };

  const paginatedOrders = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;

  return (
    <div className="w-full p-4 flex flex-col space-y-4 h-full min-h-0 overflow-hidden">
      {/* Barcode / Receipt Search Bar */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative flex-1 max-w-lg">
          <ScanLine className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B8860B]" />
          <Input
            ref={searchInputRef}
            placeholder="Scan invoice barcode or search by ID (#), customer, phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-32 text-xs h-10 rounded-xl bg-card border-border shadow-2xs focus-visible:ring-[#C9A227]"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 select-none pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              SCAN INVOICE
            </div>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="flex-1 min-h-0 rounded-2xl border border-border/80 overflow-y-auto bg-card shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40 border-b border-border/80">
              <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3.5">Invoice #</TableHead>
              <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3.5">Timestamp</TableHead>
              <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3.5">Billed Customer</TableHead>
              <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3.5">Total Paid</TableHead>
              <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3.5">Tender Mode</TableHead>
              <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3.5">Status</TableHead>
              <TableHead className="text-right text-sm font-bold text-foreground uppercase tracking-wider py-3.5">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground">
                  Loading branch orders...
                </TableCell>
              </TableRow>
            ) : paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground font-semibold">
                  No orders found matching search criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow key={order.id} className="border-b border-border/60 hover:bg-secondary/20">
                  <TableCell className="font-mono text-xs font-bold text-foreground py-3">
                    #{order.id}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono py-3">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground py-3">
                    {order.customer?.fullName || "Walk-in Guest"}
                  </TableCell>
                  <TableCell className="text-xs font-bold font-mono text-foreground py-3">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell className="text-xs font-mono uppercase text-muted-foreground py-3">
                    {order.paymentType || "CASH"}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant={getStatusBadgeVariant(order.status)}
                      className="text-[10px] uppercase font-bold"
                    >
                      {order.status || "COMPLETED"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <Button
                      size="sm"
                      disabled={order.status === "REFUNDED"}
                      onClick={() => order.status !== "REFUNDED" && handleSelectOrder(order)}
                      className={`text-xs font-bold h-8 gap-1 px-3 ${
                        order.status === "REFUNDED"
                          ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted"
                          : ""
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {order.status === "REFUNDED" ? "Refunded" : "Select Return"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground font-mono">
            Page {currentPage + 1} of {totalPages}
          </span>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="text-xs h-8"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="text-xs h-8"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTable;
