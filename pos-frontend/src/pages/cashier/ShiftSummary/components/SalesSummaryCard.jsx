import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { TrendingUp } from "lucide-react";

const SalesSummaryCard = ({ shiftData }) => {
  const { format: formatCurrency } = useCurrencyFormatter();

  return (
    <Card className="border-border shadow-2xs">
      <CardContent className="p-5 space-y-3">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/60 pb-2.5">
          <TrendingUp className="w-3.5 h-3.5 text-[#B8860B]" />
          Shift Sales Breakdown
        </h2>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Invoices Settled:</span>
            <span className="font-bold font-mono text-foreground">{shiftData.totalOrders || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gross Sales Revenue:</span>
            <span className="font-bold font-mono text-foreground">{formatCurrency(shiftData.totalSales || 0)}</span>
          </div>
          <div className="flex justify-between text-destructive">
            <span>Total Refunds Disbursed:</span>
            <span className="font-mono font-bold">- {formatCurrency(shiftData.totalRefunds || 0)}</span>
          </div>
          <div className="flex justify-between font-black text-sm pt-2 border-t border-border/60 text-foreground">
            <span>Net Shift Revenue:</span>
            <span className="font-mono">{formatCurrency(shiftData.netSales || 0)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesSummaryCard;