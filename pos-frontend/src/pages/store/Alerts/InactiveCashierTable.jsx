
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tag, Package, BellOff, Loader2, UserX } from "lucide-react";
import { formatDateTime } from "../../../utils/formateDate";
import { dismissAlert } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";

const InactiveCashierTable = () => {
  const dispatch = useDispatch();
  const { storeAlerts, loading } = useSelector((state) => state.storeAnalytics || {});
  const user = useSelector((state) => state.user?.userProfile);

  const handleDismiss = (cashierId) => {
    if (user?.id) {
      dispatch(dismissAlert({
        storeAdminId: user.id,
        alertType: 'INACTIVE_CASHIER',
        referenceId: cashierId
      }));
    }
  };

  const cashiers = storeAlerts?.inactiveCashiers || [];

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/60">
            <TableHead className="text-xs font-bold text-foreground py-3 pl-6">Cashier</TableHead>
            <TableHead className="text-xs font-bold text-foreground py-3">Assigned Branch</TableHead>
            <TableHead className="text-xs font-bold text-foreground py-3">Last Active Shift</TableHead>
            <TableHead className="text-xs font-bold text-foreground py-3 pr-6 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin inline-block mr-2 text-primary" />
                Checking cashier activity feeds...
              </TableCell>
            </TableRow>
          ) : cashiers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-xs">
                All assigned cashiers have logged into active shifts recently.
              </TableCell>
            </TableRow>
          ) : (
            cashiers.map((cashier) => (
              <TableRow key={cashier.id} className="hover:bg-muted/30 transition-colors border-b border-border/40">
                <TableCell className="pl-6 py-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-foreground">{cashier.fullName}</div>
                    <div className="text-[11px] text-muted-foreground">{cashier.email}</div>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <span className="text-xs font-medium text-foreground">
                    {cashier.branchName || cashier.branch?.name || 'Main Store'}
                  </span>
                </TableCell>
                <TableCell className="py-3 text-xs text-muted-foreground font-mono">
                  {cashier.lastLogin ? formatDateTime(cashier.lastLogin) : 'Never Logged In'}
                </TableCell>
                <TableCell className="pr-6 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    onClick={() => handleDismiss(cashier.id)}
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

export default InactiveCashierTable;

