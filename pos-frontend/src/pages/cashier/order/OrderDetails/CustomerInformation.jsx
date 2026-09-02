import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

const CustomerInformation = ({ selectedOrder }) => {
  const isWalkIn = !selectedOrder.customer || !selectedOrder.customer.fullName;

  return (
    <Card className="h-full border-border shadow-2xs">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-center border-b border-border pb-2">
          <h3 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#B8860B]" />
            Billed Customer
          </h3>
          {isWalkIn && <Badge variant="secondary" className="text-[10px]">Walk-in</Badge>}
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Customer Name:</span>
            <span className="text-xs font-bold text-foreground">
              {selectedOrder.customer?.fullName || "Walk-in Guest"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Phone Number:</span>
            <span className="text-xs font-mono">{selectedOrder.customer?.phone || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Email Account:</span>
            <span className="text-xs truncate max-w-[150px]">{selectedOrder.customer?.email || "—"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerInformation;