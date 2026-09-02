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
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Receipt,
  X,
  Eye,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getRefundsByBranch } from "@/Redux Toolkit/features/refund/refundThunks";
import { formatDateTime } from "@/utils/formateDate";
import { findBranchEmployees } from "@/Redux Toolkit/features/employee/employeeThunks";
import RefundDetailsDialog from "./RefundDetailsDialog";

const Refunds = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { branch } = useSelector((store) => store.branch);
  const { userProfile } = useSelector((store) => store.user);
  const branchId = branch?.id || userProfile?.branchId || userProfile?.branch?.id;
  const refunds = useSelector((store) => store.refund.refundsByBranch) || [];
  const loading = useSelector((store) => store.refund.loading);
  const { employees } = useSelector((state) => state.employee);

  const [searchTerm, setSearchTerm] = useState("");
  const [cashierFilter, setCashierFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (branchId) {
      dispatch(getRefundsByBranch(branchId));
      dispatch(findBranchEmployees({ branchId, role: "ROLE_BRANCH_CASHIER" }));
    }
  }, [branchId, dispatch]);

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
        description: "Branch refunds ledger updated.",
      });
    }
  };

  const totalRefundsCount = refunds.length;
  const totalRefundAmount = useMemo(() => {
    return refunds.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  }, [refunds]);

  const filteredRefunds = useMemo(() => {
    return refunds.filter((refund) => {
      if (cashierFilter !== "all") {
        const matchesCashierName =
          refund.cashierName &&
          refund.cashierName.toLowerCase().includes(cashierFilter.toLowerCase());
        const matchesCashierId = String(refund.cashierId) === cashierFilter;
        if (!matchesCashierName && !matchesCashierId) return false;
      }

      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase().trim();
        const idMatch = String(refund.id).includes(term);
        const orderIdMatch = String(refund.orderId).includes(term);
        const cashierMatch = (refund.cashierName || "").toLowerCase().includes(term);
        const customerMatch = (refund.customerName || "walk-in customer")
          .toLowerCase()
          .includes(term);
        const reasonMatch = (refund.reason || "").toLowerCase().includes(term);

        if (!idMatch && !orderIdMatch && !cashierMatch && !customerMatch && !reasonMatch) {
          return false;
        }
      }

      return true;
    });
  }, [refunds, cashierFilter, searchTerm]);

  const totalPages = Math.ceil(filteredRefunds.length / pageSize) || 1;
  const paginatedRefunds = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRefunds.slice(start, start + pageSize);
  }, [filteredRefunds, currentPage, pageSize]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Customer Returns & Refunds
            </h1>
            <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-mono font-bold">
              {totalRefundsCount} {totalRefundsCount === 1 ? "Refund" : "Refunds"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Audit register return slips, cashier refund authorizations, and reversal totals
          </p>
        </div>

        <Button
          variant="outline"
          className="text-xs h-10 gap-1.5"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Sync Refunds
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Refund Claims
              </p>
              <p className="text-2xl font-black font-mono text-foreground mt-1">
                {totalRefundsCount}
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-secondary flex items-center justify-center text-foreground">
              <RotateCcw className="h-5 w-5 text-[#B8860B]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Reversals
              </p>
              <p className="text-2xl font-black font-mono text-destructive mt-1">
                ₹{totalRefundAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-[#FBF0EC] border border-[#EFC8BD] flex items-center justify-center text-destructive">
              <TrendingDown className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Avg. Return Value
              </p>
              <p className="text-2xl font-black font-mono text-foreground mt-1">
                ₹{totalRefundsCount > 0 ? (totalRefundAmount / totalRefundsCount).toFixed(2) : "0.00"}
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-secondary flex items-center justify-center text-foreground">
              <Receipt className="h-5 w-5 text-[#B8860B]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="space-y-3 bg-card p-4 rounded-2xl border border-border shadow-2xs">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search Refund #, Order #, or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-10"
            />
          </div>

          <div>
            <Select value={cashierFilter} onValueChange={setCashierFilter}>
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

          {(cashierFilter !== "all" || searchTerm.trim() !== "") && (
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCashierFilter("all");
                  setSearchTerm("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground h-10 gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Refund #</TableHead>
              <TableHead>Linked Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Cashier</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-xs font-semibold text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin inline-block mr-2 text-[#B8860B]" />
                  Loading refund records...
                </TableCell>
              </TableRow>
            ) : paginatedRefunds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-xs font-semibold text-muted-foreground">
                  No return or refund records found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRefunds.map((refund) => (
                <TableRow key={refund.id}>
                  <TableCell className="font-mono text-xs font-bold text-foreground">
                    #{refund.id}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground font-semibold">
                    #{refund.orderId}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground">
                    {refund.customerName || "Walk-in Guest"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {refund.cashierName || "Staff"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                    {refund.reason || "Product Return"}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-xs text-destructive">
                    -₹{Number(refund.amount || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {refund.createdAt ? formatDateTime(refund.createdAt) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => {
                        setSelectedRefund(refund);
                        setShowDetails(true);
                      }}
                      title="View Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredRefunds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Items per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-18 text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-muted-foreground font-mono pl-2">
              Showing {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredRefunds.length)} of {filteredRefunds.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-mono text-xs text-muted-foreground px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Details Dialog */}
      <RefundDetailsDialog
        open={showDetails && !!selectedRefund}
        onOpenChange={setShowDetails}
        refund={selectedRefund}
      />
    </div>
  );
};

export default Refunds;
