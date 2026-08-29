import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Printer, User, CreditCard, Calendar, ReceiptText, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import OrderItemTable from "../../common/Order/OrderItemTable";
import { handleDownloadOrderPDF } from "../../cashier/order/pdf/pdfUtils";

const OrderDetailsDialog = ({
  open,
  onOpenChange,
  selectedOrder,
  getStatusColor,
  getPaymentIcon,
}) => {
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    if (selectedOrder) {
      await handleDownloadOrderPDF(selectedOrder, toast);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!selectedOrder) return null;

  const cashierName =
    selectedOrder.cashierName ||
    selectedOrder.cashier?.fullName ||
    selectedOrder.cashier?.name ||
    (selectedOrder.cashierId ? `Cashier #${selectedOrder.cashierId}` : "Branch Cashier");

  const customerName =
    selectedOrder.customer?.fullName ||
    selectedOrder.customer?.name ||
    "Walk-in Customer";

  const formattedDate = selectedOrder.createdAt
    ? new Date(selectedOrder.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-primary" />
              Order #{selectedOrder.id}
            </DialogTitle>
            <Badge className={getStatusColor(selectedOrder.status)} variant="secondary">
              {selectedOrder.status || "COMPLETED"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Order Summary & Customer Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Order Info
              </div>
              <div className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formattedDate}</span>
              </div>
              <div className="text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="inline-flex items-center gap-1 font-medium">
                  {getPaymentIcon(selectedOrder.paymentType)}{" "}
                  {selectedOrder.paymentType || "CASH"}
                </span>
              </div>
              <div className="text-base font-semibold text-primary pt-1">
                Total: ₹{Number(selectedOrder.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Customer Details
              </div>
              <div className="text-sm flex items-center gap-2 font-medium">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{customerName}</span>
                {!selectedOrder.customer && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-slate-100">
                    Walk-in
                  </Badge>
                )}
              </div>
              {selectedOrder.customer && (
                <>
                  {selectedOrder.customer.phone && (
                    <div className="text-xs text-muted-foreground">
                      Phone: {selectedOrder.customer.phone}
                    </div>
                  )}
                  {selectedOrder.customer.email && (
                    <div className="text-xs text-muted-foreground">
                      Email: {selectedOrder.customer.email}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Cashier Info */}
          <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-md border text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-muted-foreground">Processed by:</span>
              <span className="font-semibold">{cashierName}</span>
            </div>
            {selectedOrder.cashierId && (
              <span className="text-xs text-muted-foreground font-mono">
                Cashier ID: #{selectedOrder.cashierId}
              </span>
            )}
          </div>

          {/* Order Items */}
          <div>
            <div className="font-semibold text-sm mb-2 text-foreground">
              Order Items ({selectedOrder.items?.length || 0})
            </div>
            <div className="border rounded-md overflow-hidden">
              <OrderItemTable selectedOrder={selectedOrder} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t">
            <Button
              variant="outline"
              className="w-full sm:w-auto gap-2"
              onClick={handleDownloadPDF}
            >
              <Download className="h-4 w-4" />
              Download Invoice PDF
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto gap-2"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              Print Receipt
            </Button>
            <div className="sm:ml-auto w-full sm:w-auto">
              <DialogClose asChild>
                <Button className="w-full sm:w-auto" variant="default">
                  Close
                </Button>
              </DialogClose>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
