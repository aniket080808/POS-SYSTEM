import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";

const NotificationItem = ({ id, title, description, checked, onToggle }) => (
  <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
    <div>
      <h4 className="text-xs font-bold text-foreground">{title}</h4>
      <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onToggle} />
  </div>
);

const NotificationSettingsForm = ({ notifications, onToggle }) => {
  const notificationItems = [
    {
      id: "newStoreRequests",
      title: "Store Registration Alerts",
      description: "Notify immediately whenever a new merchant applies for platform onboarding",
    },
    {
      id: "storeApprovals",
      title: "Moderation Status Notifications",
      description: "Receive confirmations whenever a store request is approved or rejected",
    },
    {
      id: "commissionUpdates",
      title: "Platform Revenue & Commission Alerts",
      description: "Notify when new subscription invoices are generated or paid",
    },
    {
      id: "systemAlerts",
      title: "Critical Infrastructure Warnings",
      description: "High-priority alerts regarding WebSocket downtime or database load",
    },
    {
      id: "emailNotifications",
      title: "Digest Email Dispatch",
      description: "Send daily operational summary reports to the super admin inbox",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#B8860B]" /> Platform Notification Channels
        </CardTitle>
        <CardDescription className="text-xs">
          Select operational events that trigger push alerts and email notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {notificationItems.map((item) => (
          <NotificationItem
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description}
            checked={!!notifications[item.id]}
            onToggle={() => onToggle(item.id)}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default NotificationSettingsForm;