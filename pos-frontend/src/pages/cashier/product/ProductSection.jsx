import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Search, Loader2, X, Package, ScanLine } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ProductCard from "./ProductCard";
import { useDispatch, useSelector } from "react-redux";
import {
  getProductsByStore,
  searchProducts,
} from "../../../Redux Toolkit/features/product/productThunks";
import { getBranchById } from "../../../Redux Toolkit/features/branch/branchThunks";
import { getCategoriesByStore } from "../../../Redux Toolkit/features/category/categoryThunks";
import { clearSearchResults } from "@/Redux Toolkit/features/product/productSlice";
import { addToCart } from "@/Redux Toolkit/features/cart/cartSlice";
import { offlineDb } from "@/utils/offlineDb";

const ProductSection = ({ searchInputRef }) => {
  const dispatch = useDispatch();
  const { branch } = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);
  const { store } = useSelector((state) => state.store);
  const { categories } = useSelector((state) => state.category);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [offlineProducts, setOfflineProducts] = useState([]);
  const { toast } = useToast();

  const {
    products = [],
    searchResults = [],
    loading,
  } = useSelector((state) => state.product);

  // Sync products to local IndexedDB for zero-internet offline billing
  useEffect(() => {
    if (products && products.length > 0) {
      offlineDb.cacheProducts(products);
    } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
      offlineDb.getCachedProducts().then((cached) => {
        if (cached && cached.length > 0) {
          setOfflineProducts(cached);
        }
      });
    }
  }, [products]);


  const activeStoreId =
    store?.id ||
    branch?.storeId ||
    branch?.store?.id ||
    userProfile?.storeId ||
    userProfile?.store?.id ||
    userProfile?.branch?.store?.id ||
    userProfile?.branch?.storeId;

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (userProfile?.branchId && jwt && !branch) {
      dispatch(
        getBranchById({
          id: userProfile.branchId,
          jwt,
        })
      );
    }
  }, [dispatch, userProfile, branch]);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (activeStoreId && jwt) {
      dispatch(getProductsByStore(activeStoreId));
      if (!categories || categories.length === 0) {
        dispatch(getCategoriesByStore({ storeId: activeStoreId, token: jwt }));
      }
    }
  }, [dispatch, activeStoreId]);

  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (query) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (query.trim() && activeStoreId && localStorage.getItem("jwt")) {
            dispatch(
              searchProducts({
                query: query.trim(),
                storeId: activeStoreId,
              })
            )
              .unwrap()
              .catch((error) => {
                console.error("Search failed:", error);
              });
          }
        }, 300);
      };
    })(),
    [dispatch, activeStoreId]
  );

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.trim()) {
      debouncedSearch(val);
    } else {
      dispatch(clearSearchResults());
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      e.preventDefault();
      const q = searchTerm.trim().toLowerCase();
      const exactMatch =
        (products || []).find((p) => p.sku?.toLowerCase() === q) ||
        (products || []).find((p) => p.name?.toLowerCase().includes(q)) ||
        displayedProducts[0];

      if (exactMatch) {
        dispatch(
          addToCart({
            id: exactMatch.id,
            name: exactMatch.name,
            sku: exactMatch.sku,
            price: exactMatch.sellingPrice || exactMatch.mrp || 0,
            sellingPrice: exactMatch.sellingPrice || exactMatch.mrp || 0,
            image: exactMatch.image,
            quantity: 1,
          })
        );
        toast({
          title: "Scanned & Added",
          description: `${exactMatch.name} added to cart.`,
        });
        setSearchTerm("");
        dispatch(clearSearchResults());
      }
    }
  };

  const PAGE_SIZE = 48;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset visible items when category or search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, selectedCategory]);

  const displayedProducts = useMemo(() => {
    const activeProducts = products && products.length > 0 ? products : offlineProducts;
    let list = searchTerm.trim() && searchResults.length > 0 ? searchResults : activeProducts || [];

    if (selectedCategory !== "ALL") {
      list = list.filter((p) => {
        const cat = (p.category?.name || p.category || "").toString().toLowerCase();
        return cat === selectedCategory.toLowerCase();
      });
    }

    return list;
  }, [products, offlineProducts, searchResults, searchTerm, selectedCategory]);

  const paginatedProducts = useMemo(() => {
    return displayedProducts.slice(0, visibleCount);
  }, [displayedProducts, visibleCount]);

  const categoryList = useMemo(() => {
    const baseCats = (categories || []).map((c) => (typeof c === "string" ? c : c.name)).filter(Boolean);
    const productCats = (products || []).map((p) => (typeof p.category === "string" ? p.category : p.category?.name)).filter(Boolean);
    const unique = Array.from(new Set([...baseCats, ...productCats]));
    return ["ALL", ...unique];
  }, [categories, products]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, displayedProducts.length));
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-card/40 border-r border-border h-full overflow-hidden">
      {/* Search & Filter Header */}
      <div className="p-3 border-b border-border/70 bg-card space-y-2 shrink-0">
        <div className="relative">
          <ScanLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8860B]" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Scan barcode or type name / SKU (F1)..."
            className="pl-10 pr-28 text-xs h-9 rounded-xl bg-background border-border shadow-2xs focus-visible:ring-[#C9A227]"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleInputKeyDown}
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                dispatch(clearSearchResults());
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 select-none pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              SCANNER READY
            </div>
          )}
        </div>

        {/* Category Filter Chips */}
        {categoryList.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {categoryList.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-[#262422] text-white shadow-xs"
                      : "bg-secondary text-muted-foreground hover:text-foreground border border-border/60 hover:border-border"
                  }`}
                >
                  {cat === "ALL" ? "All Catalog" : cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
          <span>
            {loading ? (
              <span className="flex items-center gap-1.5 text-[#B8860B]">
                <Loader2 className="w-3 h-3 animate-spin" /> Querying inventory...
              </span>
            ) : (
              <span>
                Showing <strong className="text-foreground">{paginatedProducts.length}</strong> of{" "}
                <strong className="text-foreground">{displayedProducts.length}</strong> items
              </span>
            )}
          </span>
          {selectedCategory !== "ALL" && (
            <button
              onClick={() => setSelectedCategory("ALL")}
              className="text-[11px] text-[#B8860B] hover:underline font-semibold cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 min-h-0">
        {loading && (!products || products.length === 0) ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-44 rounded-2xl bg-secondary/50 animate-pulse border border-border"
              />
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-16">
            <div className="p-4 rounded-2xl bg-secondary border border-border text-muted-foreground">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground">No Products Found</p>
              <p className="text-[11px] text-muted-foreground max-w-xs">
                {searchTerm
                  ? `No items match "${searchTerm}"`
                  : "No items registered under this category"}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {displayedProducts.length > visibleCount && (
              <div className="pt-2 pb-6 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  className="text-xs font-bold px-6 py-2 rounded-xl border-border hover:bg-secondary cursor-pointer shadow-2xs"
                >
                  Load More Items (+{Math.min(PAGE_SIZE, displayedProducts.length - visibleCount)})
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};


export default ProductSection;
