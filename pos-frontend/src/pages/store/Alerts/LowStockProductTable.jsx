import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tag, BellOff, Loader2, Package } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { dismissAlert } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { Badge } from "@/components/ui/badge";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const LowStockProductTable = () => {
  const dispatch = useDispatch();
  const { format: formatCurrency } = useCurrencyFormatter();
  const { storeAlerts, loading } = useSelector((state) => state.storeAnalytics);
  const user = useSelector((state) => state.user.userProfile);

  const handleDismiss = (productId, stock) => {
    if (user?.id) {
      dispatch(
        dismissAlert({
          storeAdminId: user.id,
          alertType: "LOW_STOCK",
          referenceId: productId,
          snapshotValue: stock,
        })
      );
    }
  };

  const products = storeAlerts?.lowStockAlerts || [];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">Item</TableHead>
          <TableHead>Product Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-xs font-semibold text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin inline-block mr-2 text-[#B8860B]" />
              Scanning stock levels...
            </TableCell>
          </TableRow>
        ) : products.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-xs font-semibold text-muted-foreground">
              All inventory stock counts are healthy above minimum safety thresholds.
            </TableCell>
          </TableRow>
        ) : (
          products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="w-8 h-8 rounded-lg border border-border bg-secondary/40 flex items-center justify-center overflow-hidden shrink-0">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-foreground">
                    {product.name ? product.name.slice(0, 32) : "Unnamed Product"}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono truncate max-w-[140px]">
                    {product.sku || product.description?.slice(0, 24) || ""}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">
                  {product.category || "General"}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-xs font-mono font-bold text-foreground">
                  {formatCurrency(product.sellingPrice || product.mrp || 0)}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="error" className="font-mono text-[10px] font-bold px-2 py-0.5">
                  {product.stock ?? 0} left
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleDismiss(product.id, product.stock)}
                  title="Dismiss alert"
                >
                  <BellOff className="h-3.5 w-3.5 mr-1" /> Dismiss
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default LowStockProductTable;