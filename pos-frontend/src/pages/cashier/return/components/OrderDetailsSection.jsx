import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "../../order/data";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { ArrowLeft, CheckSquare, Square, Plus, Minus, ScanLine, Search, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const OrderDetailsSection = ({
  selectedOrder,
  setSelectedOrder,
  selectedItems = {},
  onToggleItem,
  onUpdateQty,
  onToggleAll,
}) => {
  const { format: formatCurrency } = useCurrencyFormatter();
  const { toast } = useToast();
  const barcodeInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  const totalSelectedCount = Object.keys(selectedItems).length;
  const totalItemsCount = selectedOrder?.items?.filter((it) => (it.quantity || 1) > 0).length || 0;
  const isAllSelected = totalItemsCount > 0 && totalSelectedCount === totalItemsCount;

  const totalSelectedRefundAmount = Object.values(selectedItems).reduce(
    (sum, it) => sum + it.unitPrice * (it.returnQty || 1),
    0
  );

  // Auto-focus barcode input when order opens
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, [selectedOrder?.id]);

  // Barcode / SKU fast scan handler
  const handleBarcodeKeyDown = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      e.preventDefault();
      const term = searchTerm.trim().toLowerCase();
      const matchedItem = selectedOrder?.items?.find((item) => {
        const p = item.product || {};
        return (
          p.sku?.toLowerCase() === term ||
          p.name?.toLowerCase().includes(term) ||
          item.productName?.toLowerCase().includes(term) ||
          String(p.id) === term ||
          String(item.id) === term
        );
      });

      if (matchedItem) {
        if (!selectedItems[matchedItem.id]) {
          onToggleItem(matchedItem);
        } else {
          const currentQty = selectedItems[matchedItem.id].returnQty;
          const maxQty = matchedItem.quantity || 1;
          if (currentQty < maxQty) {
            onUpdateQty(matchedItem.id, currentQty + 1);
          }
        }
        toast({
          title: "Item Scanned for Return",
          description: `${matchedItem.product?.name || matchedItem.productName || "Product"} selected.`,
        });
        setSearchTerm("");
      } else {
        toast({
          title: "Item Not In This Invoice",
          description: `No line item matching "${searchTerm}" in Invoice #${selectedOrder?.id}.`,
          variant: "destructive",
        });
      }
    }
  };

  const filteredItems = (selectedOrder?.items || []).filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const p = item.product || {};
    return (
      p.name?.toLowerCase().includes(term) ||
      p.sku?.toLowerCase().includes(term) ||
      item.productName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-1/2 border-r border-border p-4 flex flex-col space-y-3 h-full min-h-0 bg-card/30 overflow-hidden select-none">
      {/* Navigation & Action Bar */}
      <div className="flex items-center justify-between shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedOrder(null)}
          className="text-xs h-8 gap-1.5 cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Order Directory
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleAll}
          className="text-xs h-8 gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {isAllSelected ? (
            <>
              <Square className="w-3.5 h-3.5 text-muted-foreground" />
              Deselect All
            </>
          ) : (
            <>
              <CheckSquare className="w-3.5 h-3.5 text-[#B8860B]" />
              Select All ({totalItemsCount})
            </>
          )}
        </Button>
      </div>

      {/* Barcode Scanner & Search Bar */}
      <div className="relative shrink-0">
        <ScanLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8860B]" />
        <Input
          ref={barcodeInputRef}
          type="text"
          placeholder="Scan barcode / SKU or type product name to select..."
          className="pl-10 pr-32 text-xs h-9 rounded-xl bg-background border-border shadow-2xs focus-visible:ring-[#C9A227]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleBarcodeKeyDown}
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 select-none pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SCAN TO SELECT
          </div>
        )}
      </div>

      {/* Invoice Summary Card */}
      <Card className="border-border shadow-2xs shrink-0">
        <CardContent className="p-3.5 space-y-2.5 text-xs">
          <div className="flex justify-between items-center border-b border-border/60 pb-2">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-foreground">
                Invoice #{selectedOrder.id}
              </h2>
              <span className="text-[11px] text-muted-foreground font-mono">
                {formatDate(selectedOrder.createdAt)}
              </span>
            </div>
            <Badge
              variant={selectedOrder.status === "REFUNDED" ? "destructive" : "active"}
              className="uppercase font-mono text-[10px]"
            >
              {selectedOrder.status === "REFUNDED" ? "REFUNDED" : (selectedOrder.paymentType || "CASH")}
            </Badge>
          </div>

          <div className="flex justify-between items-center text-xs">
            <div>
              <span className="text-muted-foreground">Customer: </span>
              <span className="font-bold text-foreground">
                {selectedOrder?.customer?.fullName || "Walk-in Guest"}
              </span>
              {selectedOrder.customer?.phone && (
                <span className="text-[11px] text-muted-foreground font-mono ml-1.5">
                  ({selectedOrder.customer.phone})
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <span className="text-muted-foreground text-[11px]">Original Total: </span>
                <span className="font-mono font-semibold text-foreground">
                  {formatCurrency(selectedOrder.totalAmount)}
                </span>
              </div>
              <div className="pl-3 border-l border-border/60">
                <span className="text-[#B8860B] font-bold text-[11px]">Return Payout: </span>
                <span className="font-mono font-bold text-sm text-[#B8860B]">
                  {formatCurrency(totalSelectedRefundAmount)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedOrder.status === "REFUNDED" && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
          <span>⚠️ This invoice has already been fully refunded. No items can be returned.</span>
        </div>
      )}

      {/* Scrollable Items Table Container */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-border/80 bg-card shadow-2xs">
        <Table>
          <TableHeader className="sticky top-0 bg-secondary/95 backdrop-blur-xs z-10 border-b border-border/80">
            <TableRow className="border-b border-border/80 hover:bg-transparent">
              <TableHead className="w-10 text-center py-2.5">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onToggleAll}
                  disabled={selectedOrder.status === "REFUNDED"}
                  aria-label="Select all items for return"
                />
              </TableHead>
              <TableHead className="text-xs font-bold text-foreground uppercase tracking-wider py-2.5">
                Product ({filteredItems.length})
              </TableHead>
              <TableHead className="text-center text-xs font-bold text-foreground uppercase tracking-wider py-2.5">
                Purchased
              </TableHead>
              <TableHead className="text-center text-xs font-bold text-foreground uppercase tracking-wider py-2.5">
                Return Qty
              </TableHead>
              <TableHead className="text-right text-xs font-bold text-foreground uppercase tracking-wider py-2.5 pr-4">
                Refund Value
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => {
              const maxQty = typeof item.quantity === "number" ? item.quantity : 0;
              const unitPrice = maxQty > 0 ? item.price / maxQty : item.price || 0;
              const isAlreadyReturned = maxQty <= 0 || selectedOrder.status === "REFUNDED";
              const isSelected = !isAlreadyReturned && !!selectedItems[item.id];
              const selectedItem = selectedItems[item.id];
              const returnQty = selectedItem ? selectedItem.returnQty : (isAlreadyReturned ? 0 : maxQty);
              const itemRefundTotal = unitPrice * returnQty;

              return (
                <TableRow
                  key={item.id}
                  className={`border-b border-border/60 transition-colors ${
                    isAlreadyReturned
                      ? "opacity-50 cursor-not-allowed bg-muted/20"
                      : isSelected
                      ? "bg-[#B8860B]/10 hover:bg-[#B8860B]/15 cursor-pointer"
                      : "hover:bg-muted/40 cursor-pointer"
                  }`}
                  onClick={(e) => {
                    if (isAlreadyReturned) return;
                    if (e.target.closest("button") || e.target.closest("input")) return;
                    onToggleItem(item);
                  }}
                >
                  <TableCell className="text-center py-2.5">
                    <Checkbox
                      checked={isSelected}
                      disabled={isAlreadyReturned}
                      onCheckedChange={() => !isAlreadyReturned && onToggleItem(item)}
                      aria-label={`Select ${item.product?.name || "item"}`}
                    />
                  </TableCell>
                  <TableCell className="text-xs font-semibold py-2.5">
                    <div className="font-bold text-foreground">
                      {item.product?.name || item.productName || "Product"}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.product?.sku && (
                        <span className="px-1.5 py-0.2 rounded bg-muted text-[10px] font-mono text-muted-foreground border border-border/60">
                          {item.product.sku}
                        </span>
                      )}
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {formatCurrency(unitPrice)} / unit
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-xs font-mono font-bold py-2.5 text-muted-foreground">
                    {maxQty} pcs
                  </TableCell>
                  <TableCell className="text-center py-2.5" onClick={(e) => e.stopPropagation()}>
                    {isSelected ? (
                      <div className="inline-flex items-center gap-1 bg-background border border-border rounded-lg p-0.5 shadow-2xs">
                        <button
                          type="button"
                          disabled={returnQty <= 1}
                          onClick={() => onUpdateQty(item.id, returnQty - 1)}
                          className="h-6 w-6 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-mono font-bold text-foreground">
                          {returnQty}
                        </span>
                        <button
                          type="button"
                          disabled={returnQty >= maxQty}
                          onClick={() => onUpdateQty(item.id, returnQty + 1)}
                          className="h-6 w-6 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground font-mono">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono font-bold py-2.5 pr-4">
                    {isSelected ? (
                      <span className="text-[#B8860B] font-bold">
                        {formatCurrency(itemRefundTotal)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60">
                        {formatCurrency(unitPrice * maxQty)}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrderDetailsSection;