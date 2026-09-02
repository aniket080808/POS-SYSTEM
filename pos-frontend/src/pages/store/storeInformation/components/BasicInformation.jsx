import React from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const BasicInformation = ({ storeData }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">General Information</h3>
      <div className="space-y-3">
        <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Brand / Store Name</Label>
          <p className="text-sm font-bold text-foreground mt-0.5">{storeData?.brand || storeData?.name || "N/A"}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Business Vertical</Label>
          <div className="mt-1">
            <Badge variant="secondary" className="text-xs font-bold">
              {storeData?.storeType || "Retail Store"}
            </Badge>
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Store Description</Label>
          <p className="text-xs text-foreground/90 mt-0.5 leading-relaxed">{storeData?.description || "No description provided."}</p>
        </div>
      </div>
    </div>
  );
};

export default BasicInformation;