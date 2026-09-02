import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Save, Loader2, QrCode } from "lucide-react";

const PaymentSettingsForm = ({ data, onChange, onSave, isSaving }) => {
  const paymentMethods = [
    { id: "cash", label: "Cash on Counter", description: "Accept physical cash currency with automated change calculation" },
    { id: "upi", label: "Dynamic UPI QR Code", description: "Generate dynamic UPI QR codes on checkout for instant mobile payment" },
    { id: "card", label: "Card Swiping Terminal", description: "Accept Visa, Mastercard, and RuPay card payments" },
  ];

  const accepted = data?.acceptedPaymentMethods || ["cash", "upi", "card"];

  const handleToggle = (id, checked) => {
    let updated;
    if (checked) {
      updated = [...accepted, id];
    } else {
      updated = accepted.filter((m) => m !== id);
    }
    onChange({ ...data, acceptedPaymentMethods: updated });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Accepted Payment Methods
        </h4>
        {paymentMethods.map((method) => (
          <div key={method.id} className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
            <div>
              <h4 className="text-xs font-bold text-foreground">{method.label}</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">{method.description}</p>
            </div>
            <Switch
              id={method.id}
              checked={accepted.includes(method.id)}
              onCheckedChange={(checked) => handleToggle(method.id, checked)}
            />
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-2 border-t border-border/60">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Merchant UPI Configuration
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="upiId" className="text-sm font-semibold text-foreground">
              Merchant UPI VPA ID
            </Label>
            <Input
              id="upiId"
              value={data?.upiId || ""}
              onChange={(e) => onChange({ ...data, upiId: e.target.value })}
              placeholder="storename@okaxis"
              className="text-xs h-10 font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="merchantName" className="text-sm font-semibold text-foreground">
              Merchant Payee Display Name
            </Label>
            <Input
              id="merchantName"
              value={data?.merchantName || ""}
              onChange={(e) => onChange({ ...data, merchantName: e.target.value })}
              placeholder="e.g. Apex Hypermarket Retail"
              className="text-xs h-10"
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button onClick={onSave} disabled={isSaving} className="text-xs font-bold h-10 gap-1.5">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Payment Preferences
        </Button>
      </div>
    </div>
  );
};

export default PaymentSettingsForm;