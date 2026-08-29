import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectDiscount, setDiscount } from "../../../Redux Toolkit/features/cart/cartSlice";
import { Tag, Percent, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const PRESET_PERCENTAGES = [5, 10, 15, 20];

const DiscountSection = () => {
  const dispatch = useDispatch();
  const discount = useSelector(selectDiscount);
  const { symbol: currencySymbol } = useCurrencyFormatter();

  const handleSetDiscount = (e) => {
    dispatch(
      setDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })
    );
  };

  const applyPreset = (pct) => {
    dispatch(setDiscount({ type: "percentage", value: pct }));
  };

  return (
    <div className="p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Discount
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground">F2</span>
      </div>

      <div className="space-y-2">
        {/* Type Toggle + Input */}
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={discount.value || ""}
            onChange={handleSetDiscount}
            className="h-8 text-xs font-mono rounded-xl bg-background border-border"
          />

          <div className="flex bg-muted/60 p-0.5 rounded-xl border border-border/60 shrink-0">
            <button
              type="button"
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                discount.type === "percentage"
                  ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setDiscount({ ...discount, type: "percentage" })}
            >
              %
            </button>
            <button
              type="button"
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                discount.type === "fixed"
                  ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setDiscount({ ...discount, type: "fixed" })}
            >
              {currencySymbol}
            </button>
          </div>
        </div>

        {/* Quick Percentage Presets */}
        <div className="grid grid-cols-4 gap-1 pt-0.5">
          {PRESET_PERCENTAGES.map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => applyPreset(pct)}
              className={`py-1 text-[11px] font-bold rounded-lg border transition-all ${
                discount.type === "percentage" && discount.value === pct
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                  : "bg-background border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscountSection;