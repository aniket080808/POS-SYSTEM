import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  scanSupplierInvoice,
  importExtractedInvoice,
} from "@/Redux Toolkit/features/ai/aiThunks";
import { clearInvoiceExtraction } from "@/Redux Toolkit/features/ai/aiSlice";
import { getProductsByStore } from "@/Redux Toolkit/features/product/productThunks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import {
  Sparkles,
  UploadCloud,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
} from "lucide-react";

const AiInvoiceScannerModal = ({ open, onOpenChange, storeId }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { format: formatCurrency } = useCurrencyFormatter();
  const fileInputRef = useRef(null);

  const {
    invoiceExtraction,
    scanningInvoice,
    scanError,
    importingInvoice,
  } = useSelector((state) => state.ai || {});

  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editableItems, setEditableItems] = useState([]);

  const handleFileSelect = (file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an invoice document smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    // Trigger AI Scan
    const formData = new FormData();
    formData.append("file", file);

    dispatch(scanSupplierInvoice(formData))
      .unwrap()
      .then((res) => {
        if (res.items && res.items.length > 0) {
          setEditableItems(res.items);
          toast({
            title: "Invoice Parsed with Groq Vision AI",
            description: `Successfully extracted ${res.items.length} product items from bill.`,
          });
        }
      })
      .catch((err) => {
        toast({
          title: "Scan Failed",
          description: err || "Could not parse invoice with AI.",
          variant: "destructive",
        });
      });
  };

  const handleItemChange = (index, field, value) => {
    setEditableItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleDeleteItem = (index) => {
    setEditableItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveToInventory = async () => {
    if (!editableItems || editableItems.length === 0) {
      toast({
        title: "No Items to Import",
        description: "Please extract or add at least one line item.",
        variant: "destructive",
      });
      return;
    }

    try {
      await dispatch(
        importExtractedInvoice({
          storeId: storeId,
          supplierName: invoiceExtraction?.supplierName,
          invoiceNumber: invoiceExtraction?.invoiceNumber,
          items: editableItems.map((it) => ({
            name: it.name,
            sku: it.sku || `SKU-${Date.now().toString().slice(-5)}`,
            barcode: it.barcode || it.sku,
            category: it.category || "General",
            mrp: parseFloat(it.mrp) || parseFloat(it.sellingPrice) || 0,
            sellingPrice: parseFloat(it.sellingPrice) || parseFloat(it.mrp) || 0,
            costPrice: parseFloat(it.costPrice) || 0,
            quantity: parseInt(it.quantity, 10) || 1,
            batchNumber: it.batchNumber,
            expiryDate: it.expiryDate,
            manufacturingDate: it.manufacturingDate,
            hsnCode: it.hsnCode,
            description: it.description,
          })),
        })
      ).unwrap();

      toast({
        title: "Inventory Imported 🎉",
        description: `Successfully created and restocked ${editableItems.length} products!`,
      });

      // Refresh store products
      if (storeId) {
        dispatch(getProductsByStore(storeId));
      }

      onOpenChange(false);
      dispatch(clearInvoiceExtraction());
      setEditableItems([]);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error || "Could not save extracted items to inventory.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-card border-border flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 border-b border-border/80 bg-[#262422] text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-linear-to-br from-[#C9A227] to-[#8C6D14] text-[#262422] shadow-xs">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                  Groq AI Supplier Invoice Ingestion
                  <Badge className="bg-[#C9A227] text-[#262422] text-[10px] font-mono font-bold">
                    ⚡ LLAMA 3.2 VISION
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-[#A8A29E]">
                  Upload photo or PDF of your supplier bill to automatically extract SKUs, prices, batches, & expiry dates into your inventory.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!invoiceExtraction && !scanningInvoice ? (
            /* Upload Dropzone */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/80 hover:border-[#C9A227] rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-secondary/20 hover:bg-secondary/40 space-y-3"
            >
              <div className="p-4 rounded-2xl bg-secondary text-[#C9A227] shadow-2xs">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Click or drag and drop supplier bill / invoice here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports JPEG, PNG, WEBP, and PDF documents up to 10MB
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-xs font-semibold gap-1.5 border-[#C9A227]/40 text-[#C9A227] hover:bg-[#C9A227]/10"
              >
                <FileText className="w-3.5 h-3.5" />
                Browse Document
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
            </div>
          ) : scanningInvoice ? (
            /* Scanning Loader */
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#C9A227]/20 border-t-[#C9A227] animate-spin" />
                <Sparkles className="w-6 h-6 text-[#C9A227] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">
                  Groq Vision is Analyzing Document...
                </p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Detecting item names, wholesale cost, selling prices, tax rates, batch numbers, and expiry dates.
                </p>
              </div>
            </div>
          ) : (
            /* Parsed Items Review Table */
            <div className="space-y-4">
              {/* Header Summary Banner */}
              <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Supplier: </span>
                  <strong className="text-foreground">{invoiceExtraction.supplierName || "Direct Vendor"}</strong>
                  {invoiceExtraction.invoiceNumber && (
                    <span className="text-muted-foreground ml-2">
                      (Inv #{invoiceExtraction.invoiceNumber})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="active" className="text-xs font-mono">
                    {editableItems.length} Products Extracted
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      dispatch(clearInvoiceExtraction());
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="text-xs h-7 gap-1"
                  >
                    Scan Another Document
                  </Button>
                </div>
              </div>

              {/* Editable Line Items Table */}
              <div className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-2xs max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-secondary/95 backdrop-blur-xs z-10">
                    <TableRow className="border-b border-border/80">
                      <TableHead className="text-xs font-bold py-2.5">Product Name</TableHead>
                      <TableHead className="text-xs font-bold py-2.5">Category</TableHead>
                      <TableHead className="text-right text-xs font-bold py-2.5">Cost</TableHead>
                      <TableHead className="text-right text-xs font-bold py-2.5">Selling Price</TableHead>
                      <TableHead className="text-center text-xs font-bold py-2.5">Qty</TableHead>
                      <TableHead className="text-xs font-bold py-2.5">Batch / Expiry</TableHead>
                      <TableHead className="w-10 text-center py-2.5"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editableItems.map((item, idx) => (
                      <TableRow key={idx} className="border-b border-border/60">
                        <TableCell className="py-2">
                          <Input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                            className="h-8 text-xs font-semibold rounded-lg"
                          />
                        </TableCell>
                        <TableCell className="py-2">
                          <Input
                            type="text"
                            value={item.category || ""}
                            placeholder="Category"
                            onChange={(e) => handleItemChange(idx, "category", e.target.value)}
                            className="h-8 text-xs rounded-lg"
                          />
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          <Input
                            type="number"
                            value={item.costPrice || ""}
                            onChange={(e) => handleItemChange(idx, "costPrice", e.target.value)}
                            className="h-8 text-xs font-mono text-right rounded-lg w-20 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          <Input
                            type="number"
                            value={item.sellingPrice || ""}
                            onChange={(e) => handleItemChange(idx, "sellingPrice", e.target.value)}
                            className="h-8 text-xs font-mono font-bold text-[#B8860B] text-right rounded-lg w-20 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          <Input
                            type="number"
                            value={item.quantity || 1}
                            onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                            className="h-8 text-xs font-mono text-center rounded-lg w-16 mx-auto"
                          />
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="space-y-1">
                            <Input
                              type="text"
                              value={item.batchNumber || ""}
                              placeholder="Batch #"
                              onChange={(e) => handleItemChange(idx, "batchNumber", e.target.value)}
                              className="h-6 text-[10px] font-mono rounded"
                            />
                            <Input
                              type="date"
                              value={item.expiryDate || ""}
                              onChange={(e) => handleItemChange(idx, "expiryDate", e.target.value)}
                              className="h-6 text-[10px] font-mono rounded"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(idx)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-[#FBF0EC] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-border/80 bg-secondary/30 shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-9"
          >
            Cancel
          </Button>

          {invoiceExtraction && (
            <Button
              size="sm"
              onClick={handleSaveToInventory}
              disabled={importingInvoice || editableItems.length === 0}
              className="text-xs font-bold h-9 gap-1.5 bg-[#C9A227] hover:bg-[#B08B1B] text-[#262422] cursor-pointer"
            >
              {importingInvoice ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {importingInvoice ? "Importing to Inventory..." : `Commit ${editableItems.length} Items to Inventory`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AiInvoiceScannerModal;
