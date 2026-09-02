import React from "react";
import { handleDownloadOrderPDF } from "../pdf/pdfUtils";
import { useToast } from "../../../../components/ui/use-toast";
import {
  Dialog,
  DialogContent,
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
    dispatch(resetOrder());

    toast({
      title: "Invoice Finalized",
      description: "Order saved. Terminal ready for next sale.",
    });
  };

  return (
    <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
      {selectedOrder && (
        <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden shadow-2xl bg-card border-border">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border/80 bg-card shrink-0 flex items-center justify-between">
            <DialogHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#B8860B]" />
                <DialogTitle className="text-lg font-bold tracking-tight">
                  Settled Invoice #{selectedOrder.id}
                </DialogTitle>
              </div>
            </DialogHeader>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <OrderDetails selectedOrder={selectedOrder} />
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-4 border-t border-border/80 bg-card shrink-0 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="text-xs h-9">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintInvoice}
                className="text-xs h-9"
              >
                <PrinterIcon className="h-3.5 w-3.5 mr-1.5" />
                Print Receipt
              </Button>
            </div>

            <Button onClick={finishOrder} size="sm" className="w-full sm:w-auto text-xs font-bold h-9 gap-1.5">
              <PlusCircle className="h-3.5 w-3.5" />
              Start New Order
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default InvoiceDialog;
