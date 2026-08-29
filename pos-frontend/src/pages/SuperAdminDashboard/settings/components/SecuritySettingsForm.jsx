import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Eye, EyeOff, ShieldCheck } from "lucide-react";

const PasswordInput = ({ id, label, value, onChange, show, onToggle }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-xs font-semibold text-foreground">{label}</Label>
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="h-9 rounded-xl text-xs pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-transparent"
        onClick={onToggle}
      >
        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
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
    <Card className="rounded-2xl border-border/80 shadow-2xs">
      <CardHeader className="pb-4 border-b border-border/60">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          <span>Security & Authentication</span>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Update your platform administrator master account password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-5 max-w-md">
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
          label="New Password"
          value={passwordData.newPassword}
          onChange={(e) => onPasswordChange("newPassword", e.target.value)}
          show={showPasswords.new}
          onToggle={() => onShowPasswordToggle("new")}
        />
        <PasswordInput
          id="confirm-password"
          label="Confirm New Password"
          value={passwordData.confirmPassword}
          onChange={(e) => onPasswordChange("confirmPassword", e.target.value)}
          show={showPasswords.confirm}
          onToggle={() => onShowPasswordToggle("confirm")}
        />
        <Button onClick={onUpdate} size="sm" className="flex items-center gap-1.5 rounded-xl text-xs font-semibold h-9 mt-2">
          <Key className="w-3.5 h-3.5" />
          <span>Update Password</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default SecuritySettingsForm;
 