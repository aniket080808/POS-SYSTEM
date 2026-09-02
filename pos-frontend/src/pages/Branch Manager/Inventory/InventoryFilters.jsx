import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const InventoryFilters = ({
  searchTerm,
  onSearch,
  category,
  onCategoryChange,
  products = [],
  inventoryRows = [],
}) => {
  const totalUnits = inventoryRows.reduce((sum, row) => sum + (row.quantity || 0), 0);

  return (
    <div className="space-y-3 bg-card p-4 rounded-2xl border border-border shadow-2xs">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search SKU or Product Name..."
            className="pl-9 text-xs h-10"
            value={searchTerm}
            onChange={onSearch}
          />
        </div>

        <div>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger className="text-xs h-10 w-full">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Product Categories</SelectItem>
              {[...new Set(products.map((p) => p.category).filter(Boolean))].map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-2.5 px-4 rounded-xl bg-secondary/30 border border-border/60">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Total Allocated Units:
          </span>
          <span className="text-base font-black font-mono text-foreground">
            {totalUnits.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InventoryFilters;
