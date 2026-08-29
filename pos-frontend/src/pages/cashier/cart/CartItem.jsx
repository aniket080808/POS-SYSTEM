import React from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const CartItem = ({ item, updateCartItemQuantity, removeFromCart }) => {
  const { format: formatCurrency } = useCurrencyFormatter();
  const sellingPrice = item.sellingPrice !== undefined ? item.sellingPrice : item.price || 0;
  const lineTotal = sellingPrice * item.quantity;

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/80 hover:border-emerald-500/40 transition-all shadow-2xs">
      {/* Product Thumbnail / Icon */}
      <div className="w-11 h-11 rounded-xl bg-muted/60 flex items-center justify-center overflow-hidden shrink-0 border border-border/40">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <ShoppingBag className="w-5 h-5 text-muted-foreground/60" />
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-foreground truncate" title={item.name}>
          {item.name}
        </h4>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
          <span>{formatCurrency(sellingPrice)} each</span>
          {item.sku && <span>• {item.sku}</span>}
        </div>
      </div>

      {/* Quantity Stepper */}
      <div className="flex items-center bg-muted/50 border border-border rounded-xl p-0.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 rounded-lg hover:bg-background text-foreground"
          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="px-2 text-xs font-bold font-mono min-w-[1.8rem] text-center">
          {item.quantity}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 rounded-lg hover:bg-background text-foreground"
          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* Line Total */}
      <div className="text-right shrink-0 min-w-[60px]">
        <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
          {formatCurrency(lineTotal)}
        </p>
      </div>

      {/* Delete Item */}
      <button
        type="button"
        onClick={() => removeFromCart(item.id)}
        className="p-1 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
        title="Remove item"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default CartItem;