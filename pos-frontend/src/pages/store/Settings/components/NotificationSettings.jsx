import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

const NotificationItem = ({ id, title, description, checked, onToggle, disabled }) => (
  <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
    <div>
      <h4 className="text-xs font-bold text-foreground">{title}</h4>
      <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onToggle} disabled={disabled} />
  </div>
);

const NotificationSettingsForm = ({ data, onChange, onSave, isSaving }) => {
  const notificationItems = [
    {
      name: "emailNotifications",
      title: "Email Dispatch Alerts",
      description: "Receive store updates and daily register close summaries via email",
    },
    {
      name: "lowStockAlerts",
      title: "Low Inventory Triggers",
      description: "Real-time notice when product catalog quantities drop below minimum reorder thresholds",
    },
    {
      name: "salesReports",
      title: "Automated Sales Reports",
      description: "Daily and weekly revenue reports emailed to store administrator",
    },
    {
      name: "employeeActivity",
      title: "Cashier Shift Audit Alerts",
      description: "Alert when a cashier opens till drawer or applies large bill discounts",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {notificationItems.map((item) => (
          <NotificationItem
            key={item.name}
            id={item.name}
            title={item.title}
            description={item.description}
            checked={!!data[item.name]}
            onToggle={(checked) => onChange({ ...data, [item.name]: checked })}
          />
        ))}
      </div>
      <div className="pt-2">
        <Button onClick={onSave} disabled={isSaving} className="text-xs font-bold h-10 gap-1.5">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Notification Preferences
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettingsForm;