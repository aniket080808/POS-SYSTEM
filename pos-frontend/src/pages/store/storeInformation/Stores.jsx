import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { getStoreByAdmin, updateStore } from "@/Redux Toolkit/features/store/storeThunks";
import { fetchStoreSubscriptionStatus } from "@/Redux Toolkit/features/storeSubscription/storeSubscriptionThunks";
import {
  StoreHeader,
  StoreInfoCard,
  EditStoreDialog,
  LoadingState,
  EmptyState,
  getInitialValues
} from "./components";

export default function Stores() {
  const dispatch = useDispatch();
  const { store, loading, error } = useSelector((state) => state.store || {});
  const { user } = useSelector((state) => state.user || {});
  const { statusResponse } = useSelector((state) => state.storeSubscription || {});

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [storeData, setStoreData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStoreData();
    dispatch(fetchStoreSubscriptionStatus());
  }, [dispatch, user]);
  
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
      await dispatch(updateStore({ 
        id: storeData.id, 
        storeData: values
      })).unwrap();
      
      setEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Store updated successfully",
      });
      fetchStoreData();
      resetForm({ values });
    } catch (err) {
      toast({
        title: "Error",
        description: err || "Failed to update store",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <StoreHeader 
        onRefresh={fetchStoreData}
        refreshing={refreshing}
        loading={loading}
      />

      {error && (
        <Alert variant="destructive" className="rounded-xl text-xs">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <LoadingState />
      ) : !storeData ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6">
          <StoreInfoCard 
            storeData={storeData}
            onEditClick={handleEditClick}
          />

          {/* Subscription Summary */}
          {statusResponse && (
            <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/60 py-3.5 px-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-bold text-foreground">Active Subscription Tier</CardTitle>
                </div>
                {statusResponse.subscriptionStatus === 'ACTIVE' && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">Active Plan</Badge>
                )}
                {statusResponse.subscriptionStatus === 'PENDING' && (
                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold">Pending Review</Badge>
                )}
                {statusResponse.subscriptionStatus === 'REJECTED' && (
                  <Badge variant="destructive" className="text-xs font-semibold">Rejected</Badge>
                )}
                {statusResponse.subscriptionStatus === 'NONE' && (
                  <Badge variant="outline" className="text-xs">No Plan</Badge>
                )}
              </CardHeader>
              <CardContent className="p-6">
                {statusResponse.currentPlan ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-bold text-foreground">{statusResponse.currentPlan.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        ₹{statusResponse.currentPlan.price} / {statusResponse.currentPlan.billingCycle?.toLowerCase()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">No active subscription plan found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <EditStoreDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        initialValues={getInitialValues(storeData)}
        onSubmit={handleEditStore}
        isSubmitting={false}
      />
    </div>
  );
}