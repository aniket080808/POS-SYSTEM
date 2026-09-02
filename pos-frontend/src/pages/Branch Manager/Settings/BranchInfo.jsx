import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { useSelector, useDispatch } from "react-redux";
import { updateBranch } from "../../../Redux Toolkit/features/branch/branchThunks";
import { Input } from "@/components/ui/input";
import { Phone, Mail, Clock, Save, Loader2, Store } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import { Checkbox } from "../../../components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

const DAYS = [
  { label: "Monday", value: "MONDAY" },
  { label: "Tuesday", value: "TUESDAY" },
  { label: "Wednesday", value: "WEDNESDAY" },
  { label: "Thursday", value: "THURSDAY" },
  { label: "Friday", value: "FRIDAY" },
  { label: "Saturday", value: "SATURDAY" },
  { label: "Sunday", value: "SUNDAY" },
];

const BranchInfo = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { branch } = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);

  const activeBranchId = branch?.id || userProfile?.branchId || userProfile?.branch?.id;

  const [saving, setSaving] = useState(false);
  const [branchInfo, setBranchInfo] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    openTime: "",
    closeTime: "",
    workingDays: [],
  });

  useEffect(() => {
    if (branch) {
      setBranchInfo({
        name: branch.name || "",
        address: branch.address || "",
        phone: branch.phone || "",
        email: branch.email || "",
        openTime: branch.openTime || "",
        closeTime: branch.closeTime || "",
        workingDays: Array.isArray(branch.workingDays)
          ? branch.workingDays.map((d) => String(d).toUpperCase())
          : [],
      });
    }
  }, [branch]);

  const handleBranchInfoChange = (field, value) => {
    setBranchInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = async () => {
    if (!activeBranchId) {
      toast({
        title: "Error",
        description: "Branch ID could not be identified.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      await dispatch(
        updateBranch({
          id: activeBranchId,
          dto: branchInfo,
          jwt: localStorage.getItem("jwt"),
        })
      ).unwrap();
      toast({
        title: "Workstation Settings Saved",
        description: "Branch details and trading schedule updated successfully.",
      });
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err || "Failed to update branch settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border shadow-2xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-base flex items-center gap-2">
          <Store className="w-4 h-4 text-[#B8860B]" />
          Workstation Details & Trading Schedule
        </CardTitle>
        <CardDescription className="text-xs">
          Branch location metadata, contact channels, and operating hours
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="branch-name" className="text-sm font-semibold text-foreground mb-1.5 block">
                Branch Location Name
              </label>
              <Input
                id="branch-name"
                value={branchInfo.name}
                onChange={(e) => handleBranchInfoChange("name", e.target.value)}
                className="text-xs h-10"
              />
            </div>
            <div>
              <label htmlFor="branch-address" className="text-sm font-semibold text-foreground mb-1.5 block">
                Physical Workstation Address
              </label>
              <Input
                id="branch-address"
                value={branchInfo.address}
                onChange={(e) => handleBranchInfoChange("address", e.target.value)}
                className="text-xs h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="branch-phone" className="text-sm font-semibold text-foreground mb-1.5 block">
                Direct Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="branch-phone"
                  value={branchInfo.phone}
                  onChange={(e) => handleBranchInfoChange("phone", e.target.value)}
                  className="pl-9 text-xs h-10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="branch-email" className="text-sm font-semibold text-foreground mb-1.5 block">
                Branch Station Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="branch-email"
                  type="email"
                  value={branchInfo.email}
                  onChange={(e) => handleBranchInfoChange("email", e.target.value)}
                  className="pl-9 text-xs h-10"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-border/60" />

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Trading Hours & Days</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="opening-time" className="text-sm font-semibold text-foreground mb-1.5 block">
                Daily Opening Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="opening-time"
                  type="time"
                  value={branchInfo.openTime}
                  onChange={(e) => handleBranchInfoChange("openTime", e.target.value)}
                  className="pl-9 text-xs h-10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="closing-time" className="text-sm font-semibold text-foreground mb-1.5 block">
                Daily Closing Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="closing-time"
                  type="time"
                  value={branchInfo.closeTime}
                  onChange={(e) => handleBranchInfoChange("closeTime", e.target.value)}
                  className="pl-9 text-xs h-10"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Active Operating Days
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
              {DAYS.map((day) => (
                <label
                  key={day.value}
                  htmlFor={`day-${day.value}`}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-secondary/20 cursor-pointer hover:bg-secondary/40 transition-colors"
                >
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={branchInfo.workingDays.includes(day.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleBranchInfoChange("workingDays", [...branchInfo.workingDays, day.value]);
                      } else {
                        handleBranchInfoChange(
                          "workingDays",
                          branchInfo.workingDays.filter((d) => d !== day.value)
                        );
                      }
                    }}
                  />
                  <span className="text-xs font-medium text-foreground">{day.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-border/60">
          <Button
            className="text-xs font-bold h-10 gap-1.5"
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {saving ? "Saving Changes..." : "Save Workstation Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BranchInfo;
