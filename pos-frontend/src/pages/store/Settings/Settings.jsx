import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStoreByAdmin, updateStore } from "@/Redux Toolkit/features/store/storeThunks";
import { fetchStoreSettings, updateStoreSettings } from "@/Redux Toolkit/features/storeSettings/storeSettingsThunks";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Bell, Shield, CreditCard, Database, HelpCircle } from "lucide-react";
import StoreSettingsForm from "./components/StoreSettingsForm";
import NotificationSettingsForm from "./components/NotificationSettings";
import SecuritySettingsForm from "./components/SecuritySettings";
import PaymentSettingsForm from "./components/PaymentSettings";
import SystemSettingsForm from "./components/SystemSettings";
import HelpSupportForm from "./components/HelpSupport";
import { transformSettingsToApiFormat, getInitialValues } from "./components/formUtils";

const SettingsTabTrigger = ({ value, children }) => (
  <TabsTrigger value={value} className="flex items-center gap-2">
    {children}
  </TabsTrigger>
);

export default function Settings() {
  const dispatch = useDispatch();
  const { store, loading: storeLoading } = useSelector((state) => state.store);
  const { settings: storeSettings, loading: settingsLoading } = useSelector((state) => state.storeSettings);
  const { statusResponse } = useSelector((state) => state.storeSubscription);

  const regStatus = statusResponse?.registrationStatus || store?.status || 'PENDING';
  const subStatus = statusResponse?.subscriptionStatus || 'NONE';
  const isSubscriptionActive = regStatus === 'ACTIVE' && subStatus === 'ACTIVE';

  const [storeFormData, setStoreFormData] = useState(getInitialValues(store));
  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    salesReports: true,
    employeeActivity: true,
  });
  const [securityData, setSecurityData] = useState({
    twoFactorAuth: false,
    ipRestriction: false,
    passwordExpiry: 90,
    sessionTimeout: 30,
  });
  const [paymentData, setPaymentData] = useState({
    acceptedPaymentMethods: ['cash', 'upi', 'card'],
  });

  const [savingStore, setSavingStore] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Fetch store data on mount
  useEffect(() => {
    dispatch(getStoreByAdmin()).unwrap().catch((err) => {
      toast({ title: "Error", description: err || "Failed to fetch store data", variant: "destructive" });
    });
    dispatch(fetchStoreSettings()).unwrap().catch(() => {
      // Settings may not exist yet for existing stores - that's ok
    });
  }, [dispatch]);

  // Update local state when store data loads
  useEffect(() => {
    if (store) {
      setStoreFormData(getInitialValues(store));
      setPaymentData({
        acceptedPaymentMethods: store.acceptedPaymentMethods
          ? store.acceptedPaymentMethods.split(',')
          : ['cash', 'upi', 'card'],
      });
    }
  }, [store]);

  // Update local state when store settings load
  useEffect(() => {
    if (storeSettings) {
      setNotificationData({
        emailNotifications: storeSettings.emailNotifications ?? true,
        lowStockAlerts: storeSettings.lowStockAlerts ?? true,
        salesReports: storeSettings.salesReports ?? true,
        employeeActivity: storeSettings.employeeActivity ?? true,
      });
      setSecurityData({
        twoFactorAuth: storeSettings.twoFactorAuth ?? false,
        ipRestriction: storeSettings.ipRestriction ?? false,
        passwordExpiry: storeSettings.passwordExpiry ?? 90,
        sessionTimeout: storeSettings.sessionTimeout ?? 30,
      });
    }
  }, [storeSettings]);

  const handleSaveStore = async (apiDataFromFormik) => {
    if (!store?.id) {
      toast({ title: "Error", description: "Store information not found", variant: "destructive" });
      return;
    }
    setSavingStore(true);
    try {
      // Use the apiData from Formik (which has the latest user edits), not stale storeFormData
      const apiData = {
        ...apiDataFromFormik,
        acceptedPaymentMethods: paymentData.acceptedPaymentMethods.join(','),
      };
      await dispatch(updateStore({ id: store.id, storeData: apiData })).unwrap();
      // Re-fetch store data to update Redux state
      await dispatch(getStoreByAdmin()).unwrap();
      toast({ title: "Success", description: "Store settings updated successfully" });
    } catch (err) {
      toast({ title: "Error", description: err || "Failed to update store settings", variant: "destructive" });
    } finally {
      setSavingStore(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await dispatch(updateStoreSettings({
        emailNotifications: notificationData.emailNotifications,
        lowStockAlerts: notificationData.lowStockAlerts,
        salesReports: notificationData.salesReports,
        employeeActivity: notificationData.employeeActivity,
        twoFactorAuth: securityData.twoFactorAuth,
        ipRestriction: securityData.ipRestriction,
        passwordExpiry: securityData.passwordExpiry,
        sessionTimeout: securityData.sessionTimeout,
      })).unwrap();
      // Re-fetch store settings to update Redux state
      await dispatch(fetchStoreSettings()).unwrap();
      toast({ title: "Success", description: "Notification & security settings updated successfully" });
    } catch (err) {
      toast({ title: "Error", description: err || "Failed to update settings", variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSavePayment = async () => {
    if (!store?.id) {
      toast({ title: "Error", description: "Store information not found", variant: "destructive" });
      return;
    }
    setSavingStore(true);
    try {
      const apiData = transformSettingsToApiFormat({
        ...storeFormData,
        acceptedPaymentMethods: paymentData.acceptedPaymentMethods.join(','),
      });
      await dispatch(updateStore({ id: store.id, storeData: apiData })).unwrap();
      // Re-fetch store data to update Redux state
      await dispatch(getStoreByAdmin()).unwrap();
      toast({ title: "Success", description: "Payment settings updated successfully" });
    } catch (err) {
      toast({ title: "Error", description: err || "Failed to update payment settings", variant: "destructive" });
    } finally {
      setSavingStore(false);
    }
  };

  const handleSaveAll = async () => {
    setSavingStore(true);
    setSavingSettings(true);
    try {
      if (store?.id) {
        const apiData = transformSettingsToApiFormat({
          ...storeFormData,
          acceptedPaymentMethods: paymentData.acceptedPaymentMethods.join(','),
        });
        await dispatch(updateStore({ id: store.id, storeData: apiData })).unwrap();
      }
      await dispatch(updateStoreSettings({
        emailNotifications: notificationData.emailNotifications,
        lowStockAlerts: notificationData.lowStockAlerts,
        salesReports: notificationData.salesReports,
        employeeActivity: notificationData.employeeActivity,
        twoFactorAuth: securityData.twoFactorAuth,
        ipRestriction: securityData.ipRestriction,
        passwordExpiry: securityData.passwordExpiry,
        sessionTimeout: securityData.sessionTimeout,
      })).unwrap();
      // Re-fetch both to ensure Redux state is updated
      if (store?.id) {
        await dispatch(getStoreByAdmin()).unwrap();
      }
      await dispatch(fetchStoreSettings()).unwrap();
      toast({ title: "Success", description: "All settings saved successfully" });
    } catch (err) {
      toast({ title: "Error", description: err || "Failed to save settings", variant: "destructive" });
    } finally {
      setSavingStore(false);
      setSavingSettings(false);
    }
  };

  const loading = storeLoading || settingsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Configure your store's preferences and system options
        </p>
      </div>

      <Tabs defaultValue="store-settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <SettingsTabTrigger value="store-settings">
            <Store className="w-4 h-4" />
            <span className="hidden md:inline">Store</span>
          </SettingsTabTrigger>
          <SettingsTabTrigger value="notification-settings">
            <Bell className="w-4 h-4" />
            <span className="hidden md:inline">Notifications</span>
          </SettingsTabTrigger>
          <SettingsTabTrigger value="security-settings">
            <Shield className="w-4 h-4" />
            <span className="hidden md:inline">Security</span>
          </SettingsTabTrigger>
          <SettingsTabTrigger value="payment-settings">
            <CreditCard className="w-4 h-4" />
            <span className="hidden md:inline">Payments</span>
          </SettingsTabTrigger>
          <SettingsTabTrigger value="system-settings">
            <Database className="w-4 h-4" />
            <span className="hidden md:inline">System</span>
          </SettingsTabTrigger>
          <SettingsTabTrigger value="help">
            <HelpCircle className="w-4 h-4" />
            <span className="hidden md:inline">Help</span>
          </SettingsTabTrigger>
        </TabsList>

        <TabsContent value="store-settings">
          <StoreSettingsForm
            initialValues={storeFormData}
            onSubmit={handleSaveStore}
            isSubmitting={savingStore || loading}
            storeId={store?.id}
            onChange={(name, value) => setStoreFormData(prev => ({ ...prev, [name]: value }))}
          />
        </TabsContent>

        <TabsContent value="notification-settings">
          <NotificationSettingsForm
            settings={notificationData}
            onChange={(name, value) => setNotificationData(prev => ({ ...prev, [name]: value }))}
            onSave={handleSaveSettings}
            isSubmitting={savingSettings}
            isSubscriptionActive={isSubscriptionActive}
          />
        </TabsContent>

        <TabsContent value="security-settings">
          <SecuritySettingsForm
            settings={securityData}
            onChange={(name, value) => setSecurityData(prev => ({ ...prev, [name]: value }))}
            onSave={handleSaveSettings}
            isSubmitting={savingSettings}
            isSubscriptionActive={isSubscriptionActive}
          />
        </TabsContent>

        <TabsContent value="payment-settings">
          <PaymentSettingsForm
            settings={paymentData}
            onChange={(name, value) => setPaymentData(prev => ({ ...prev, [name]: value }))}
            onSave={handleSavePayment}
            isSubmitting={savingStore}
            isSubscriptionActive={isSubscriptionActive}
          />
        </TabsContent>

        <TabsContent value="system-settings">
          <SystemSettingsForm store={store} />
        </TabsContent>

        <TabsContent value="help">
          <HelpSupportForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}