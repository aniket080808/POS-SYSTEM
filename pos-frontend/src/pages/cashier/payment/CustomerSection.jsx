import React from "react";
import { useSelector } from "react-redux";
import { selectSelectedCustomer } from "../../../Redux Toolkit/features/cart/cartSlice";
import { User, UserCheck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const CustomerSection = ({ setShowCustomerDialog }) => {
  const selectedCustomer = useSelector(selectSelectedCustomer);

  return (
    <div className="p-3.5 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-[#B8860B]" />
          Customer
        </h3>
        <span className="text-[10px] font-mono font-bold text-muted-foreground">F3</span>
      </div>

      {selectedCustomer ? (
        <div className="p-2.5 rounded-2xl bg-secondary/50 border border-border space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#262422] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <UserCheck className="w-3.5 h-3.5 text-[#C9A227]" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-foreground truncate">
                {selectedCustomer.fullName || selectedCustomer.name || "Walk-in Guest"}
              </p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono truncate">
                <Phone className="w-2.5 h-2.5 text-[#B8860B]" />
                {selectedCustomer.phone || "No phone on file"}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-7 rounded-lg font-semibold"
            onClick={() => setShowCustomerDialog(true)}
          >
            Change Customer (F3)
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full justify-center text-xs font-semibold h-9 rounded-xl border-dashed border-border hover:border-foreground hover:bg-secondary gap-2 cursor-pointer transition-colors"
          onClick={() => setShowCustomerDialog(true)}
        >
          <User className="w-3.5 h-3.5 text-[#B8860B]" />
          Select Customer (F3)
        </Button>
      )}
    </div>
  );
};

export default CustomerSection;