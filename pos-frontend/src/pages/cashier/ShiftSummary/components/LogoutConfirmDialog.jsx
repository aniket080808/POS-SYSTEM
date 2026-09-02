import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut, AlertTriangle } from "lucide-react";

const LogoutConfirmDialog = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="pb-3 border-b border-border/60">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            End Shift & Close Register
          </DialogTitle>
        </DialogHeader>

        <div className="py-3 text-xs space-y-2">
          <p className="text-foreground font-semibold">
            Are you sure you want to end your current cashier shift session?
          </p>
          <p className="text-muted-foreground">
            This will lock the register, archive shift totals, and sign you out of the POS workstation.
          </p>
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-border/60">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-9">
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm} className="text-xs font-bold h-9 gap-1.5">
            <LogOut className="w-3.5 h-3.5" />
            Confirm Shift Closure
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutConfirmDialog;