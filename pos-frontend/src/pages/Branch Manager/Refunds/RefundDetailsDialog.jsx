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
import {
  RotateCcw,
  Calendar,
  User,
  ShieldCheck,
  Receipt,
  Printer,
  FileText,
} from "lucide-react";

const RefundDetailsDialog = ({ open, onOpenChange, refund }) => {
  if (!refund) return null;

  const formattedDate = refund.createdAt
    ? new Date(refund.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <RotateCcw className="h-5 w-5 text-rose-500" />
              Refund #{refund.id}
            </DialogTitle>
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 border-purple-200 font-semibold"
            >
              REFUNDED
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Refund Amount Banner */}
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-center">
            <div className="text-xs uppercase tracking-wider text-rose-700 font-semibold">
              Refund Amount
            </div>
            <div className="text-3xl font-bold text-rose-600 mt-1">
              ₹{Number(refund.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-rose-700/80 mt-1">
              Original Order #{refund.orderId}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-muted/30 rounded-lg border space-y-1.5">
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Date & Time
              </div>
              <div className="font-medium text-foreground">{formattedDate}</div>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg border space-y-1.5">
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Processed By
              </div>
              <div className="font-medium text-foreground">
                {refund.cashierName || "Branch Cashier"}
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg border space-y-1.5 sm:col-span-2">
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Customer
              </div>
              <div className="font-medium text-foreground flex items-center gap-2">
                <span>{refund.customerName || "Walk-in Customer"}</span>
                {!refund.customerName && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-slate-100">
                    Walk-in
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Reason Section */}
          <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-lg space-y-1">
            <div className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Refund Reason
            </div>
            <div className="text-sm text-foreground">
              {refund.reason || "No reason specified"}
            </div>
          </div>

          {/* Dialog Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-3 border-t">
            <Button
              variant="outline"
              className="w-full sm:w-auto gap-2"
              onClick={handlePrintReceipt}
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

export default RefundDetailsDialog;
