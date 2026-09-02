import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BellOff, Loader2, MapPin } from "lucide-react";
import { dismissAlert } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";

const NoSaleTodayBranchTable = () => {
  const dispatch = useDispatch();
  const { storeAlerts, loading } = useSelector((state) => state.storeAnalytics);
  const user = useSelector((state) => state.user.userProfile);

  const handleDismiss = (branchId) => {
    if (user?.id) {
      dispatch(
        dismissAlert({
          storeAdminId: user.id,
          alertType: "NO_SALE_TODAY",
          referenceId: branchId,
        })
      );
    }
  };

  const branches = storeAlerts?.noSalesToday || [];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Branch Name</TableHead>
          <TableHead>Workstation Address</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center py-8 text-xs font-semibold text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin inline-block mr-2 text-[#B8860B]" />
              Querying branch terminal feeds...
            </TableCell>
          </TableRow>
        ) : branches.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center py-8 text-xs font-semibold text-muted-foreground">
              All active branch workstations have recorded transactions today.
            </TableCell>
          </TableRow>
        ) : (
          branches.map((branch) => (
            <TableRow key={branch.id}>
              <TableCell>
                <span className="font-bold text-xs text-foreground">{branch.name}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-[#B8860B] shrink-0" />
                  <span className="truncate max-w-xs">{branch.address || "N/A"}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleDismiss(branch.id)}
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

export default NoSaleTodayBranchTable;