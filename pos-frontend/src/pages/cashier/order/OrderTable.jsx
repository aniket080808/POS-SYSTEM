import React from "react";
import { formatDate, getPaymentModeLabel, getStatusBadgeVariant } from "./data";
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
import { EyeIcon } from "lucide-react";
import { PrinterIcon } from "lucide-react";
import { RotateCcwIcon } from "lucide-react";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const OrderTable = ({
  orders,
  handleViewOrder,
  handlePrintInvoice,
  handleInitiateReturn,
}) => {
  const { format: formatCurrency } = useCurrencyFormatter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Date/Time</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Payment Mode</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.id}</TableCell>
            <TableCell>{formatDate(order.createdAt)}</TableCell>
            <TableCell>
              {order.customer?.fullName || "Walk-in Customer"}
            </TableCell>
            <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
            <TableCell>{getPaymentModeLabel(order.paymentType)}</TableCell>
            <TableCell>
              <Badge
                variant={getStatusBadgeVariant(order.status)}
                className="capitalize"
              >
                {order.status || "COMPLETE"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleViewOrder(order)}
                >
                  <EyeIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePrintInvoice(order)}
                >
                  <PrinterIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleInitiateReturn(order)}
                >
                  <RotateCcwIcon className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default OrderTable;
