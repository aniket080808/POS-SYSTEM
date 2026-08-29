import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tag, BellOff, Package, Loader2 } from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { dismissAlert } from '@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks';
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { Badge } from "@/components/ui/badge";

const LowStockProductTable = () => {
  const dispatch = useDispatch();
  const { format: formatCurrency } = useCurrencyFormatter();
  const { storeAlerts, loading } = useSelector((state) => state.storeAnalytics || {});
  const user = useSelector((state) => state.user?.userProfile);

  const handleDismiss = (productId, stock) => {
    if (user?.id) {
      dispatch(dismissAlert({
        storeAdminId: user.id,
        alertType: 'LOW_STOCK',
        referenceId: productId,
        snapshotValue: stock
      }));
    }
  };

  const products = storeAlerts?.lowStockAlerts || [];

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/60">
            <TableHead className="text-xs font-bold text-foreground py-3 pl-6">Product</TableHead>
            <TableHead className="text-xs font-bold text-foreground py-3">Category</TableHead>
            <TableHead className="text-xs font-bold text-foreground py-3">Selling Price</TableHead>
            <TableHead className="text-xs font-bold text-foreground py-3">Stock Balance</TableHead>
            <TableHead className="text-xs font-bold text-foreground py-3 pr-6 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin inline-block mr-2 text-primary" />
                Scanning store stock levels...
              </TableCell>
            </TableRow>
          ) : products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-xs">
                All inventory SKU levels are healthy above safety threshold.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id} className="hover:bg-muted/30 transition-colors border-b border-border/40">
                <TableCell className="pl-6 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center shrink-0 overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-3.5 h-3.5 text-muted-foreground/50" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-foreground truncate max-w-[160px]">
                        {product.name || 'Unnamed Product'}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {product.sku || `#${product.id}`}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-xs text-muted-foreground">
                  {product.category || 'Uncategorized'}
                </TableCell>
                <TableCell className="py-3 font-mono font-bold text-xs text-foreground">
                  {formatCurrency(product.sellingPrice || product.mrp || 0)}
                </TableCell>
                <TableCell className="py-3">
                  <Badge variant="outline" className="text-[10px] font-bold bg-destructive/10 text-destructive border-destructive/20 font-mono">
                    {product.stock ?? 0} units left
                  </Badge>
                </TableCell>
                <TableCell className="pr-6 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    onClick={() => handleDismiss(product.id, product.stock)}
                  >
                    <BellOff className="h-3 w-3 mr-1" /> Dismiss
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LowStockProductTable;