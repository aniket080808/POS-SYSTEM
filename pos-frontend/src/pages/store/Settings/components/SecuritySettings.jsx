import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Save, Loader2, Clock } from "lucide-react";

const SecuritySettingsForm = ({ data, onChange, onSave, isSaving }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Workstation Session Security
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="sessionTimeout" className="text-sm font-semibold text-foreground">
              Terminal Idle Timeout (Minutes)
            </Label>
            <Input
              id="sessionTimeout"
              type="number"
              min="5"
              max="480"
              value={data?.sessionTimeout || 30}
              onChange={(e) => onChange({ ...data, sessionTimeout: Number(e.target.value) })}
              className="text-xs h-10 font-mono"
            />
            <p className="text-[11px] text-muted-foreground">Auto-locks cashier terminal after inactivity</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="passwordExpiry" className="text-sm font-semibold text-foreground">
              Staff Password Rotation (Days)
            </Label>
            <Input
              id="passwordExpiry"
              type="number"
              min="30"
              max="365"
              value={data?.passwordExpiry || 90}
              onChange={(e) => onChange({ ...data, passwordExpiry: Number(e.target.value) })}
              className="text-xs h-10 font-mono"
            />
            <p className="text-[11px] text-muted-foreground">Requires employees to change PIN periodically</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-border/60">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Authentication Safeguards
        </h4>
        <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
          <div>
            <h4 className="text-xs font-bold text-foreground">Two-Factor Authentication for Store Admins</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">Require OTP verification when accessing store backoffice from new devices</p>
          </div>
          <Switch
            checked={!!data?.twoFactorAuth}
            onCheckedChange={(checked) => onChange({ ...data, twoFactorAuth: checked })}
          />
        </div>
      </div>

      <div className="pt-2">
        <Button onClick={onSave} disabled={isSaving} className="text-xs font-bold h-10 gap-1.5">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Security Policies
        </Button>
      </div>
    </div>
  );
};

export default SecuritySettingsForm;