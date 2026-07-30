import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Bell, Save, Loader2, Lock } from "lucide-react";

const NotificationItem = ({ id, title, description, checked, onToggle, disabled }) => (
  <>
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onToggle} disabled={disabled} />
    </div>
    <Separator />
  </>
);

const NotificationSettingsForm = ({ settings, onChange, onSave, isSubmitting, isSubscriptionActive }) => {
  const notificationItems = [
    {
      name: "emailNotifications",
      title: "Email Notifications",
      description: "Receive notifications via email"
    },
    {
      name: "lowStockAlerts",
      title: "Low Stock Alerts",
      description: "Get notified when inventory is low"
    },
    {
      name: "salesReports",
      title: "Sales Reports",
      description: "Receive periodic sales reports"
    },
    {
      name: "employeeActivity",
      title: "Employee Activity",
      description: "Get notified about employee activities"
    }
  ];

  const disabled = !isSubscriptionActive;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure how you receive alerts and notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificationItems.map((item, index) => (
          <React.Fragment key={item.name}>
            <NotificationItem
              id={item.name}
              title={item.title}
              description={item.description}
              checked={!!settings[item.name]}
              onToggle={(checked) => onChange(item.name, checked)}
              disabled={disabled}
            />
            {index === notificationItems.length - 2 && <Separator />}
          </React.Fragment>
        ))}
        <Button onClick={onSave} disabled={isSubmitting || disabled} className="flex items-center gap-2">
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save Notification Settings</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationSettingsForm;