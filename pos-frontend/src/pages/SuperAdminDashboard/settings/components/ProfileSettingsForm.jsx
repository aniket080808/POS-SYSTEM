import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Save, Loader2, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileInput = ({ id, label, value, onChange, disabled, readOnly }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-sm font-semibold text-foreground">{label}</Label>
    {disabled ? (
      <Skeleton className="h-10 w-full rounded-xl" />
    ) : (
      <Input
        id={id}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        className={`text-xs h-10 ${readOnly ? "bg-secondary/60 text-muted-foreground" : "bg-card"}`}
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
    <Card>
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="w-4 h-4 text-[#B8860B]" /> Super Admin Profile Details
        </CardTitle>
        <CardDescription className="text-xs">
          Personal identification and contact details associated with the primary root administrator
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileInput
            id="fullName"
            label="Full Name"
            value={profileData.fullName}
            onChange={(e) => onFieldChange("fullName", e.target.value)}
            disabled={loading}
          />
          <ProfileInput
            id="email"
            label="Root Email Address (Immutable)"
            value={profileData.email}
            readOnly
            disabled={false}
          />
          <ProfileInput
            id="phone"
            label="Contact Phone Number"
            value={profileData.phone}
            onChange={(e) => onFieldChange("phone", e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="pt-2">
          <Button
            onClick={onUpdate}
            className="text-xs font-bold h-10 gap-1.5"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettingsForm;