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
import { CreditCard, Pause } from "lucide-react";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const PaymentSection = ({ setShowPaymentDialog }) => {
  const cartItems = useSelector(selectCartItems) || [];
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
    <div className="p-3.5 bg-card border-t border-border space-y-2.5">
      {/* Total Amount Display */}
      <div className="p-3 rounded-2xl bg-[#262422] text-white text-center space-y-0.5 shadow-2xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A227]">
          Gross Total Payable
        </span>
        <div className="text-2xl font-black text-white font-mono tracking-tight">
          {formatCurrency(total)}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          className="w-full py-5 text-xs font-bold bg-[#C9A227] hover:bg-[#B08B1B] text-[#262422] rounded-xl shadow-xs transition-transform active:scale-98 gap-2 cursor-pointer"
          onClick={handlePayment}
          disabled={cartItems.length === 0}
        >
          <CreditCard className="w-4 h-4" />
          Process Tender Settlement
          <span className="text-[10px] font-mono font-normal opacity-80 pl-1">(Ctrl+Enter)</span>
        </Button>

        <Button
          variant="outline"
          className="w-full text-xs font-semibold h-9 rounded-xl border-border hover:bg-secondary text-muted-foreground hover:text-foreground gap-2 cursor-pointer"
          onClick={handleHoldOrder}
          disabled={cartItems.length === 0}
        >
          <Pause className="w-3.5 h-3.5 text-[#B8860B]" />
          Hold Invoice
        </Button>
      </div>
    </div>
  );
};

export default PaymentSection;
