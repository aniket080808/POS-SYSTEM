import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const PrintDialog = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="pb-3 border-b border-border/60">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#B8860B]" />
            Print Shift Reconciliation Report
          </DialogTitle>
        </DialogHeader>

        <div className="py-3 text-xs space-y-1">
          <p className="text-foreground font-semibold">
            Ready to spool shift reconciliation report to thermal printer.
          </p>
          <p className="text-muted-foreground">
            Paper roll output will include gross tenders, refund logs, velocity products, and transaction audits.
          </p>
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-border/60">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-9">
            Cancel
          </Button>
          <Button size="sm" onClick={onConfirm} className="text-xs font-bold h-9 gap-1.5">
            <Printer className="w-3.5 h-3.5" />
            Send to Thermal Printer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintDialog;