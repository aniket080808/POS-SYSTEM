import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import {
  getAllCustomers,
  addLoyaltyPoints,
} from "@/Redux Toolkit/features/customer/customerThunks";
import {
  getOrdersByCustomer,
} from "@/Redux Toolkit/features/order/orderThunks";
import {
  filterCustomers,
  calculateCustomerStats,
} from "./utils/customerUtils";
import {
  CustomerSearch,
  CustomerList,
  CustomerDetails,
  PurchaseHistory,
  AddPointsDialog,
} from "./components";
import { clearCustomerOrders } from "../../../Redux Toolkit/features/order/orderSlice";
import CustomerForm from "./CustomerForm";

const CustomerLookupPage = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const {
    customers = [],
    loading: customerLoading,
    error: customerError,
  } = useSelector((state) => state.customer);
  const {
    customerOrders = [],
    loading: orderLoading,
    error: orderError,
  } = useSelector((state) => state.order);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddPointsDialog, setShowAddPointsDialog] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState(0);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  useEffect(() => {
    dispatch(getAllCustomers());
  }, [dispatch]);

  useEffect(() => {
    if (customerError) {
      toast({
        title: "Error",
        description: customerError,
        variant: "destructive",
      });
    }
  }, [customerError, toast]);

  useEffect(() => {
    if (orderError) {
      toast({
        title: "Error",
        description: orderError,
        variant: "destructive",
      });
    }
  }, [orderError, toast]);

  const filteredCustomers = filterCustomers(customers, searchTerm);

  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    dispatch(clearCustomerOrders());
    if (customer?.id) {
      dispatch(getOrdersByCustomer(customer.id));
    }
  };

  // Auto-select first customer or sync current selectedCustomer with fresh backend customer list
  useEffect(() => {
    if (customers.length > 0) {
      if (!selectedCustomer) {
        handleSelectCustomer(customers[0]);
      } else {
        const fresh = customers.find((c) => c.id === selectedCustomer.id);
        if (fresh && (fresh.loyaltyPoints !== selectedCustomer.loyaltyPoints || fresh.loyaltyStatus !== selectedCustomer.loyaltyStatus)) {
          setSelectedCustomer(fresh);
        }
      }
    }
  }, [customers]);


  const handleAddPoints = async () => {
    const pts = parseInt(pointsToAdd, 10);
    if (isNaN(pts) || pts <= 0) {
      toast({
        title: "Invalid Points",
        description: "Please enter a valid positive number of loyalty points.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCustomer?.id) return;

    try {
      const result = await dispatch(addLoyaltyPoints({ id: selectedCustomer.id, points: pts })).unwrap();
      setSelectedCustomer((prev) => ({ ...prev, ...result }));
      toast({
        title: "Loyalty Points Awarded",
        description: `Successfully awarded ${pts} points to ${selectedCustomer?.fullName || "customer"}.`,
      });
      setShowAddPointsDialog(false);
      setPointsToAdd(0);
    } catch (err) {
      toast({
        title: "Failed to Add Points",
        description: typeof err === "string" ? err : (err?.message || "Failed to update loyalty points"),
        variant: "destructive",
      });
    }
  };

  const customerStats = selectedCustomer
    ? calculateCustomerStats(customerOrders)
    : null;

  const displayCustomer = selectedCustomer
    ? {
        ...selectedCustomer,
        ...customerStats,
      }
    : null;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 bg-card border-b border-border/80 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Customer Relationship Management</h1>
          <p className="text-xs text-muted-foreground">Directory search, purchase histories, and loyalty balances</p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Customer Search & List */}
        <div className="w-1/3 border-r border-border flex flex-col bg-card/40">
          <CustomerSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddCustomer={() => setShowCustomerForm(true)}
          />

          <CustomerList
            customers={filteredCustomers}
            selectedCustomer={selectedCustomer}
            onSelectCustomer={handleSelectCustomer}
            loading={customerLoading}
          />
        </div>

        {/* Right Column - Customer Details */}
        <div className="w-2/3 flex flex-col overflow-y-auto bg-card/20">
          <CustomerDetails
            customer={displayCustomer}
            onAddPoints={() => setShowAddPointsDialog(true)}
            loading={orderLoading}
          />

          {selectedCustomer && (
            <PurchaseHistory orders={customerOrders} loading={orderLoading} />
          )}
        </div>
      </div>

      <AddPointsDialog
        isOpen={showAddPointsDialog}
        onClose={() => setShowAddPointsDialog(false)}
        customer={selectedCustomer}
        pointsToAdd={pointsToAdd}
        onPointsChange={setPointsToAdd}
        onAddPoints={handleAddPoints}
      />

      <CustomerForm 
        showCustomerForm={showCustomerForm}
        setShowCustomerForm={setShowCustomerForm}
      />
    </div>
  );
};

export default CustomerLookupPage;
