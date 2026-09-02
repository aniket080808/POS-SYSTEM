import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, CheckCircle2 } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const ReturnReceiptDialog = ({
  showReceiptDialog,
  setShowReceiptDialog,
  selectedOrder,
  selectedItems = {},
}) => {
  const { format: formatCurrency } = useCurrencyFormatter();

  const handlePrint = () => {
    window.print();
  };

  const selectedItemsList = Object.values(selectedItems);
  const itemsToRender =
    selectedItemsList.length > 0
      ? selectedItemsList
      : selectedOrder?.items?.map((it) => ({
          orderItemId: it.id,
          productName: it.product?.name || it.productName || "Item",
          returnQty: it.quantity || 1,
          unitPrice: it.product?.sellingPrice || it.price || 0,
        })) || [];

  const totalRefundAmount = itemsToRender.reduce(
    (sum, it) => sum + (it.unitPrice || 0) * (it.returnQty || 1),
    0
  );

  return (
    <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="pb-3 border-b border-border/60">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#B8860B]" />
            Refund Voucher Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="bg-card p-4 rounded-2xl border border-border space-y-3 max-h-80 overflow-y-auto text-xs">
          <div className="text-center space-y-0.5 border-b border-border/60 pb-2">
            <h3 className="font-extrabold text-sm text-foreground">REFUND SETTLEMENT VOUCHER</h3>
            <p className="text-[11px] text-muted-foreground font-mono">
              Voucher Ref: RTN-{Date.now().toString().substring(7)}
            </p>
          </div>

          <div className="space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Original Invoice:</span>
              <span className="font-mono font-bold text-foreground">#{selectedOrder?.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Timestamp:</span>
              <span className="font-mono text-foreground">{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Billed Customer:</span>
              <span className="text-foreground font-medium">{selectedOrder?.customer?.fullName || "Walk-in Guest"}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40 border-b border-border/80">
                  <TableHead className="text-xs font-bold text-foreground uppercase tracking-wider py-2.5">Item</TableHead>
                  <TableHead className="text-center text-xs font-bold text-foreground uppercase tracking-wider py-2.5">Qty</TableHead>
                  <TableHead className="text-right text-xs font-bold text-foreground uppercase tracking-wider py-2.5">Refund Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemsToRender.map((item, idx) => (
                  <TableRow key={item.orderItemId || idx} className="border-b border-border/60">
                    <TableCell className="py-2 text-xs font-medium">
                      {(item.productName || "Item").slice(0, 24)}
                    </TableCell>
                    <TableCell className="text-center py-2 text-xs font-mono font-bold">
                      {item.returnQty}
                    </TableCell>
                    <TableCell className="text-right py-2 text-xs font-mono font-bold text-[#B8860B]">
                      {formatCurrency((item.unitPrice || 0) * (item.returnQty || 1))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-1 pt-2 border-t border-border/60">
            <div className="flex justify-between font-black text-xs text-foreground">
              <span>Net Refund Disbursed:</span>
              <span className="font-mono text-sm text-[#B8860B]">{formatCurrency(totalRefundAmount)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground text-[11px]">
              <span>Tender Channel:</span>
              <span className="font-mono uppercase font-bold text-foreground">{selectedOrder?.paymentType || "CASH"}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-border/60">
          <Button variant="outline" size="sm" onClick={() => setShowReceiptDialog(false)} className="text-xs h-9">
            Close
          </Button>
          <Button size="sm" onClick={handlePrint} className="text-xs font-bold h-9 gap-1.5">
            <Printer className="h-3.5 w-3.5" />
            Print Refund Slip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnReceiptDialog;
