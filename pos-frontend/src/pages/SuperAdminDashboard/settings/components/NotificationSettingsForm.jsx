import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell } from "lucide-react";

const NotificationItem = ({ id, title, description, checked, onToggle }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <h4 className="text-xs font-semibold text-foreground">{title}</h4>
      <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onToggle} />
  </div>
);

const NotificationSettingsForm = ({ notifications, onToggle }) => {
  const notificationItems = [
    {
      id: "newStoreRequests",
      title: "New Store Registrations",
      description: "Get immediate alerts when new merchants submit store applications",
    },
    {
      id: "storeApprovals",
      title: "Store Approval Actions",
      description: "Notifications when approval requests are resolved or escalated",
    },
    {
      id: "commissionUpdates",
      title: "Commission & Fee Updates",
      description: "Alerts when platform fee rates or pricing tiers change",
    },
    {
      id: "systemAlerts",
      title: "Platform Health & Security Alerts",
      description: "Critical alerts for failed jobs, high traffic, or moderation issues",
    },
    {
      id: "emailNotifications",
      title: "Email Digest Notifications",
      description: "Receive daily summary reports and urgent alerts via administrator email",
    },
  ];

  return (
    <Card className="rounded-2xl border-border/80 shadow-2xs">
      <CardHeader className="pb-4 border-b border-border/60">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <span>Notification Preferences</span>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Configure real-time system alerts and communication channels.
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border/60 p-4 sm:p-6">
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
 