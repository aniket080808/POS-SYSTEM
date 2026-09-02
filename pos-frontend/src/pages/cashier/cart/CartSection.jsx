import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Pause, Trash2, ShoppingBag } from "lucide-react";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import AiUpsellBanner from "./AiUpsellBanner";
import { playScanBeep, playErrorBeep } from "@/utils/audioUtils";
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
  const cartItems = useSelector(selectCartItems) || [];
  const dbHeldOrders = useSelector((state) => state.heldOrder?.heldOrders) || [];
  const localHeldOrders = useSelector(selectHeldOrders) || [];
  const totalHeldCount = Math.max(dbHeldOrders.length, localHeldOrders.length);
  const dispatch = useDispatch();
  const { toast } = useToast();


  const handleUpdateCartItemQuantity = (id, newQuantity) => {
    dispatch(updateCartItemQuantity({ id, quantity: newQuantity }));
    playScanBeep();
  };

  const handleRemoveFromCart = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    playErrorBeep();
    toast({
      title: "Cart Emptied",
      description: "All products removed from active invoice.",
    });
  };

  return (
    <div className="w-72 lg:w-80 xl:w-[32%] shrink-0 flex flex-col bg-card/60 border-r border-border h-full overflow-hidden">
      {/* Cart Top Bar */}
      <div className="p-3 border-b border-border/70 bg-card flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-secondary text-foreground">
            <ShoppingCart className="w-4 h-4 text-[#B8860B]" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-foreground">
              Current Invoice Cart
            </h2>
            <span className="text-[10px] text-muted-foreground font-mono">
              {cartItems.length} {cartItems.length === 1 ? "line item" : "line items"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHeldOrdersDialog(true)}
            className="text-xs h-8 px-2.5 rounded-lg border-border hover:bg-secondary font-semibold"
          >
            <Pause className="w-3.5 h-3.5 mr-1 text-[#B8860B]" />
            Held ({totalHeldCount})
          </Button>


          {cartItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCart}
              className="text-xs h-8 px-2.5 rounded-lg border-destructive/30 text-destructive hover:bg-[#FBF0EC] font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Cart Items Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-12">
            <div className="p-4 rounded-2xl bg-secondary text-muted-foreground border border-border">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground">Active Cart is Empty</p>
              <p className="text-[11px] text-muted-foreground max-w-[200px]">
                Scan barcode (F1) or select items from catalog to start order
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

      {/* AI Counter Upsell Banner */}
      {cartItems.length > 0 && (
        <div className="px-3 pb-1 shrink-0">
          <AiUpsellBanner />
        </div>
      )}

      {/* Cart Summary Breakdown */}
      {cartItems.length > 0 && <CartSummary />}
    </div>
  );
};

export default CartSection;
