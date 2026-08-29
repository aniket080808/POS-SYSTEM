
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BellOff, MapPin, Loader2 } from "lucide-react";
import { dismissAlert } from '@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks';

const NoSaleTodayBranchTable = () => {
  const dispatch = useDispatch();
  const { storeAlerts, loading } = useSelector((state) => state.storeAnalytics || {});
  const user = useSelector((state) => state.user?.userProfile);

  const handleDismiss = (branchId) => {
    if (user?.id) {
      dispatch(dismissAlert({
        storeAdminId: user.id,
        alertType: 'NO_SALE_TODAY',
        referenceId: branchId
      }));
    }
  };

  const branches = storeAlerts?.noSalesToday || [];

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/60">
            <TableHead className="text-xs font-bold text-foreground py-3 pl-6">Branch Location</TableHead>
            <TableHead className="text-xs font-bold text-foreground py-3">Physical Address</TableHead>
            <TableHead className="text-xs font-bold text-foreground py-3 pr-6 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin inline-block mr-2 text-primary" />
                Scanning branch transaction registers...
              </TableCell>
            </TableRow>
          ) : branches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-xs">
                All store branches have recorded sales transactions today.
              </TableCell>
            </TableRow>
          ) : (
            branches.map((branch) => (
              <TableRow key={branch.id} className="hover:bg-muted/30 transition-colors border-b border-border/40">
                <TableCell className="pl-6 py-3">
                  <div>
                    <div className="font-bold text-xs text-foreground">{branch.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">Branch ID #{branch.id}</div>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                    <span>{branch.address || 'Address unlisted'}</span>
                  </div>
                </TableCell>
                <TableCell className="pr-6 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    onClick={() => handleDismiss(branch.id)}
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

export default NoSaleTodayBranchTable;