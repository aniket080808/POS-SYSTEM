import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Store } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { getAllBranchesByStore } from "@/Redux Toolkit/features/branch/branchThunks";
import { getStoreOverview } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { Badge } from "@/components/ui/badge";
import BranchTable from "./BranchTable";
import BranchForm from "./BranchForm";

export default function Branches() {
  const dispatch = useDispatch();
  const { branches = [], loading, error } = useSelector((state) => state.branch);
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
  }, [dispatch, activeStoreId]);

  useEffect(() => {
    if (userProfile?.id && !storeOverview) {
      dispatch(getStoreOverview(userProfile.id));
    }
  }, [dispatch, userProfile?.id, storeOverview]);

  const maxBranches = statusResponse?.currentPlan?.maxBranches;
  const totalBranches = storeOverview?.totalBranches || branches.length;
  const showBranchLimit = maxBranches != null && maxBranches > 0;
  const currentUserRole = userProfile?.role || user?.role;
  const canManageBranch = currentUserRole === "ROLE_STORE_ADMIN" || currentUserRole === "ROLE_ADMIN";

  const handleAddBranchSuccess = () => {
    setIsAddDialogOpen(false);
    if (activeStoreId) {
      dispatch(getAllBranchesByStore({ storeId: activeStoreId, jwt: localStorage.getItem("jwt") }));
    }
  };

  const handleEditBranchSuccess = () => {
    setIsEditDialogOpen(false);
    setCurrentBranch(null);
    if (activeStoreId) {
      dispatch(getAllBranchesByStore({ storeId: activeStoreId, jwt: localStorage.getItem("jwt") }));
    }
  };

  const openEditDialog = (branch) => {
    setCurrentBranch(branch);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Branch Locations & Workstations
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure multi-location physical store outlets, assigned branch managers, and phone lines
          </p>
        </div>

        <div className="flex items-center gap-3">
          {showBranchLimit && (
            <Badge variant="outline" className="font-mono text-xs px-2.5 py-1">
              Quota: {totalBranches} / {maxBranches} branches
            </Badge>
          )}
          {canManageBranch && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="text-xs font-bold h-10 gap-1.5">
                  <Plus className="w-4 h-4" /> Add Branch
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Add Branch Location</DialogTitle>
                  <DialogDescription className="text-xs">
                    Create a new retail workstation counter for this store
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
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Branch Details</DialogTitle>
            <DialogDescription className="text-xs">
              Update location address, contact phone, or assigned branch manager
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

      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base">Active Store Branches</CardTitle>
          <CardDescription className="text-xs">
            Workstations authorized to process cashier checkouts and track localized inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
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