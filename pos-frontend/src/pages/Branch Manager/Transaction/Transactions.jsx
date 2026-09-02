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
  Search,
  X,
  CreditCard,
  Banknote,
  QrCode,
  TrendingUp,
} from "lucide-react";
import * as XLSX from "xlsx";
import TransactionTable from "./TransactionTable";
import { formatDateTime } from "@/utils/formateDate";
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
  const { orders = [], loading, selectedOrder } = useSelector((state) => state.order);
  const { branch } = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);
  const branchId = branch?.id || userProfile?.branchId || userProfile?.branch?.id;
  const { format: formatCurrency } = useCurrencyFormatter();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (branchId) {
      dispatch(getOrdersByBranch({ branchId }));
      dispatch(
        findBranchEmployees({
          branchId,
          role: "ROLE_BRANCH_CASHIER",
        })
      );
    }
  }, [branchId, dispatch]);

  const handleRefresh = () => {
    if (branchId) {
      dispatch(getOrdersByBranch({ branchId }));
      toast({
        title: "Refreshed",
        description: "Transactions ledger updated successfully.",
      });
    }
  };

  const handleViewDetails = (orderId) => {
    dispatch(getOrderById(orderId));
    setShowDetails(true);
  };

  const handlePrintInvoice = async (orderId) => {
    try {
      const actionResult = await dispatch(getOrderById(orderId));
      if (getOrderById.fulfilled.match(actionResult) && actionResult.payload) {
        await handleDownloadOrderPDF(actionResult.payload, toast);
      } else {
        const found = orders?.find((o) => o.id === orderId);
        if (found) {
          await handleDownloadOrderPDF(found, toast);
        }
      }
    } catch (error) {
      console.error("Error generating transaction PDF:", error);
      toast({
        title: "Error",
        description: "Failed to download tax PDF",
        variant: "destructive",
      });
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "all" && (order.status || "").toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (paymentFilter !== "all" && (order.paymentType || "").toLowerCase() !== paymentFilter.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [orders, statusFilter, paymentFilter]);

  const totalVolume = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [filteredOrders]);

  const handleExportCSV = () => {
    try {
      const exportData = filteredOrders.map((o) => ({
        "Transaction ID": o.id,
        Customer: o.customer?.fullName || o.customer?.name || "Walk-in Guest",
        Cashier: o.cashier?.fullName || o.cashier?.name || "Staff",
        Payment: o.paymentType || "CASH",
        Status: o.status || "COMPLETED",
        Amount: o.totalAmount,
        Date: o.createdAt ? formatDateTime(o.createdAt) : "",
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, `Branch_Transactions_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast({ title: "Export Complete", description: "Excel transaction ledger downloaded." });
    } catch (err) {
      toast({ title: "Export Failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Station Settlement Ledger
            </h1>
            <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-mono font-bold">
              {filteredOrders.length} {filteredOrders.length === 1 ? "Record" : "Records"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Audit tender receipts, register settlements, and export financial journals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="text-xs h-10 gap-1.5"
            onClick={handleExportCSV}
          >
            <Download className="h-3.5 w-3.5" /> Export Excel
          </Button>

          <Button
            variant="outline"
            className="text-xs h-10 gap-1.5"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Sync Ledger
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Settled Volume
              </p>
              <p className="text-2xl font-black font-mono text-foreground mt-1">
                {formatCurrency(totalVolume)}
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-secondary flex items-center justify-center text-foreground">
              <TrendingUp className="h-5 w-5 text-[#B8860B]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Transaction Count
              </p>
              <p className="text-2xl font-black font-mono text-foreground mt-1">
                {filteredOrders.length}
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-secondary flex items-center justify-center text-foreground">
              <CreditCard className="h-5 w-5 text-[#B8860B]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Average Basket
              </p>
              <p className="text-2xl font-black font-mono text-foreground mt-1">
                {formatCurrency(filteredOrders.length > 0 ? totalVolume / filteredOrders.length : 0)}
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-secondary flex items-center justify-center text-foreground">
              <Banknote className="h-5 w-5 text-[#B8860B]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="space-y-3 bg-card p-4 rounded-2xl border border-border shadow-2xs">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search Transaction #, Customer, or Cashier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-10"
            />
          </div>

          <div>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="text-xs h-10">
                <SelectValue placeholder="All Tender Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tender Types</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Credit / Debit Card</SelectItem>
                <SelectItem value="upi">UPI QR Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-xs h-10">
                <SelectValue placeholder="All Settlement Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Settlement Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(paymentFilter !== "all" || statusFilter !== "all" || searchTerm.trim() !== "") && (
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPaymentFilter("all");
                  setStatusFilter("all");
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

      {/* Transaction Table */}
      <TransactionTable
        transactions={filteredOrders}
        loading={loading}
        searchTerm={searchTerm}
        onViewDetails={handleViewDetails}
        onPrintInvoice={handlePrintInvoice}
        getStatusColor={getStatusColor}
        getPaymentIcon={getPaymentIcon}
      />

      {/* Order Details Dialog */}
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
