import React from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

const ProductSearch = ({ value, onChange }) => {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search by name, SKU, brand, category..."
        value={value || ""}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="pl-9 pr-8 h-9 text-xs"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange && onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground flex items-center justify-center"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default ProductSearch;
