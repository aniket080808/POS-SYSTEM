import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch } from "react-redux";
import StoreTable from "./StoreTable";
import StoreDetailDrawer from "./StoreDetailDrawer";
import { useToast } from "@/components/ui/use-toast";
import { moderateStore } from "@/Redux Toolkit/features/store/storeThunks";

export default function StoreListPage() {
  const dispatch = useDispatch();
  const [selectedStore, setSelectedStore] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Registered Store Tenants</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor merchant accounts, review compliance status, and manage platform permissions.
          </p>
        </div>
      </div>

      <Card className="rounded-2xl border-border/80 shadow-2xs">
        <CardContent className="p-4 sm:p-6">
          <StoreTable
            onViewDetails={handleViewDetails}
            onBlockStore={handleBlockStore}
            onActivateStore={handleActivateStore}
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
        actionLoadingId={actionLoadingId}
      />
    </div>
  );
}