import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CreditCard, Save, Loader2 } from "lucide-react";

const PaymentSettingsForm = ({ settings, onChange, onSave, isSubmitting, isSubscriptionActive }) => {
  const paymentMethods = [
    { id: "cash", label: "Cash", description: "Accept cash payments at the counter" },
    { id: "upi", label: "UPI", description: "Accept UPI payments (Google Pay, PhonePe, Paytm, etc.)" },
    { id: "card", label: "Card", description: "Accept credit and debit card payments" },
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Accepted Payment Methods
        </CardTitle>
        <CardDescription>
          Choose which payment methods your store accepts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {paymentMethods.map((method, index) => (
          <React.Fragment key={method.id}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{method.label}</h4>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </div>
              <Switch
                id={method.id}
                checked={isChecked(method.id)}
                onCheckedChange={(checked) => handleToggle(method.id, checked)}
                disabled={disabled}
              />
            </div>
            {index < paymentMethods.length - 1 && <Separator />}
          </React.Fragment>
        ))}
        <Button onClick={onSave} disabled={isSubmitting || disabled} className="flex items-center gap-2">
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save Payment Settings</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentSettingsForm;