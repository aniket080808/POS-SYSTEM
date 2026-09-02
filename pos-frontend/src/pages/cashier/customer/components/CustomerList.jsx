import React from "react";
import { UserIcon, Loader2 } from "lucide-react";
import CustomerCard from "./CustomerCard";

const CustomerList = ({
  customers = [],
  selectedCustomer,
  onSelectCustomer,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
        <Loader2 className="animate-spin h-6 w-6 mb-2 text-[#B8860B]" />
        <p className="text-xs">Loading customer directory...</p>
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6 space-y-2">
        <UserIcon size={36} className="text-muted-foreground/60" />
        <p className="text-xs font-bold text-foreground">No Customers Found</p>
        <p className="text-[11px] text-muted-foreground">Try a different name or phone query</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="divide-y divide-border/60">
        {customers.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onSelectCustomer={onSelectCustomer}
            selectedCustomer={selectedCustomer}
          />
        ))}
      </div>
    </div>
  );
};

export default CustomerList;
