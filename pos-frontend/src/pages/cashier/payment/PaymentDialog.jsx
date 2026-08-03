import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import {
  selectCartItems,
  selectNote,
  selectPaymentMethod,
  selectSelectedCustomer,
  selectTotal,
  setCurrentOrder,
  setPaymentMethod,
} from "../../../Redux Toolkit/features/cart/cartSlice";
import { useToast } from "../../../components/ui/use-toast";
import { useDispatch } from "react-redux";
import { createOrder } from "../../../Redux Toolkit/features/order/orderThunks";
import { paymentMethods as allPaymentMethods } from "./data";

const PaymentDialog = ({
  showPaymentDialog,
  setShowPaymentDialog,
  setShowReceiptDialog,
}) => {
  const paymentMethod = useSelector(selectPaymentMethod);
  const {toast} = useToast();
  const cart = useSelector(selectCartItems);
  const branch = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);
  const { store } = useSelector((state) => state.store);
  const dispatch = useDispatch();
  
  // Filter payment methods based on store settings
  const acceptedMethods = store?.acceptedPaymentMethods 
    ? store.acceptedPaymentMethods.split(',').map(m => m.trim().toUpperCase())
    : ['CASH', 'CARD', 'UPI'];
  const paymentMethods = allPaymentMethods.filter(m => acceptedMethods.includes(m.key));

  const selectedCustomer = useSelector(selectSelectedCustomer);

  const total = useSelector(selectTotal);

  const note = useSelector(selectNote);

  

  const processPayment = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before processing payment",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCustomer) {
      toast({
        title: "Customer Required",
        description: "Please select a customer before processing payment",
        variant: "destructive",
      });
      return;
    }

    // Guard: ensure a payment method is selected and is in the accepted list
    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }
    if (!acceptedMethods.includes(paymentMethod.toUpperCase())) {
      toast({
        title: "Payment Method Not Available",
        description: "This payment method is not accepted by this store.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare order data according to OrderDTO structure
      const orderData = {
        totalAmount: total,
        branchId: branch.id,
        cashierId: userProfile.id,
        customer: selectedCustomer || null,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        paymentType: paymentMethod,
        note: note || "",
      };

      console.log("Creating order:", orderData);

      // Create order
      const createdOrder = await dispatch(createOrder(orderData)).unwrap();
      dispatch(setCurrentOrder(createdOrder));

      setShowPaymentDialog(false);
      setShowReceiptDialog(true);

      toast({
        title: "Order Created Successfully",
        description: `Order #${createdOrder.id} created and payment processed`,
      });
    } catch (error) {
      console.error("Failed to create order:", error);
      toast({
        title: "Order Creation Failed",
        description: error || "Failed to create order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentMethod = (method) => dispatch(setPaymentMethod(method));

  return (
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              ₹{total.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">Amount to be paid</p>
          </div>

          <div className="space-y-2">
            {paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <Button
                  key={method.key}
                  variant={paymentMethod === method.key ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handlePaymentMethod(method.key)}
                >
                  {method.label}
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No payment methods are configured for this store. Please contact your store administrator.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
            Cancel
          </Button>
          <Button onClick={processPayment}>Complete Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
