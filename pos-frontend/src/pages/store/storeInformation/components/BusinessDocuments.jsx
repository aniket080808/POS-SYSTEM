import React from "react";
import { FileText, ShieldCheck } from "lucide-react";
import { Label } from "@/components/ui/label";

const BusinessDocuments = ({ storeData }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tax & Legal Registration</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5 text-[#B8860B]" />
            <span>GST Number</span>
          </div>
          <p className="text-xs font-mono font-bold text-foreground mt-1">{storeData?.gstNumber || "Not provided"}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5 text-[#B8860B]" />
            <span>PAN Number</span>
          </div>
          <p className="text-xs font-mono font-bold text-foreground mt-1">{storeData?.panNumber || "Not provided"}</p>
        </div>
      </div>
    </div>
  );
};

export default BusinessDocuments;