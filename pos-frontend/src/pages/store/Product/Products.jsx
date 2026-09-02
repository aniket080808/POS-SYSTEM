import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, RefreshCw, Upload, ShoppingCart, Download, Trash2, Sparkles } from "lucide-react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { getProductsByStore } from "@/Redux Toolkit/features/product/productThunks";
import { getStoreByAdmin } from "@/Redux Toolkit/features/store/storeThunks";
import { getCategoriesByStore } from "@/Redux Toolkit/features/category/categoryThunks";
import { getStoreOverview } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { fetchStoreSubscriptionStatus } from "@/Redux Toolkit/features/storeSubscription/storeSubscriptionThunks";
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
import { toast } from "@/components/ui/use-toast";
import ProductTable from "./ProductTable";
import ProductForm from "./ProductForm";
import ProductSearch from "./ProductSearch";
import ProductDetails from "./ProductDetails";
import ImportProductsModal from "./ImportProductsModal";
import AiInvoiceScannerModal from "./AiInvoiceScannerModal";
import { deleteAllProducts } from "@/Redux Toolkit/features/product/productThunks";

export default function Products() {
  const dispatch = useDispatch();
  const { products = [], loading, error, searchResults } = useSelector(
    (state) => state.product
  );
  const { store } = useSelector((state) => state.store);
  const { storeOverview } = useSelector((state) => state.storeAnalytics);
  const { statusResponse } = useSelector((state) => state.storeSubscription);
  const { userProfile } = useSelector((state) => state.user);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isAiScanModalOpen, setIsAiScanModalOpen] = useState(false);
  const [isClearAllDialogOpen, setIsClearAllDialogOpen] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const activeStoreId = store?.id || userProfile?.storeId || userProfile?.store?.id;

  useEffect(() => {
    if (!store?.id) {
      dispatch(getStoreByAdmin());
    }
  }, [dispatch, store?.id]);

  useEffect(() => {
    if (activeStoreId) {
      dispatch(getProductsByStore(activeStoreId));
      const token = localStorage.getItem("jwt");
      dispatch(getCategoriesByStore({ storeId: activeStoreId, token }));
    }
  }, [dispatch, activeStoreId]);

  useEffect(() => {
    if (userProfile?.id && !storeOverview) {
      dispatch(getStoreOverview(userProfile.id));
    }
  }, [dispatch, userProfile?.id, storeOverview]);

  const displayedProducts = React.useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        (p.category?.name || p.category)?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const maxProducts = statusResponse?.currentPlan?.maxProducts;
  const totalProducts = products?.length ?? 0;
  const showProductLimit = maxProducts != null && maxProducts > 0;

  const fetchProducts = async (targetStoreId) => {
    const sId = targetStoreId || activeStoreId;
    if (!sId) return;
    try {
      await dispatch(getProductsByStore(sId)).unwrap();
    } catch (err) {
      toast({ title: "Fetch Failed", description: "Failed to load product catalog.", variant: "destructive" });
    }
  };

  const notifyCatalogChanged = () => {
    try {
      const channel = new BroadcastChannel("products_catalog_channel");
      channel.postMessage({ type: "CATALOG_UPDATED" });
      channel.close();
    } catch (e) {}
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      let sId = activeStoreId;
      if (!sId) {
        const storeRes = await dispatch(getStoreByAdmin()).unwrap();
        sId = storeRes?.id;
      }
      if (sId) {
        await dispatch(getProductsByStore(sId)).unwrap();
        const token = localStorage.getItem("jwt");
        dispatch(getCategoriesByStore({ storeId: sId, token }));
        if (userProfile?.id) {
          dispatch(getStoreOverview(userProfile.id));
        }
        notifyCatalogChanged();
        toast({
          title: "Catalog Synchronized",
          description: "Live product catalog and stock levels updated.",
        });
      }
    } catch (err) {
      toast({
        title: "Sync Failed",
        description: err || "Failed to synchronize product catalog.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleExportCatalog = () => {
    if (!products || products.length === 0) {
      toast({
        title: "No Products",
        description: "There are no catalog products to export.",
        variant: "destructive",
      });
      return;
    }
    try {
      const exportRows = products.map((p) => ({
        "SKU / Barcode": p.sku || "",
        "Product Name": p.name || "",
        "Category": p.category?.name || p.category || "Uncategorized",
        "Brand": p.brand || "",
        "Color": p.color || "",
        "MRP": p.mrp || 0,
        "Selling Price": p.sellingPrice || 0,
        "Current Stock": p.stock || 0,
        "Description": p.description || "",
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportRows);
      XLSX.utils.book_append_sheet(wb, ws, "Product Catalog");
      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `Catalog_Export_${dateStr}.xlsx`);
      toast({
        title: "Catalog Exported",
        description: `Exported ${products.length} products successfully.`,
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "Failed to generate catalog export file.",
        variant: "destructive",
      });
    }
  };

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    fetchProducts();
    notifyCatalogChanged();
    if (userProfile?.id) dispatch(getStoreOverview(userProfile.id));
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setCurrentProduct(null);
    fetchProducts();
    notifyCatalogChanged();
  };

  const openEditDialog = (product) => {
    setCurrentProduct(product);
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (product) => {
    setCurrentProduct(product);
    setIsViewDialogOpen(true);
  };

  const handleClearAllProducts = async () => {
    const sId = store?.id || userProfile?.storeId || userProfile?.store?.id;
    if (!sId) {
      toast({
        title: "Store Not Found",
        description: "Unable to resolve the active store. Please sync and try again.",
        variant: "destructive",
      });
      return;
    }
    setClearingAll(true);
    try {
      const deletedCount = await dispatch(deleteAllProducts(sId)).unwrap();
      setIsClearAllDialogOpen(false);
      notifyCatalogChanged();
      if (userProfile?.id) dispatch(getStoreOverview(userProfile.id));
      toast({
        title: "Catalog Cleared",
        description: `${deletedCount ?? 0} products deleted from the catalog successfully.`,
      });
    } catch (err) {
      toast({
        title: "Clear Failed",
        description: typeof err === "string" ? err : "Failed to clear product catalog.",
        variant: "destructive",
      });
    } finally {
      setClearingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Product Catalog & Inventory
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage SKU identifiers, pricing, retail margins, stock quantities, and barcodes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showProductLimit && (
            <Badge variant="outline" className="font-mono text-xs px-2.5 py-1">
              Quota: {totalProducts} / {maxProducts} items
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-xs h-10 gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Sync
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCatalog}
            className="text-xs h-10 gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export Catalog
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportDialogOpen(true)}
            className="text-xs h-10 gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" /> Import CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAiScanModalOpen(true)}
            className="text-xs h-10 gap-1.5 cursor-pointer border-[#C9A227]/50 text-[#C9A227] hover:bg-[#C9A227]/10 font-bold shadow-2xs"
            title="Scan paper or PDF invoice using Groq AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" /> AI Invoice OCR
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsClearAllDialogOpen(true)}
            disabled={totalProducts === 0 || clearingAll}
            className="text-xs h-10 gap-1.5 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/40"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="text-xs font-bold h-10 gap-1.5">
                <Plus className="w-4 h-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">Add New Product</DialogTitle>
                <DialogDescription className="text-xs">
                  Create a new SKU item with pricing, barcode, and initial stock
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                onSubmit={handleAddSuccess}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Product</DialogTitle>
            <DialogDescription className="text-xs">
              Modify product attributes, pricing, or stock level
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            initialValues={currentProduct}
            onSubmit={handleEditSuccess}
            onCancel={() => setIsEditDialogOpen(false)}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Product Specifications</DialogTitle>
          </DialogHeader>
          <ProductDetails product={currentProduct} />
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <ImportProductsModal
        open={isImportDialogOpen}
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onSuccess={() => {
          setIsImportDialogOpen(false);
          fetchProducts();
          if (userProfile?.id) dispatch(getStoreOverview(userProfile.id));
        }}
      />

      {/* Clear All Products Confirmation */}
      <AlertDialog open={isClearAllDialogOpen} onOpenChange={setIsClearAllDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Entire Product Catalog?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>all {totalProducts} products</strong> from your
              store catalog, including their stock levels and pricing. Past sales records will be
              preserved, but this action <strong>cannot be undone</strong>. Consider exporting the
              catalog first if you need a backup.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearingAll}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleClearAllProducts();
              }}
              disabled={clearingAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {clearingAll ? "Deleting..." : `Delete All ${totalProducts} Products`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Store Catalog Inventory</CardTitle>
              <CardDescription className="text-xs">
                Active catalog items available for counter scanning and cashier terminal sales
              </CardDescription>
            </div>
            <div className="w-full sm:w-72">
              <ProductSearch
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <ProductTable
            products={displayedProducts}
            loading={loading}
            onEdit={openEditDialog}
            onView={openViewDialog}
          />
        </CardContent>
      </Card>

      {/* Groq AI Invoice Vision OCR Modal */}
      <AiInvoiceScannerModal
        open={isAiScanModalOpen}
        onOpenChange={setIsAiScanModalOpen}
        storeId={activeStoreId}
      />
    </div>
  );
}
