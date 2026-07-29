import React from "react";
import StoreSettings from "./StoreSettings";
import NotificationSettings from "./NotificationSettings";
import SecuritySettings from "./SecuritySettings";
import PaymentSettings from "./PaymentSettings";
import { Save, Lock } from "lucide-react";
import { Button } from "../../../../components/ui/button";

const SettingsContent = ({
  storeSettings,
  notificationSettings,
  securitySettings,
  paymentSettings,
  onStoreSettingsChange,
  onNotificationSettingsChange,
  onSecuritySettingsChange,
  onPaymentSettingsChange,
  isSubscriptionActive = false,
}) => {
  const onSave = () => {
    console.log("on save");
  };

  return (
    <div className="space-y-6">
      {/* Store Basic Settings - Always Accessible */}
      <StoreSettings
        settings={storeSettings}
        onChange={onStoreSettingsChange}
      />

      {/* Advanced Settings - Gated behind Subscription Active Status */}
      <div className="relative space-y-6">
        {!isSubscriptionActive && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-2xl border border-amber-200 shadow-sm p-6">
            <div className="bg-card p-6 rounded-xl border border-amber-300 text-center max-w-md shadow-lg space-y-3">
              <div className="p-3 bg-amber-100 rounded-full w-fit mx-auto text-amber-600">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg text-foreground">Advanced Settings Locked</h4>
              <p className="text-sm text-muted-foreground">
                Active store registration and subscription are required to modify notification, security, and payment integration settings.
              </p>
            </div>
          </div>
        )}

        <div className={!isSubscriptionActive ? "opacity-40 pointer-events-none select-none" : ""}>
          <NotificationSettings
            settings={notificationSettings}
            onChange={onNotificationSettingsChange}
          />

          <div className="mt-6">
            <SecuritySettings
              settings={securitySettings}
              onChange={onSecuritySettingsChange}
            />
          </div>

          <div className="mt-6">
            <PaymentSettings
              settings={paymentSettings}
              onChange={onPaymentSettingsChange}
            />
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={onSave}
        disabled={!isSubscriptionActive}
      >
        <Save className="mr-2 h-4 w-4" /> Save All Settings
      </Button>
    </div>
  );
};

export default SettingsContent;
