import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Receipt, CheckCircle2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  resetOrder,
  selectPaymentMethod,
  selectTotal,
  selectCurrentOrder,
} from "../../../Redux Toolkit/features/cart/cartSlice";
import { useToast } from "../../../components/ui/use-toast";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const ReceiptDialog = ({ showReceiptDialog, setShowReceiptDialog }) => {
  const paymentMethod = useSelector(selectPaymentMethod);
  const total = useSelector(selectTotal);
  const currentOrder = useSelector(selectCurrentOrder);

  const dispatch = useDispatch();
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrencyFormatter();

  const finishOrder = () => {
    setShowReceiptDialog(false);
    dispatch(resetOrder());

    toast({
      title: "Order Completed",
      description: "Receipt printed and transaction saved successfully.",
    });
  };

  return (
    <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader className="pb-3 border-b border-border/60">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#B8860B]" />
            Transaction Completed
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-[#262422] text-white flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6 text-[#C9A227]" />
            </div>
            <h3 className="text-sm font-bold text-foreground pt-2">Payment Settled Successfully</h3>
            <p className="text-xs text-muted-foreground">Receipt queued to thermal printer</p>
          </div>

          <div className="bg-secondary/40 p-4 rounded-2xl border border-border space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Settlement Total:</span>
              <span className="font-bold font-mono text-foreground">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tender Method:</span>
              <span className="font-bold uppercase font-mono text-foreground">
                {paymentMethod || "CASH"}
              </span>
            </div>
            {currentOrder?.loyaltyPointsEarned > 0 && (
              <div className="flex justify-between text-amber-600 dark:text-amber-400 font-semibold pt-1 border-t border-border/50">
                <span>⭐ Loyalty Points Earned:</span>
                <span className="font-bold font-mono">+{currentOrder.loyaltyPointsEarned} pts</span>
              </div>
            )}
            {currentOrder?.loyaltyPointsRedeemed > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>⭐ Loyalty Points Redeemed:</span>
                <span className="font-bold font-mono">-{currentOrder.loyaltyPointsRedeemed} pts</span>
              </div>
            )}
          </div>

        </div>

        <DialogFooter className="pt-2 border-t border-border/60">
          <Button onClick={finishOrder} className="w-full text-xs font-bold h-10">
            Start Next Customer Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptDialog;
