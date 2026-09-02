import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { Label } from "@/components/ui/label";

const ContactInformation = ({ storeData }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact & Location</h3>
      <div className="space-y-3">
        <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <MapPin className="h-3.5 w-3.5 text-[#B8860B]" />
            <span>Store Premises Address</span>
          </div>
          <p className="text-xs text-foreground mt-1 leading-relaxed">{storeData?.contact?.address || storeData?.address || "No address provided"}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <Phone className="h-3.5 w-3.5 text-[#B8860B]" />
            <span>Contact Phone</span>
          </div>
          <p className="text-xs font-mono font-bold text-foreground mt-1">{storeData?.contact?.phone || storeData?.phone || "No phone provided"}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <Mail className="h-3.5 w-3.5 text-[#B8860B]" />
            <span>Official Email</span>
          </div>
          <p className="text-xs font-bold text-foreground mt-1">{storeData?.contact?.email || storeData?.email || "No email provided"}</p>
        </div>
      </div>
    </div>
  );
};

export default ContactInformation;