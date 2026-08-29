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
import { Filter } from "lucide-react";
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
  const products = useSelector((state) => state.product.products);
  const isEdit = mode === "edit";
  const selectedProduct = products.find(
    (p) => String(p.id) === String(selectedProductId)
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Inventory" : "Add Inventory"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="product" className="text-right">
              Product
            </label>
            {isEdit ? (
              <Input
                id="product"
                value={selectedProduct?.name || ""}
                disabled
                readOnly
                className="col-span-3"
              />
            ) : (
              <Select
                value={selectedProductId ? String(selectedProductId) : ""}
                onValueChange={(value) => setSelectedProductId(value)}
              >
                <SelectTrigger
                  className="w-full col-span-3"
                >
                  <SelectValue placeholder="Select a Product" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {products && products.length > 0 ? (
                    products.map((product) => (
                      <SelectItem key={product.id} value={String(product.id)}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No products available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="quantity" className="text-right">
              Quantity
            </label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            {isEdit ? "Update Inventory" : "Add Inventory"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryFormDialog;
