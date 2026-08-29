import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  Search,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
  AlertCircle,
  TrendingDown,
  DollarSign,
  Receipt,
  X,
  Eye,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getRefundsByBranch } from "@/Redux Toolkit/features/refund/refundThunks";
import { findBranchEmployees } from "@/Redux Toolkit/features/employee/employeeThunks";
import RefundDetailsDialog from "./RefundDetailsDialog";

const Refunds = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { branch } = useSelector((store) => store.branch);
  const rawRefunds = useSelector((store) => store.refund.refundsByBranch);
  const refunds = useMemo(() => rawRefunds || [], [rawRefunds]);
  const loading = useSelector((store) => store.refund.loading);
  const { employees } = useSelector((state) => state.employee);

  const [searchTerm, setSearchTerm] = useState("");
  const [cashierFilter, setCashierFilter] = useState("all");
  const [sortField, setSortField] = useState("createdAt"); // 'id' | 'orderId' | 'amount' | 'createdAt'
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch branch cashiers & refunds
  useEffect(() => {
    if (branch?.id) {
      dispatch(getRefundsByBranch(branch.id));
      dispatch(findBranchEmployees({ branchId: branch.id, role: "ROLE_BRANCH_CASHIER" }));
    }
  }, [branch?.id, dispatch]);

  const cashiers = useMemo(() => {
    return employees
      ? employees.filter((emp) => emp.role === "ROLE_BRANCH_CASHIER")
      : [];
  }, [employees]);

  const handleRefresh = () => {
    if (branch?.id) {
      dispatch(getRefundsByBranch(branch.id));
      toast({
        title: "Refreshed",
        description: "Refunds list updated.",
      });
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // KPI Calculations
  const totalRefundsCount = refunds.length;
  const totalRefundAmount = useMemo(() => {
    return refunds.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  }, [refunds]);

  // Filtering
  const filteredRefunds = useMemo(() => {
    return refunds.filter((refund) => {
      // Cashier filter
      if (cashierFilter !== "all") {
        const matchesCashierName = refund.cashierName && refund.cashierName.toLowerCase().includes(cashierFilter.toLowerCase());
        const matchesCashierId = String(refund.cashierId) === cashierFilter;
        if (!matchesCashierName && !matchesCashierId) {
          return false;
        }
      }

      // Search term
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase().trim();
        const idMatch = String(refund.id).includes(term);
        const orderIdMatch = String(refund.orderId).includes(term);
        const cashierMatch = (refund.cashierName || "").toLowerCase().includes(term);
        const customerMatch = (refund.customerName || "walk-in customer").toLowerCase().includes(term);
        const reasonMatch = (refund.reason || "").toLowerCase().includes(term);

        if (!idMatch && !orderIdMatch && !cashierMatch && !customerMatch && !reasonMatch) {
          return false;
        }
      }

      return true;
    });
  }, [refunds, cashierFilter, searchTerm]);

  // Sorting
  const sortedRefunds = useMemo(() => {
    const sorted = [...filteredRefunds];
    sorted.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "createdAt") {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else if (sortField === "amount" || sortField === "id" || sortField === "orderId") {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredRefunds, sortField, sortDirection]);

  // Pagination
  const totalCount = sortedRefunds.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedRefunds = useMemo(() => {
    const start = (validPage - 1) * pageSize;
    return sortedRefunds.slice(start, start + pageSize);
  }, [sortedRefunds, validPage, pageSize]);

  const handleViewRefund = (refund) => {
    setSelectedRefund(refund);
    setShowDetails(true);
  };

  const handlePrintRefund = (refund) => {
    setSelectedRefund(refund);
    setShowDetails(true);
    toast({
      title: "Refund Receipt",
      description: `Opening receipt for Refund #${refund.id}`,
    });
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 opacity-40 group-hover:opacity-100" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-primary font-bold" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-primary font-bold" />
    );
  };

  const hasActiveFilters = cashierFilter !== "all" || searchTerm.trim() !== "";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Refunds</h1>
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 border-purple-200 px-2.5 py-0.5 text-xs font-semibold"
            >
              {totalRefundsCount} {totalRefundsCount === 1 ? "Refund" : "Refunds"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Review and track all processed returns and customer refunds for this branch.
          </p>
        </div>

        <Button
          variant="outline"
          className="gap-2 shadow-sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Refunds
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {totalRefundsCount}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <RotateCcw className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Refunded Amount
              </p>
              <p className="text-2xl font-bold text-rose-600 mt-1">
                ₹{totalRefundAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
              <TrendingDown className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Average Refund
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                ₹{(totalRefundsCount > 0 ? totalRefundAmount / totalRefundsCount : 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Receipt className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card p-4 rounded-xl border shadow-sm space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Refund ID, Order #, Cashier, Reason..."
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

          {/* Cashier Filter */}
          <div>
            <Select
              value={cashierFilter}
              onValueChange={setCashierFilter}
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
                  <SelectItem key={emp.id} value={emp.fullName}>
                    {emp.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground border-t">
            <span>Filtered results active</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setCashierFilter("all");
              }}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <X className="h-3 w-3" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Refunds Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[100px]">
                <button
                  type="button"
                  onClick={() => handleSort("id")}
                  className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider group hover:text-foreground cursor-pointer"
                >
                  Refund ID
                  {renderSortIcon("id")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => handleSort("orderId")}
                  className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider group hover:text-foreground cursor-pointer"
                >
                  Order ID
                  {renderSortIcon("orderId")}
                </button>
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Customer
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Cashier
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => handleSort("createdAt")}
                  className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider group hover:text-foreground cursor-pointer"
                >
                  Date & Time
                  {renderSortIcon("createdAt")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  onClick={() => handleSort("amount")}
                  className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider group hover:text-foreground cursor-pointer"
                >
                  Amount
                  {renderSortIcon("amount")}
                </button>
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                Reason
              </TableHead>
              <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Loading refunds...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedRefunds.length > 0 ? (
              paginatedRefunds.map((refund) => {
                const dateDisplay = refund.createdAt
                  ? new Date(refund.createdAt).toLocaleDateString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-";

                const formattedAmount = Number(refund.amount || 0).toLocaleString(
                  "en-IN",
                  { minimumFractionDigits: 2 }
                );

                return (
                  <TableRow
                    key={refund.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-semibold font-mono text-foreground">
                      #{refund.id}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      <span className="bg-muted px-2 py-1 rounded text-xs font-mono font-semibold">
                        #ORD-{refund.orderId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground">
                          {refund.customerName || "Walk-in Customer"}
                        </span>
                        {!refund.customerName && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 text-muted-foreground bg-muted/30"
                          >
                            Walk-in
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-foreground">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">
                          {refund.cashierName || "Branch Cashier"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                      {dateDisplay}
                    </TableCell>
                    <TableCell className="font-semibold text-rose-600 whitespace-nowrap">
                      -₹{formattedAmount}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-foreground">
                      <span title={refund.reason}>
                        {refund.reason || "Defective package returned"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleViewRefund(refund)}
                          title="View Refund Details"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => handlePrintRefund(refund)}
                          title="Print Refund Receipt"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RotateCcw className="h-8 w-8 text-muted-foreground/50" />
                    <p className="font-medium text-base">No refunds found</p>
                    <p className="text-xs text-muted-foreground">
                      {searchTerm || cashierFilter !== "all"
                        ? "Try adjusting your search filters"
                        : "No returns or refunds have been processed for this branch"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {!loading && totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              Showing{" "}
              <strong className="text-foreground">
                {(validPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-foreground">
                {Math.min(validPage * pageSize, totalCount)}
              </strong>{" "}
              of <strong className="text-foreground">{totalCount}</strong> refunds
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs">Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={validPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-xs font-medium px-2">
                Page {validPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={validPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Details Dialog */}
      <RefundDetailsDialog
        open={showDetails && !!selectedRefund}
        onOpenChange={setShowDetails}
        refund={selectedRefund}
      />
    </div>
  );
};

export default Refunds;
