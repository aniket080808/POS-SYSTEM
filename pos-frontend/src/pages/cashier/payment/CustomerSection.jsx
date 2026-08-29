import React from "react";
import { useSelector } from "react-redux";
import { selectSelectedCustomer } from "../../../Redux Toolkit/features/cart/cartSlice";
import { User, UserCheck, Phone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CustomerSection = ({ setShowCustomerDialog }) => {
  const selectedCustomer = useSelector(selectSelectedCustomer);

  return (
    <div className="p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Customer Details
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground">F3</span>
      </div>

      {selectedCustomer ? (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-emerald-500 text-white">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  {selectedCustomer.fullName || selectedCustomer.name || "Valued Customer"}
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  {selectedCustomer.phone || "—"}
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-7 rounded-lg border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold"
            onClick={() => setShowCustomerDialog(true)}
          >
            Change Customer
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full justify-center text-xs font-semibold h-10 rounded-xl border-dashed border-border/80 hover:border-emerald-500 hover:bg-emerald-500/5 hover:text-emerald-600 gap-2 cursor-pointer transition-all"
          onClick={() => setShowCustomerDialog(true)}
        >
          <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Select Customer (F3)
        </Button>
      )}
    </div>
  );
};

export default CustomerSection;