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
import { IndianRupee, BellOff, Loader2 } from "lucide-react";
import { dismissAlert } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";

const RefundSpikeTable = () => {
  const dispatch = useDispatch();
  const { storeAlerts, loading } = useSelector((state) => state.storeAnalytics);
  const user = useSelector((state) => state.user.userProfile);

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Cashier Name</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Spike Reason</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin inline-block mr-2 text-emerald-600" />
              Checking refund anomaly feeds...
            </TableCell>
          </TableRow>
        ) : refunds.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
              No refund spikes or anomalous activities detected.
            </TableCell>
          </TableRow>
        ) : (
          refunds.map((refund) => (
            <TableRow key={refund.id}>
              <TableCell className="font-mono text-xs">{refund.id}</TableCell>
              <TableCell>
                <div className="font-medium text-sm">{refund.cashierName || 'Cashier'}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 font-semibold text-emerald-700 text-sm">
                  <IndianRupee className="h-3.5 w-3.5 text-gray-400" />
                  {refund.amount ? refund.amount.toFixed(2) : '0.00'}
                </div>
              </TableCell>
              <TableCell>
                <p className="text-xs text-muted-foreground">{refund.reason || 'N/A'}</p>
              </TableCell>
              <TableCell className="text-red-600 font-medium text-xs">
                {refund.spikeReason || '—'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDismiss(refund.id)}
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
