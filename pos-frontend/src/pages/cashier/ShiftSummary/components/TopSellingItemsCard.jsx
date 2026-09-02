import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { Award } from "lucide-react";

const TopSellingItemsCard = ({ shiftData }) => {
  const { format: formatCurrency } = useCurrencyFormatter();

  return (
    <Card className="border-border shadow-2xs">
      <CardContent className="p-5 space-y-3">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/60 pb-2.5">
          <Award className="w-3.5 h-3.5 text-[#B8860B]" />
          Top Velocity Products
        </h2>
        <div className="space-y-2.5">
          {(!shiftData.topSellingProducts || shiftData.topSellingProducts.length === 0) ? (
            <div className="text-center py-6 text-xs text-muted-foreground font-semibold">
              No products sold during this shift yet.
            </div>
          ) : (
            shiftData.topSellingProducts.map((item, index) => {
              const price = item.sellingPrice || item.mrp || item.price || 0;
              const qty = item.quantity || item.quantitySold || item.totalQuantity || 0;
              return (
                <div key={item.id || index} className="flex items-center p-2.5 rounded-xl bg-secondary/30 border border-border/60">
                  <div className="w-6 h-6 rounded-lg bg-[#262422] text-white flex items-center justify-center mr-3 text-xs font-bold shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-bold text-xs text-foreground truncate" title={item.name}>{item.name}</span>
                      <span className="font-bold font-mono text-xs text-foreground shrink-0">{formatCurrency(price)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground font-mono mt-0.5">
                      <span>{qty} {qty === 1 ? 'unit' : 'units'} sold</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopSellingItemsCard;