import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Barcode, Loader2, X, Sparkles, Filter, Package } from "lucide-react";
import ProductCard from "./ProductCard";
import { useDispatch, useSelector } from "react-redux";
import {
  getProductsByStore,
  searchProducts,
} from "../../../Redux Toolkit/features/product/productThunks";
import { getBranchById } from "../../../Redux Toolkit/features/branch/branchThunks";
import { getCategoriesByStore } from "../../../Redux Toolkit/features/category/categoryThunks";
import { clearSearchResults } from "@/Redux Toolkit/features/product/productSlice";

const ProductSection = ({ searchInputRef }) => {
  const dispatch = useDispatch();
  const { branch } = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);
  const { categories } = useSelector((state) => state.category);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const searchTimerRef = useRef(null);

  const {
    products,
    searchResults,
    loading,
  } = useSelector((state) => state.product);

  const activeStoreId =
    branch?.storeId ||
    branch?.store?.id ||
    userProfile?.storeId ||
    userProfile?.store?.id ||
    userProfile?.branch?.store?.id ||
    userProfile?.branch?.storeId;

  // 1. Fetch branch if not loaded but branchId exists
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

  // 2. Fetch products and categories when activeStoreId is resolved
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (activeStoreId && jwt) {
      dispatch(getProductsByStore(activeStoreId));
      if (!categories || categories.length === 0) {
        dispatch(getCategoriesByStore({ storeId: activeStoreId, token: jwt }));
      }
    }
  }, [dispatch, activeStoreId, categories]);

  // Debounced search function
  const debouncedSearch = useCallback(
    (query) => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
      searchTimerRef.current = setTimeout(() => {
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
    },
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

  // Filter products by search results and category filter
  const displayedProducts = useMemo(() => {
    let list = searchTerm.trim() && searchResults.length > 0 ? searchResults : products || [];

    if (selectedCategory !== "ALL") {
      list = list.filter((p) => {
        const cat = (p.category?.name || p.category || "").toString().toLowerCase();
        return cat === selectedCategory.toLowerCase();
      });
    }

    return list;
  }, [products, searchResults, searchTerm, selectedCategory]);

  // Category list with counts
  const categoryList = useMemo(() => {
    const baseCats = (categories || []).map((c) => (typeof c === "string" ? c : c.name)).filter(Boolean);
    const productCats = (products || []).map((p) => (typeof p.category === "string" ? p.category : p.category?.name)).filter(Boolean);
    const unique = Array.from(new Set([...baseCats, ...productCats]));
    return ["ALL", ...unique];
  }, [categories, products]);

  return (
    <div className="w-5/12 flex flex-col bg-card/50 backdrop-blur-xs border-r border-border/80 h-full overflow-hidden">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-border/80 bg-muted/30 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search by name, SKU, or scan barcode (F1)..."
            className="pl-10 pr-9 py-2.5 text-sm rounded-xl bg-background border-border/80 shadow-2xs focus-visible:ring-emerald-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                dispatch(clearSearchResults());
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Horizontal Filter Chips */}
        {categoryList.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categoryList.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25"
                      : "bg-background/80 text-muted-foreground hover:text-foreground border border-border/60 hover:border-border"
                  }`}
                >
                  {cat === "ALL" ? "All Products" : cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
          <span className="font-medium">
            {loading ? (
              <span className="flex items-center gap-1.5 text-emerald-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching inventory...
              </span>
            ) : (
              <span>
                Showing <strong className="text-foreground">{displayedProducts.length}</strong> items
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (!products || products.length === 0) ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-44 rounded-2xl bg-muted/40 animate-pulse border border-border/50"
              />
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
            <div className="p-4 rounded-full bg-muted text-muted-foreground/60">
              <Package className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">No products found</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                {searchTerm
                  ? `No matching products found for "${searchTerm}". Try another keyword.`
                  : "No products available in this store's inventory catalog."}
              </p>
            </div>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("ALL");
                  dispatch(clearSearchResults());
                }}
                className="text-xs"
              >
                Reset Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSection;
