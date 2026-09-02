import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Eye, EyeOff, ShieldCheck } from "lucide-react";

const PasswordInput = ({ id, label, value, onChange, show, onToggle }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-sm font-semibold text-foreground">{label}</Label>
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value || ""}
        onChange={onChange}
        className="text-xs h-10 pr-10 bg-card"
        placeholder="••••••••"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-10 w-10 hover:bg-transparent text-muted-foreground"
        onClick={onToggle}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </Button>
    </div>
  </div>
);

const SecuritySettingsForm = ({
  passwordData,
  showPasswords,
  onPasswordChange,
  onShowPasswordToggle,
  onUpdate,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-base flex items-center gap-2">
          <Key className="w-4 h-4 text-[#B8860B]" /> Security & Master Password Authentication
        </CardTitle>
        <CardDescription className="text-xs">
          Update the root administrator password used for dashboard access
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 max-w-md">
        <PasswordInput
          id="current-password"
          label="Current Password"
          value={passwordData.currentPassword}
          onChange={(e) => onPasswordChange("currentPassword", e.target.value)}
          show={showPasswords.current}
          onToggle={() => onShowPasswordToggle("current")}
        />
        <PasswordInput
          id="new-password"
          label="New Master Password"
          value={passwordData.newPassword}
          onChange={(e) => onPasswordChange("newPassword", e.target.value)}
          show={showPasswords.new}
          onToggle={() => onShowPasswordToggle("new")}
        />
        <PasswordInput
          id="confirm-password"
          label="Confirm New Master Password"
          value={passwordData.confirmPassword}
          onChange={(e) => onPasswordChange("confirmPassword", e.target.value)}
          show={showPasswords.confirm}
          onToggle={() => onShowPasswordToggle("confirm")}
        />
        <div className="pt-2">
          <Button onClick={onUpdate} className="text-xs font-bold h-10 gap-1.5 w-full">
            <ShieldCheck className="w-4 h-4" /> Update Master Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettingsForm;