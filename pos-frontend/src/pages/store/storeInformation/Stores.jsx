import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Store, CheckCircle, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { getStoreByAdmin, updateStore } from "@/Redux Toolkit/features/store/storeThunks";
import { fetchStoreSubscriptionStatus } from "@/Redux Toolkit/features/storeSubscription/storeSubscriptionThunks";
import {
  StoreHeader,
  StoreInfoCard,
  EditStoreDialog,
  LoadingState,
  EmptyState,
} from "./components";

export default function Stores() {
  const dispatch = useDispatch();
  const { store, loading, error } = useSelector((state) => state.store);
  const { user } = useSelector((state) => state.user);
  const { statusResponse } = useSelector((state) => state.storeSubscription);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [storeData, setStoreData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!store?.id) {
      fetchStoreData();
    }
  }, [dispatch, store?.id]);

  useEffect(() => {
    if (store) {
      setStoreData(store);
    }
  }, [store]);

  const fetchStoreData = async () => {
    setRefreshing(true);
    try {
      await dispatch(getStoreByAdmin()).unwrap();
    } catch (err) {
      toast({
        title: "Error",
        description: err || "Failed to fetch store data",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditStore = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(
        updateStore({
          id: storeData.id,
          storeData: values,
        })
      ).unwrap();
      toast({
        title: "Store Profile Updated",
        description: "Store profile information has been saved.",
      });
      setEditDialogOpen(false);
      fetchStoreData();
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err || "Failed to update store information",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !refreshing && !storeData) {
    return <LoadingState />;
  }

  if (!storeData && !loading) {
    return <EmptyState onRefresh={fetchStoreData} refreshing={refreshing} />;
  }

  const currentPlan = statusResponse?.currentPlan;
  const isSubscriptionActive = statusResponse?.subscriptionStatus === "ACTIVE";

  return (
    <div className="space-y-6">
      <StoreHeader
        storeData={storeData}
        onRefresh={fetchStoreData}
        refreshing={refreshing}
      />

      {error && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Subscription Tier Summary Card */}
      {currentPlan && (
        <Card className="border-[#262422] bg-card shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#262422] text-white flex items-center justify-center shadow-xs">
                <CreditCard className="w-6 h-6 text-[#C9A227]" />
              </div>
              <div>
                <div className="font-bold text-base text-foreground">
                  Active Tier: {currentPlan.name}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  ₹{currentPlan.price?.toLocaleString()} / {currentPlan.billingCycle?.toLowerCase()}
                </div>
              </div>
            </div>
            <Badge variant={isSubscriptionActive ? "active" : "warning"} className="text-xs px-3 py-1 self-start sm:self-auto">
              {isSubscriptionActive ? "ACTIVE SUBSCRIPTION" : "PENDING VERIFICATION"}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Store Info Card */}
      <StoreInfoCard
        storeData={storeData}
        onEditClick={() => setEditDialogOpen(true)}
      />

      {/* Edit Store Dialog */}
      <EditStoreDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        storeData={storeData}
        onSubmit={handleEditStore}
      />
    </div>
  );
}