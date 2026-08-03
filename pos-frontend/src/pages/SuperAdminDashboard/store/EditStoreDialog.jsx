import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import EditStoreForm from "../../store/storeInformation/components/EditStoreForm";
import { updateStoreAsSuperAdmin } from "@/Redux Toolkit/features/store/storeThunks";

export default function EditStoreDialog({ store, open, onOpenChange }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!store) return null;

  const initialValues = {
    brand: store.brand || "",
    storeType: store.storeType || "",
    description: store.description || "",
    contact: {
      address: store.contact?.address || "",
      phone: store.contact?.phone || "",
      email: store.contact?.email || "",
    },
    gstNumber: store.gstNumber || "",
    panNumber: store.panNumber || "",
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await dispatch(
        updateStoreAsSuperAdmin({ id: store.id, storeData: values })
      ).unwrap();
      toast({
        title: "Store Updated",
        description: `Store "${values.brand}" has been updated successfully.`,
      });
      onOpenChange(false);
    } catch (e) {
      toast({
        title: "Update Failed",
        description: e?.message || e || "Failed to update store.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Store</DialogTitle>
          <DialogDescription>
            Update store information for {store.brand}
          </DialogDescription>
        </DialogHeader>
        <EditStoreForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}