import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSelector } from "react-redux";

const InventoryFormDialog = ({
  open,
  onOpenChange,
  selectedProductId,
  setSelectedProductId,
  quantity,
  setQuantity,
  onSubmit,
  mode = "add",
}) => {
  const products = useSelector((state) => state.product.products) || [];
  const isEdit = mode === "edit";
  const selectedProduct = products.find(
    (p) => String(p.id) === String(selectedProductId)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="pb-3 border-b border-border/60">
          <DialogTitle className="text-lg font-bold">
            {isEdit ? "Adjust Branch Inventory" : "Allocate Inventory to Branch"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">
              Product SKU & Name
            </label>
            {isEdit ? (
              <Input
                value={selectedProduct?.name ? `${selectedProduct.name} (${selectedProduct.sku || 'No SKU'})` : `Product #${selectedProductId}`}
                disabled
                readOnly
                className="text-xs h-10 bg-secondary/50 font-medium"
              />
            ) : (
              <Select
                value={selectedProductId ? String(selectedProductId) : ""}
                onValueChange={(value) => setSelectedProductId(value)}
              >
                <SelectTrigger className="w-full text-xs h-10">
                  <SelectValue placeholder="Select Catalog Product" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {products.length > 0 ? (
                    products.map((product) => (
                      <SelectItem key={product.id} value={String(product.id)}>
                        {product.name} — ({product.sku || "No SKU"})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No catalog products registered in store
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">
              Available Units Count
            </label>
            <Input
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="text-xs h-10 font-mono"
              placeholder="e.g. 50"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 border-t border-border/60 pt-3">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs h-9">
            Cancel
          </Button>
          <Button size="sm" onClick={onSubmit} className="text-xs font-bold h-9">
            {isEdit ? "Save Adjustment" : "Allocate Stock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryFormDialog;
