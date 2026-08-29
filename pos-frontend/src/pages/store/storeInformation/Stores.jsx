import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";
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
  const { store, loading, error } = useSelector((state) => state.store);
  const { user } = useSelector((state) => state.user);
  const { statusResponse } = useSelector((state) => state.storeSubscription);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStoreData = useCallback(async () => {
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
  }, [dispatch]);

  useEffect(() => {
    fetchStoreData();
    dispatch(fetchStoreSubscriptionStatus());
  }, [dispatch, fetchStoreData, user]);

  const storeData = store;

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
    <div className="space-y-6">
      <StoreHeader 
        onRefresh={fetchStoreData}
        refreshing={refreshing}
        loading={loading}
      />

      {error && (
        <Alert variant="destructive">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Current Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statusResponse.currentPlan ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-medium">{statusResponse.currentPlan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{statusResponse.currentPlan.price} / {statusResponse.currentPlan.billingCycle?.toLowerCase()}
                      </p>
                    </div>
                    {statusResponse.subscriptionStatus === 'ACTIVE' && (
                      <Badge className="bg-green-600 hover:bg-green-600 text-white">Active</Badge>
                    )}
                    {statusResponse.subscriptionStatus === 'PENDING' && (
                      <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white">Pending</Badge>
                    )}
                    {statusResponse.subscriptionStatus === 'REJECTED' && (
                      <Badge className="bg-red-600 hover:bg-red-600 text-white">Rejected</Badge>
                    )}
                    {statusResponse.subscriptionStatus === 'NONE' && (
                      <Badge variant="secondary">No Plan</Badge>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">No active subscription plan</p>
                    <Badge variant="secondary">No Plan</Badge>
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