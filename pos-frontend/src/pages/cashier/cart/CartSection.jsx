import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Pause, Trash2, ShoppingBag } from "lucide-react";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import { useSelector, useDispatch } from "react-redux";
import {
  clearCart,
  removeFromCart,
  selectCartItems,
  selectHeldOrders,
  updateCartItemQuantity,
} from "../../../Redux Toolkit/features/cart/cartSlice";
import { useToast } from "@/components/ui/use-toast";

const CartSection = ({ setShowHeldOrdersDialog }) => {
  const cartItems = useSelector(selectCartItems);
  const heldOrders = useSelector(selectHeldOrders);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const handleUpdateCartItemQuantity = (id, newQuantity) => {
    dispatch(updateCartItemQuantity({ id, quantity: newQuantity }));
  };

  const handleRemoveFromCart = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    toast({
      title: "Cart Cleared",
      description: "All items removed from active cart",
    });
  };

  return (
    <div className="w-4/12 flex flex-col bg-card/60 backdrop-blur-xs border-r border-border/80 h-full overflow-hidden">
      {/* Cart Top Bar */}
      <div className="p-4 border-b border-border/80 bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Current Order
            </h2>
            <span className="text-[11px] text-muted-foreground">
              {cartItems.length} item{cartItems.length === 1 ? "" : "s"} in cart
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHeldOrdersDialog(true)}
            className="text-xs h-8 px-2.5 rounded-lg border-border/80 hover:bg-muted font-medium"
          >
            <Pause className="w-3.5 h-3.5 mr-1 text-amber-500" />
            Held ({heldOrders.length})
          </Button>

          {cartItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCart}
              className="text-xs h-8 px-2.5 rounded-lg border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Cart Items Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-12">
            <div className="p-4 rounded-2xl bg-muted/60 text-muted-foreground/60 border border-border/50">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">Cart is Empty</p>
              <p className="text-xs text-muted-foreground max-w-[200px]">
                Click any product from the catalog on the left to start this order
              </p>
            </div>
          </div>
        ) : (
          cartItems.map((item) => (
            <CartItem
              item={item}
              key={item.id}
              updateCartItemQuantity={handleUpdateCartItemQuantity}
              removeFromCart={handleRemoveFromCart}
            />
          ))
        )}
      </div>

      {/* Cart Summary Breakdown */}
      {cartItems.length > 0 && <CartSummary />}
    </div>
  );
};

export default CartSection;
