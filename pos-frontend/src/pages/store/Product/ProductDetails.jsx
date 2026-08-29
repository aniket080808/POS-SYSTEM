import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, Package, Calendar, Barcode, Palette, Image as ImageIcon } from "lucide-react";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const ProductDetails = ({ product }) => {
  const { format: formatCurrency } = useCurrencyFormatter();

  if (!product) return null;

  return (
    <div className="overflow-hidden rounded-2xl">
      <div className="bg-muted/40 border-b border-border/60 p-5">
        <h3 className="text-base font-bold text-foreground">{product.name}</h3>
        {product.brand && (
          <p className="text-xs font-semibold text-primary mt-0.5">
            {product.brand}
          </p>
        )}
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Product Image */}
        {product.image && (
          <div className="flex justify-center">
            <div className="relative w-full max-w-sm h-48 rounded-xl overflow-hidden border border-border/60 bg-muted/20">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
              <Barcode className="h-3.5 w-3.5 text-primary" />
              <span>SKU / Product Code</span>
            </div>
            <div className="text-xs font-mono font-bold text-foreground">{product.sku || 'N/A'}</div>
          </div>

          <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
              <Tag className="h-3.5 w-3.5 text-primary" />
              <span>Category</span>
            </div>
            <div className="text-xs font-semibold text-foreground">{product.category || 'Uncategorized'}</div>
          </div>

          <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
              <Palette className="h-3.5 w-3.5 text-primary" />
              <span>Variant / Color</span>
            </div>
            <div className="text-xs font-semibold text-foreground">{product.color || 'Standard'}</div>
          </div>

          <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
              <Package className="h-3.5 w-3.5 text-primary" />
              <span>Current Stock Balance</span>
            </div>
            <div className="text-xs font-semibold text-foreground">
              {product.stock !== undefined ? (
                <span className="font-mono font-bold text-foreground">{product.stock} units</span>
              ) : 'N/A'}
            </div>
          </div>
        </div>

        {/* Price Box */}
        <div className="p-4 bg-muted/30 border border-border/60 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block">Selling Price</span>
            <span className="text-base font-bold font-mono text-foreground">
              {formatCurrency(product.sellingPrice)}
            </span>
          </div>
          {(() => {
            const mrp = Number(product.mrp);
            const sellingPrice = Number(product.sellingPrice);
            if (mrp > 0 && sellingPrice > 0 && mrp > sellingPrice) {
              const discountPercent = Math.round(((mrp - sellingPrice) / mrp) * 100);
              return (
                <div className="text-right">
                  <span className="text-[11px] text-muted-foreground/60 line-through font-mono block">
                    MRP {formatCurrency(mrp)}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {discountPercent}% OFF
                  </span>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Description */}
        {product.description && (
          <div className="pt-3 border-t border-border/60">
            <h4 className="text-xs font-bold text-foreground mb-1">Product Description</h4>
            <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{product.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;