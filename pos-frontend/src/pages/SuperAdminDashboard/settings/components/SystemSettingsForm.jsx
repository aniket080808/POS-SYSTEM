import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";

const SystemSettingItem = ({ id, title, description, checked, onToggle }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <h4 className="text-xs font-semibold text-foreground">{title}</h4>
      <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onToggle} />
  </div>
);

const SystemSettingsForm = ({ systemSettings, onToggle }) => {
  const systemSettingItems = [
    {
      id: "autoApproveStores",
      title: "Automatic Store Approvals",
      description: "Automatically grant active status to new store registrations without manual review",
    },
    {
      id: "requireDocumentVerification",
      title: "Mandatory Tax Document Verification",
      description: "Require verified GST and PAN numbers prior to enabling terminal transactions",
    },
    {
      id: "commissionAutoCalculation",
      title: "Automated Platform Fee Settlements",
      description: "Calculate and lock platform commissions automatically on monthly billing cycles",
    },
    {
      id: "maintenanceMode",
      title: "Platform Maintenance Mode",
      description: "Temporarily pause merchant cashier access for major platform database updates",
    },
  ];

  return (
    <Card className="rounded-2xl border-border/80 shadow-2xs">
      <CardHeader className="pb-4 border-b border-border/60">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <span>System Operation Flags</span>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Platform-wide automated moderation policies and maintenance controls.
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border/60 p-4 sm:p-6">
        {systemSettingItems.map((item) => (
          <SystemSettingItem
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description}
            checked={!!systemSettings[item.id]}
            onToggle={() => onToggle(item.id)}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default SystemSettingsForm;
 