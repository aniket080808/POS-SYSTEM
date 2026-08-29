import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectNote,
  selectPaymentMethod,
  selectSelectedCustomer,
  selectSubtotal,
  selectDiscountAmount,
  selectTax,
  selectTotal,
  setCurrentOrder,
  setPaymentMethod,
} from "../../../Redux Toolkit/features/cart/cartSlice";
import { useToast } from "@/components/ui/use-toast";
import { createOrder } from "../../../Redux Toolkit/features/order/orderThunks";
import { paymentMethods as allPaymentMethods } from "./data";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { Banknote, CreditCard, QrCode, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

const QUICK_DENOMINATIONS = [100, 200, 500, 1000, 2000];

const PaymentDialog = ({
  showPaymentDialog,
  setShowPaymentDialog,
  setShowReceiptDialog,
}) => {
  const paymentMethod = useSelector(selectPaymentMethod);
  const { toast } = useToast();
  const cart = useSelector(selectCartItems);
  const { branch } = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);
  const { store } = useSelector((state) => state.store);
  const { format: formatCurrency, symbol } = useCurrencyFormatter();
  const dispatch = useDispatch();

  const [cashGiven, setCashGiven] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filter payment methods based on store settings
  const acceptedMethods = store?.acceptedPaymentMethods
    ? store.acceptedPaymentMethods.split(",").map((m) => m.trim().toUpperCase())
    : ["CASH", "CARD", "UPI"];
  const paymentMethods = allPaymentMethods.filter((m) =>
    acceptedMethods.includes(m.key)
  );

  const selectedCustomer = useSelector(selectSelectedCustomer);
  const subtotal = useSelector(selectSubtotal);
  const discountAmount = useSelector(selectDiscountAmount);
  const tax = useSelector(selectTax);
  const total = useSelector(selectTotal);
  const note = useSelector(selectNote);

  const effectiveBranchId =
    branch?.id ||
    branch?.branch?.id ||
    userProfile?.branchId ||
    userProfile?.branch?.id;

  const cashAmountNumber = parseFloat(cashGiven) || 0;
  const changeDue = Math.max(0, cashAmountNumber - total);

  const getMethodIcon = (id) => {
    switch (id?.toUpperCase()) {
      case "CASH":
        return <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case "CARD":
        return <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case "UPI":
        return <QrCode className="w-5 h-5 text-violet-600 dark:text-violet-400" />;
      default:
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
    }
  };

  const processPayment = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before processing payment",
        variant: "destructive",
      });
      return;
    }

    const effectivePaymentType = paymentMethod ? paymentMethod.toUpperCase() : "CASH";

    if (effectivePaymentType === "CASH") {
      if (!cashGiven.trim() || isNaN(cashAmountNumber) || cashAmountNumber <= 0) {
        toast({
          title: "Cash Amount Required",
          description: "Please enter the cash amount received from the customer.",
          variant: "destructive",
        });
        return;
      }
      if (cashAmountNumber < total) {
        toast({
          title: "Insufficient Cash",
          description: `Cash received (${formatCurrency(cashAmountNumber)}) is less than total amount due (${formatCurrency(total)}).`,
          variant: "destructive",
        });
        return;
      }
    }

    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    if (!acceptedMethods.includes(effectivePaymentType)) {
      toast({
        title: "Payment Method Not Available",
        description: "This payment method is not accepted by this store.",
        variant: "destructive",
      });
      return;
    }

    if (!effectiveBranchId) {
      toast({
        title: "Branch ID Missing",
        description: "Unable to resolve branch. Please ensure you are assigned to a valid branch.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        totalAmount: total,
        subtotal: subtotal,
        discount: discountAmount,
        tax: tax,
        branchId: effectiveBranchId,
        cashierId: userProfile?.id,
        customer: selectedCustomer || null,
        items: cart.map((item) => {
          const itemPrice = item.sellingPrice !== undefined ? item.sellingPrice : item.price || 0;
          return {
            productId: item.id,
            quantity: item.quantity,
            price: itemPrice,
            total: itemPrice * item.quantity,
          };
        }),
        paymentType: effectivePaymentType,
        note: note || "",
      };

      const createdOrder = await dispatch(createOrder(orderData)).unwrap();
      dispatch(setCurrentOrder(createdOrder));

      setShowPaymentDialog(false);
      setShowReceiptDialog(true);
      setCashGiven("");

      toast({
        title: "Order Processed Successfully ✨",
        description: `Order #${createdOrder.id || ""} completed. Receipt ready.`,
      });
    } catch (error) {
      console.error("Failed to create order:", error);
      toast({
        title: "Payment Processing Failed",
        description: error || "Failed to create order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentMethod = (method) => dispatch(setPaymentMethod(method));

  return (
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogContent className="sm:max-w-md p-6 rounded-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Complete Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Total Amount Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 text-center space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Amount Payable
            </p>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(total)}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Customer: <span className="font-bold text-foreground">{selectedCustomer?.fullName || selectedCustomer?.name || "Customer"}</span>
            </p>
          </div>

          {/* Payment Method Cards */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Select Payment Method
            </label>

            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => {
                const isSelected = paymentMethod === method.key;
                return (
                  <button
                    key={method.key}
                    type="button"
                    onClick={() => handlePaymentMethod(method.key)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-500/10 text-foreground shadow-sm shadow-emerald-600/15 scale-[1.02]"
                        : "border-border/70 hover:border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="mb-1.5">{getMethodIcon(method.key)}</div>
                    <span className="text-xs font-bold">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Specific Quick Calculator */}
          {paymentMethod === "CASH" && (
            <div className="space-y-2.5 p-3.5 rounded-xl bg-muted/40 border border-border/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Cash Received</span>
                {cashAmountNumber >= total && total > 0 && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Change Due: {formatCurrency(changeDue)}
                  </span>
                )}
              </div>

              <Input
                type="number"
                placeholder={`Enter cash amount (e.g. ${total})`}
                value={cashGiven}
                onChange={(e) => setCashGiven(e.target.value)}
                className="h-9 text-sm font-mono rounded-lg bg-background"
              />

              {/* Quick Cash Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setCashGiven(String(total))}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg border bg-background hover:bg-muted text-emerald-600 border-emerald-500/30"
                >
                  Exact ({formatCurrency(total)})
                </button>
                {QUICK_DENOMINATIONS.filter((d) => d >= total).slice(0, 3).map((den) => (
                  <button
                    key={den}
                    type="button"
                    onClick={() => setCashGiven(String(den))}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-lg border bg-background hover:bg-muted text-muted-foreground"
                  >
                    {symbol}{den}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            variant="outline"
            onClick={() => setShowPaymentDialog(false)}
            disabled={submitting}
            className="rounded-xl text-xs"
          >
            Cancel
          </Button>

          <Button
            onClick={processPayment}
            disabled={submitting || cart.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 gap-2 px-5"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Complete Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
