import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Plus, Store, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAllBranchesByStore } from "@/Redux Toolkit/features/branch/branchThunks";
import { getStoreOverview } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BranchTable from "./BranchTable";
import BranchForm from "./BranchForm";

export default function Branches() {
  const dispatch = useDispatch();
  const { branches, loading, error } = useSelector((state) => state.branch);
  const { store } = useSelector((state) => state.store);
  const { user, userProfile } = useSelector((state) => state.user);
  const { storeOverview } = useSelector((state) => state.storeAnalytics);
  const { statusResponse } = useSelector((state) => state.storeSubscription);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(null);

  const activeStoreId = store?.id || userProfile?.store?.id;

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

  useEffect(() => {
    if (userProfile?.id && !storeOverview) {
      dispatch(getStoreOverview(userProfile.id));
    }
  }, [dispatch, userProfile, storeOverview]);

  const maxBranches = statusResponse?.currentPlan?.maxBranches;
  const totalBranches = storeOverview?.totalBranches;
  const showBranchLimit = storeOverview && maxBranches != null && maxBranches > 0;
  const isBranchLimitReached = showBranchLimit && totalBranches >= maxBranches;

  const handleEdit = (branch) => {
    setCurrentBranch(branch);
    setIsEditDialogOpen(true);
  };

  const handleFormSubmit = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setCurrentBranch(null);
    if (activeStoreId) {
      dispatch(
        getAllBranchesByStore({
          storeId: activeStoreId,
          jwt: localStorage.getItem("jwt"),
        })
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Branch Outlets
            </h2>
            {showBranchLimit && (
              <Badge
                variant={isBranchLimitReached ? "destructive" : "outline"}
                className="text-xs font-mono"
              >
                {totalBranches} / {maxBranches} Outlets
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage physical retail locations, assigned managers, and outlet addresses
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={isBranchLimitReached}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-10 px-4 rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Branch Outlet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                Add New Branch Outlet
              </DialogTitle>
            </DialogHeader>
            <BranchForm
              onSubmit={handleFormSubmit}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isBranchLimitReached && (
        <Alert variant="destructive" className="rounded-xl border-amber-300 bg-amber-50/50 text-amber-900">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs font-medium">
            You have reached your subscription plan's maximum branch limit ({maxBranches} branches). Upgrade your plan to add additional store branches.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
        </Alert>
      )}

      <BranchTable
        branches={branches}
        loading={loading}
        onEdit={handleEdit}
        activeStoreId={activeStoreId}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Edit Branch Outlet
            </DialogTitle>
          </DialogHeader>
          <BranchForm
            initialValues={currentBranch}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsEditDialogOpen(false)}
            isEditing
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}