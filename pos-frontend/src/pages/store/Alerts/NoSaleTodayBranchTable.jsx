
import { useSelector, useDispatch } from 'react-redux';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tag, Package, BellOff, MapPin } from "lucide-react";
import { dismissAlert } from '@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks';

const NoSaleTodayBranchTable = () => {
  const dispatch = useDispatch();
  const { storeAlerts, loading } = useSelector((state) => state.storeAnalytics);
  const user = useSelector((state) => state.user.userProfile);

  const handleDismiss = (branchId) => {
    if (user?.id) {
      dispatch(dismissAlert({
        storeAdminId: user.id,
        alertType: 'NO_SALE_TODAY',
        referenceId: branchId
      }));
    }
  };

  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Branch Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={4} className="text-center py-8">
              <div className="flex justify-center items-center">
                <svg className="animate-spin h-6 w-6 text-emerald-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading branches...
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  const branches = storeAlerts?.noSalesToday || [];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Branch Name</TableHead>
          <TableHead>Address</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {branches.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">
              All active branches have recorded sales today.
            </TableCell>
          </TableRow>
        ) : (
          branches.map((branch) => (
            <TableRow key={branch.id}>
              <TableCell className="font-mono text-xs">{branch.id}</TableCell>
              <TableCell>
                <div className="font-medium text-sm">{branch.name}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  {branch.address || 'N/A'}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDismiss(branch.id)}
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