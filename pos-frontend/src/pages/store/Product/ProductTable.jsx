import React, { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Tag, Package, Eye, Loader2, ImageOff } from "lucide-react";
import { useDispatch } from 'react-redux';
import { deleteProduct } from '@/Redux Toolkit/features/product/productThunks';
import { toast } from '@/components/ui/use-toast';
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const ProductTable = ({ products = [], loading, onEdit, onView }) => {
  const dispatch = useDispatch();
  const { format: formatCurrency } = useCurrencyFormatter();
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteProduct(productToDelete.id)).unwrap();
      toast({ title: "Product Deleted", description: `"${productToDelete.name}" removed from inventory.` });
    } catch (err) {
      toast({ title: "Error", description: err || "Failed to delete product", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/60">
              <TableHead className="text-xs font-bold text-foreground py-3.5 pl-6">Product Details</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">SKU / Code</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">Category</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">Pricing & Margin</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5">Stock Level</TableHead>
              <TableHead className="text-xs font-bold text-foreground py-3.5 pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin inline-block mr-2 text-primary" />
                  Loading inventory catalog...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-xs font-semibold text-foreground">No inventory items found</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Add your first product or import catalog data via CSV/Excel.</p>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const mrp = Number(product.mrp);
                const sellingPrice = Number(product.sellingPrice);
                const hasDiscount = mrp > 0 && sellingPrice > 0 && mrp > sellingPrice;
                const discountPercent = hasDiscount ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
                const stockQty = Number(product.stock ?? 0);

                return (
                  <TableRow key={product.id} className="hover:bg-muted/30 transition-colors border-b border-border/40">
                    <TableCell className="pl-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-center shrink-0 overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Package className="w-4 h-4 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="space-y-0.5 max-w-[200px] sm:max-w-xs">
                          <span className="font-bold text-xs text-foreground block truncate" title={product.name}>
                            {product.name}
                          </span>
                          {product.brand && (
                            <span className="text-[10px] text-muted-foreground font-medium block">
                              {product.brand}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span className="text-xs font-mono font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/40">
                        {product.sku || `SKU-${product.id}`}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Tag className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                        <span>{product.category || "Uncategorized"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold font-mono text-foreground block">
                          {formatCurrency(sellingPrice)}
                        </span>
                        {hasDiscount && discountPercent > 0 && (
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <span className="line-through text-muted-foreground/60 font-mono">
                              {formatCurrency(mrp)}
                            </span>
                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1 rounded">
                              {discountPercent}% OFF
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${
                          stockQty <= 0
                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                            : stockQty <= 5
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {stockQty <= 0 ? 'Out of Stock' : `${stockQty} units`}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary"
                            onClick={() => onView(product)}
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary"
                          onClick={() => onEdit(product)}
                          title="Edit Product"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          onClick={() => setProductToDelete(product)}
                          title="Delete Product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={Boolean(productToDelete)} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">Delete Inventory Item</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to remove <strong className="text-foreground">"{productToDelete?.name}"</strong> from your store inventory?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl text-xs font-semibold h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProduct}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl text-xs font-semibold h-8"
            >
              {isDeleting ? "Deleting..." : "Delete Item"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductTable;