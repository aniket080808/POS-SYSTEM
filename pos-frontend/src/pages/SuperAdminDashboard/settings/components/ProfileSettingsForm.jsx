import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Save, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileInput = ({ id, label, value, onChange, disabled, readOnly }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-xs font-semibold text-foreground">{label}</Label>
    {disabled ? (
      <Skeleton className="h-9 w-full rounded-xl" />
    ) : (
      <Input
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        className={`h-9 rounded-xl text-xs ${readOnly ? "bg-muted/40 text-muted-foreground font-mono" : ""}`}
      />
    )}
  </div>
);

const ProfileSettingsForm = ({
  profileData,
  onUpdate,
  onFieldChange,
  loading,
}) => {
  return (
    <Card className="rounded-2xl border-border/80 shadow-2xs">
      <CardHeader className="pb-4 border-b border-border/60">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <span>Profile Information</span>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Update your platform administrator account credentials and contact details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProfileInput
            id="fullName"
            label="Full Name"
            value={profileData.fullName}
            onChange={(e) => onFieldChange("fullName", e.target.value)}
            disabled={loading}
          />
          <ProfileInput
            id="email"
            label="Email Address (Permanent ID)"
            value={profileData.email}
            readOnly
            disabled={false}
          />
          <ProfileInput
            id="phone"
            label="Contact Phone"
            value={profileData.phone}
            onChange={(e) => onFieldChange("phone", e.target.value)}
            disabled={loading}
          />
        </div>
        <Button
          onClick={onUpdate}
          size="sm"
          className="flex items-center gap-1.5 rounded-xl text-xs font-semibold h-9"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile Changes</span>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileSettingsForm;
 