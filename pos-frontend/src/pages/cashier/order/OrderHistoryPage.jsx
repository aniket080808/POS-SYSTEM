import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Printer,
  Calendar,
  Loader2,
  RefreshCw,
  Download,
  Receipt,
} from "lucide-react";
import { getOrdersByCashier, getOrdersByBranch } from "@/Redux Toolkit/features/order/orderThunks";
import OrderDetails from "./OrderDetails/OrderDetails";
import OrderTable from "./OrderTable";
import { handleDownloadOrderPDF } from "./pdf/pdfUtils";

const OrderHistoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile } = useSelector((state) => state.user);
  const { branch } = useSelector((state) => state.branch);
  const { store } = useSelector((state) => state.store);
  const { orders = [], loading, error } = useSelector((state) => state.order);

  const effectiveBranchId =
    branch?.id ||
    userProfile?.branchId ||
    userProfile?.branch?.id ||
    store?.branches?.[0]?.id;

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });
  const [showOrderDetailsDialog, setShowOrderDetailsDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (userProfile?.role === "ROLE_BRANCH_CASHIER" && userProfile?.id) {
      dispatch(getOrdersByCashier(userProfile.id));
    } else if (effectiveBranchId) {
      dispatch(getOrdersByBranch({ branchId: effectiveBranchId }));
    } else if (userProfile?.id) {
      dispatch(getOrdersByCashier(userProfile.id));
    }
  }, [dispatch, userProfile, effectiveBranchId]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error Loading Orders",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const weekStart = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay());
    return d;
  }, [today]);

  const filteredOrders = useMemo(() => {
    return (orders || []).filter((order) => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesId = String(order.id).toLowerCase().includes(term);
        const matchesCustomer =
          order.customer?.fullName?.toLowerCase().includes(term) ||
          order.customer?.name?.toLowerCase().includes(term);
        if (!matchesId && !matchesCustomer) return false;
      }

      if (!order.createdAt) return true;
      const orderDate = new Date(order.createdAt);

      if (dateFilter === "today") {
        return orderDate >= today;
      } else if (dateFilter === "week") {
        return orderDate >= weekStart;
      } else if (dateFilter === "month") {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return orderDate >= monthStart;
      } else if (dateFilter === "custom") {
        if (customDateRange.start) {
          const start = new Date(customDateRange.start);
          start.setHours(0, 0, 0, 0);
          if (orderDate < start) return false;
        }
        if (customDateRange.end) {
          const end = new Date(customDateRange.end);
          end.setHours(23, 59, 59, 999);
          if (orderDate > end) return false;
        }
      }
      return true;
    });
  }, [orders, searchTerm, dateFilter, customDateRange, today, weekStart]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsDialog(true);
  };

  const handlePrintInvoice = async (order) => {
    await handleDownloadOrderPDF(order, toast);
  };

  const handleInitiateReturn = (order) => {
    navigate("/cashier/returns", { state: { selectedOrder: order } });
  };

  const handleDownloadPDF = async () => {
    if (selectedOrder) {
      await handleDownloadOrderPDF(selectedOrder, toast);
    }
  };

  const handleRefreshOrders = () => {
    if (userProfile?.role === "ROLE_BRANCH_CASHIER" && userProfile?.id) {
      dispatch(getOrdersByCashier(userProfile.id));
    } else if (effectiveBranchId) {
      dispatch(getOrdersByBranch({ branchId: effectiveBranchId }));
    } else if (userProfile?.id) {
      dispatch(getOrdersByCashier(userProfile.id));
    }
    toast({
      title: "Refreshing Invoices",
      description: "Latest till transactions synced.",
    });
  };

  const handleExportExcel = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      toast({
        title: "No Orders",
        description: "No cashier orders available to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      const exportData = filteredOrders.map((o, idx) => ({
        "S.No": idx + 1,
        "Order ID": o.id || o.orderNumber,
        "Date": o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN") : "-",
        "Customer Name": o.customer?.fullName || "Walk-in Customer",
        "Customer Phone": o.customer?.phone || "-",
        "Payment Mode": o.paymentType || "CASH",
        "Subtotal (₹)": o.subtotal || 0,
        "Tax (₹)": o.tax || 0,
        "Discount (₹)": o.discount || 0,
        "Total Amount (₹)": o.totalAmount || 0,
        "Status": o.status || "COMPLETED",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Till Orders Ledger");
      XLSX.writeFile(wb, `Till_Orders_${new Date().toISOString().split("T")[0]}.xlsx`);

      toast({
        title: "Orders Exported",
        description: `Exported ${exportData.length} till orders successfully.`,
      });
    } catch (err) {
      console.error("Export error:", err);
      toast({
        title: "Export Failed",
        description: "Failed to generate Excel file.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 bg-card border-b border-border/80 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-foreground">Cashier Order Ledger</h1>
          <p className="text-xs text-muted-foreground">Historical till receipts, reprints, and customer returns</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="text-xs h-9 gap-1.5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export (.xlsx)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshOrders}
            disabled={loading}
            className="text-xs h-9 gap-1.5 cursor-pointer"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Sync Till
          </Button>
        </div>
      </div>

      <div className="p-4 border-b border-border/80 bg-card/50 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[280px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search invoice number or customer name..."
                className="pl-9 text-xs h-10 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-secondary/40 p-1 rounded-xl border border-border">
            {[
              { key: "today", label: "Today" },
              { key: "week", label: "This Week" },
              { key: "month", label: "This Month" },
              { key: "custom", label: "Custom Range" },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setDateFilter(f.key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  dateFilter === f.key
                    ? "bg-[#262422] text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {dateFilter === "custom" && (
          <div className="flex flex-wrap gap-3 items-end p-3 rounded-xl bg-secondary/30 border border-border">
            <div className="w-48">
              <label htmlFor="start-date" className="text-sm font-semibold text-foreground mb-1 block">
                Start Date
              </label>
              <Input
                id="start-date"
                type="date"
                value={customDateRange.start}
                onChange={(e) =>
                  setCustomDateRange({
                    ...customDateRange,
                    start: e.target.value,
                  })
                }
                className="text-xs h-9 font-mono"
              />
            </div>
            <div className="w-48">
              <label htmlFor="end-date" className="text-sm font-semibold text-foreground mb-1 block">
                End Date
              </label>
              <Input
                id="end-date"
                type="date"
                value={customDateRange.end}
                onChange={(e) =>
                  setCustomDateRange({
                    ...customDateRange,
                    end: e.target.value,
                  })
                }
                className="text-xs h-9 font-mono"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCustomDateRange({ start: "", end: "" })}
              className="text-xs h-9"
            >
              Reset
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <Loader2 className="animate-spin h-8 w-8 text-[#B8860B] mb-2" />
            <p className="text-xs font-medium">Loading till order ledger...</p>
          </div>
        ) : (
          <OrderTable
            orders={filteredOrders}
            handleInitiateReturn={handleInitiateReturn}
            handlePrintInvoice={handlePrintInvoice}
            handleViewOrder={handleViewOrder}
          />
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog
        open={showOrderDetailsDialog}
        onOpenChange={setShowOrderDetailsDialog}
      >
        {selectedOrder && (
          <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-card border-border shadow-2xl">
            <div className="px-6 py-4 border-b border-border bg-card shrink-0 flex items-center justify-between">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#B8860B]" />
                  Order Invoice #{selectedOrder.id} Details
                </DialogTitle>
              </DialogHeader>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <OrderDetails selectedOrder={selectedOrder} />
            </div>

            <DialogFooter className="px-6 py-3 border-t border-border bg-card shrink-0 flex justify-between items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="text-xs h-9 gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </Button>
              <Button
                size="sm"
                onClick={() => handlePrintInvoice(selectedOrder)}
                className="text-xs font-bold h-9 gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Receipt
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default OrderHistoryPage;
