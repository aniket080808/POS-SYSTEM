import React, { useState, useEffect, useMemo } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Package, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { deleteProduct } from "@/Redux Toolkit/features/product/productThunks";
import { toast } from "@/components/ui/use-toast";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { Badge } from "@/components/ui/badge";
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

const PAGE_SIZE_OPTIONS = [50, 100, 200];

const ProductTable = ({ products = [], loading, onEdit, onView }) => {
  const dispatch = useDispatch();
  const { format: formatCurrency } = useCurrencyFormatter();
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  // Reset to page 1 whenever product list or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [products.length]);

  const totalItems = products.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure currentPage does not exceed totalPages
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Slice exactly pageSize items for the current page
  const paginatedProducts = useMemo(() => {
    const startIdx = (validCurrentPage - 1) * pageSize;
    return products.slice(startIdx, startIdx + pageSize);
  }, [products, validCurrentPage, pageSize]);

  const startRecord = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endRecord = Math.min(validCurrentPage * pageSize, totalItems);

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteProduct(productToDelete.id)).unwrap();
      toast({ title: "Product Deleted", description: `Product "${productToDelete.name}" removed from catalog.` });
    } catch (err) {
      const errMsg = typeof err === "string" ? err : err?.message || "Failed to delete product.";
      toast({ title: "Delete Failed", description: errMsg, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  // Generate pagination pill items (max 5 visible numbers)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, validCurrentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-12 text-xs font-bold uppercase tracking-wider">Item</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Product & SKU</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Category</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">MRP / Retail Price</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Current Stock</TableHead>
              <TableHead className="text-right text-xs font-bold uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-xs font-semibold text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin inline-block mr-2 text-primary" />
                  Loading inventory catalog...
                </TableCell>
              </TableRow>
            ) : paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-xs font-semibold text-muted-foreground">
                  No products found. Add items or import CSV to populate inventory.
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => {
                const stock = product.stock ?? 0;
                const isLowStock = stock <= 5;

                return (
                  <TableRow key={product.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="w-9 h-9 rounded-xl border border-border bg-secondary/40 flex items-center justify-center overflow-hidden shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <Package className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-bold text-foreground text-xs leading-snug">{product.name}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">{product.sku}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-foreground">
                        {product.category?.name || product.category || "Uncategorized"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold font-mono text-foreground">
                          {formatCurrency(product.sellingPrice)}
                        </div>
                        {product.mrp && product.mrp > product.sellingPrice && (
                          <div className="text-[10px] font-mono text-muted-foreground line-through">
                            {formatCurrency(product.mrp)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isLowStock ? "error" : "active"}
                        className="font-mono text-[11px] px-2 py-0.5"
                      >
                        {stock} in stock
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg cursor-pointer"
                          onClick={() => onView(product)}
                          title="View Specifications"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg cursor-pointer"
                          onClick={() => onEdit(product)}
                          title="Edit Product"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 cursor-pointer"
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

      {/* Pagination Bar */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-foreground font-semibold">{startRecord}</strong> to{" "}
              <strong className="text-foreground font-semibold">{endRecord}</strong> of{" "}
              <strong className="text-foreground font-semibold">{totalItems.toLocaleString()}</strong> products
            </span>
            <span className="text-muted-foreground/50">•</span>
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-card border border-border rounded-md px-2 py-1 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage === 1}
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={validCurrentPage === 1}
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 mx-1">
              {getPageNumbers().map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === validCurrentPage ? "default" : "outline"}
                  size="sm"
                  className={`h-8 min-w-8 px-2 text-xs font-semibold cursor-pointer ${
                    pageNum === validCurrentPage ? "font-bold" : ""
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={validCurrentPage === totalPages}
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage === totalPages}
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete SKU <strong>"{productToDelete?.name}"</strong> ({productToDelete?.sku})? This product and its inventory entries will be removed from your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProduct}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
            >
              {isDeleting ? "Deleting..." : "Delete Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductTable;