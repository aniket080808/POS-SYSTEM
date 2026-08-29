import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, User } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { paymentModeMap, statusMap } from "./data";
import { getOrdersByBranch } from "../../../Redux Toolkit/features/order/orderThunks";

const OrdersFilters = ({ searchTerm, setSearchTerm, filters, setFilters }) => {
  const dispatch = useDispatch();
  const branchId = useSelector((state) => state.branch.branch?.id);
  const { employees } = useSelector((state) => state.employee);

  // Strictly filter to ROLE_BRANCH_CASHIER only
  const cashiers = employees
    ? employees.filter((emp) => emp.role === "ROLE_BRANCH_CASHIER")
    : [];

  useEffect(() => {
    if (branchId) {
      const data = {
        branchId,
        cashierId: filters.cashierId !== "all" ? filters.cashierId : undefined,
        paymentType: paymentModeMap[filters.paymentMode],
        status: statusMap[filters.status],
      };
      console.log("Fetching orders with filters:", data);
      dispatch(getOrdersByBranch(data));
    }
  }, [branchId, filters.cashierId, filters.paymentMode, filters.status, dispatch]);

  const hasActiveFilters =
    filters.cashierId !== "all" ||
    filters.paymentMode !== "all" ||
    filters.status !== "all" ||
    (searchTerm && searchTerm.trim() !== "");

  const handleReset = () => {
    setFilters({
      cashierId: "all",
      paymentMode: "all",
      status: "all",
    });
    if (setSearchTerm) setSearchTerm("");
  };

  return (
    <div className="space-y-3 bg-card p-4 rounded-xl border shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Order ID, Customer, Cashier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Payment Mode Filter */}
        <div>
          <Select
            value={filters.paymentMode}
            onValueChange={(value) =>
              setFilters({ ...filters, paymentMode: value })
            }
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Payment Modes" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Modes</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="Card">Card</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cashier Filter (Role-filtered) */}
        <div>
          <Select
            value={filters.cashierId}
            onValueChange={(value) =>
              setFilters({ ...filters, cashierId: value })
            }
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2 truncate">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Cashiers" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cashiers</SelectItem>
              {cashiers.map((emp) => (
                <SelectItem key={emp.id} value={String(emp.id)}>
                  {emp.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Refunded">Refunded</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground border-t">
          <span>Active filters applied</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <X className="h-3 w-3" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrdersFilters;
