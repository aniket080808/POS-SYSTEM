import React from "react";
import { handleDownloadOrderPDF } from "../pdf/pdfUtils";
import { useToast } from "../../../../components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, PrinterIcon, PlusCircle, CheckCircle2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import OrderDetails from "./OrderDetails";
import { resetOrder } from "../../../../Redux Toolkit/features/cart/cartSlice";

const InvoiceDialog = ({ showInvoiceDialog, setShowInvoiceDialog }) => {
  const { selectedOrder } = useSelector((state) => state.order);
  const { toast } = useToast();
  const dispatch = useDispatch();

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (selectedOrder) {
      await handleDownloadOrderPDF(selectedOrder, toast);
    }
  };

  const finishOrder = () => {
    setShowInvoiceDialog(false);
    // Reset the order
    dispatch(resetOrder());

    toast({
      title: "Order Completed",
      description: "Order saved successfully. Terminal ready for next sale.",
    });
  };

  return (
    <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
      {selectedOrder && (
        <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b bg-background shrink-0 flex items-center justify-between">
            <DialogHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <DialogTitle className="text-xl font-bold">
                  Order #{selectedOrder.id} Invoice
                </DialogTitle>
              </div>
            </DialogHeader>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <OrderDetails selectedOrder={selectedOrder} />
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-4 border-t bg-muted/30 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="flex-1 sm:flex-none">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintInvoice}
                className="flex-1 sm:flex-none"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
            </div>

            <Button onClick={finishOrder} size="sm" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
              <PlusCircle className="h-4 w-4 mr-2" />
              Start New Order
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default InvoiceDialog;
