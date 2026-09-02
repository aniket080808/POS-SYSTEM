import React from "react";
import { formatDate, getStatusBadgeVariant } from "./data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Eye, Printer, RotateCcw } from "lucide-react";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const OrderTable = ({
  orders = [],
  handleViewOrder,
  handlePrintInvoice,
  handleInitiateReturn,
}) => {
  const { format: formatCurrency } = useCurrencyFormatter();

  return (
    <div className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/40 border-b border-border/80">
            <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3.5">Invoice ID</TableHead>
            <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3.5">Timestamp</TableHead>
            <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3.5">Customer</TableHead>
            <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3.5">Gross Amount</TableHead>
            <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3.5">Tender Mode</TableHead>
            <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3.5">Status</TableHead>
            <TableHead className="text-right text-sm font-bold text-foreground uppercase tracking-wider py-3.5">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground font-semibold">
                No matching order records found for this shift.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
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
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleViewOrder(order)}
                      title="View Invoice Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handlePrintInvoice(order)}
                      title="Print Thermal Receipt"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={order.status === "REFUNDED"}
                      className={`h-8 w-8 ${
                        order.status === "REFUNDED"
                          ? "opacity-30 cursor-not-allowed text-muted-foreground"
                          : "text-muted-foreground hover:text-destructive"
                      }`}
                      onClick={() => order.status !== "REFUNDED" && handleInitiateReturn(order)}
                      title={order.status === "REFUNDED" ? "Invoice Already Refunded" : "Process Return / Refund"}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderTable;
