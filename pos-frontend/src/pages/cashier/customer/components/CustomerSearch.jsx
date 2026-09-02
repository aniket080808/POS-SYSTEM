import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, UserPlus } from "lucide-react";

const CustomerSearch = ({ 
  searchTerm, 
  onSearchChange, 
  onAddCustomer 
}) => {
  return (
    <div className="p-3.5 border-b border-border/70 bg-card">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search customers by name, phone, or email..."
            className="pl-9 text-xs h-10 rounded-xl"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button onClick={onAddCustomer} className="text-xs font-bold h-10 gap-1.5 px-3.5">
          <UserPlus className="h-3.5 w-3.5" />
          New Customer
        </Button>
      </div>
    </div>
  );
};

export default CustomerSearch;