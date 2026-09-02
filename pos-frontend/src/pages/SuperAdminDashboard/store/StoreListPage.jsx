import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useDispatch } from "react-redux";
import StoreTable from "./StoreTable";
import StoreDetailDrawer from "./StoreDetailDrawer";
import { useToast } from "@/components/ui/use-toast";
import { moderateStore, searchStores } from "@/Redux Toolkit/features/store/storeThunks";

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
      dispatch(searchStores({ page: 0, size: 10 }));
      toast({
        title: "Status Updated",
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
    runModerate(storeId, "BLOCKED", "The store account has been suspended.");
  };

  const handleActivateStore = (storeId) => {
    runModerate(storeId, "ACTIVE", "The store account has been activated.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Registered Stores & Tenants
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage all registered retail merchants, verify documents, and control system access
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-lg">Merchant Tenant Directory</CardTitle>
          <CardDescription className="text-xs">
            Filter, inspect, and moderate commercial tenant accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
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