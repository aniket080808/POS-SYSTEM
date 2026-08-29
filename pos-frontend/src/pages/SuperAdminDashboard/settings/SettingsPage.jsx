import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Bell, Settings as SettingsIcon } from "lucide-react";
import ProfileSettingsForm from "./components/ProfileSettingsForm";
import SecuritySettingsForm from "./components/SecuritySettingsForm";
import NotificationSettingsForm from "./components/NotificationSettingsForm";
import SystemSettingsForm from "./components/SystemSettingsForm";
import { useSettingsState } from "./components/useSettingsState";

const SettingsTabTrigger = ({ value, children }) => (
  <TabsTrigger value={value} className="flex items-center gap-2 rounded-lg text-xs font-semibold">
    {children}
  </TabsTrigger>
);

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
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Platform Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage administrator profile credentials, security policies, and system preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/60 p-1 rounded-xl w-full grid grid-cols-2 sm:grid-cols-4 max-w-xl">
          <SettingsTabTrigger value="profile">
            <User className="w-3.5 h-3.5" />
            Profile
          </SettingsTabTrigger>
          <SettingsTabTrigger value="security">
            <Shield className="w-3.5 h-3.5" />
            Security
          </SettingsTabTrigger>
          <SettingsTabTrigger value="notifications">
            <Bell className="w-3.5 h-3.5" />
            Notifications
          </SettingsTabTrigger>
          <SettingsTabTrigger value="system">
            <SettingsIcon className="w-3.5 h-3.5" />
            System
          </SettingsTabTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettingsForm
            profileData={profileData}
            onUpdate={handleProfileUpdate}
            onFieldChange={handleProfileFieldChange}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettingsForm
            passwordData={passwordData}
            showPasswords={showPasswords}
            onPasswordChange={handlePasswordFieldChange}
            onShowPasswordToggle={handleShowPasswordToggle}
            onUpdate={handlePasswordChange}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettingsForm
            notifications={notifications}
            onToggle={handleNotificationToggle}
          />
        </TabsContent>

        <TabsContent value="system">
          <SystemSettingsForm
            systemSettings={systemSettings}
            onToggle={handleSystemSettingToggle}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
 