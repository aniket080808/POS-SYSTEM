import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const StoreHeader = ({ onRefresh, refreshing, loading }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Business Entity & Profile</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          View registered legal entity metadata, tax documents, and contact details.
        </p>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onRefresh} 
              disabled={refreshing || loading}
              className="h-9 w-9 rounded-xl"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">
            <p>Sync store records</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default StoreHeader;
 