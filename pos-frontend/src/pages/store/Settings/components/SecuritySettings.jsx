import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Save, Loader2, Clock, AlertTriangle, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SecuritySettingsForm = ({ settings, onChange, onSave, isSubmitting, isSubscriptionActive, isReadOnly }) => {
  const [errors, setErrors] = useState({});
  const disabled = !isSubscriptionActive || isReadOnly;

  const validate = () => {
    const newErrors = {};
    if (settings.passwordExpiry < 1) {
      newErrors.passwordExpiry = "Must be at least 1 day";
    }
    if (settings.passwordExpiry > 365) {
      newErrors.passwordExpiry = "Cannot exceed 365 days";
    }
    if (settings.sessionTimeout < 1) {
      newErrors.sessionTimeout = "Must be at least 1 minute";
    }
    if (settings.sessionTimeout > 1440) {
      newErrors.sessionTimeout = "Cannot exceed 1440 minutes (24 hours)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave();
    }
  };

  const handleInputChange = (name, value) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      onChange(name, numValue);
    } else if (value === "") {
      onChange(name, 0);
    }
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Access & Authentication Policies</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Enforce password rotations, terminal inactivity timeouts, and session limits.
        </p>

        {isReadOnly && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold mb-4">
            <Lock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span>Security policy is read-only for Store Managers. Store Admin privileges required.</span>
          </div>
        )}

        <div className="divide-y divide-border/60 border border-border/60 rounded-2xl p-4 bg-muted/20 space-y-3">
          {/* Two-Factor Authentication - Coming Soon */}
          <div className="flex items-center justify-between opacity-60 pt-1">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-foreground">Multi-Factor Authentication (MFA)</h4>
                <Badge variant="outline" className="text-[10px] font-semibold">Coming Soon</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Require OTP verification for cashier login</p>
            </div>
            <Switch checked={false} disabled={true} />
          </div>

          {/* IP Restriction - Coming Soon */}
          <div className="flex items-center justify-between opacity-60 pt-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-foreground">Terminal IP Allowlist</h4>
                <Badge variant="outline" className="text-[10px] font-semibold">Coming Soon</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Restrict POS login strictly to in-store Wi-Fi network IPs</p>
            </div>
            <Switch checked={false} disabled={true} />
          </div>
        </div>
      </div>

      {/* Numeric Policy Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
        <div className="space-y-1.5">
          <Label htmlFor="passwordExpiry" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            Password Expiry Cycle (Days)
          </Label>
          <Input
            id="passwordExpiry"
            type="number"
            min={1}
            max={365}
            value={settings.passwordExpiry}
            onChange={(e) => handleInputChange("passwordExpiry", e.target.value)}
            disabled={disabled}
            className={`h-9 rounded-xl text-xs ${errors.passwordExpiry ? "border-destructive" : ""}`}
          />
          {errors.passwordExpiry && (
            <p className="text-[11px] text-destructive flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {errors.passwordExpiry}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sessionTimeout" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            Terminal Inactivity Timeout (Minutes)
          </Label>
          <Input
            id="sessionTimeout"
            type="number"
            min={1}
            max={1440}
            value={settings.sessionTimeout}
            onChange={(e) => handleInputChange("sessionTimeout", e.target.value)}
            disabled={disabled}
            className={`h-9 rounded-xl text-xs ${errors.sessionTimeout ? "border-destructive" : ""}`}
          />
          {errors.sessionTimeout && (
            <p className="text-[11px] text-destructive flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {errors.sessionTimeout}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={isSubmitting || disabled} size="sm" className="rounded-xl text-xs font-semibold h-9 gap-1.5">
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Security Policy</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SecuritySettingsForm;