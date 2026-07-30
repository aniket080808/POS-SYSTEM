import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Save, Loader2, Clock, AlertTriangle, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SecuritySettingsForm = ({ settings, onChange, onSave, isSubmitting, isSubscriptionActive }) => {
  const [errors, setErrors] = useState({});
  const disabled = !isSubscriptionActive;

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security Settings
        </CardTitle>
        <CardDescription>
          Configure security options for your store
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Two-Factor Authentication - Coming Soon */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                Coming Soon
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
          </div>
          <Switch checked={false} disabled={true} />
        </div>
        <Separator />

        {/* IP Restriction - Coming Soon */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium">IP Restriction</h4>
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                Coming Soon
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Limit access to specific IP addresses</p>
          </div>
          <Switch checked={false} disabled={true} />
        </div>
        <Separator />

        {/* Password Expiry */}
        <div className="space-y-2">
          <Label htmlFor="passwordExpiry" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Password Expiry (days)
          </Label>
          <Input
            id="passwordExpiry"
            type="number"
            min={1}
            max={365}
            value={settings.passwordExpiry}
            onChange={(e) => handleInputChange("passwordExpiry", e.target.value)}
            disabled={disabled}
            className={errors.passwordExpiry ? "border-red-500" : ""}
          />
          {errors.passwordExpiry && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {errors.passwordExpiry}
            </p>
          )}
        </div>

        {/* Session Timeout */}
        <div className="space-y-2">
          <Label htmlFor="sessionTimeout" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Session Timeout (minutes)
          </Label>
          <Input
            id="sessionTimeout"
            type="number"
            min={1}
            max={1440}
            value={settings.sessionTimeout}
            onChange={(e) => handleInputChange("sessionTimeout", e.target.value)}
            disabled={disabled}
            className={errors.sessionTimeout ? "border-red-500" : ""}
          />
          {errors.sessionTimeout && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {errors.sessionTimeout}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            After this period of inactivity, users will be automatically logged out
          </p>
        </div>

        <Button onClick={handleSave} disabled={isSubmitting || disabled} className="flex items-center gap-2">
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save Security Settings</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SecuritySettingsForm;