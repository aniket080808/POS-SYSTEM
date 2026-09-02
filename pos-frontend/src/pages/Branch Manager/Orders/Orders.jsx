import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ShoppingBag, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { useToast } from "@/components/ui/use-toast";
import {
  getOrdersByBranch,
  getOrderById,
} from "@/Redux Toolkit/features/order/orderThunks";
import { findBranchEmployees } from "@/Redux Toolkit/features/employee/employeeThunks";
import { getPaymentIcon } from "../../../utils/getPaymentIcon";
import { getStatusColor } from "../../../utils/getStatusColor";
import { paymentModeMap, statusMap } from "./data";
import { handleDownloadOrderPDF } from "../../cashier/order/pdf/pdfUtils";
import OrdersFilters from "./OrdersFilters";
import OrdersTable from "./OrdersTable";
import OrderDetailsDialog from "./OrderDetailsDialog";

const Orders = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { branch } = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);
  const branchId = branch?.id || userProfile?.branchId || userProfile?.branch?.id;
  const { orders = [], loading, selectedOrder } = useSelector((state) => state.order);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    cashierId: "all",
    paymentMode: "all",
    status: "all",
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (branchId) {
      dispatch(findBranchEmployees({ branchId, role: "ROLE_BRANCH_CASHIER" }));
      dispatch(getOrdersByBranch({ branchId }));
    }
  }, [branchId, dispatch]);

  const handleRefresh = () => {
    if (branchId) {
      const data = {
        branchId,
        cashierId: filters.cashierId !== "all" ? filters.cashierId : undefined,
        paymentType: paymentModeMap[filters.paymentMode],
        status: statusMap[filters.status],
      };
      dispatch(getOrdersByBranch(data));
      toast({
        title: "Refreshed",
        description: "Branch orders list updated.",
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
      console.error("Error generating invoice PDF:", error);
      toast({
        title: "Error",
        description: "Failed to download invoice PDF",
        variant: "destructive",
      });
    }
  };

  const handleExportOrdersExcel = () => {
    if (!orders || orders.length === 0) {
      toast({
        title: "No Orders",
        description: "No branch orders found to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      const exportData = orders.map((o, idx) => ({
        "S.No": idx + 1,
        "Order ID": o.id || o.orderNumber,
        "Date": o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN") : "-",
        "Customer Name": o.customer?.fullName || "Walk-in Customer",
        "Customer Phone": o.customer?.phone || "-",
        "Cashier": o.cashier?.fullName || "-",
        "Payment Mode": o.paymentType || "CASH",
        "Subtotal (₹)": o.subtotal || 0,
        "Tax (₹)": o.tax || 0,
        "Discount (₹)": o.discount || 0,
        "Total Amount (₹)": o.totalAmount || 0,
        "Status": o.status || "COMPLETED",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Branch Orders Ledger");
      const branchName = (branch?.name || "Branch").replace(/[^a-zA-Z0-9]/g, "_");
      XLSX.writeFile(wb, `${branchName}_Orders_Ledger_${new Date().toISOString().split("T")[0]}.xlsx`);

      toast({
        title: "Orders Ledger Exported",
        description: `Exported ${exportData.length} branch orders successfully.`,
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
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Branch Orders & Invoices
            </h1>
            <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-mono font-bold">
              {orders?.length || 0} {orders?.length === 1 ? "Order" : "Orders"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Audit customer invoices, cashier checkouts, and reprint tax receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="text-xs h-10 gap-1.5 cursor-pointer"
            onClick={handleExportOrdersExcel}
          >
            <Download className="h-3.5 w-3.5" /> Export Orders (.xlsx)
          </Button>

          <Button
            variant="outline"
            className="text-xs h-10 gap-1.5 cursor-pointer"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Sync Orders
          </Button>
        </div>
      </div>

      <OrdersFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
      />

      <OrdersTable
        orders={orders}
        loading={loading}
        searchTerm={searchTerm}
        onViewDetails={handleViewDetails}
        onPrintInvoice={handlePrintInvoice}
        getStatusColor={getStatusColor}
        getPaymentIcon={getPaymentIcon}
      />

      <OrderDetailsDialog
        open={showDetails}
        onOpenChange={setShowDetails}
        selectedOrder={selectedOrder}
        getStatusColor={getStatusColor}
        getPaymentIcon={getPaymentIcon}
      />
    </div>
  );
};

export default Orders;
