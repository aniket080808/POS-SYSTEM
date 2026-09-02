import React from "react";
import { StarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CustomerCard = ({ customer, onSelectCustomer, selectedCustomer }) => {
  const isSelected = selectedCustomer?.id === customer.id;

  return (
    <div 
      key={customer.id} 
      className={`p-3.5 cursor-pointer transition-colors border-b border-border/60 ${
        isSelected ? "bg-secondary/70 border-l-4 border-l-[#C9A227]" : "hover:bg-secondary/30"
      }`}
      onClick={() => onSelectCustomer(customer)}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-bold text-xs text-foreground">{customer.fullName || "Guest Customer"}</h3>
          <p className="text-[11px] text-muted-foreground font-mono">{customer.phone || "—"}</p>
          <p className="text-[10px] text-muted-foreground truncate max-w-[170px]">{customer.email || "—"}</p>
        </div>
        <Badge variant="warning" className="flex items-center gap-1 text-[10px] px-2 py-0.5 font-mono font-bold">
          <StarIcon className="h-3 w-3 text-[#B8860B]" />
          {customer.loyaltyPoints || 0} pts
        </Badge>
      </div>
    </div>
  );
};

export default CustomerCard;