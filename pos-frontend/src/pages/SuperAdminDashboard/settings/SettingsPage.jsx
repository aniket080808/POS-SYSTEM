import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Bell, Settings as SettingsIcon } from "lucide-react";
import ProfileSettingsForm from "./components/ProfileSettingsForm";
import SecuritySettingsForm from "./components/SecuritySettingsForm";
import NotificationSettingsForm from "./components/NotificationSettingsForm";
import SystemSettingsForm from "./components/SystemSettingsForm";
import { useSettingsState } from "./components/useSettingsState";

export default function SettingsPage() {
  const {
    profileData,
    loading,
    passwordData,
    showPasswords,
    notifications,
    systemSettings,
    handleProfileUpdate,
    handlePasswordChange,
    handleNotificationToggle,
    handleSystemSettingToggle,
    handleProfileFieldChange,
    handlePasswordFieldChange,
    handleShowPasswordToggle,
  } = useSettingsState();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Platform Governance & System Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage super admin security credentials, automated review policies, and notification dispatch
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-secondary p-1 rounded-xl grid grid-cols-2 sm:grid-cols-4 max-w-2xl">
          <TabsTrigger value="profile" className="flex items-center gap-2 text-xs font-bold">
            <User className="w-3.5 h-3.5" />
            Profile Info
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            Security & Passwords
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 text-xs font-bold">
            <Bell className="w-3.5 h-3.5" />
            Alerts & Notices
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2 text-xs font-bold">
            <SettingsIcon className="w-3.5 h-3.5" />
            Platform Engine
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileSettingsForm
            profileData={profileData}
            onUpdate={handleProfileUpdate}
            onFieldChange={handleProfileFieldChange}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecuritySettingsForm
            passwordData={passwordData}
            showPasswords={showPasswords}
            onPasswordChange={handlePasswordFieldChange}
            onShowPasswordToggle={handleShowPasswordToggle}
            onUpdate={handlePasswordChange}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettingsForm
            notifications={notifications}
            onToggle={handleNotificationToggle}
          />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <SystemSettingsForm
            systemSettings={systemSettings}
            onToggle={handleSystemSettingToggle}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}