import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon } from "lucide-react";

const SystemSettingItem = ({ id, title, description, checked, onToggle }) => (
  <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
    <div>
      <h4 className="text-xs font-bold text-foreground">{title}</h4>
      <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onToggle} />
  </div>
);

const SystemSettingsForm = ({ systemSettings, onToggle }) => {
  const systemSettingItems = [
    {
      id: "autoApproveStores",
      title: "Automatic Store Onboarding Approval",
      description: "Instantly activate new store registrations without manual Super Admin review queue",
    },
    {
      id: "requireDocumentVerification",
      title: "Mandatory Business Document Verification",
      description: "Require PAN / GST compliance documents before a store can process live cashier sales",
    },
    {
      id: "commissionAutoCalculation",
      title: "Automated Platform Fee Invoicing",
      description: "Automatically compute and log monthly commission splits on billing renewal",
    },
    {
      id: "maintenanceMode",
      title: "Platform Maintenance Mode",
      description: "Temporarily restrict POS workstation access for scheduled database and API upgrades",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-base flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-[#B8860B]" /> Platform Engine & Policy Governance
        </CardTitle>
        <CardDescription className="text-xs">
          Automated compliance controls and tenant validation rules
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
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