import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";
import { searchProducts } from "@/Redux Toolkit/features/product/productThunks";

const ProductSearch = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const dispatch = useDispatch();
  const { store } = useSelector((state) => state.store || {});

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const token = localStorage.getItem("jwt");
      const results = await dispatch(
        searchProducts({ query: searchQuery, storeId: store?.id, token })
      ).unwrap();
      if (onSearch) {
        onSearch(results);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (onSearch) {
      onSearch(null);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex w-full max-w-sm items-center gap-2"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, SKU, or brand..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 pl-8 pr-8 rounded-xl text-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <Button
        type="submit"
        disabled={!searchQuery.trim() || isSearching}
        size="sm"
        className="rounded-xl text-xs font-semibold h-9 gap-1.5"
      >
        {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
      </Button>
    </form>
  );
};

export default ProductSearch;

