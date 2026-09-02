import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectDiscount, setDiscount } from "../../../Redux Toolkit/features/cart/cartSlice";
import { Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const PRESET_PERCENTAGES = [5, 10, 15, 20];
const PRESET_AMOUNTS = [20, 50, 100, 200];

const DiscountSection = () => {
  const dispatch = useDispatch();
  const discount = useSelector(selectDiscount) || { type: "percentage", value: 0 };
  const { symbol: currencySymbol } = useCurrencyFormatter();

  const handleSetDiscount = (e) => {
    const val = parseFloat(e.target.value);
    dispatch(
      setDiscount({
        ...discount,
        value: isNaN(val) ? 0 : Math.max(0, val),
      })
    );
  };

  const handleToggleType = (type) => {
    dispatch(
      setDiscount({
        ...discount,
        type,
      })
    );
  };

  const applyPreset = (val) => {
    dispatch(setDiscount({ type: discount.type, value: val }));
  };

  const presets = discount.type === "percentage" ? PRESET_PERCENTAGES : PRESET_AMOUNTS;

  return (
    <div className="p-3.5 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-[#B8860B]" />
          Discount
        </h3>
        <span className="text-[10px] font-mono font-bold text-muted-foreground">F2</span>
      </div>

      <div className="space-y-2">
        {/* Type Toggle + Input */}
        <div className="flex items-center gap-1.5">
          <Input
            id="pos-discount-input"
            type="number"
            min="0"
            placeholder={discount.type === "percentage" ? "0 %" : `${currencySymbol} 0`}
            value={discount.value || ""}
            onChange={handleSetDiscount}
            className="h-8 text-xs font-mono rounded-xl bg-background border-border"
          />

          <div className="flex bg-secondary p-0.5 rounded-xl border border-border shrink-0">
            <button
              type="button"
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                discount.type === "percentage"
                  ? "bg-card text-foreground shadow-2xs font-mono"
                  : "text-muted-foreground hover:text-foreground font-mono"
              }`}
              onClick={() => handleToggleType("percentage")}
            >
              %
            </button>
            <button
              type="button"
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                discount.type === "fixed"
                  ? "bg-card text-foreground shadow-2xs font-mono"
                  : "text-muted-foreground hover:text-foreground font-mono"
              }`}
              onClick={() => handleToggleType("fixed")}
            >
              {currencySymbol}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-4 gap-1">
          {presets.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => applyPreset(val)}
              className={`py-1 text-[11px] font-bold font-mono rounded-lg border transition-colors cursor-pointer ${
                discount.value === val
                  ? "bg-[#262422] border-[#262422] text-white"
                  : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground"
              }`}
            >
              {discount.type === "percentage" ? `${val}%` : `${currencySymbol}${val}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscountSection;