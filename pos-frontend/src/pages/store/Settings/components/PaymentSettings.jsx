import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Save, Loader2, QrCode } from "lucide-react";

const PaymentSettingsForm = ({ settings, onChange, onSave, isSubmitting, isSubscriptionActive }) => {
  const paymentMethods = [
    { id: "cash", label: "Cash on Counter", description: "Accept paper currency and physical cash transactions at POS terminals" },
    { id: "upi", label: "UPI & Instant QR", description: "Dynamic UPI QR code payments (Google Pay, PhonePe, Paytm, BHIM)" },
    { id: "card", label: "Debit & Credit Card", description: "Integrated chip, swipe, and NFC contactless card terminals" },
  ];

  const disabled = !isSubscriptionActive;

  const isChecked = (methodId) => {
    return (settings.acceptedPaymentMethods || []).includes(methodId);
  };

  const handleToggle = (methodId, checked) => {
    const currentMethods = settings.acceptedPaymentMethods || [];
    let updatedMethods;
    if (checked) {
      updatedMethods = [...currentMethods, methodId];
    } else {
      updatedMethods = currentMethods.filter((method) => method !== methodId);
    }
    onChange("acceptedPaymentMethods", updatedMethods);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Accepted Terminal Payment Methods</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Choose which tender types are available on Cashier POS checkout screens.
        </p>
        <div className="divide-y divide-border/60 border border-border/60 rounded-2xl p-4 bg-muted/20">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between py-3">
              <div>
                <h4 className="text-xs font-semibold text-foreground">{method.label}</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">{method.description}</p>
              </div>
              <Switch
                id={method.id}
                checked={isChecked(method.id)}
                onCheckedChange={(checked) => handleToggle(method.id, checked)}
                disabled={disabled}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Payment Gateway Configuration */}
      <div className="pt-2 border-t border-border/60">
        <div className="flex items-center gap-2 mb-1">
          <QrCode className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">UPI VPA & Merchant Credentials</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Configure default UPI Virtual Payment Address used for terminal dynamic QR generation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="upiId" className="text-xs font-semibold text-foreground">Merchant UPI ID (VPA)</Label>
            <Input
              id="upiId"
              placeholder="e.g. storename@upi or 9876543210@paytm"
              value={settings.upiId || ""}
              onChange={(e) => onChange("upiId", e.target.value)}
              disabled={disabled}
              className="h-9 rounded-xl text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="merchantName" className="text-xs font-semibold text-foreground">Merchant Display Name</Label>
            <Input
              id="merchantName"
              placeholder="e.g. NexPOS Merchant Store"
              value={settings.merchantName || ""}
              onChange={(e) => onChange("merchantName", e.target.value)}
              disabled={disabled}
              className="h-9 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="pt-5 flex justify-end">
          <Button onClick={onSave} disabled={isSubmitting || disabled} size="sm" className="rounded-xl text-xs font-semibold h-9 gap-1.5">
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Payment Settings</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettingsForm;