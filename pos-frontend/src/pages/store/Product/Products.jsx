import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, RefreshCw, Upload, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getProductsByStore } from "@/Redux Toolkit/features/product/productThunks";
import { getStoreOverview } from "@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import ProductTable from "./ProductTable";
import ProductForm from "./ProductForm";
import ProductSearch from "./ProductSearch";
import ProductDetails from "./ProductDetails";
import ImportProductsModal from "./ImportProductsModal";

export default function Products() {
  const dispatch = useDispatch();
  const { products, loading, error, searchResults } = useSelector(
    (state) => state.product || {}
  );
  const { store } = useSelector((state) => state.store || {});
  const { storeOverview } = useSelector((state) => state.storeAnalytics || {});
  const { statusResponse } = useSelector((state) => state.storeSubscription || {});
  const { userProfile } = useSelector((state) => state.user || {});

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const activeStoreId = store?.id || userProfile?.store?.id;

  // Fetch products on mount or when store changes
  useEffect(() => {
    if (activeStoreId) {
      fetchProducts();
    }
  }, [dispatch, activeStoreId]);

  // Fetch store overview for usage-vs-limit badge if not already loaded
  useEffect(() => {
    if (userProfile?.id && !storeOverview) {
      dispatch(getStoreOverview(userProfile.id));
    }
  }, [dispatch, userProfile, storeOverview]);

  const maxProducts = statusResponse?.currentPlan?.maxProducts;
  const totalProducts = storeOverview?.totalProducts;
  const showProductLimit = storeOverview && maxProducts != null && maxProducts > 0;

  // Update displayed products when products or search results change
  useEffect(() => {
    setDisplayedProducts(
      isSearchActive && searchResults?.length > 0 ? searchResults : (products || [])
    );
  }, [products, searchResults, isSearchActive]);

  const fetchProducts = async () => {
    if (!activeStoreId) return;
    try {
      await dispatch(getProductsByStore(activeStoreId)).unwrap();
    } catch (err) {
      toast({
        title: "Error",
        description: err || "Failed to fetch products",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
    setIsSearchActive(false);
  };

  const handleAddProductSuccess = () => {
    setIsAddDialogOpen(false);
  };

  const handleEditProductSuccess = () => {
    setIsEditDialogOpen(false);
    setCurrentProduct(null);
  };

  const openEditDialog = (product) => {
    setCurrentProduct(product);
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (product) => {
    setCurrentProduct(product);
    setIsViewDialogOpen(true);
  };

  const handleSearch = (results) => {
    if (results === null) {
      setIsSearchActive(false);
    } else {
      setIsSearchActive(true);
      setDisplayedProducts(results);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Catalog & Inventory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage product SKU pricing, stock quantities, and batch imports.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {showProductLimit && (
            <Badge variant="outline" className="text-xs font-mono px-2.5 py-1 rounded-xl">
              {totalProducts} / {maxProducts} Quota
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportDialogOpen(true)}
            className="rounded-xl text-xs font-semibold h-9 gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" /> Import CSV/Excel
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl text-xs font-semibold h-9 gap-1.5 shadow-2xs">
                <Plus className="h-3.5 w-3.5" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[620px] max-h-[85vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-foreground">Add New Product</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Define SKU code, MRP, selling price, and category classification.
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                onSubmit={handleAddProductSuccess}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 items-stretch sm:items-center">
        <ProductSearch onSearch={handleSearch} />

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="rounded-xl text-xs font-semibold h-9 gap-1.5 self-end sm:self-auto shrink-0"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          <span>{refreshing ? "Syncing..." : "Sync Catalog"}</span>
        </Button>
      </div>

      {isSearchActive && (
        <div className="bg-primary/5 border border-primary/20 text-foreground px-4 py-2.5 rounded-xl flex justify-between items-center text-xs">
          <span className="font-medium">
            Search filter active — {displayedProducts.length}{" "}
            {displayedProducts.length === 1 ? "match" : "matches"} found
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSearchActive(false)}
            className="h-7 text-xs text-primary font-semibold hover:bg-primary/10"
          >
            Clear Filter
          </Button>
        </div>
      )}

      {error && (
        <div className="text-destructive text-xs font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-xl">
          {error}
        </div>
      )}

      <Card className="rounded-2xl border-border/80 shadow-2xs overflow-hidden">
        <CardContent className="p-0">
          <ProductTable
            products={displayedProducts}
            loading={loading || refreshing}
            onEdit={openEditDialog}
            onView={openViewDialog}
          />
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">Edit Product SKU</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify product details, selling price, and stock levels.
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            initialValues={currentProduct}
            onSubmit={handleEditProductSuccess}
            onCancel={() => setIsEditDialogOpen(false)}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[85vh] overflow-y-auto rounded-2xl p-0">
          <ProductDetails product={currentProduct} />
        </DialogContent>
      </Dialog>

      <ImportProductsModal
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </div>
  );
}

