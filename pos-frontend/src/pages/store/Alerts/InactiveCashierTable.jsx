import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BellOff, Loader2 } from "lucide-react";
import { formatDateTime } from "../../../utils/formateDate";
import { dismissAlert } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";

const InactiveCashierTable = () => {
  const dispatch = useDispatch();
  const { storeAlerts, loading } = useSelector((state) => state.storeAnalytics);
  const user = useSelector((state) => state.user.userProfile);

  const handleDismiss = (cashierId) => {
    if (user?.id) {
      dispatch(
        dismissAlert({
          storeAdminId: user.id,
          alertType: "INACTIVE_CASHIER",
          referenceId: cashierId,
        })
      );
    }
  };

  const cashiers = storeAlerts?.inactiveCashiers || [];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Staff Member</TableHead>
          <TableHead>Assigned Branch</TableHead>
          <TableHead>Last Active Login</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-8 text-xs font-semibold text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin inline-block mr-2 text-[#B8860B]" />
              Loading cashier activity logs...
            </TableCell>
          </TableRow>
        ) : cashiers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-8 text-xs font-semibold text-muted-foreground">
              All cashier logins are active with verified shift logs.
            </TableCell>
          </TableRow>
        ) : (
          cashiers.map((cashier) => (
            <TableRow key={cashier.id}>
              <TableCell>
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-foreground">{cashier.fullName}</div>
                  <div className="text-[11px] text-muted-foreground">{cashier.email}</div>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {cashier.branchName || cashier.branch?.name || "Main Counter"}
              </TableCell>
              <TableCell className="text-xs font-mono text-muted-foreground">
                {cashier.lastLogin ? formatDateTime(cashier.lastLogin) : "Never Logged In"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleDismiss(cashier.id)}
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

export default InactiveCashierTable;
