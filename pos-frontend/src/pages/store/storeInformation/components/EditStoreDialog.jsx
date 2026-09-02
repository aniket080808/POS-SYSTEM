import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EditStoreForm from "./EditStoreForm";
import { getInitialValues } from "./formUtils";

const EditStoreDialog = ({
  open,
  isOpen,
  onOpenChange,
  onClose,
  storeData,
  initialValues,
  onSubmit,
  isSubmitting,
}) => {
  const dialogOpen = open !== undefined ? open : (isOpen !== undefined ? isOpen : false);

  const handleOpenChange = (val) => {
    if (onOpenChange) onOpenChange(val);
    if (!val && onClose) onClose();
  };

  const values = initialValues || getInitialValues(storeData);

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto bg-card border-border rounded-2xl shadow-xl">
        <DialogHeader className="pb-2 border-b border-border/60">
          <DialogTitle className="text-base font-bold text-foreground">
            Edit Store Profile
          </DialogTitle>
        </DialogHeader>

        <EditStoreForm
          initialValues={values}
          onSubmit={onSubmit}
          onCancel={() => handleOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditStoreDialog;