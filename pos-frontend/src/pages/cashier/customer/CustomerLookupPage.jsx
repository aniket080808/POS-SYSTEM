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

  // Redux state
  const {
    customers,
    loading: customerLoading,
    error: customerError,
  } = useSelector((state) => state.customer);
  const {
    customerOrders,
    loading: orderLoading,
    error: orderError,
  } = useSelector((state) => state.order);
  // const { userProfile } = useSelector((state) => state.user);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddPointsDialog, setShowAddPointsDialog] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState(0);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  

  // Load customers on component mount
  useEffect(() => {
    dispatch(getAllCustomers());
  }, [dispatch]);

  // Handle errors
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

  // Filter customers based on search term
  const filteredCustomers = filterCustomers(customers, searchTerm);

  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    dispatch(clearCustomerOrders());
    if (customer?.id) {
      dispatch(getOrdersByCustomer(customer.id));
    }
  };

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
        title: "Loyalty Points Added",
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

  // Calculate customer stats from orders
  const customerStats = selectedCustomer
    ? calculateCustomerStats(customerOrders)
    : null;

  // Format customer data for display
  const displayCustomer = selectedCustomer
    ? {
        ...selectedCustomer,
        ...customerStats,
      }
    : null;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-card border-b">
        <h1 className="text-2xl font-bold">Customer Management</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Customer Search & List */}
        <div className="w-1/3 border-r flex flex-col ">
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
        <div className="w-2/3 flex flex-col overflow-y-auto">
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

      {/* Add Points Dialog */}
      <AddPointsDialog
        isOpen={showAddPointsDialog}
        onClose={() => setShowAddPointsDialog(false)}
        customer={selectedCustomer}
        pointsToAdd={pointsToAdd}
        onPointsChange={setPointsToAdd}
        onAddPoints={handleAddPoints}
      />

      {/* Add Customer Dialog */}
        <CustomerForm 
          showCustomerForm={showCustomerForm}
          setShowCustomerForm={setShowCustomerForm}
          // onCustomerCreated={handleCustomerCreat}
        />

    
    </div>
  );
};

export default CustomerLookupPage;
