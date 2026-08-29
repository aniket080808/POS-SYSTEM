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

const OrderItemTable = ({ selectedOrder }) => {
  const { format: formatCurrency } = useCurrencyFormatter();

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="w-12">Item</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-center w-20">Qty</TableHead>
            <TableHead className="text-right w-24">Price</TableHead>
            <TableHead className="text-right w-24">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {selectedOrder.items?.map((item) => {
            const unitPrice =
              item.price && item.quantity
                ? item.price / item.quantity
                : item.product?.sellingPrice || item.product?.mrp || 0;
            const totalPrice =
              item.price !== undefined && item.price !== null
                ? item.price
                : unitPrice * (item.quantity || 1);

            return (
              <TableRow key={item.id}>
                <TableCell className="py-2">
                  <div className="w-9 h-9 shrink-0">
                    {item.product?.image ? (
                      <img
                        src={item.product.image}
                        alt={item.productName || item.product?.name || "Product"}
                        className="w-9 h-9 object-cover rounded-md border"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-muted rounded-md border flex items-center justify-center">
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
                <TableCell className="py-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-xs leading-tight">
                      {item.product?.name || item.productName || "Product"}
                    </span>
                    {item.product?.sku && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        SKU: {item.product.sku}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center py-2 text-xs font-semibold">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right py-2 text-xs font-mono">
                  {formatCurrency(unitPrice)}
                </TableCell>
                <TableCell className="text-right py-2 text-xs font-mono font-semibold">
                  {formatCurrency(totalPrice)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderItemTable;
