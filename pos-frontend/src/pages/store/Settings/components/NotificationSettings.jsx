import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Save, Loader2 } from "lucide-react";

const NotificationSettingsForm = ({ settings, onChange, onSave, isSubmitting, isSubscriptionActive }) => {
  const notificationItems = [
    {
      name: "emailNotifications",
      title: "Email Digests & Reports",
      description: "Receive daily summary reports and urgent alerts via administrator email"
    },
    {
      name: "lowStockAlerts",
      title: "Low Inventory & Stock Warnings",
      description: "Get real-time notifications when product units fall below threshold"
    },
    {
      name: "salesReports",
      title: "Periodic Business Statements",
      description: "Receive weekly and monthly revenue summaries and tax reports"
    },
    {
      name: "employeeActivity",
      title: "Cashier Shift & Register Logs",
      description: "Get notified about cashier shift openings, closings, and discrepancies"
    }
  ];

  const disabled = !isSubscriptionActive;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Notification & Alert Rules</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Configure real-time automated notifications and periodic merchant digests.
        </p>

        <div className="divide-y divide-border/60 border border-border/60 rounded-2xl p-4 bg-muted/20">
          {notificationItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between py-3">
              <div>
                <h4 className="text-xs font-semibold text-foreground">{item.title}</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
              </div>
              <Switch
                id={item.name}
                checked={!!settings[item.name]}
                onCheckedChange={(checked) => onChange(item.name, checked)}
                disabled={disabled}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={onSave} disabled={isSubmitting || disabled} size="sm" className="rounded-xl text-xs font-semibold h-9 gap-1.5">
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Notification Preferences</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettingsForm;