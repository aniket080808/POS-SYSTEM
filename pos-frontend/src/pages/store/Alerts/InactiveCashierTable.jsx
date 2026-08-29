
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tag, Package, BellOff, Loader2 } from "lucide-react";
import { formatDateTime } from "../../../utils/formateDate";
import { dismissAlert } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";

const InactiveCashierTable = () => {
  const dispatch = useDispatch();
  const { storeAlerts, loading } = useSelector((state) => state.storeAnalytics);
  const user = useSelector((state) => state.user.userProfile);

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Full Name</TableHead>
          <TableHead>Branch Name</TableHead>
          <TableHead>Last Login</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin inline-block mr-2 text-emerald-600" />
              Loading cashier activity...
            </TableCell>
          </TableRow>
        ) : cashiers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
              All cashiers are active and up to date.
            </TableCell>
          </TableRow>
        ) : (
          cashiers.map((cashier) => (
            <TableRow key={cashier.id}>
              <TableCell>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <Package className="h-3.5 w-3.5 text-gray-400" />
                  {cashier.id}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-0.5">
                  <div className="font-medium text-sm">{cashier.fullName}</div>
                  <div className="text-xs text-muted-foreground">{cashier.email}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Tag className="h-3.5 w-3.5 text-gray-400" />
                  {cashier.branchName || cashier.branch?.name || 'N/A'}
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {cashier.lastLogin ? formatDateTime(cashier.lastLogin) : 'Never'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDismiss(cashier.id)}
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
