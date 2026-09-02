import React from "react";
import { Info, Database, ShieldCheck } from "lucide-react";
import { useSelector } from "react-redux";
import { useDateFormatter } from "@/utils/dateUtils";

const SystemSettingsForm = () => {
  const { store } = useSelector((state) => state.store);
  const { formatDate } = useDateFormatter();

  const storeInfo = [
    { label: "Merchant Store ID", value: `#${store?.id || "N/A"}` },
    { label: "Registered Brand", value: store?.brand || store?.name || "N/A" },
    { label: "Retail Category", value: store?.storeType || "Retail Store" },
    { label: "Account Status", value: store?.status || "ACTIVE" },
    { label: "Enrolled On", value: store?.createdAt ? formatDate(store.createdAt) : "N/A" },
    { label: "Last Profile Sync", value: store?.updatedAt ? formatDate(store.updatedAt) : "N/A" },
    { label: "GST Identification", value: store?.gstNumber || "Not configured" },
    { label: "PAN Card Number", value: store?.panNumber || "Not configured" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {storeInfo.map((item) => (
          <div key={item.label} className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
            <p className="text-sm font-bold text-foreground mt-1 font-mono">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#B8860B] shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <p className="font-bold text-foreground mb-0.5">Platform Policy Compliance</p>
          <p>
            This tenant account operates under POS Centralized Multi-Tenant Architecture. Platform policies such as maintenance windows and transaction commission rates are governed by Super Admin console.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsForm;