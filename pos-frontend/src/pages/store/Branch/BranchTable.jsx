import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MapPin, Phone, Users, Loader2, Store } from "lucide-react";
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
  const { store } = useSelector((state) => state.store || {});
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

      // Refresh branches list
      if (store?.id) {
        dispatch(getAllBranchesByStore({ storeId: store.id, jwt }));
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/60">
              <TableHead className="text-xs font-bold text-foreground py-3.5 pl-6">Branch Location</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">Address</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">Assigned Manager</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">Contact Phone</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5 pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin inline-block mr-2 text-primary" />
                  Loading branch directory...
                </TableCell>
              </TableRow>
            ) : branches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <Store className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-xs font-semibold text-foreground">No branches registered</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Click "Add New Branch" to establish your first store terminal location.</p>
                </TableCell>
              </TableRow>
            ) : (
              branches.map((branch) => (
                <TableRow key={branch.id} className="hover:bg-muted/30 transition-colors border-b border-border/40">
                  <TableCell className="pl-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        <Store className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-foreground block">{branch.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: #{branch.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 max-w-xs md:max-w-md">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title={branch.address}>
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                      <span className="truncate">{branch.address}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    {branch.manager ? (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{branch.manager}</span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                        Unassigned
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                      <span>{branch.phone || "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="pr-6 py-3.5 text-right">
                    {canManageBranch ? (
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary"
                          onClick={() => onEdit(branch)}
                          title="Edit Branch"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          onClick={() => setBranchToDelete(branch)}
                          disabled={loading || isDeleting}
                          title="Delete Branch"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic pr-2">View Only</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog for Branch Deletion */}
      <AlertDialog open={Boolean(branchToDelete)} onOpenChange={(open) => !open && setBranchToDelete(null)}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">Delete Branch Location</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete branch{" "}
              <strong className="text-foreground">"{branchToDelete?.name}"</strong>?
              This action cannot be undone and will revoke terminal access associated with this branch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl text-xs font-semibold h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBranch}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl text-xs font-semibold h-8"
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