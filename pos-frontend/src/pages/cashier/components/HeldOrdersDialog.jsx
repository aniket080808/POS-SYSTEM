import React, { useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pause, Play, Trash2, Clock, User, Loader2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchHeldOrders,
  recallAndDeleteHeldOrder,
} from "@/Redux Toolkit/features/heldOrder/heldOrderThunks";
import { resumeOrder, selectHeldOrders } from "@/Redux Toolkit/features/cart/cartSlice";
import { useToast } from "@/components/ui/use-toast";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { playScanBeep, playErrorBeep } from "@/utils/audioUtils";

const HeldOrdersDialog = ({
  showHeldOrdersDialog,
  setShowHeldOrdersDialog,
}) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrencyFormatter();
  const { heldOrders: dbHeldOrders = [], loading } = useSelector((state) => state.heldOrder || {});
  const localHeldOrders = useSelector(selectHeldOrders) || [];
  const { userProfile } = useSelector((state) => state.user || {});
  const { branch } = useSelector((state) => state.branch || {});
  const { store } = useSelector((state) => state.store || {});

  const effectiveBranchId =
    branch?.id ||
    branch?.branch?.id ||
    userProfile?.branchId ||
    userProfile?.branch?.id ||
    store?.branches?.[0]?.id ||
    userProfile?.storeId;

  useEffect(() => {
    if (showHeldOrdersDialog) {
      dispatch(fetchHeldOrders(effectiveBranchId || null));
    }
  }, [showHeldOrdersDialog, effectiveBranchId, dispatch]);

  // Combine DB held orders and LocalStorage fallback held orders
  const allHeldOrders = useMemo(() => {
    const combined = [...dbHeldOrders];
    const existingIds = new Set(dbHeldOrders.map((o) => String(o.id)));

    localHeldOrders.forEach((lo) => {
      if (!existingIds.has(String(lo.id))) {
        combined.push({
          id: lo.id,
          referenceTag: `Parked #${String(lo.id).slice(-4)}`,
          totalAmount: lo.items?.reduce((sum, it) => sum + (Number(it.sellingPrice || it.price || 0) * Number(it.quantity || 1)), 0) || 0,
          customerName: lo.customer?.fullName || lo.customer?.name || null,
          customerPhone: lo.customer?.phone || null,
          customerId: lo.customer?.id || null,
          createdAt: lo.timestamp || new Date().toISOString(),
          items: (lo.items || []).map((it) => ({
            id: it.id,
            productId: it.id,
            productName: it.name,
            sellingPrice: it.sellingPrice || it.price,
            price: it.price || it.sellingPrice,
            sku: it.sku,
            quantity: it.quantity,
            image: it.image,
          })),
          isLocalOnly: true,
        });
      }
    });

    return combined;
  }, [dbHeldOrders, localHeldOrders]);

  const handleResumeOrder = async (order) => {
    // 1. Load items into cart
    dispatch(
      resumeOrder({
        id: order.id,
        items: (order.items || []).map((it) => ({
          id: it.productId || it.id,
          name: it.productName || it.name,
          sku: it.sku,
          price: it.sellingPrice || it.price || 0,
          sellingPrice: it.sellingPrice || it.price || 0,
          image: it.image,
          quantity: it.quantity || 1,
          product: {
            id: it.productId || it.id,
            name: it.productName || it.name,
            sellingPrice: it.sellingPrice || it.price || 0,
            mrp: it.price || it.sellingPrice || 0,
            sku: it.sku,
            image: it.image,
          },
        })),
        customer: order.customerId
          ? {
              id: order.customerId,
              fullName: order.customerName,
              phone: order.customerPhone,
            }
          : null,
      })
    );

    // 2. Delete from database held orders
    if (order.id) {
      dispatch(recallAndDeleteHeldOrder(order.id));
    }

    playScanBeep();
    setShowHeldOrdersDialog(false);
    toast({
      title: "Order Recalled 🎉",
      description: `${order.referenceTag || "Held Bill"} loaded into active cart.`,
    });
  };

  const handleDeleteHeldOrder = (order) => {
    if (order.id) {
      dispatch(recallAndDeleteHeldOrder(order.id));
      dispatch(resumeOrder({ id: order.id, items: [] })); // cleans local
    }
    playErrorBeep();
    toast({
      title: "Parked Bill Removed",
      description: "Held bill discarded from queue.",
    });
  };

  return (
    <Dialog open={showHeldOrdersDialog} onOpenChange={setShowHeldOrdersDialog}>
      <DialogContent className="sm:max-w-xl bg-card border-border">
        <DialogHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Pause className="w-4 h-4 text-[#B8860B]" />
              Parked & Held Orders Queue
            </DialogTitle>
            <Badge variant="outline" className="font-mono text-xs">
              {allHeldOrders.length} {allHeldOrders.length === 1 ? "Order" : "Orders"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto py-2">
          {loading && allHeldOrders.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#B8860B]" />
              <p className="text-xs text-muted-foreground">Loading parked orders...</p>
            </div>
          ) : allHeldOrders.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground font-semibold space-y-2">
              <div className="p-3.5 rounded-full bg-secondary w-fit mx-auto text-muted-foreground/60">
                <Pause className="w-6 h-6" />
              </div>
              <p className="font-bold text-foreground">No orders currently parked</p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                Use <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">F4</kbd> during billing to park an active customer cart.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {allHeldOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-2xl bg-secondary/30 hover:bg-secondary/50 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">
                        {order.referenceTag || `Parked Order #${order.id}`}
                      </h4>
                      <Badge className="bg-[#B8860B]/15 text-[#B8860B] border-0 text-[10px] font-mono">
                        {formatCurrency(order.totalAmount || 0)}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : "Held"}
                      </span>
                      <span>•</span>
                      <span>{order.items?.length || 0} line items</span>
                      {order.customerName && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-foreground font-medium">
                            <User className="w-3 h-3 text-[#B8860B]" />
                            {order.customerName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteHeldOrder(order)}
                      className="text-xs h-8 px-2 text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer"
                      title="Discard Parked Bill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs font-bold h-8 gap-1.5 bg-[#C9A227] hover:bg-[#B08B1B] text-[#262422] cursor-pointer shadow-xs"
                      onClick={() => handleResumeOrder(order)}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Recall Bill
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-border/60">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHeldOrdersDialog(false)}
            className="text-xs h-9"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HeldOrdersDialog;