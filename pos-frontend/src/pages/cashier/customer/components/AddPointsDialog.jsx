import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const AddPointsDialog = ({ 
  isOpen, 
  onClose, 
  customer, 
  pointsToAdd, 
  onPointsChange, 
  onAddPoints 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="pb-3 border-b border-border/60">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Star className="w-4 h-4 text-[#B8860B]" />
            Credit Loyalty Points
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="p-3 rounded-xl bg-secondary/40 border border-border/70 space-y-1">
            <p className="text-muted-foreground">
              Customer: <strong className="text-foreground">{customer?.fullName || customer?.name}</strong>
            </p>
            <p className="text-muted-foreground font-mono">
              Current Points Balance: <strong className="text-foreground">{customer?.loyaltyPoints || 0} pts</strong>
            </p>
          </div>

          <div>
            <label htmlFor="points" className="text-sm font-semibold text-foreground mb-1.5 block">
              Additional Points to Credit
            </label>
            <Input
              id="points"
              type="number"
              min="1"
              value={pointsToAdd}
              onChange={(e) => onPointsChange(parseInt(e.target.value) || 0)}
              className="text-xs h-10 font-mono"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-3 border-t border-border/60">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-10">
            Cancel
          </Button>
          <Button size="sm" onClick={onAddPoints} className="text-xs font-bold h-10 gap-1.5">
            Credit Loyalty Points
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPointsDialog;