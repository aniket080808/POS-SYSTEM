import React from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const CartItem = ({ item, updateCartItemQuantity, removeFromCart }) => {
  const { format: formatCurrency } = useCurrencyFormatter();
  const sellingPrice = item.sellingPrice !== undefined ? item.sellingPrice : item.price || 0;
  const lineTotal = sellingPrice * item.quantity;

  return (
    <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-card border border-border hover:border-[#C9A227]/60 transition-colors shadow-2xs">
      {/* Product Thumbnail */}
      <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden shrink-0 border border-border/50">
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
          <ShoppingBag className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-foreground truncate" title={item.name}>
          {item.name}
        </h4>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
          <span>{formatCurrency(sellingPrice)}</span>
          {item.sku && <span>• {item.sku}</span>}
        </div>
      </div>

      {/* Quantity Stepper */}
      <div className="flex items-center bg-secondary/70 border border-border rounded-xl p-0.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 rounded-lg hover:bg-card text-foreground"
          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="px-1.5 text-xs font-black font-mono min-w-[1.5rem] text-center">
          {item.quantity}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 rounded-lg hover:bg-card text-foreground"
          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* Line Total */}
      <div className="text-right shrink-0 min-w-[55px]">
        <p className="text-xs font-black font-mono text-foreground">
          {formatCurrency(lineTotal)}
        </p>
      </div>

      {/* Delete Item */}
      <button
        type="button"
        onClick={() => removeFromCart(item.id)}
        className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-[#FBF0EC] transition-colors cursor-pointer"
        title="Remove line item"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default CartItem;