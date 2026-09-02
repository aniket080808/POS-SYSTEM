import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  clearCart,
} from "../../../Redux Toolkit/features/cart/cartSlice";
import { getAllCustomers } from "@/Redux Toolkit/features/customer/customerThunks";
import { useToast } from "@/components/ui/use-toast";
import { createOrder } from "../../../Redux Toolkit/features/order/orderThunks";
import { paymentMethods as allPaymentMethods } from "./data";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { offlineDb } from "@/utils/offlineDb";
import { playScanBeep, playErrorBeep } from "@/utils/audioUtils";
import { checkRealConnectivity } from "@/hooks/useOfflineSync";
import {
  Banknote,
  CreditCard,
  QrCode,
  ArrowRight,
  Loader2,
  Layers,
  Sparkles,
  CheckCircle2,
  Gift,
} from "lucide-react";

const QUICK_DENOMINATIONS = [100, 200, 500, 1000, 2000];

const calculateEarnedLoyaltyPoints = (amt) => {
  if (amt <= 0) return 0;
  if (amt >= 50000) return 200 + Math.floor((amt - 50000) / 250);
  if (amt >= 25000) return 100;
  if (amt >= 10000) return 75;
  if (amt >= 5000) return 50;
  if (amt >= 2000) return 25;
  if (amt >= 500) return 10;
  return Math.max(1, Math.floor(amt / 50));
};

