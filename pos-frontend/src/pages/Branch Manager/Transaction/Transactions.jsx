import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  IndianRupee,
  Search,
  X,
  CreditCard,
} from "lucide-react";
import * as XLSX from "xlsx";
import TransactionTable from "./TransactionTable";
import {
  getOrdersByBranch,
  getOrderById,
} from "../../../Redux Toolkit/features/order/orderThunks";
import { findBranchEmployees } from "@/Redux Toolkit/features/employee/employeeThunks";
import { getStatusColor } from "../../../utils/getStatusColor";
import { getPaymentIcon } from "../../../utils/getPaymentIcon";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { useToast } from "@/components/ui/use-toast";
import OrderDetailsDialog from "../Orders/OrderDetailsDialog";
import { handleDownloadOrderPDF } from "../../cashier/order/pdf/pdfUtils";

export default function Transactions() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { orders, loading, selectedOrder } = useSelector(
    (state) => state.order
  );
  const { branch } = useSelector((state) => state.branch);
  const { format: formatCurrency } = useCurrencyFormatter();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (branch?.id) {
      dispatch(getOrdersByBranch({ branchId: branch.id }));
      dispatch(
        findBranchEmployees({
          branchId: branch.id,
          role: "ROLE_BRANCH_CASHIER",
        })
      );
    }
  }, [branch?.id, dispatch]);

  // --- KPI Calculations ---
  // Total Income = Gross Sales (sum of ALL order amounts, including refunded)
  const totalIncome = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return 0;
    return orders.reduce((sum, t) => sum + (Number(t.totalAmount) || 0), 0);
  }, [orders]);

  // Total Expenses = Refund Deductions (sum of REFUNDED order amounts)
  const totalExpenses = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return 0;
    return orders
      .filter((t) => {
        const status = (t.status || "").toString().toUpperCase();
        return status === "REFUNDED";
      })
      .reduce((sum, t) => sum + (Number(t.totalAmount) || 0), 0);
  }, [orders]);

  // Net Amount = Total Income - Total Expenses
  const netAmount = totalIncome - totalExpenses;

  // --- Filtered transactions for the table (by status & payment method) ---
  const filteredTransactions = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    return orders.filter((t) => {
      // Status filter
      if (statusFilter !== "all") {
        const tStatus = (t.status || "COMPLETED").toString().toUpperCase();
        if (tStatus !== statusFilter.toUpperCase()) return false;
      }
      // Payment filter
      if (paymentFilter !== "all") {
        const tPayment = (t.paymentType || "").toString().toUpperCase();
        if (tPayment !== paymentFilter.toUpperCase()) return false;
      }
      return true;
    });
  }, [orders, statusFilter, paymentFilter]);

  // --- Handlers ---
  const handleRefresh = () => {
    if (branch?.id) {
      dispatch(getOrdersByBranch({ branchId: branch.id }));
      toast({ title: "Refreshed", description: "Transactions list updated." });
    }
  };

  const handleViewDetails = (orderId) => {
    dispatch(getOrderById(orderId));
    setShowDetails(true);
  };

  const handlePrintInvoice = async (orderId) => {
    try {
      const actionResult = await dispatch(getOrderById(orderId));
      if (
        getOrderById.fulfilled.match(actionResult) &&
        actionResult.payload
      ) {
        await handleDownloadOrderPDF(actionResult.payload, toast);
      } else {
        const found = orders?.find((o) => o.id === orderId);
        if (found) {
          await handleDownloadOrderPDF(found, toast);
        }
      }
    } catch (error) {
      console.error("Error generating invoice PDF:", error);
      toast({
        title: "Error",
        description: "Failed to download invoice PDF",
        variant: "destructive",
      });
    }
  };

  const handleExportTransactions = () => {
    try {
      if (!orders || orders.length === 0) {
        toast({
          title: "No Data",
          description: "No transactions to export.",
          variant: "destructive",
        });
        return;
      }

      const exportData = orders.map((t) => {
        const cashierName =
          t.cashierName ||
          t.cashier?.fullName ||
          t.cashier?.name ||
          (t.cashierId ? `Cashier #${t.cashierId}` : "Unknown");
        const customerName =
          t.customer?.fullName || t.customer?.name || "Walk-in Customer";
        const dateStr = t.createdAt
          ? new Date(t.createdAt).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-";
        const status = t.status || "COMPLETED";
        const amount = Number(t.totalAmount || 0);

        return {
          "Transaction ID": `#${t.id}`,
          "Date & Time": dateStr,
          Cashier: cashierName,
          Customer: customerName,
          "Amount (₹)": amount.toFixed(2),
          "Payment Method": t.paymentType || "CASH",
          Status: status,
        };
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths for readability
      ws["!cols"] = [
        { wch: 16 }, // Transaction ID
        { wch: 24 }, // Date & Time
        { wch: 20 }, // Cashier
        { wch: 20 }, // Customer
        { wch: 14 }, // Amount
        { wch: 18 }, // Payment Method
        { wch: 14 }, // Status
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(
        wb,
        `Branch_Transactions_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      toast({
        title: "Success",
        description: "Transactions exported to Excel successfully.",
      });
    } catch (err) {
      console.error("Export error:", err);
      toast({
        title: "Export Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const hasActiveFilters =
    statusFilter !== "all" ||
    paymentFilter !== "all" ||
    searchTerm.trim() !== "";

  const transactionCount = orders?.length || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Transactions
            </h1>
            <Badge
              variant="secondary"
              className="px-2.5 py-0.5 text-xs font-semibold"
            >
              {transactionCount}{" "}
              {transactionCount === 1 ? "Transaction" : "Transactions"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Track all sales transactions, refunds, and financial activity for
            this branch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 shadow-sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            onClick={handleExportTransactions}
          >
            <Download className="h-4 w-4" /> Export Transactions
          </Button>
        </div>
      </div>

      {/* Transaction Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Income
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatCurrency(totalIncome)}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Gross sales (all orders)
                </p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-green-100 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Expenses
                </p>
                <h3 className="text-2xl font-bold mt-1 text-rose-600">
                  {formatCurrency(totalExpenses)}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Refund deductions
                </p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-red-100 flex items-center justify-center">
                <ArrowDownLeft className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Net Amount
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatCurrency(netAmount)}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Income minus refunds
                </p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-blue-100 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-xl border shadow-sm space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, Cashier, Customer..."
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

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2 truncate">
                <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Statuses" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Method Filter */}
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2 truncate">
                <IndianRupee className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Payment Methods" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Methods</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="CARD">Card</SelectItem>
              <SelectItem value="NET_BANKING">Net Banking</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground border-t">
            <span>Filtered results active</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPaymentFilter("all");
              }}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <X className="h-3 w-3" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <TransactionTable
        transactions={filteredTransactions}
        loading={loading}
        searchTerm={searchTerm}
        onViewDetails={handleViewDetails}
        onPrintInvoice={handlePrintInvoice}
        getStatusColor={getStatusColor}
        getPaymentIcon={getPaymentIcon}
      />

      {/* Transaction Details Dialog (reuses OrderDetailsDialog) */}
      <OrderDetailsDialog
        open={showDetails && !!selectedOrder}
        onOpenChange={setShowDetails}
        selectedOrder={selectedOrder}
        getStatusColor={getStatusColor}
        getPaymentIcon={getPaymentIcon}
      />
    </div>
  );
}
