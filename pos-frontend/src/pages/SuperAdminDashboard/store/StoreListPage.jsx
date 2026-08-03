import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch } from "react-redux";
import StoreTable from "./StoreTable";
import StoreDetailDrawer from "./StoreDetailDrawer";
import EditStoreDialog from "./EditStoreDialog";
import { useToast } from "@/components/ui/use-toast";
import { moderateStore } from "@/Redux Toolkit/features/store/storeThunks";

export default function StoreListPage() {
  const dispatch = useDispatch();
  const [selectedStore, setSelectedStore] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editStore, setEditStore] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const { toast } = useToast();

  const handleViewDetails = (store) => {
    setSelectedStore(store);
    setDrawerOpen(true);
  };

  const runModerate = async (storeId, action, successMsg) => {
    setActionLoadingId(storeId);
    try {
      await dispatch(moderateStore({ storeId, action })).unwrap();
      toast({
        title: "Success",
        description: successMsg,
      });
    } catch (e) {
      toast({
        title: "Action Failed",
        description: e?.message || e || "Failed to update store status.",
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBlockStore = (storeId) => {
    runModerate(storeId, "BLOCKED", "The store has been successfully blocked.");
  };

  const handleActivateStore = (storeId) => {
    runModerate(storeId, "ACTIVE", "The store has been successfully activated.");
  };

  const handleEditStore = (store) => {
    setEditStore(store);
    setEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Stores</h2>
          <p className="text-muted-foreground">
            Manage all registered stores and their status
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Stores</CardTitle>
        </CardHeader>
        <CardContent>
          <StoreTable
            onViewDetails={handleViewDetails}
            onBlockStore={handleBlockStore}
            onActivateStore={handleActivateStore}
            onEditStore={handleEditStore}
            actionLoadingId={actionLoadingId}
          />
        </CardContent>
      </Card>

      <StoreDetailDrawer
        store={selectedStore}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onBlockStore={handleBlockStore}
        onActivateStore={handleActivateStore}
        onEditStore={handleEditStore}
        actionLoadingId={actionLoadingId}
      />

      <EditStoreDialog
        store={editStore}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
}