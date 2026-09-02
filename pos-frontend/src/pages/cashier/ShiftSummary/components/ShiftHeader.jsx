import React from "react";
import { Button } from "@/components/ui/button";
import { Printer, LogOut } from "lucide-react";

const ShiftHeader = ({ onPrintClick, onEndShiftClick }) => {
  return (
    <div className="p-4 bg-card border-b border-border/80 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold text-foreground">Cashier Shift Settlement</h1>
        <p className="text-xs text-muted-foreground">Session totals, till reconciliations, and shift closure report</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrintClick} className="text-xs h-9 gap-1.5">
          <Printer className="h-3.5 w-3.5" />
          Print Shift Report
        </Button>
        <Button variant="destructive" size="sm" onClick={onEndShiftClick} className="text-xs font-bold h-9 gap-1.5">
          <LogOut className="h-3.5 w-3.5" />
          End Shift & Logout
        </Button>
      </div>
    </div>
  );
};

export default ShiftHeader;