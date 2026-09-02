import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Printer, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import OrderItemTable from "../../common/Order/OrderItemTable";
import { handleDownloadOrderPDF } from "../../cashier/order/pdf/pdfUtils";
import { formatDateTime } from "@/utils/formateDate";

const OrderDetailsDialog = ({
  open,
  onOpenChange,
  selectedOrder,
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

  const cashierName =
    selectedOrder?.cashierName ||
    selectedOrder?.cashier?.fullName ||
    selectedOrder?.cashier?.name ||
    (selectedOrder?.cashierId ? `Cashier #${selectedOrder.cashierId}` : "Branch Cashier");

  const customerName =
    selectedOrder?.customer?.fullName ||
    selectedOrder?.customer?.name ||
    "Walk-in Customer";

  const formattedDate = selectedOrder?.createdAt
    ? formatDateTime(selectedOrder.createdAt)
    : "-";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto bg-card border-border p-6 shadow-2xl">
        {!selectedOrder ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-semibold">Loading invoice details...</p>
          </div>
        ) : (
          <>
            <DialogHeader className="pb-4 border-b border-border/60 pr-10">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                    Invoice Order #{selectedOrder.id}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Order checkout details and line items breakdown
                  </p>
                </div>
                <Badge
                  variant={selectedOrder.status === "COMPLETED" ? "active" : "warning"}
                  className="text-xs font-bold px-3 py-1 mr-2"
                >
                  {selectedOrder.status || "COMPLETED"}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-5 py-4">
              {/* Metadata Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Customer</span>
                  <span className="text-xs font-bold text-foreground mt-1 block truncate" title={customerName}>{customerName}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Cashier</span>
                  <span className="text-xs font-bold text-foreground mt-1 block truncate" title={cashierName}>{cashierName}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Payment Mode</span>
                  <span className="text-xs font-bold font-mono text-foreground mt-1 block">{selectedOrder.paymentType || "CASH"}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Date & Time</span>
                  <span className="text-xs font-mono text-muted-foreground mt-1 block truncate" title={formattedDate}>{formattedDate}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-border/70 rounded-2xl overflow-hidden shadow-2xs">
                <OrderItemTable selectedOrder={selectedOrder} items={selectedOrder.items || []} />
              </div>

              {/* Totals Summary */}
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Settlement:</span>
                  <span className="text-2xl font-black font-mono text-foreground">
                    ₹{Number(selectedOrder.totalAmount || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="text-xs h-9 gap-1.5 font-semibold"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Receipt
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownloadPDF}
                    className="text-xs font-bold h-9 gap-1.5 bg-[#F5A623] text-[#262422] hover:bg-[#E09214]"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Tax PDF
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
