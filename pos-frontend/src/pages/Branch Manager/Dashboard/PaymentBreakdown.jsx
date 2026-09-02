import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, CreditCard, Banknote, QrCode } from "lucide-react";
import { getPaymentBreakdown } from "@/Redux Toolkit/features/branchAnalytics/branchAnalyticsThunks";
import { getLocalDateString } from "@/utils/formateDate";

const PaymentBreakdown = () => {
  const dispatch = useDispatch();
  const { branch } = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);
  const branchId = branch?.id || userProfile?.branchId || userProfile?.branch?.id;
  const { paymentBreakdown, loading } = useSelector((state) => state.branchAnalytics);
  const [range, setRange] = useState("today");

  useEffect(() => {
    if (branchId) {
      if (range === "today") {
        const today = getLocalDateString();
        dispatch(getPaymentBreakdown({ branchId, date: today }));
      } else {
        dispatch(getPaymentBreakdown({ branchId, date: null }));
      }
    }
  }, [branchId, range, dispatch]);

  const totalAmount = paymentBreakdown?.reduce((sum, item) => sum + (item.totalAmount || 0), 0) || 0;
  const totalTxns = paymentBreakdown?.reduce((sum, item) => sum + (item.transactionCount || 0), 0) || 0;

  const getMethodIcon = (method) => {
    const m = (method || "").toUpperCase();
    if (m.includes("CASH")) return <Banknote className="w-4 h-4 text-[#F5A623]" />;
    if (m.includes("UPI")) return <QrCode className="w-4 h-4 text-[#F5A623]" />;
    return <CreditCard className="w-4 h-4 text-[#F5A623]" />;
  };

  return (
    <Card className="border-border shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#F5A623]" />
            Payment Methods
          </CardTitle>
          <CardDescription className="text-xs">
            {totalTxns > 0
              ? `${totalTxns} transactions (₹${totalAmount.toLocaleString("en-IN")})`
              : "Total sales by payment method"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-xl border border-border/60">
          <Button
            variant={range === "today" ? "default" : "ghost"}
            size="sm"
            className="h-7 text-xs px-2.5 rounded-lg font-semibold"
            onClick={() => setRange("today")}
          >
            Today
          </Button>
          <Button
            variant={range === "all" ? "default" : "ghost"}
            size="sm"
            className="h-7 text-xs px-2.5 rounded-lg font-semibold"
            onClick={() => setRange("all")}
          >
            All-Time
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {loading && (!paymentBreakdown || paymentBreakdown.length === 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : !paymentBreakdown || paymentBreakdown.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground font-semibold">
            No payments recorded for this period.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {paymentBreakdown.map((item, idx) => {
              const method = item.type || item.paymentMethod || "CASH";
              return (
                <div
                  key={method || idx}
                  className="p-4 rounded-2xl bg-secondary/30 border border-border/60 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getMethodIcon(method)}
                      <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                        {method}
                      </span>
                    </div>
                    <div className="text-lg font-black font-mono text-foreground">
                      ₹{(item.totalAmount || 0).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-muted-foreground block">
                      {item.transactionCount || 0} orders
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#8C5800] block">
                      {item.percentage || 0}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentBreakdown;