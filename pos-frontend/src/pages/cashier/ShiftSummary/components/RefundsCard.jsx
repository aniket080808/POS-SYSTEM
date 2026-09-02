import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RotateCcw, CheckCircle2 } from "lucide-react";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const RefundsCard = ({ shiftData }) => {
  const { format: formatCurrency } = useCurrencyFormatter();

  return (
    <Card className="border-border shadow-2xs">
      <CardContent className="p-5 space-y-3">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/60 pb-2.5">
          <RotateCcw className="w-3.5 h-3.5 text-[#B8860B]" />
          Shift Refunds Disbursed
        </h2>
        {shiftData.refunds?.length > 0 ? (
          <div className="rounded-xl border border-border/80 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40 border-b border-border/80">
                  <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3">Refund ID</TableHead>
                  <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3">Order ID</TableHead>
                  <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3">Reason</TableHead>
                  <TableHead className="text-right text-sm font-bold text-foreground uppercase tracking-wider py-3">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shiftData.refunds.map((refund) => (
                  <TableRow key={refund.id} className="border-b border-border/60">
                    <TableCell className="font-mono text-xs font-bold text-foreground py-2.5">
                      RFD-{refund.id}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground py-2.5">
                      ORD-{refund.orderId}
                    </TableCell>
                    <TableCell className="text-xs py-2.5">{refund.reason}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-destructive py-2.5">
                      - {formatCurrency(refund.amount || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground space-y-1">
            <CheckCircle2 size={32} className="text-muted-foreground/60" />
            <p className="text-xs font-bold text-foreground">Zero Shift Refunds</p>
            <p className="text-[11px] text-muted-foreground">No reversal vouchers disbursed during this session</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RefundsCard;