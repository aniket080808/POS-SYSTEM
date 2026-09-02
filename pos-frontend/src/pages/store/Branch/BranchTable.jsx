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
import { Badge } from "@/components/ui/badge";

const BranchTable = ({ branches = [], loading, onEdit, canManageBranch = false }) => {
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
        title: "Branch Deleted",
        description: `Branch "${branchToDelete.name}" deleted successfully.`,
      });

      if (store?.id) {
        dispatch(getAllBranchesByStore({ storeId: store.id, jwt }));
      }
    } catch (error) {
      toast({
        title: "Delete Error",
        description: error.message || error || "Failed to delete branch.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setBranchToDelete(null);
    }
  };

  return (
    <>
      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Branch Name</TableHead>
              <TableHead>Physical Address</TableHead>
              <TableHead>Assigned Manager</TableHead>
              <TableHead>Contact Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-xs font-semibold text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin inline-block mr-2 text-[#B8860B]" />
                  Loading branch locations...
                </TableCell>
              </TableRow>
            ) : branches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-xs font-semibold text-muted-foreground">
                  No branch workstations registered for this store.
                </TableCell>
              </TableRow>
            ) : (
              branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-bold text-foreground">
                    {branch.name}
                  </TableCell>
                  <TableCell className="max-w-xs md:max-w-md">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title={branch.address}>
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{branch.address}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Users className="h-3.5 w-3.5 text-[#B8860B]" />
                      <span>{branch.manager || <span className="text-muted-foreground italic">Unassigned</span>}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{branch.phone || "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {canManageBranch ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => onEdit(branch)}
                          title="Edit Branch"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                          onClick={() => setBranchToDelete(branch)}
                          disabled={loading || isDeleting}
                          title="Delete Branch"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground font-mono">View Only</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={Boolean(branchToDelete)} onOpenChange={(open) => !open && setBranchToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-destructive">Delete Branch Location</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to delete branch{" "}
              <strong>"{branchToDelete?.name}"</strong>?
              This will unassign terminals and staff associated with this location.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="text-xs h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBranch}
              disabled={isDeleting}
              className="text-xs font-bold h-9 bg-destructive hover:bg-destructive/90 text-white"
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BranchTable;