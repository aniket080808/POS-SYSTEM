import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ShoppingBag } from "lucide-react";
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
  const branchId = useSelector((state) => state.branch.branch?.id);
  const { orders, loading, selectedOrder } = useSelector((state) => state.order);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    cashierId: "all",
    paymentMode: "all",
    status: "all",
  });
  const [showDetails, setShowDetails] = useState(false);

  // Fetch branch employees (cashiers)
  useEffect(() => {
    if (branchId) {
      dispatch(findBranchEmployees({ branchId, role: "ROLE_BRANCH_CASHIER" }));
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
        description: "Orders list updated.",
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
        // Fallback: check if order is in current list
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Orders</h1>
            <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-semibold">
              {orders?.length || 0} {orders?.length === 1 ? "Order" : "Orders"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Track, filter, and inspect all customer orders across this branch.
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

      {/* Search and Filters */}
      <OrdersFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Orders Table */}
      <OrdersTable
        orders={orders}
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
};

export default Orders;
