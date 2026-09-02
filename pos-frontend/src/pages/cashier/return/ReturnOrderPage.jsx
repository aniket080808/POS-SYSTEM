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
  const { branch, branches = [] } = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);
  const { store } = useSelector((state) => state.store);

  const effectiveBranchId =
    branch?.id ||
    branch?.branch?.id ||
    userProfile?.branchId ||
    userProfile?.branch?.id ||
    store?.branches?.[0]?.id ||
    branches?.[0]?.id;

  useEffect(() => {
    if (effectiveBranchId) {
      dispatch(getOrdersByBranch({ branchId: effectiveBranchId }));
    }
  }, [dispatch, effectiveBranchId]);

  const [selectedItems, setSelectedItems] = useState({});

  useEffect(() => {
    if (selectedOrder?.items && selectedOrder.status !== "REFUNDED") {
      // Default: select all eligible items with their remaining quantity
      const initialSelection = {};
      selectedOrder.items.forEach((item) => {
        const qty = typeof item.quantity === "number" ? item.quantity : 0;
        if (qty > 0) {
          // item.price in OrderItem is the total line price (unitPrice * quantity)
          const unitPrice = qty > 0 ? item.price / qty : item.price || 0;
          initialSelection[item.id] = {
            orderItemId: item.id,
            productId: item.product?.id || item.productId,
            productName: item.product?.name || item.productName || "Product",
            maxQty: qty,
            returnQty: qty,
            unitPrice: unitPrice,
          };
        }
      });
      setSelectedItems(initialSelection);
    } else {
      setSelectedItems({});
    }
  }, [selectedOrder]);

  const handleToggleItem = (item) => {
    if (selectedOrder?.status === "REFUNDED") return;
    const qty = typeof item.quantity === "number" ? item.quantity : 0;
    if (qty <= 0) return;

    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[item.id]) {
        delete next[item.id];
      } else {
        const unitPrice = qty > 0 ? item.price / qty : item.price || 0;
        next[item.id] = {
          orderItemId: item.id,
          productId: item.product?.id || item.productId,
          productName: item.product?.name || item.productName || "Product",
          maxQty: qty,
          returnQty: qty,
          unitPrice: unitPrice,
        };
      }
      return next;
    });
  };

  const handleUpdateQty = (itemId, newQty) => {
    if (selectedOrder?.status === "REFUNDED") return;
    setSelectedItems((prev) => {
      if (!prev[itemId]) return prev;
      const item = prev[itemId];
      const boundedQty = Math.max(1, Math.min(item.maxQty, parseInt(newQty, 10) || 1));
      return {
        ...prev,
        [itemId]: {
          ...item,
          returnQty: boundedQty,
        },
      };
    });
  };

  const handleToggleAll = () => {
    if (!selectedOrder?.items || selectedOrder.status === "REFUNDED") return;
    const availableItems = selectedOrder.items.filter(
      (it) => (typeof it.quantity === "number" ? it.quantity : 0) > 0
    );
    if (availableItems.length === 0) return;

    const allSelected = availableItems.every((it) => !!selectedItems[it.id]);
    if (allSelected) {
      setSelectedItems({});
    } else {
      const fullSelection = {};
      availableItems.forEach((item) => {
        const qty = item.quantity;
        const unitPrice = qty > 0 ? item.price / qty : item.price || 0;
        fullSelection[item.id] = {
          orderItemId: item.id,
          productId: item.product?.id || item.productId,
          productName: item.product?.name || item.productName || "Product",
          maxQty: qty,
          returnQty: qty,
          unitPrice: unitPrice,
        };
      });
      setSelectedItems(fullSelection);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 bg-card border-b border-border/80 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Customer Returns & Refunds</h1>
          <p className="text-xs text-muted-foreground">Select past transaction, select item reason, and disburse refund</p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {!selectedOrder ? (
          <OrderTable handleSelectOrder={handleSelectOrder} />
        ) : (
          <>
            <OrderDetailsSection
              selectedOrder={selectedOrder}
              setSelectedOrder={setSelectedOrder}
              selectedItems={selectedItems}
              onToggleItem={handleToggleItem}
              onUpdateQty={handleUpdateQty}
              onToggleAll={handleToggleAll}
            />
            <ReturnItemsSection
              setShowReceiptDialog={setShowReceiptDialog}
              selectedOrder={selectedOrder}
              selectedItems={selectedItems}
              effectiveBranchId={effectiveBranchId}
            />
          </>
        )}
      </div>

      {selectedOrder && (
        <ReturnReceiptDialog
          showReceiptDialog={showReceiptDialog}
          setShowReceiptDialog={setShowReceiptDialog}
          selectedOrder={selectedOrder}
          selectedItems={selectedItems}
        />
      )}
    </div>
  );
};

export default ReturnOrderPage;
