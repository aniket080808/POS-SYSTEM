import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BellOff, Loader2 } from "lucide-react";
import { dismissAlert } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { Badge } from "@/components/ui/badge";

const RefundSpikeTable = () => {
  const dispatch = useDispatch();
  const { format: formatCurrency } = useCurrencyFormatter();
  const { storeAlerts, loading } = useSelector((state) => state.storeAnalytics);
  const user = useSelector((state) => state.user.userProfile);

  const handleDismiss = (refundId) => {
    if (user?.id) {
      dispatch(
        dismissAlert({
          storeAdminId: user.id,
          alertType: "REFUND_SPIKE",
          referenceId: refundId,
        })
      );
    }
  };

  const refunds = storeAlerts?.refundSpikeAlerts || [];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cashier</TableHead>
          <TableHead>Refund Amount</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Anomaly Flag</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-xs font-semibold text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin inline-block mr-2 text-[#B8860B]" />
              Auditing refund activity streams...
            </TableCell>
          </TableRow>
        ) : refunds.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-xs font-semibold text-muted-foreground">
              No anomalous refund spikes or till reversals recorded.
            </TableCell>
          </TableRow>
        ) : (
          refunds.map((refund) => (
            <TableRow key={refund.id}>
              <TableCell>
                <div className="font-bold text-xs text-foreground">
                  {refund.cashierName || "Staff"}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs font-bold text-destructive">
                  {formatCurrency(refund.amount || 0)}
                </span>
              </TableCell>
              <TableCell>
                <p className="text-xs text-muted-foreground">{refund.reason || "N/A"}</p>
              </TableCell>
              <TableCell>
                <Badge variant="error" className="text-[10px] font-bold">
                  {refund.spikeReason || "Volume Spike"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleDismiss(refund.id)}
                  title="Dismiss alert"
                >
                  <BellOff className="h-3.5 w-3.5 mr-1" /> Dismiss
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default RefundSpikeTable;
