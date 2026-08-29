import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store } from "lucide-react";
import StoreSettingsForm from "./StoreSettingsForm";

const StoreSettings = ({ settings }) => {
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
          onSubmit={() => {}}
          isSubmitting={false}
        />
      </CardContent>
    </Card>
  );
};

export default StoreSettings;