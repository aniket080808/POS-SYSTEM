import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store, Save, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { updateStore } from "@/Redux Toolkit/features/store/storeThunks";
import StoreSettingsForm from "./StoreSettingsForm";
import { getInitialValues, transformSettingsToApiFormat } from "./formUtils";

const StoreSettings = ({ settings, onChange }) => {
  // This component is kept as a wrapper for backward compatibility
  // The main implementation is now in Settings.jsx
  // This wrapper delegates to StoreSettingsForm
  
  return (
    <Card id="store-settings">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5" />
          Store Settings
        </CardTitle>
        <CardDescription>
          Configure your store's basic information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StoreSettingsForm
          initialValues={settings}
          onSubmit={() => {}} // Handled by parent Settings.jsx
          isSubmitting={false}
          storeId={null}
        />
      </CardContent>
    </Card>
  );
};

export default StoreSettings;