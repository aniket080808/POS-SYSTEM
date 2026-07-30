import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Info } from "lucide-react";

const SystemSettingsForm = ({ store }) => {
  const storeInfo = [
    { label: "Store ID", value: store?.id || "N/A" },
    { label: "Brand", value: store?.brand || "N/A" },
    { label: "Store Type", value: store?.storeType || "Retail Store" },
    { label: "Status", value: store?.status || "N/A" },
    { label: "Created", value: store?.createdAt ? new Date(store.createdAt).toLocaleDateString() : "N/A" },
    { label: "Last Updated", value: store?.updatedAt ? new Date(store.updatedAt).toLocaleDateString() : "N/A" },
    { label: "GST Number", value: store?.gstNumber || "Not set" },
    { label: "PAN Number", value: store?.panNumber || "Not set" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          System Information
        </CardTitle>
        <CardDescription>
          View your store's system information and details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storeInfo.map((item) => (
            <div key={item.label} className="space-y-1">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="font-medium">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-muted rounded-lg flex items-start gap-3">
          <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">About This System</p>
            <p>This store is running on the POS System platform. For system-level settings (maintenance mode, auto-approval, etc.), please contact your super admin.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemSettingsForm;