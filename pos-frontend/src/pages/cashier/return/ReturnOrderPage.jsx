import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";

import {
  OrderDetailsSection,
  ReturnItemsSection,
  ReturnReceiptDialog,
} from "./components";
import { useDispatch, useSelector } from "react-redux";
import { getOrdersByBranch } from "../../../Redux Toolkit/features/order/orderThunks";
import OrderTable from "./components/OrderTable";

const ReturnOrderPage = () => {
  const location = useLocation();
  const [selectedOrder, setSelectedOrder] = useState(location.state?.selectedOrder || null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);

  const dispatch = useDispatch();
  const { branch } = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);

  const effectiveBranchId =
    branch?.id ||
    branch?.branch?.id ||
    userProfile?.branchId ||
    userProfile?.branch?.id;

  // Fetch orders for the branch on mount or when branch changes
  useEffect(() => {
    if (effectiveBranchId) {
      dispatch(getOrdersByBranch({ branchId: effectiveBranchId }));
    }
  }, [dispatch, effectiveBranchId]);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-card border-b">
        <h1 className="text-2xl font-bold">Return / Refund</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Order Search & Selection */}
        {!selectedOrder ? (
          <OrderTable handleSelectOrder={handleSelectOrder} />
        ) : (
          <>
            <OrderDetailsSection
              selectedOrder={selectedOrder}
              setSelectedOrder={setSelectedOrder}
            />
            <ReturnItemsSection
              setShowReceiptDialog={setShowReceiptDialog}
              selectedOrder={selectedOrder}
            />
          </>
        )}
      </div>

      {selectedOrder && (
        <ReturnReceiptDialog
          showReceiptDialog={showReceiptDialog}
          setShowReceiptDialog={setShowReceiptDialog}
          selectedOrder={selectedOrder}
        />
      )}
    </div>
  );
};

export default ReturnOrderPage;
