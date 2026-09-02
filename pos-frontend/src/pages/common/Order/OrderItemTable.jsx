import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const OrderItemTable = ({ selectedOrder, items: directItems }) => {
  const { format: formatCurrency } = useCurrencyFormatter();
  const items = directItems || selectedOrder?.items || selectedOrder?.orderItems || [];

  return (
    <div className="rounded-xl border border-border/80 overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/40 border-b border-border/80">
            <TableHead className="w-12 text-sm font-bold text-foreground uppercase tracking-wider py-3">Item</TableHead>
            <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3">Description</TableHead>
            <TableHead className="text-center w-20 text-sm font-bold text-foreground uppercase tracking-wider py-3">Qty</TableHead>
            <TableHead className="text-right w-28 text-sm font-bold text-foreground uppercase tracking-wider py-3">Price</TableHead>
            <TableHead className="text-right w-28 text-sm font-bold text-foreground uppercase tracking-wider py-3">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-xs text-muted-foreground font-semibold">
                No items recorded for this order.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, idx) => {
              const unitPrice =
                item.price && item.quantity
                  ? item.price / item.quantity
                  : item.product?.sellingPrice || item.product?.mrp || 0;
              const totalPrice =
                item.price !== undefined && item.price !== null
                  ? item.price
                  : unitPrice * (item.quantity || 1);

              return (
                <TableRow key={item.id || idx} className="border-b border-border/60 hover:bg-secondary/20">
                <TableCell className="py-2.5">
                  <div className="w-9 h-9 shrink-0">
                    {item.product?.image ? (
                      <img
                        src={item.product.image}
                        alt={item.productName || item.product?.name || "Product"}
                        className="w-9 h-9 object-cover rounded-lg border border-border"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-secondary rounded-lg border border-border flex items-center justify-center">
                        <span className="text-[11px] text-muted-foreground font-semibold">
                          {item.productName
                            ? item.productName.charAt(0).toUpperCase()
                            : item.product?.name
                            ? item.product.name.charAt(0).toUpperCase()
                            : "P"}
                        </span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-2.5">
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-foreground leading-tight">
                      {item.product?.name || item.productName || "Product"}
                    </span>
                    {item.product?.sku && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        SKU: {item.product.sku}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center py-2.5 text-xs font-bold font-mono">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right py-2.5 text-xs font-mono">
                  {formatCurrency(unitPrice)}
                </TableCell>
                <TableCell className="text-right py-2.5 text-xs font-mono font-bold text-foreground">
                  {formatCurrency(totalPrice)}
                </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderItemTable;
