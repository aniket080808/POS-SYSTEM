import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Printer, ReceiptText } from "lucide-react";
import { formatDateTime } from "../../../utils/formateDate";

const RefundDetailsDialog = ({ open, onOpenChange, refund }) => {
  if (!refund) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#B8860B]" />
              Refund Slip #{refund.id}
            </DialogTitle>
            <Badge variant="error" className="text-[10px] font-bold">
              PROCESSED RETURN
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-secondary/30 border border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Linked Invoice</span>
              <span className="text-xs font-mono font-bold text-foreground mt-0.5 block">#{refund.orderId}</span>
            </div>
            <div className="p-3 rounded-2xl bg-secondary/30 border border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Cashier</span>
              <span className="text-xs font-bold text-foreground mt-0.5 block truncate">{refund.cashierName || "Staff"}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-secondary/30 border border-border/60 space-y-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Customer Name</span>
              <span className="text-xs font-medium text-foreground block">{refund.customerName || "Walk-in Guest"}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Return Reason</span>
              <span className="text-xs text-foreground block leading-relaxed">{refund.reason || "Customer Return"}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Timestamp</span>
              <span className="text-xs font-mono text-muted-foreground block">
                {refund.createdAt ? formatDateTime(refund.createdAt) : "—"}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FBF0EC] border border-[#EFC8BD] flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A331E] uppercase tracking-wider">Refund Amount Disbursed</span>
            <span className="text-xl font-black font-mono text-destructive">
              -₹{Number(refund.amount || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs h-9 gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print Refund Slip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RefundDetailsDialog;
