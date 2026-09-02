import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useSelector, useDispatch } from "react-redux";
import { createRefund } from "../../../../Redux Toolkit/features/refund/refundThunks";
import { getOrdersByBranch } from "../../../../Redux Toolkit/features/order/orderThunks";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { RotateCcw, AlertTriangle, Loader2, PackageCheck } from "lucide-react";

const returnReasons = [
  "Damaged product",
  "Wrong product",
  "Customer changed mind",
  "Product quality issue",
  "Pricing error",
  "Other",
];

const ReturnItemsSection = ({
  selectedOrder,
  setShowReceiptDialog,
  selectedItems = {},
  effectiveBranchId,
}) => {
  const { toast } = useToast();
  const { userProfile } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { format: formatCurrency } = useCurrencyFormatter();

  const [returnReason, setReturnReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedItemsList = Object.values(selectedItems);
  const totalRefundPayout = selectedItemsList.reduce(
    (sum, it) => sum + it.unitPrice * (it.returnQty || 1),
    0
  );

  const processRefund = async () => {
    if (selectedItemsList.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item to return.",
        variant: "destructive",
      });
      return;
    }

    if (!returnReason) {
      toast({
        title: "Reason Required",
        description: "Please select a statutory return reason.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const refundDTO = {
      orderId: selectedOrder.id,
      branchId: effectiveBranchId || selectedOrder?.branchId || selectedOrder?.branch?.id,
      cashierId: userProfile?.id,
      reason: returnReason === "Other" ? otherReason : returnReason,
      amount: totalRefundPayout,
      paymentType:
        refundMethod === "original"
          ? selectedOrder.paymentType || selectedOrder.paymentMode || "CASH"
          : refundMethod || "CASH",
      items: selectedItemsList.map((it) => ({
        orderItemId: it.orderItemId,
        productId: it.productId,
        quantity: it.returnQty,
        price: it.unitPrice,
      })),
    };

    try {
      await dispatch(createRefund(refundDTO)).unwrap();

      // Refresh orders in store so updated order amount and inventory are reflected everywhere
      if (effectiveBranchId) {
        dispatch(getOrdersByBranch({ branchId: effectiveBranchId }));
      }

      setShowReceiptDialog(true);
      toast({
        title: "Refund Approved & Restocked",
        description: `Successfully processed refund of ${formatCurrency(totalRefundPayout)} and restocked ${selectedItemsList.reduce((s, it) => s + it.returnQty, 0)} items.`,
      });
    } catch (error) {
      toast({
        title: "Refund Failed",
        description: error || "Failed to process refund. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-1/2 p-4 flex flex-col space-y-4 overflow-y-auto">
      <Card className="border-border shadow-2xs">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-bold text-sm border-b border-border/60 pb-3">
            <RotateCcw className="w-4 h-4 text-[#B8860B]" />
            Process Return Settlement
          </div>

          {/* Selected items summary */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Items to Return ({selectedItemsList.length})
            </label>
            {selectedItemsList.length === 0 ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Select one or more items from the left invoice table.</span>
              </div>
            ) : (
              <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-secondary/30 rounded-xl border border-border/60">
                {selectedItemsList.map((it) => (
                  <div
                    key={it.orderItemId}
                    className="flex justify-between items-center text-xs py-1 px-2 rounded-lg bg-card border border-border/50"
                  >
                    <span className="font-semibold text-foreground truncate max-w-[200px]">
                      {it.productName}
                    </span>
                    <div className="flex items-center gap-3 text-right">
                      <span className="font-mono text-muted-foreground font-bold">
                        x{it.returnQty}
                      </span>
                      <span className="font-mono font-bold text-[#B8860B]">
                        {formatCurrency(it.unitPrice * it.returnQty)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">
              Statutory Return Reason <span className="text-destructive">*</span>
            </label>
            <Select
              value={returnReason}
              onValueChange={(value) => setReturnReason(value)}
            >
              <SelectTrigger className="text-xs h-10">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {returnReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {returnReason === "Other" && (
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">
                Specify Reason Details <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Enter return justification note..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                className="text-xs resize-none"
                rows={2}
              />
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">
              Refund Tender Mode
            </label>
            <Select value={refundMethod} onValueChange={setRefundMethod}>
              <SelectTrigger className="text-xs h-10">
                <SelectValue placeholder="Select refund tender..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original">
                  Original Tender ({selectedOrder.paymentType || selectedOrder.paymentMode || "CASH"})
                </SelectItem>
                <SelectItem value="CASH">Cash Till Payout</SelectItem>
                <SelectItem value="UPI">UPI Reverse Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-3 border-t border-border/60 space-y-2">
            <div className="p-3 rounded-xl bg-[#262422] text-white flex justify-between items-center shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
                Total Refund Payout:
              </span>
              <span className="text-lg font-black font-mono text-white">
                {formatCurrency(totalRefundPayout)}
              </span>
            </div>

            <Button
              className="w-full text-xs font-bold h-10 gap-1.5 cursor-pointer"
              onClick={processRefund}
              disabled={submitting || selectedItemsList.length === 0 || selectedOrder?.status === "REFUNDED" || totalRefundPayout <= 0}
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
              {selectedOrder?.status === "REFUNDED" ? "Invoice Fully Refunded" : submitting ? "Processing Refund..." : "Authorize & Issue Refund Voucher"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnItemsSection;
