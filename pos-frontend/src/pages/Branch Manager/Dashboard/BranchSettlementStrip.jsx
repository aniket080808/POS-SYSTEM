import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Banknote,
  QrCode,
  CreditCard,
  Users,
  Receipt,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

export default function BranchSettlementStrip() {
  const navigate = useNavigate();
  const { format: formatCurrency } = useCurrencyFormatter();
  const { paymentBreakdown = [], todayOverview } = useSelector(
    (state) => state.branchAnalytics
  );
  const { employees = [] } = useSelector((state) => state.employee);

  // Group payment methods
  const summary = useMemo(() => {
    let cash = { amount: 0, count: 0 };
    let upi = { amount: 0, count: 0 };
    let card = { amount: 0, count: 0 };
    let other = { amount: 0, count: 0 };

    (paymentBreakdown || []).forEach((item) => {
      const method = (item.paymentMethod || item.method || "").toUpperCase();
      const amount = item.totalAmount || 0;
      const count = item.transactionCount || 0;

      if (method.includes("CASH")) {
        cash.amount += amount;
        cash.count += count;
      } else if (method.includes("UPI")) {
        upi.amount += amount;
        upi.count += count;
      } else if (method.includes("CARD")) {
        card.amount += amount;
        card.count += count;
      } else {
        other.amount += amount;
        other.count += count;
      }
    });

    const activeCashiersCount = employees.filter(
      (e) => e.role === "ROLE_BRANCH_CASHIER" && e.enabled !== false
    ).length;

    return { cash, upi, card, other, activeCashiersCount };
  }, [paymentBreakdown, employees]);

  return (
    <Card className="border-border/80 bg-gradient-to-r from-card via-secondary/20 to-card shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#8C5800]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  Counter Settlement & Drawer Reconciliation
                </h3>
                <Badge variant="active" className="text-[10px] font-mono">
                  LIVE SHIFT
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Today's tender collection breakdown across active checkout terminals
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/branch/transactions")}
            className="h-8 text-xs font-semibold gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>View Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Breakdown Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-1">
          {/* Cash Drawer */}
          <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Cash in Drawer
              </span>
              <div className="p-1 rounded-md bg-amber-500/10 text-[#8C5800]">
                <Banknote className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-foreground">
              {formatCurrency(summary.cash.amount)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {summary.cash.count} cash bills settled
            </div>
          </div>

          {/* UPI / QR */}
          <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                UPI / QR Digital
              </span>
              <div className="p-1 rounded-md bg-blue-500/10 text-blue-600">
                <QrCode className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-foreground">
              {formatCurrency(summary.upi.amount)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {summary.upi.count} instant transfers
            </div>
          </div>

          {/* Card Machine */}
          <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Card Swipes / POS
              </span>
              <div className="p-1 rounded-md bg-purple-500/10 text-purple-600">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-foreground">
              {formatCurrency(summary.card.amount)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {summary.card.count} terminal card slips
            </div>
          </div>

          {/* Active Cashiers */}
          <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Staff on Shift
              </span>
              <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-foreground">
              {summary.activeCashiersCount || 1} Counters
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {todayOverview?.ordersToday || 0} total branch receipts
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