const PaymentDialog = ({
  showPaymentDialog,
  setShowPaymentDialog,
  setShowReceiptDialog,
}) => {
  const paymentMethod = useSelector(selectPaymentMethod);
  const { toast } = useToast();
  const cart = useSelector(selectCartItems) || [];
  const { branch, branches = [] } = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);
  const { store } = useSelector((state) => state.store);
  const { format: formatCurrency, symbol } = useCurrencyFormatter();
  const dispatch = useDispatch();

  const [paymentMode, setPaymentMode] = useState("SINGLE"); // "SINGLE" | "SPLIT"
  const [cashGiven, setCashGiven] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Single mode loyalty redemption
  const [singleLoyaltyRedeemed, setSingleLoyaltyRedeemed] = useState("");

  // Split Payment states
  const [splitCash, setSplitCash] = useState("");
  const [splitUpi, setSplitUpi] = useState("");
  const [splitCard, setSplitCard] = useState("");
  const [splitLoyalty, setSplitLoyalty] = useState("");

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
    userProfile?.branch?.id ||
    store?.branches?.[0]?.id ||
    branches?.[0]?.id;

  const customerPoints = selectedCustomer?.loyaltyPoints || 0;
  const earnedPointsEstimate = selectedCustomer ? calculateEarnedLoyaltyPoints(total) : 0;

  // Single Mode calculations
  const numSingleLoyalty = Math.min(
    customerPoints,
    Math.min(total, parseFloat(singleLoyaltyRedeemed) || 0)
  );
  const payableAfterSingleLoyalty = Math.max(0, total - numSingleLoyalty);
  const cashAmountNumber = parseFloat(cashGiven) || 0;
  const singleChangeDue = Math.max(0, cashAmountNumber - payableAfterSingleLoyalty);

  // Split Calculations
  const numSplitCash = parseFloat(splitCash) || 0;
  const numSplitUpi = parseFloat(splitUpi) || 0;
  const numSplitCard = parseFloat(splitCard) || 0;
  const numSplitLoyalty = Math.min(
    customerPoints,
    Math.min(total, parseFloat(splitLoyalty) || 0)
  );

  const totalSplitTendered =
    numSplitCash + numSplitUpi + numSplitCard + numSplitLoyalty;
  const splitRemaining = Math.max(0, Math.round((total - totalSplitTendered) * 100) / 100);

  const getMethodIcon = (id) => {
    switch (id?.toUpperCase()) {
      case "CASH":
        return <Banknote className="w-5 h-5 text-[#B8860B]" />;
      case "CARD":
        return <CreditCard className="w-5 h-5 text-[#262422]" />;
      case "UPI":
        return <QrCode className="w-5 h-5 text-[#785600]" />;
      default:
        return <CreditCard className="w-5 h-5 text-[#B8860B]" />;
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

    if (!effectiveBranchId) {
      toast({
        title: "Branch Missing",
        description: "Unable to resolve branch. Please ensure you are assigned to a valid branch.",
        variant: "destructive",
      });
      return;
    }

    let finalPaymentType = paymentMethod ? paymentMethod.toUpperCase() : "CASH";
    let cashAmt = 0;
    let upiAmt = 0;
    let cardAmt = 0;
    let loyaltyAmt = 0;
    let pointsRedeemed = 0;

    if (paymentMode === "SINGLE") {
      loyaltyAmt = numSingleLoyalty;
      pointsRedeemed = Math.floor(numSingleLoyalty);

      if (finalPaymentType === "CASH") {
        if (!cashGiven.trim() || isNaN(cashAmountNumber) || cashAmountNumber <= 0) {
          toast({
            title: "Cash Amount Required",
            description: "Please enter the cash amount received from the customer.",
            variant: "destructive",
          });
          return;
        }
        if (cashAmountNumber < payableAfterSingleLoyalty) {
          toast({
            title: "Insufficient Cash Received",
            description: `Cash received (${formatCurrency(cashAmountNumber)}) is less than total due (${formatCurrency(payableAfterSingleLoyalty)}).`,
            variant: "destructive",
          });
          return;
        }
        cashAmt = payableAfterSingleLoyalty;
      } else if (finalPaymentType === "UPI") {
        upiAmt = payableAfterSingleLoyalty;
      } else if (finalPaymentType === "CARD") {
        cardAmt = payableAfterSingleLoyalty;
      }

      // If loyalty was used alongside single payment, tag as SPLIT for ledger clarity
      if (loyaltyAmt > 0) {
        finalPaymentType = "SPLIT";
      }
    } else {
      // Split Payment validation
      finalPaymentType = "SPLIT";

      const nonCashSum = numSplitUpi + numSplitCard + numSplitLoyalty;
      if (nonCashSum > total + 0.05) {
        toast({
          title: "Non-Cash Tenders Exceed Total",
          description: `Digital & Points tenders (${formatCurrency(nonCashSum)}) cannot exceed total bill (${formatCurrency(total)}).`,
          variant: "destructive",
        });
        return;
      }

      if (totalSplitTendered < total - 0.05) {
        toast({
          title: "Incomplete Payment",
          description: `Remaining balance of ${formatCurrency(splitRemaining)} must be tendered across split modes.`,
          variant: "destructive",
        });
        return;
      }

      if (numSplitLoyalty > customerPoints) {
        toast({
          title: "Excessive Loyalty Points",
          description: `Customer only has ${customerPoints} points available.`,
          variant: "destructive",
        });
        return;
      }

      cashAmt = Math.max(0, Math.round((total - nonCashSum) * 100) / 100);
      upiAmt = numSplitUpi;
      cardAmt = numSplitCard;
      loyaltyAmt = numSplitLoyalty;
      pointsRedeemed = Math.floor(numSplitLoyalty);
    }

    setSubmitting(true);
    const offlineId = `OFF-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const orderData = {
      totalAmount: total,
      subtotal: subtotal,
      discount: discountAmount + loyaltyAmt,
      tax: tax,
      branchId: effectiveBranchId,
      cashierId: userProfile?.id,
      cashierName: userProfile?.fullName || "Cashier",
      customer: selectedCustomer || null,
      items: cart.map((item) => {
        const itemPrice = item.sellingPrice !== undefined ? item.sellingPrice : item.price || 0;
        return {
          productId: item.id || item.productId,
          name: item.name || item.product?.name,
          quantity: item.quantity,
          price: itemPrice,
          total: itemPrice * item.quantity,
        };
      }),
      paymentType: finalPaymentType,
      offlineId: offlineId,
      isOfflineSynced: false,
      cashAmount: cashAmt,
      upiAmount: upiAmt,
      cardAmount: cardAmt,
      loyaltyAmount: loyaltyAmt,
      storeCreditAmount: 0.0,
      loyaltyPointsRedeemed: pointsRedeemed,
      note: note || "",
    };

    try {
      const isOnline = await checkRealConnectivity();

      if (!isOnline) {
        // Offline Order Placement
        await offlineDb.queueOfflineOrder(orderData);
        dispatch(setCurrentOrder({ ...orderData, id: offlineId, isOffline: true }));
        dispatch(clearCart());
        setShowPaymentDialog(false);
        setShowReceiptDialog(true);
        playScanBeep();
        toast({
          title: "Offline Order Placed! 🔴",
          description: "Bill saved locally in offline queue. Will auto-sync when connection is restored.",
        });
      } else {
        // Online Order Placement
        const createdOrder = await dispatch(createOrder(orderData)).unwrap();
        dispatch(setCurrentOrder(createdOrder));
        dispatch(clearCart());
        dispatch(getAllCustomers()); // Refresh customer CRM immediately with updated loyalty points
        setShowPaymentDialog(false);
        setShowReceiptDialog(true);
        playScanBeep();
        toast({
          title: "Order Settled! 🚀",
          description: `Order #${createdOrder.id || ""} settled. Earned +${createdOrder.loyaltyPointsEarned || earnedPointsEstimate} Points!`,
        });
      }

      setCashGiven("");
      setSingleLoyaltyRedeemed("");
      setSplitCash("");
      setSplitUpi("");
      setSplitCard("");
      setSplitLoyalty("");
    } catch (error) {
      console.error("Failed to create order:", error);
      const isNetworkError =
        !error?.response ||
        error?.code === "ERR_NETWORK" ||
        (typeof error === "string" && error.toLowerCase().includes("network")) ||
        (error?.message && error.message.toLowerCase().includes("network"));

      if (isNetworkError) {
        await offlineDb.queueOfflineOrder(orderData);
        dispatch(setCurrentOrder({ ...orderData, id: offlineId, isOffline: true }));
        dispatch(clearCart());
        setShowPaymentDialog(false);
        setShowReceiptDialog(true);
        playScanBeep();
        toast({
          title: "Network Dropped - Saved Offline! 🔴",
          description: "Bill saved locally in offline queue. Will auto-sync when connection is restored.",
        });
        return;
      }

      playErrorBeep();
      const errMsg = typeof error === "string" ? error : error?.message || "Failed to create order. Please try again.";
      toast({
        title: "Payment Processing Failed",
        description: errMsg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentMethod = (method) => dispatch(setPaymentMethod(method));

  return (
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogContent className="sm:max-w-lg p-6 rounded-3xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-border/60">
          <DialogTitle className="text-base font-bold tracking-tight text-foreground flex items-center justify-between">
            <span>Order Payment Settlement</span>
            <span className="text-xs font-mono text-primary font-bold">
              {formatCurrency(total)}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Amount Due Card */}
          <div className="p-4 rounded-2xl bg-[#262422] text-white flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A227]">
                Total Amount Due
              </span>
              <div className="text-2xl font-black font-mono tracking-tight text-white mt-0.5">
                {formatCurrency(total)}
              </div>
            </div>
            {selectedCustomer && (
              <div className="text-right">
                <span className="text-[10px] text-[#A8A29E] block">Billed Customer</span>
                <span className="text-xs font-bold text-white block truncate max-w-[150px]">
                  {selectedCustomer.fullName || selectedCustomer.name}
                </span>
                <div className="flex items-center justify-end gap-1.5 mt-0.5 text-[10px] text-amber-300 font-semibold">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{customerPoints} Points (₹{customerPoints}.00)</span>
                </div>
              </div>
            )}
          </div>

          {/* Points Reward Banner */}
          {selectedCustomer && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-600 dark:text-amber-400">
              <span className="flex items-center gap-1.5 font-semibold text-xs">
                <Gift className="w-4 h-4 text-amber-500" />
                Customer will earn on this invoice:
              </span>
              <span className="font-bold font-mono text-xs bg-amber-500/20 px-2 py-0.5 rounded-md">
                +{earnedPointsEstimate} Points
              </span>
            </div>
          )}

          {/* Payment Mode Selector Tabs */}
          <Tabs value={paymentMode} onValueChange={setPaymentMode} className="w-full">
            <TabsList className="grid grid-cols-2 w-full h-10 p-1 bg-secondary/70 rounded-xl">
              <TabsTrigger
                value="SINGLE"
                className="text-xs font-bold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs"
              >
                Single Payment
              </TabsTrigger>
              <TabsTrigger
                value="SPLIT"
                className="text-xs font-bold rounded-lg gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-xs"
              >
                <Layers className="w-3.5 h-3.5 text-primary" />
                Split / Multi-Tender
              </TabsTrigger>
            </TabsList>

            {/* SINGLE PAYMENT TAB */}
            <TabsContent value="SINGLE" className="space-y-4 pt-3">
              {/* Optional Loyalty Points Discount in Single Mode */}
              {selectedCustomer && customerPoints > 0 && (
                <div className="p-3 rounded-2xl bg-secondary/40 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Redeem Loyalty Points Discount (1 Pt = ₹1)
                    </label>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Available: {customerPoints} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder={`Enter pts (Max: ${customerPoints})`}
                      value={singleLoyaltyRedeemed}
                      onChange={(e) => setSingleLoyaltyRedeemed(e.target.value)}
                      className="h-8 text-xs font-mono font-bold bg-background"
                      max={customerPoints}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSingleLoyaltyRedeemed(String(Math.min(customerPoints, Math.floor(total))))}
                      className="h-8 text-xs px-2.5 font-bold border-[#C9A227] text-[#785600] bg-[#FDF6E2] hover:bg-[#FCEBC2] cursor-pointer shrink-0"
                    >
                      Use Max
                    </Button>
                  </div>
                  {numSingleLoyalty > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5">
                      <span>Loyalty Discount: -{formatCurrency(numSingleLoyalty)}</span>
                      <span>Net Payable: {formatCurrency(payableAfterSingleLoyalty)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Method Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Select Tender Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => {
                    const isSelected = paymentMethod === method.key;
                    return (
                      <button
                        key={method.key}
                        type="button"
                        onClick={() => handlePaymentMethod(method.key)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? "bg-[#262422] border-[#262422] text-white shadow-xs"
                            : "bg-secondary/40 border-border text-foreground hover:bg-secondary"
                        }`}
                      >
                        <div className="mb-1">{getMethodIcon(method.key)}</div>
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {method.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash Tender Calculation */}
              {paymentMethod === "CASH" && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-secondary/30 border border-border">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Cash Received ({symbol})
                    </label>
                    <Input
                      type="number"
                      placeholder={`Enter cash (minimum ${formatCurrency(payableAfterSingleLoyalty)})`}
                      value={cashGiven}
                      onChange={(e) => setCashGiven(e.target.value)}
                      className="h-10 text-sm font-mono font-bold rounded-xl bg-background border-border"
                      autoFocus
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      Quick Cash Chips
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCashGiven(String(payableAfterSingleLoyalty))}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-[#C9A227] bg-[#FDF6E2] text-[#785600] cursor-pointer"
                      >
                        Exact ({formatCurrency(payableAfterSingleLoyalty)})
                      </button>
                      {QUICK_DENOMINATIONS.map((denom) => (
                        <button
                          key={denom}
                          type="button"
                          onClick={() => setCashGiven(String(denom))}
                          className="px-2 py-1 text-xs font-mono font-semibold rounded-lg border border-border bg-background hover:bg-secondary text-foreground cursor-pointer"
                        >
                          {symbol}{denom}
                        </button>
                      ))}
                    </div>
                  </div>

                  {cashAmountNumber > 0 && (
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        cashAmountNumber >= payableAfterSingleLoyalty
                          ? "bg-[#262422] border-[#262422] text-white"
                          : "bg-destructive/10 border-destructive/30 text-destructive"
                      }`}
                    >
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {cashAmountNumber >= payableAfterSingleLoyalty ? "Change Due:" : "Shortage:"}
                      </span>
                      <span className="text-lg font-black font-mono">
                        {cashAmountNumber >= payableAfterSingleLoyalty
                          ? formatCurrency(singleChangeDue)
                          : `- ${formatCurrency(payableAfterSingleLoyalty - cashAmountNumber)}`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === "UPI" && (
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border text-center space-y-2">
                  <QrCode className="w-10 h-10 mx-auto text-[#B8860B]" />
                  <p className="text-xs font-bold text-foreground">Scan Dynamic QR Code</p>
                  <p className="text-[11px] text-muted-foreground">
                    Customer scans terminal QR code for {formatCurrency(payableAfterSingleLoyalty)}.
                  </p>
                </div>
              )}

              {paymentMethod === "CARD" && (
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border text-center space-y-2">
                  <CreditCard className="w-10 h-10 mx-auto text-foreground" />
                  <p className="text-xs font-bold text-foreground">Swipe / Tap Card on Terminal</p>
                  <p className="text-[11px] text-muted-foreground">
                    Process {formatCurrency(payableAfterSingleLoyalty)} on external EDC card machine.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* SPLIT PAYMENT TAB */}
            <TabsContent value="SPLIT" className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-2.5">
                {/* Cash Split */}
                <div className="space-y-1 p-2.5 rounded-xl bg-secondary/30 border border-border">
                  <label className="text-[11px] font-bold flex items-center gap-1 text-foreground">
                    <Banknote className="w-3.5 h-3.5 text-amber-500" /> 💵 Cash ({symbol})
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={splitCash}
                    onChange={(e) => setSplitCash(e.target.value)}
                    className="h-8 text-xs font-mono font-bold bg-background"
                  />
                </div>

                {/* UPI Split */}
                <div className="space-y-1 p-2.5 rounded-xl bg-secondary/30 border border-border">
                  <label className="text-[11px] font-bold flex items-center gap-1 text-foreground">
                    <QrCode className="w-3.5 h-3.5 text-amber-600" /> 📱 UPI ({symbol})
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={splitUpi}
                    onChange={(e) => setSplitUpi(e.target.value)}
                    className="h-8 text-xs font-mono font-bold bg-background"
                  />
                </div>

                {/* Card Split */}
                <div className="space-y-1 p-2.5 rounded-xl bg-secondary/30 border border-border">
                  <label className="text-[11px] font-bold flex items-center gap-1 text-foreground">
                    <CreditCard className="w-3.5 h-3.5 text-blue-500" /> 💳 Card ({symbol})
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={splitCard}
                    onChange={(e) => setSplitCard(e.target.value)}
                    className="h-8 text-xs font-mono font-bold bg-background"
                  />
                </div>

                {/* Loyalty Points Split */}
                <div className="space-y-1 p-2.5 rounded-xl bg-secondary/30 border border-border">
                  <label className="text-[11px] font-bold flex items-center justify-between text-foreground">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> ⭐ Redeem Points (1 Pt = ₹1)
                    </span>
                    <span className="text-[9px] text-muted-foreground font-mono">
                      Max: {customerPoints}
                    </span>
                  </label>
                  <Input
                    type="number"
                    placeholder="0 pts"
                    value={splitLoyalty}
                    onChange={(e) => setSplitLoyalty(e.target.value)}
                    className="h-8 text-xs font-mono font-bold bg-background"
                    disabled={!selectedCustomer || customerPoints <= 0}
                    max={customerPoints}
                  />
                </div>
              </div>

              {/* Split Summary Status Bar */}
              <div
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  Math.abs(totalSplitTendered - total) < 0.05 || (totalSplitTendered >= total && numSplitCash > 0)
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  {Math.abs(totalSplitTendered - total) < 0.05 ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs font-bold">Exact Total Reached ✨</span>
                    </>
                  ) : totalSplitTendered >= total && numSplitCash > 0 ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs font-bold">
                        Tendered (Change Due: {formatCurrency(totalSplitTendered - total)})
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                      <span className="text-xs font-bold">
                        Remaining: {formatCurrency(splitRemaining)}
                      </span>
                    </>
                  )}
                </div>
                <span className="text-sm font-mono font-black">
                  Tendered: {formatCurrency(totalSplitTendered)}
                </span>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="gap-2 pt-3 border-t border-border/60">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPaymentDialog(false)}
            disabled={submitting}
            className="text-xs h-10"
          >
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={processPayment}
            disabled={
              submitting ||
              cart.length === 0 ||
              (paymentMode === "SINGLE" && paymentMethod === "CASH" && cashAmountNumber < payableAfterSingleLoyalty) ||
              (paymentMode === "SPLIT" && totalSplitTendered < total - 0.05)
            }
            className="text-xs font-bold h-10 gap-1.5"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
            {submitting ? "Settling..." : "Confirm & Print Receipt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
