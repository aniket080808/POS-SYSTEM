import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "../../../../utils/formateDate";
import { Clock, User } from "lucide-react";

const ShiftInformationCard = ({ shiftData }) => {
  return (
    <Card className="border-border shadow-2xs">
      <CardContent className="p-5 space-y-3">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/60 pb-2.5">
          <Clock className="w-3.5 h-3.5 text-[#B8860B]" />
          Shift Session Metadata
        </h2>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Logged Cashier:</span>
            <span className="font-bold text-foreground">{shiftData.cashier?.fullName || "Cashier"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shift Commenced:</span>
            <span className="font-mono text-foreground">{formatDateTime(shiftData.shiftStart)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shift Status:</span>
            <span className="font-bold text-[#B8860B] uppercase font-mono">
              {shiftData.shiftEnd ? formatDateTime(shiftData.shiftEnd) : "Active / Open Till"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftInformationCard;