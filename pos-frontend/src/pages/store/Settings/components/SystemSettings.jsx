import React from "react";
import { Badge } from "@/components/ui/badge";
import { Database, Info } from "lucide-react";

const SystemSettingsForm = ({ store }) => {
  const storeInfo = [
    { label: "Merchant Store ID", value: store?.id || "N/A" },
    { label: "Brand Name", value: store?.brand || "N/A" },
    { label: "Store Category", value: store?.storeType || "Retail Store" },
    { label: "Registration Status", value: store?.status || "N/A" },
    { label: "Registered Date", value: store?.createdAt ? new Date(store.createdAt).toLocaleDateString() : "N/A" },
    { label: "Last System Sync", value: store?.updatedAt ? new Date(store.updatedAt).toLocaleDateString() : "N/A" },
    { label: "GSTIN Number", value: store?.gstNumber || "Not configured" },
    { label: "PAN Number", value: store?.panNumber || "Not configured" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">System Metadata & Compliance</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Core tenant identification parameters and platform verification status.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/20 border border-border/60">
          {storeInfo.map((item) => (
            <div key={item.label} className="p-2.5 rounded-xl bg-card border border-border/40 space-y-1">
              <p className="text-[11px] font-semibold text-muted-foreground">{item.label}</p>
              <p className="text-xs font-mono font-bold text-foreground truncate">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3.5 bg-muted/40 border border-border/60 rounded-2xl flex items-start gap-3 text-xs text-muted-foreground">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Platform Tenant Isolation</p>
            <p className="text-[11px] mt-0.5">This workspace is encrypted and partitioned on the NexPOS cloud runtime. Super Administrator approval is required for business entity changes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsForm;