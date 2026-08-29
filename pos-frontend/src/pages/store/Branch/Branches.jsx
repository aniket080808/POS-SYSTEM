import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import {
  getAllBranchesByStore,
} from "@/Redux Toolkit/features/branch/branchThunks";
import { getStoreOverview } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BranchTable from "./BranchTable";
import BranchForm from "./BranchForm";

export default function Branches() {
  const dispatch = useDispatch();
  const { branches, loading, error } = useSelector((state) => state.branch || {});
  const { store } = useSelector((state) => state.store || {});
  const { user, userProfile } = useSelector((state) => state.user || {});
  const { storeOverview } = useSelector((state) => state.storeAnalytics || {});
  const { statusResponse } = useSelector((state) => state.storeSubscription || {});

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(null);

  const activeStoreId = store?.id || userProfile?.store?.id;

  // Fetch branches when component mounts
  useEffect(() => {
    if (activeStoreId) {
      dispatch(
        getAllBranchesByStore({
          storeId: activeStoreId,
          jwt: localStorage.getItem("jwt"),
        })
      );
    }
  }, [dispatch, activeStoreId, user]);

  // Fetch store overview for usage-vs-limit badge if not already loaded
  useEffect(() => {
    if (userProfile?.id && !storeOverview) {
      dispatch(getStoreOverview(userProfile.id));
    }
  }, [dispatch, userProfile, storeOverview]);

  const maxBranches = statusResponse?.currentPlan?.maxBranches;
  const totalBranches = storeOverview?.totalBranches;
  const showBranchLimit = storeOverview && maxBranches != null && maxBranches > 0;
  const currentUserRole = userProfile?.role || user?.role;
  const canManageBranch = currentUserRole === "ROLE_STORE_ADMIN" || currentUserRole === "ROLE_ADMIN";

  const handleAddBranchSuccess = () => {
    setIsAddDialogOpen(false);
  };

  const handleEditBranchSuccess = () => {
    setIsEditDialogOpen(false);
    setCurrentBranch(null);
  };

  const openEditDialog = (branch) => {
    setCurrentBranch(branch);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Retail Branch Locations</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage store branches, cashier terminals, and branch manager assignments.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-2">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2.5">
          {showBranchLimit && (
            <Badge variant="outline" className="text-xs font-mono px-2.5 py-1 rounded-xl">
              {totalBranches} / {maxBranches} Quota
            </Badge>
          )}
          {canManageBranch && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-xl text-xs font-semibold h-9 gap-1.5 shadow-2xs">
                  <Plus className="h-3.5 w-3.5" /> Add New Branch
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[540px] max-h-[85vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold text-foreground">Add Retail Branch</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Register a new store location and assign a branch manager.
                  </DialogDescription>
                </DialogHeader>
                <BranchForm
                  onSubmit={handleAddBranchSuccess}
                  onCancel={() => setIsAddDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[540px] max-h-[85vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">Edit Retail Branch</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update branch location details, contact number, or manager assignment.
              </DialogDescription>
            </DialogHeader>
            <BranchForm
              initialValues={currentBranch}
              onSubmit={handleEditBranchSuccess}
              onCancel={() => setIsEditDialogOpen(false)}
              isEditing={true}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden">
        <CardContent className="p-0">
          <BranchTable
            branches={branches}
            loading={loading}
            onEdit={openEditDialog}
            canManageBranch={canManageBranch}
          />
        </CardContent>
      </Card>
    </div>
  );
}