import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import {
  holdOrder,
  selectCartItems,
  selectSelectedCustomer,
  selectTotal,
} from "../../../Redux Toolkit/features/cart/cartSlice";
import { Button } from "@/components/ui/button";
import { CreditCard, Pause, Sparkles, CheckCircle2 } from "lucide-react";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const PaymentSection = ({ setShowPaymentDialog }) => {
  const cartItems = useSelector(selectCartItems);
  const selectedCustomer = useSelector(selectSelectedCustomer);
  const total = useSelector(selectTotal);
  const { format: formatCurrency } = useCurrencyFormatter();
  const { toast } = useToast();
  const dispatch = useDispatch();

  const handlePayment = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before proceeding to payment",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCustomer) {
      toast({
        title: "Customer Required",
        description: "Please select or create a customer before proceeding to payment",
        variant: "destructive",
      });
      return;
    }

    setShowPaymentDialog(true);
  };

  const handleHoldOrder = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "No items in cart to hold",
        variant: "destructive",
      });
      return;
    }

    dispatch(holdOrder());
    toast({
      title: "Order Placed On Hold ⏸️",
      description: "You can resume this order anytime from the Held orders menu.",
    });
  };

  return (
    <div className="p-4 bg-muted/40 border-t border-border/80 space-y-3">
      {/* Total Amount Hero Display */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 text-center space-y-0.5 shadow-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Total Due
        </span>
        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
          {formatCurrency(total)}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          className="w-full py-5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01] gap-2 cursor-pointer"
          onClick={handlePayment}
          disabled={cartItems.length === 0}
        >
          <CreditCard className="w-4 h-4" />
          Process Payment
          <span className="text-[10px] font-mono font-normal opacity-80 pl-1">(Ctrl+Enter)</span>
        </Button>

        <Button
          variant="outline"
          className="w-full text-xs font-semibold h-9 rounded-xl border-border hover:bg-muted text-muted-foreground hover:text-foreground gap-2 cursor-pointer"
          onClick={handleHoldOrder}
          disabled={cartItems.length === 0}
        >
          <Pause className="w-3.5 h-3.5 text-amber-500" />
          Hold Order
        </Button>
      </div>
    </div>
  );
};

export default PaymentSection;
