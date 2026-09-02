import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tag, Package, Barcode, Palette, Info } from "lucide-react";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const ProductDetails = ({ product }) => {
  const { format: formatCurrency } = useCurrencyFormatter();

  if (!product) return null;

  return (
    <div className="space-y-6">
      {product.image && (
        <div className="flex justify-center">
          <div className="w-full max-w-sm h-56 rounded-2xl overflow-hidden border border-border bg-secondary/30">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain p-2"
            />
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold text-foreground">{product.name}</h3>
        {product.brand && (
          <p className="text-xs text-muted-foreground mt-0.5">Brand: {product.brand}</p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-2xl bg-secondary/30 border border-border/60">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Barcode className="w-3.5 h-3.5 text-[#B8860B]" />
            <span>SKU / Barcode</span>
          </div>
          <p className="text-xs font-mono font-bold text-foreground mt-1">{product.sku || "N/A"}</p>
        </div>

        <div className="p-3 rounded-2xl bg-secondary/30 border border-border/60">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Tag className="w-3.5 h-3.5 text-[#B8860B]" />
            <span>Category</span>
          </div>
          <p className="text-xs font-bold text-foreground mt-1">
            {product.category?.name || product.category || "Uncategorized"}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-secondary/30 border border-border/60">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Package className="w-3.5 h-3.5 text-[#B8860B]" />
            <span>Current Stock</span>
          </div>
          <p className="text-xs font-mono font-bold text-foreground mt-1">
            {product.stock ?? 0} units
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 flex items-center justify-between">
        <div>
          <span className="text-xs text-muted-foreground">Retail Selling Price</span>
          <div className="text-2xl font-black font-mono text-foreground">
            {formatCurrency(product.sellingPrice)}
          </div>
        </div>
        {product.mrp && (
          <div className="text-right">
            <span className="text-xs text-muted-foreground">Max Retail Price (MRP)</span>
            <div className="text-sm font-mono text-muted-foreground line-through">
              {formatCurrency(product.mrp)}
            </div>
          </div>
        )}
      </div>

      {product.description && (
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</h4>
          <p className="text-xs text-foreground/90 leading-relaxed bg-secondary/20 p-3 rounded-xl border border-border/50">
            {product.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;