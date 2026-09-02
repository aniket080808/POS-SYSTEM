import React from "react";
import { Separator } from "@/components/ui/separator";
import { useSelector } from "react-redux";
import {
  selectDiscountAmount,
  selectSubtotal,
  selectTax,
  selectTaxRate,
  selectTotal,
} from "../../../Redux Toolkit/features/cart/cartSlice";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { Receipt } from "lucide-react";

const CartSummary = () => {
  const subtotal = useSelector(selectSubtotal);
  const tax = useSelector(selectTax);
  const taxRate = useSelector(selectTaxRate);
  const discountAmount = useSelector(selectDiscountAmount);
  const total = useSelector(selectTotal);
  const { format: formatCurrency } = useCurrencyFormatter();

  return (
    <div className="border-t border-border bg-card p-3.5 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
        <Receipt className="w-3.5 h-3.5 text-[#B8860B]" />
        Summary Breakdown
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-mono font-medium text-foreground">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span>Tax ({taxRate}% GST)</span>
          <span className="font-mono font-medium text-foreground">{formatCurrency(tax)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-destructive font-medium">
            <span>Discount Applied</span>
            <span className="font-mono">- {formatCurrency(discountAmount)}</span>
          </div>
        )}

        <Separator className="my-1.5 bg-border" />

        <div className="flex justify-between items-center pt-0.5">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">Total Payable</span>
          <span className="text-lg font-black text-foreground font-mono">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
