import React, { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

// Import components
import POSHeader from "./components/POSHeader";
import ProductSection from "./product/ProductSection";
import CartSection from "./cart/CartSection";
import CustomerPaymentSection from "./payment/CustomerPaymentSection";

import PaymentDialog from "./payment/PaymentDialog";
import HeldOrdersDialog from "./components/HeldOrdersDialog";
import CustomerDialog from "./customer/CustomerDialog";
import InvoiceDialog from "./order/OrderDetails/InvoiceDialog";

import { useDispatch, useSelector } from "react-redux";
import { parkHeldOrder, fetchHeldOrders } from "@/Redux Toolkit/features/heldOrder/heldOrderThunks";
import { clearCart, selectCartItems, selectTotal, selectSubtotal } from "@/Redux Toolkit/features/cart/cartSlice";

import { playScanBeep, playErrorBeep } from "@/utils/audioUtils";

const CreateOrderPage = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const searchInputRef = useRef(null);

  const { error: orderError } = useSelector((state) => state.order || {});
  const { userProfile } = useSelector((state) => state.user || {});
  const { selectedCustomer } = useSelector((state) => state.customer || {});
  const cartItems = useSelector(selectCartItems) || [];
  const cartTotal = useSelector(selectTotal) || 0;
  const cartSubtotal = useSelector(selectSubtotal) || 0;

  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [showHeldOrdersDialog, setShowHeldOrdersDialog] = useState(false);

  useEffect(() => {
    if (orderError) {
      toast({
        title: "Order Error",
        description: orderError,
        variant: "destructive",
      });
    }
  }, [orderError, toast]);

  // Focus on search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const { branch } = useSelector((state) => state.branch || {});
  const { store } = useSelector((state) => state.store || {});

  const effectiveBranchId =
    branch?.id ||
    branch?.branch?.id ||
    userProfile?.branchId ||
    userProfile?.branch?.id ||
    store?.branches?.[0]?.id ||
    userProfile?.storeId;

  // Auto fetch held orders on mount so badge and queue are always accurate
  useEffect(() => {
    if (effectiveBranchId) {
      dispatch(fetchHeldOrders(effectiveBranchId));
    }
  }, [effectiveBranchId, dispatch]);

  const handleParkActiveBill = () => {
    if (cartItems.length === 0) {
      playErrorBeep();
      toast({
        title: "Cart Empty",
        description: "Add products before parking a bill.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      branchId: effectiveBranchId,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.fullName,
      customerPhone: selectedCustomer?.phone,
      subtotal: cartSubtotal,
      totalAmount: cartTotal,
      referenceTag: `Parked #${Date.now().toString().slice(-4)}`,
      items: cartItems.map((it) => ({
        productId: it.product?.id || it.id,
        productName: it.product?.name || it.name,
        sku: it.product?.sku || it.sku,
        price: it.product?.sellingPrice || it.price,
        sellingPrice: it.product?.sellingPrice || it.price,
        quantity: it.quantity,
        image: it.product?.image || it.image,
      })),
    };

    dispatch(parkHeldOrder(payload));
    dispatch(clearCart());
    playScanBeep();
    toast({
      title: "Bill Parked (F4) ⏸️",
      description: "Order placed on hold. Access anytime from Held Orders queue.",
    });
  };


  // Global Keyboard Shortcuts (F1: Search, F2: Customer, F3: Discount, F4: Park, F8: Held Orders, Ctrl+Enter/F10: Pay)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F1: Focus Search Input / Barcode Scanner
      if (e.key === "F1") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      // F2: Open Customer Selection
      else if (e.key === "F2") {
        e.preventDefault();
        setShowCustomerDialog(true);
      }
      // F3: Focus Discount Input
      else if (e.key === "F3") {
        e.preventDefault();
        const discountInput = document.getElementById("pos-discount-input");
        if (discountInput) {
          discountInput.focus();
          discountInput.select();
        }
      }
      // F4: Park / Hold Active Bill
      else if (e.key === "F4") {
        e.preventDefault();
        handleParkActiveBill();
      }
      // F8: Open Parked / Held Orders Modal
      else if (e.key === "F8") {
        e.preventDefault();
        setShowHeldOrdersDialog(true);
      }
      // F9 / F10 / Ctrl + Enter: Trigger Payment Process
      else if (e.key === "F9" || e.key === "F10" || (e.ctrlKey && e.key === "Enter")) {
        e.preventDefault();
        if (cartItems.length > 0) {
          setShowPaymentDialog(true);
        } else {
          playErrorBeep();
          toast({
            title: "Cart Empty",
            description: "Please add products before checking out.",
            variant: "destructive",
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cartItems.length, cartTotal, cartSubtotal, userProfile, selectedCustomer, toast]);

  return (
    <div className="h-full flex flex-col bg-background select-none">
      {/* Header */}
      <POSHeader />

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Product Search & List */}
        <ProductSection searchInputRef={searchInputRef} />

        {/* Middle Column - Cart */}
        <CartSection setShowHeldOrdersDialog={setShowHeldOrdersDialog} />

        {/* Right Column - Customer & Payment */}
        <CustomerPaymentSection
          setShowCustomerDialog={setShowCustomerDialog}
          setShowPaymentDialog={setShowPaymentDialog}
        />
      </div>

      <CustomerDialog
        showCustomerDialog={showCustomerDialog}
        setShowCustomerDialog={setShowCustomerDialog}
      />

      <PaymentDialog
        showPaymentDialog={showPaymentDialog}
        setShowPaymentDialog={setShowPaymentDialog}
        setShowReceiptDialog={setShowReceiptDialog}
      />

      <InvoiceDialog
        showInvoiceDialog={showReceiptDialog}
        setShowInvoiceDialog={setShowReceiptDialog}
      />

      <HeldOrdersDialog
        showHeldOrdersDialog={showHeldOrdersDialog}
        setShowHeldOrdersDialog={setShowHeldOrdersDialog}
      />
    </div>
  );
};

export default CreateOrderPage;
