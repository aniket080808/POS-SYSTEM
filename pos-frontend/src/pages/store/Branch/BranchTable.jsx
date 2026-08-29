import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MapPin, Phone, Users, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { deleteBranch, getAllBranchesByStore } from "@/Redux Toolkit/features/branch/branchThunks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const BranchTable = ({ branches, loading, onEdit, canManageBranch = false }) => {
  const dispatch = useDispatch();
  const { store } = useSelector((state) => state.store);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteBranch = async () => {
    if (!branchToDelete) return;
    setIsDeleting(true);
    try {
      const jwt = localStorage.getItem("jwt");
      if (!branchToDelete.id || !jwt) {
        toast({
          title: "Error",
          description: "Branch ID or authentication JWT missing",
          variant: "destructive",
        });
        return;
      }

      await dispatch(deleteBranch({ id: branchToDelete.id, jwt })).unwrap();

      toast({
        title: "Success",
        description: `Branch "${branchToDelete.name}" deleted successfully`,
      });

      // Refresh branches list
      if (store?.id) {
        dispatch(getAllBranchesByStore({ storeId: store.id, jwt }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || error || "Failed to delete branch",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setBranchToDelete(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Branch Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />
                Loading branches...
              </TableCell>
            </TableRow>
          ) : branches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No branches found.
              </TableCell>
            </TableRow>
          ) : (
            branches.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell>
                  <div className="flex items-center gap-2 font-medium">
                    {branch.name}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs md:max-w-md">
                  <div className="flex items-center gap-2" title={branch.address}>
                    <MapPin className="h-4 w-4 text-gray-500 shrink-0" />
                    <span className="truncate">{branch.address}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    {branch.manager || "Not Assigned"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    {branch.phone}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {canManageBranch ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(branch)}
                        title="Edit Branch"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                        onClick={() => setBranchToDelete(branch)}
                        disabled={loading || isDeleting}
                        title="Delete Branch"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic pr-2">View Only</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Confirmation Dialog for Branch Deletion */}
      <AlertDialog open={Boolean(branchToDelete)} onOpenChange={(open) => !open && setBranchToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Branch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete branch{" "}
              <span className="font-semibold text-foreground">"{branchToDelete?.name}"</span>?
              This action cannot be undone and will remove associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBranch}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Branch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BranchTable;