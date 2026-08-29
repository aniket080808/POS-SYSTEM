import React from "react";
import { Badge } from "@/components/ui/badge";
import { useDispatch } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import { addToCart } from "../../../Redux Toolkit/features/cart/cartSlice";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { ShoppingBag, Plus, Tag } from "lucide-react";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrencyFormatter();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCart(product));
    toast({
      title: "Added to Cart 🛒",
      description: `${product.name} added`,
      duration: 1200,
    });
  };

  const categoryName = typeof product.category === "string" ? product.category : product.category?.name;
  const sellingPrice = product.sellingPrice !== undefined ? product.sellingPrice : product.price || 0;
  const stockCount = product.stock !== undefined ? product.stock : null;

  return (
    <div
      onClick={handleAddToCart}
      className="group relative flex flex-col justify-between bg-card hover:bg-card/95 border border-border/80 hover:border-emerald-500/60 rounded-2xl p-3 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 overflow-hidden"
    >
      {/* Product Image / Icon Container */}
      <div className="relative aspect-4/3 rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden mb-2.5 border border-border/40 group-hover:bg-emerald-500/5 transition-colors">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="p-3 text-muted-foreground/50 group-hover:text-emerald-600 transition-colors">
            <ShoppingBag className="w-8 h-8" />
          </div>
        )}

        {/* Floating Quick Add Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="absolute bottom-2 right-2 p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all cursor-pointer"
          title="Add to cart"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-1">
          {categoryName && (
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
              {categoryName}
            </span>
          )}
          {stockCount !== null && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                stockCount > 5
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                  : stockCount > 0
                  ? "text-amber-600 bg-amber-500/10"
                  : "text-red-500 bg-red-500/10"
              }`}
            >
              {stockCount > 0 ? `${stockCount} in stock` : "Out of stock"}
            </span>
          )}
        </div>

        <h3 className="font-bold text-xs text-foreground line-clamp-1 group-hover:text-emerald-600 transition-colors" title={product.name}>
          {product.name}
        </h3>

        <p className="text-[11px] font-mono text-muted-foreground truncate">
          SKU: {product.sku || "—"}
        </p>

        {/* Pricing */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(sellingPrice)}
          </span>
          {product.mrp && product.mrp > sellingPrice && (
            <span className="text-[10px] line-through text-muted-foreground">
              {formatCurrency(product.mrp)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
