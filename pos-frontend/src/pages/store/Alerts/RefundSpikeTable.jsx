import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BellOff, Loader2 } from "lucide-react";
import { dismissAlert } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { Badge } from "@/components/ui/badge";

const RefundSpikeTable = () => {
  const dispatch = useDispatch();
  const { format: formatCurrency } = useCurrencyFormatter();
  const { storeAlerts, loading } = useSelector((state) => state.storeAnalytics || {});
  const user = useSelector((state) => state.user?.userProfile);

  const handleDismiss = (refundId) => {
    if (user?.id) {
      dispatch(dismissAlert({
        storeAdminId: user.id,
        alertType: 'REFUND_SPIKE',
        referenceId: refundId
      }));
    }
  };

  const refunds = storeAlerts?.refundSpikeAlerts || [];

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/60">
            <TableHead className="text-xs font-bold text-foreground py-3 pl-6">Cashier / Staff</TableHead>
            <TableHead className="text-xs font-bold text-foreground py-3">Refund Amount</TableHead>
            <TableHead className="text-xs font-bold text-foreground py-3">Customer Note</TableHead>
            <TableHead className="text-xs font-bold text-foreground py-3">Anomaly Flag</TableHead>
            <TableHead className="text-xs font-bold text-foreground py-3 pr-6 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin inline-block mr-2 text-primary" />
                Auditing refund transaction velocity...
              </TableCell>
            </TableRow>
          ) : refunds.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-xs">
                No void anomalies or refund spikes detected in recent shifts.
              </TableCell>
            </TableRow>
          ) : (
            refunds.map((refund) => (
              <TableRow key={refund.id} className="hover:bg-muted/30 transition-colors border-b border-border/40">
                <TableCell className="pl-6 py-3">
                  <div>
                    <div className="font-bold text-xs text-foreground">{refund.cashierName || 'Cashier Terminal'}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">Invoice #{refund.id}</div>
                  </div>
                </TableCell>
                <TableCell className="py-3 font-mono font-bold text-xs text-destructive">
                  {formatCurrency(refund.amount || 0)}
                </TableCell>
                <TableCell className="py-3">
                  <p className="text-xs text-muted-foreground truncate max-w-[140px]">{refund.reason || 'No comment provided'}</p>
                </TableCell>
                <TableCell className="py-3">
                  <Badge variant="outline" className="text-[10px] font-semibold bg-destructive/10 text-destructive border-destructive/20">
                    {refund.spikeReason || 'Threshold Exceeded'}
                  </Badge>
                </TableCell>
                <TableCell className="pr-6 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    onClick={() => handleDismiss(refund.id)}
                  >
                    <BellOff className="h-3 w-3 mr-1" /> Dismiss
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RefundSpikeTable;

