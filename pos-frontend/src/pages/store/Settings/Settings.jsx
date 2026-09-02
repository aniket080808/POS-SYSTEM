import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStoreByAdmin, updateStore } from "@/Redux Toolkit/features/store/storeThunks";
import { fetchStoreSettings, updateStoreSettings } from "@/Redux Toolkit/features/storeSettings/storeSettingsThunks";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Bell, Shield, CreditCard, Database, HelpCircle, Save, Loader2 } from "lucide-react";
import StoreSettingsForm from "./components/StoreSettingsForm";
import NotificationSettingsForm from "./components/NotificationSettings";
import SecuritySettingsForm from "./components/SecuritySettings";
import PaymentSettingsForm from "./components/PaymentSettings";
import SystemSettingsForm from "./components/SystemSettings";
import HelpSupportForm from "./components/HelpSupport";
import { getInitialValues } from "./components/formUtils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Settings() {
  const dispatch = useDispatch();
  const { store, loading: storeLoading } = useSelector((state) => state.store);
  const { settings: storeSettings, loading: settingsLoading } = useSelector((state) => state.storeSettings);
  const { statusResponse } = useSelector((state) => state.storeSubscription);
  const { userProfile } = useSelector((state) => state.user);

  const regStatus = statusResponse?.registrationStatus || store?.status || "PENDING";
  const subStatus = statusResponse?.subscriptionStatus || "NONE";
  const isSubscriptionActive = regStatus === "ACTIVE" && subStatus === "ACTIVE";

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
    acceptedPaymentMethods: ["cash", "upi", "card"],
    upiId: "",
    merchantName: "",
  });

  const [savingStore, setSavingStore] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (!store?.id) {
      dispatch(getStoreByAdmin())
        .unwrap()
        .catch((err) => {
          toast({ title: "Error", description: err || "Failed to fetch store data", variant: "destructive" });
        });
    }
    dispatch(fetchStoreSettings());
  }, [dispatch, store?.id]);

  useEffect(() => {
    if (store) {
      setStoreFormData(getInitialValues(store));
      setPaymentData({
        acceptedPaymentMethods: typeof store.acceptedPaymentMethods === "string"
          ? store.acceptedPaymentMethods.split(",").map((s) => s.trim().toLowerCase())
          : (store.acceptedPaymentMethods || ["cash", "upi", "card"]),
        upiId: store.upiId || "",
        merchantName: store.merchantName || store.brand || "",
      });
    }
  }, [store]);

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
        passwordExpiry: storeSettings.passwordExpiry || 90,
        sessionTimeout: storeSettings.sessionTimeout || 30,
      });
    }
  }, [storeSettings]);

  const handleStoreSubmit = async (values, { setSubmitting }) => {
    setSavingStore(true);
    try {
      if (store?.id) {
        await dispatch(updateStore({ id: store.id, storeData: values })).unwrap();
        toast({ title: "Profile Saved", description: "Store settings successfully updated." });
      }
    } catch (err) {
      toast({ title: "Update Failed", description: err || "Failed to update store settings.", variant: "destructive" });
    } finally {
      setSavingStore(false);
      setSubmitting(false);
    }
  };

  const handlePaymentSubmit = async () => {
    setSavingSettings(true);
    try {
      if (store?.id) {
        const payload = {
          ...store,
          acceptedPaymentMethods: Array.isArray(paymentData.acceptedPaymentMethods)
            ? paymentData.acceptedPaymentMethods.join(",")
            : paymentData.acceptedPaymentMethods,
          upiId: paymentData.upiId || "",
          merchantName: paymentData.merchantName || "",
        };
        await dispatch(updateStore({ id: store.id, storeData: payload })).unwrap();
        toast({ title: "Payment Preferences Saved", description: "Accepted payment methods and UPI details updated." });
      }
    } catch (err) {
      toast({ title: "Save Error", description: err || "Failed to update payment preferences.", variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleNotificationSubmit = async () => {
    setSavingSettings(true);
    try {
      const payload = {
        ...notificationData,
        twoFactorAuth: securityData.twoFactorAuth,
        ipRestriction: securityData.ipRestriction,
        passwordExpiry: securityData.passwordExpiry || 90,
        sessionTimeout: securityData.sessionTimeout || 30,
      };
      await dispatch(updateStoreSettings(payload)).unwrap();
      toast({ title: "Preferences Saved", description: "Operational alert rules updated." });
    } catch (err) {
      toast({ title: "Save Error", description: err || "Failed to update alert rules.", variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSecuritySubmit = async () => {
    setSavingSettings(true);
    try {
      const payload = {
        ...notificationData,
        ...securityData,
        passwordExpiry: securityData.passwordExpiry || 90,
        sessionTimeout: securityData.sessionTimeout || 30,
      };
      await dispatch(updateStoreSettings(payload)).unwrap();
      toast({ title: "Security Policies Saved", description: "Staff access & security policies updated." });
    } catch (err) {
      toast({ title: "Save Error", description: err || "Failed to update security policies.", variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Store Configuration & Operational Preferences
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage merchant branding, POS payment gateways, automated alerts, and staff security rules
        </p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="bg-secondary p-1 rounded-xl grid grid-cols-2 sm:grid-cols-6 max-w-4xl">
          <TabsTrigger value="store" className="flex items-center gap-1.5 text-xs font-bold">
            <Store className="w-3.5 h-3.5" /> Store Info
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5 text-xs font-bold">
            <Bell className="w-3.5 h-3.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1.5 text-xs font-bold">
            <Shield className="w-3.5 h-3.5" /> Security
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-1.5 text-xs font-bold">
            <CreditCard className="w-3.5 h-3.5" /> Payments
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-1.5 text-xs font-bold">
            <Database className="w-3.5 h-3.5" /> Preferences
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-1.5 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" /> Helpdesk
          </TabsTrigger>
        </TabsList>

        {/* Store Settings Form */}
        <TabsContent value="store" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="w-4 h-4 text-[#B8860B]" /> Business Profile & Legal Identity
              </CardTitle>
              <CardDescription className="text-xs">
                Business address, tax registration, and primary operating credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <StoreSettingsForm
                initialValues={storeFormData}
                onSubmit={handleStoreSubmit}
                isSubmitting={savingStore}
                storeId={store?.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#B8860B]" /> Operational Alert Rules
              </CardTitle>
              <CardDescription className="text-xs">
                Email and in-app triggers for low stock thresholds and cashier shift reports
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <NotificationSettingsForm
                data={notificationData}
                onChange={setNotificationData}
                onSave={handleNotificationSubmit}
                isSaving={savingSettings}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#B8860B]" /> Staff Access & Session Security
              </CardTitle>
              <CardDescription className="text-xs">
                Workstation timeout limits and authentication policies for cashier terminals
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <SecuritySettingsForm
                data={securityData}
                onChange={setSecurityData}
                onSave={handleSecuritySubmit}
                isSaving={savingSettings}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Settings */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#B8860B]" /> Cashier Checkout & Payment Methods
              </CardTitle>
              <CardDescription className="text-xs">
                Configure accepted payment types (Cash, Dynamic UPI QR, Card Terminal)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <PaymentSettingsForm
                data={paymentData}
                onChange={setPaymentData}
                onSave={handlePaymentSubmit}
                isSaving={savingSettings}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-[#B8860B]" /> Regional Formats & Locale Preferences
              </CardTitle>
              <CardDescription className="text-xs">
                Currency symbol, timezone, and fiscal calendar settings
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <SystemSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Help & Support */}
        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#B8860B]" /> Support & Documentation
              </CardTitle>
              <CardDescription className="text-xs">
                Get assistance with terminal setup, barcode scanners, and cashier shift management
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <HelpSupportForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}