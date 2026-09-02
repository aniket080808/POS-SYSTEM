import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, getPaymentModeLabel } from "../data";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { Receipt } from "lucide-react";

const OrderInformation = ({ selectedOrder }) => {
  const { format: formatCurrency } = useCurrencyFormatter();

  const subtotal =
    selectedOrder.subtotal !== undefined && selectedOrder.subtotal !== null
      ? selectedOrder.subtotal
      : selectedOrder.items?.reduce((sum, item) => sum + (item.price || 0), 0) ||
        selectedOrder.totalAmount;

  const discount = selectedOrder.discount || 0;
  const tax = selectedOrder.tax || 0;

  return (
    <Card className="h-full border-border shadow-2xs">
      <CardContent className="p-4 space-y-3">
        <h3 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
          <Receipt className="w-3.5 h-3.5 text-[#B8860B]" />
          Order Transaction Info
        </h3>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Transaction Date:</span>
            <span className="text-xs font-semibold text-foreground">{formatDate(selectedOrder.createdAt)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Settlement Tender:</span>
            <span className="text-xs font-semibold uppercase font-mono">{getPaymentModeLabel(selectedOrder.paymentType)}</span>
          </div>

          <div className="border-t border-border pt-2 mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-xs text-destructive font-medium">
                <span>Discount Allowed:</span>
                <span className="font-mono">- {formatCurrency(discount)}</span>
              </div>
            )}

            {tax > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>GST Tax:</span>
                <span className="font-mono">+ {formatCurrency(tax)}</span>
              </div>
            )}

            <div className="flex justify-between font-black text-sm pt-1.5 border-t border-border">
              <span>Gross Settled:</span>
              <span className="text-foreground font-mono">
                {formatCurrency(selectedOrder.totalAmount)}
              </span>
            </div>

            {/* Split Tender Breakdown */}
            {selectedOrder.paymentType === "SPLIT" && (
              <div className="mt-2 pt-2 border-t border-dashed border-border/80 space-y-1 bg-secondary/30 p-2 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Split Tender Breakdown
                </span>
                {selectedOrder.cashAmount > 0 && (
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-muted-foreground">💵 Cash:</span>
                    <span>{formatCurrency(selectedOrder.cashAmount)}</span>
                  </div>
                )}
                {selectedOrder.upiAmount > 0 && (
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-muted-foreground">📱 UPI:</span>
                    <span>{formatCurrency(selectedOrder.upiAmount)}</span>
                  </div>
                )}
                {selectedOrder.cardAmount > 0 && (
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-muted-foreground">💳 Card:</span>
                    <span>{formatCurrency(selectedOrder.cardAmount)}</span>
                  </div>
                )}
                {selectedOrder.loyaltyAmount > 0 && (
                  <div className="flex justify-between text-[11px] font-mono text-amber-500">
                    <span>⭐ Loyalty Points:</span>
                    <span>{formatCurrency(selectedOrder.loyaltyAmount)}</span>
                  </div>
                )}
                {selectedOrder.storeCreditAmount > 0 && (
                  <div className="flex justify-between text-[11px] font-mono text-emerald-500">
                    <span>🏦 Store Credit:</span>
                    <span>{formatCurrency(selectedOrder.storeCreditAmount)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

  );
};

export default OrderInformation;