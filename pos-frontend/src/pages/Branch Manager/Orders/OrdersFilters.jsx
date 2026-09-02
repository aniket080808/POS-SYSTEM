import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { paymentModeMap, statusMap } from "./data";
import { getOrdersByBranch } from "../../../Redux Toolkit/features/order/orderThunks";

const OrdersFilters = ({ searchTerm, setSearchTerm, filters, setFilters }) => {
  const dispatch = useDispatch();
  const branchId = useSelector((state) => state.branch.branch?.id);
  const { employees } = useSelector((state) => state.employee);

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
    <div className="space-y-3 bg-card p-4 rounded-2xl border border-border shadow-2xs">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search Order # or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs h-10"
          />
        </div>

        {/* Cashier Filter */}
        <div>
          <Select
            value={filters.cashierId}
            onValueChange={(val) => setFilters({ ...filters, cashierId: val })}
          >
            <SelectTrigger className="text-xs h-10">
              <SelectValue placeholder="All Cashiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cashiers</SelectItem>
              {cashiers.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Filter */}
        <div>
          <Select
            value={filters.paymentMode}
            onValueChange={(val) => setFilters({ ...filters, paymentMode: val })}
          >
            <SelectTrigger className="text-xs h-10">
              <SelectValue placeholder="All Payment Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Types</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Select
            value={filters.status}
            onValueChange={(val) => setFilters({ ...filters, status: val })}
          >
            <SelectTrigger className="text-xs h-10 flex-1">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
              title="Reset Filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersFilters;
