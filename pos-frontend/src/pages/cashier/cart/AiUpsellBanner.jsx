import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUpsellSuggestions } from "@/Redux Toolkit/features/ai/aiThunks";
import { addToCart } from "@/Redux Toolkit/features/cart/cartSlice";
import { playScanBeep } from "@/utils/audioUtils";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { Sparkles, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AiUpsellBanner = () => {
  const dispatch = useDispatch();
  const { format: formatCurrency } = useCurrencyFormatter();
  const { cartItems = [] } = useSelector((state) => state.cart || {});
  const { products = [] } = useSelector((state) => state.product || {});
  const {
    upsellSuggestions = [],
    upsellPitch = "",
    upsellLoading = false,
  } = useSelector((state) => state.ai || {});

  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const names = cartItems.map((it) => it.product?.name || it.name).filter(Boolean);
      if (names.length > 0) {
        dispatch(getUpsellSuggestions({ productNames: names }));
      }
    }, 600);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [cartItems.length, dispatch]);

  if (!cartItems || cartItems.length === 0 || (!upsellPitch && upsellSuggestions.length === 0)) {
    return null;
  }

  const handleAddUpsell = (upsellItem) => {
    // Check if item matches an existing product in store catalog, else create synthetic cart item
    const matchedProduct = products.find(
      (p) => p.name?.toLowerCase() === upsellItem.name?.toLowerCase()
    );

    const productPayload = matchedProduct || {
      id: 990000 + Math.floor(Math.random() * 1000),
      name: upsellItem.name,
      sellingPrice: upsellItem.price || 20,
      mrp: upsellItem.price || 20,
      sku: "UP-" + Date.now().toString().slice(-4),
      category: upsellItem.category || "Impulse",
      stock: 50,
    };

    dispatch(addToCart(productPayload));
    playScanBeep();
  };

  return (
    <div className="p-2.5 rounded-2xl bg-linear-to-r from-[#262422] to-[#36322E] border border-[#C9A227]/40 text-white shadow-md space-y-1.5 shrink-0 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A227] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A227]">
            AI Counter Upsell
          </span>
        </div>
        {upsellLoading && <Loader2 className="w-3 h-3 animate-spin text-[#C9A227]" />}
      </div>

      {upsellPitch && (
        <p className="text-[11px] font-medium text-white/90 leading-tight line-clamp-1">
          {upsellPitch}
        </p>
      )}

      {upsellSuggestions && upsellSuggestions.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          {upsellSuggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddUpsell(item)}
              className="px-2 py-1 rounded-xl bg-white/10 hover:bg-[#C9A227]/20 border border-white/10 hover:border-[#C9A227] flex items-center gap-1.5 text-[10px] font-semibold text-white transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            >
              <Plus className="w-3 h-3 text-[#C9A227]" />
              <span>{item.name}</span>
              <span className="font-mono text-[#C9A227]">
                {formatCurrency(item.price || 0)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AiUpsellBanner;
