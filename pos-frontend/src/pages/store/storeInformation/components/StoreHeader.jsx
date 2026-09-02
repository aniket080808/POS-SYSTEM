import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Store } from "lucide-react";

const StoreHeader = ({ storeData, onRefresh, refreshing }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {storeData?.brand || "Store Profile"}
          </h1>
          {storeData?.status && (
            <Badge variant="active" className="text-[11px] uppercase font-bold">
              {storeData.status}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage legal merchant entity details, tax identification, and business address
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={refreshing}
        className="text-xs h-10 gap-1.5"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
        Refresh Profile
      </Button>
    </div>
  );
};

export default StoreHeader;