import React from "react";
import { useDispatch } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import { addToCart } from "../../../Redux Toolkit/features/cart/cartSlice";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { ShoppingBag, Plus } from "lucide-react";

const ProductCard = React.memo(({ product }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrencyFormatter();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCart(product));
    toast({
      title: "Item Added",
      description: `${product.name} added to order.`,
      duration: 1000,
    });
  };

  const categoryName = typeof product.category === "string" ? product.category : product.category?.name;
  const sellingPrice = product.sellingPrice !== undefined ? product.sellingPrice : product.price || 0;
  const stockCount = product.stock !== undefined ? product.stock : null;

  return (
    <div
      onClick={handleAddToCart}
      className="group relative flex flex-col justify-between bg-card hover:bg-card border border-border hover:border-[#C9A227] rounded-2xl p-2.5 cursor-pointer transition-all duration-150 shadow-2xs hover:shadow-md overflow-hidden"
    >
      {/* Product Image / Icon */}
      <div className="relative aspect-4/3 rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden mb-2 border border-border/50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="p-3 text-muted-foreground/60">
            <ShoppingBag className="w-7 h-7" />
          </div>
        )}

        {/* Floating Quick Add Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="absolute bottom-1.5 right-1.5 p-1.5 rounded-xl bg-[#262422] hover:bg-[#383532] text-[#C9A227] shadow-xs transition-transform active:scale-95 cursor-pointer"
          title="Add to order"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Product Info */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between gap-1">
          {categoryName && (
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
              {categoryName}
            </span>
          )}
          {stockCount !== null && (
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
                stockCount > 5
                  ? "text-foreground bg-secondary"
                  : stockCount > 0
                  ? "text-[#785600] bg-[#FDF6E2] border border-[#EED896]"
                  : "text-destructive bg-[#FBF0EC] border border-[#EFC8BD]"
              }`}
            >
              {stockCount > 0 ? `${stockCount} left` : "Out of stock"}
            </span>
          )}
        </div>

        <h3 className="font-bold text-xs text-foreground line-clamp-1 group-hover:text-[#B8860B] transition-colors" title={product.name}>
          {product.name}
        </h3>

        <p className="text-[10px] font-mono text-muted-foreground truncate">
          {product.sku || "—"}
        </p>

        {/* Pricing */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-black font-mono text-foreground">
            {formatCurrency(sellingPrice)}
          </span>
          {product.mrp && product.mrp > sellingPrice && (
            <span className="text-[10px] line-through text-muted-foreground font-mono">
              {formatCurrency(product.mrp)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export default ProductCard;

