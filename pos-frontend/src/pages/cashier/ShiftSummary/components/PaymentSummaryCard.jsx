import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getPaymentIcon } from "../../../../utils/getPaymentIcon";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { CreditCard } from "lucide-react";

const PaymentSummaryCard = ({ shiftData }) => {
  const { format: formatCurrency } = useCurrencyFormatter();

  return (
    <Card className="border-border shadow-2xs">
      <CardContent className="p-5 space-y-3">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/60 pb-2.5">
          <CreditCard className="w-3.5 h-3.5 text-[#B8860B]" />
          Tender Collections
        </h2>
        <div className="space-y-3">
          {shiftData.paymentSummaries?.map((payment) => (
            <div key={payment.type} className="flex items-center p-2 rounded-xl bg-secondary/30 border border-border/60">
              <div className="w-8 h-8 rounded-lg bg-[#262422] text-white flex items-center justify-center mr-3 text-xs shrink-0">
                {getPaymentIcon(payment.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <span className="font-bold text-xs uppercase text-foreground">{payment.type}</span>
                  <span className="font-bold font-mono text-xs text-foreground">{formatCurrency(payment.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                  <span>{payment.transactionCount} txns</span>
                  <span>
                    {shiftData.totalSales > 0
                      ? ((payment.totalAmount / shiftData.totalSales) * 100).toFixed(1)
                      : payment.percentage
                      ? Number(payment.percentage).toFixed(1)
                      : "0.0"}
                    %
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSummaryCard;