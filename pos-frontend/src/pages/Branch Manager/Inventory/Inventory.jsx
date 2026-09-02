import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, RefreshCw, Download } from "lucide-react";
import * as XLSX from "xlsx";
import {
  getInventoryByBranch,
  createInventory,
  updateInventory,
} from "@/Redux Toolkit/features/inventory/inventoryThunks";
import { getProductsByStore } from "@/Redux Toolkit/features/product/productThunks";
import { toast } from "@/components/ui/use-toast";
import InventoryTable from "./InventoryTable";
import InventoryFilters from "./InventoryFilters";
import InventoryFormDialog from "./InventoryFormDialog";

const Inventory = () => {
  const dispatch = useDispatch();
  const { branch } = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);
  const { store } = useSelector((state) => state.store);
  const branchId = branch?.id || userProfile?.branchId || userProfile?.branch?.id;
  const storeId = branch?.storeId || branch?.store?.id || store?.id || userProfile?.storeId || userProfile?.store?.id;
  const inventories = useSelector((state) => state.inventory.inventories) || [];
  const products = useSelector((state) => state.product.products) || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editInventory, setEditInventory] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);

  useEffect(() => {
    if (branchId) dispatch(getInventoryByBranch(branchId));
    if (storeId) dispatch(getProductsByStore(storeId));
  }, [branchId, storeId, dispatch]);

  const inventoryRows = useMemo(() => {
    const seenIds = new Set();
    return inventories
      .filter((inv) => {
        if (!inv || !inv.id) return false;
        if (seenIds.has(inv.id)) return false;
        seenIds.add(inv.id);
        return true;
      })
      .map((inv) => {
        const product = products.find((p) => p?.id === inv.productId) || {};
        const categoryName = typeof product.category === "object"
          ? (product.category?.name || "General")
          : (product.category || product.categoryName || "General");

        return {
          id: inv.id,
          sku: product.sku || inv.productId,
          name: product.name || "Unknown Product",
          quantity: inv.quantity,
          category: categoryName,
          productId: inv.productId,
          sellingPrice: product.sellingPrice || product.mrp || 0,
          image: product.image,
        };
      });
  }, [inventories, products]);

  const filteredRows = inventoryRows.filter((row) => {
    const matchesSearch =
      !searchTerm.trim() ||
      (row?.name && row.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (row?.sku && String(row.sku).toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      category === "all" || !category || row.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleAddInventory = async () => {
    if (!selectedProductId) {
      toast({ title: "Validation Error", description: "Please select a product.", variant: "destructive" });
      return;
    }
    try {
      await dispatch(
        createInventory({
          branchId: branch?.id,
          productId: selectedProductId,
          quantity: Number(quantity),
        })
      ).unwrap();
      toast({ title: "Inventory Added", description: "Product stock recorded successfully." });
      setIsAddDialogOpen(false);
      setSelectedProductId("");
      setQuantity(1);
      if (branch?.id) dispatch(getInventoryByBranch(branch?.id));
    } catch (err) {
      toast({ title: "Error", description: err || "Failed to add stock.", variant: "destructive" });
    }
  };

  const handleOpenEdit = (item) => {
    setEditInventory(item);
    setEditQuantity(item.quantity);
    setIsEditDialogOpen(true);
  };

  const handleUpdateInventory = async () => {
    if (!editInventory?.id) return;
    try {
      await dispatch(
        updateInventory({
          id: editInventory.id,
          quantity: Number(editQuantity),
        })
      ).unwrap();
      toast({ title: "Stock Updated", description: "Inventory count updated successfully." });
      setIsEditDialogOpen(false);
      setEditInventory(null);
      if (branch?.id) dispatch(getInventoryByBranch(branch?.id));
    } catch (err) {
      toast({ title: "Error", description: err || "Failed to update stock.", variant: "destructive" });
    }
  };

  const handleExportStockSheet = () => {
    if (!filteredRows || filteredRows.length === 0) {
      toast({
        title: "No Data",
        description: "No branch stock items available to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      const exportData = filteredRows.map((item, idx) => ({
        "S.No": idx + 1,
        "SKU / Barcode": item.sku || "-",
        "Product Name": item.name || "-",
        "Category": item.category || "General",
        "Shelf Stock Qty": item.quantity ?? 0,
        "Selling Price (₹)": item.sellingPrice || 0,
        "Stock Status": (item.quantity ?? 0) <= 0 ? "Out of Stock" : (item.quantity ?? 0) <= 5 ? "Low Stock" : "In Stock",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Branch Stock Audit");
      const branchName = (branch?.name || "Branch").replace(/[^a-zA-Z0-9]/g, "_");
      XLSX.writeFile(wb, `${branchName}_Stock_Audit_${new Date().toISOString().split("T")[0]}.xlsx`);

      toast({
        title: "Stock Audit Exported",
        description: `Exported ${exportData.length} inventory items successfully.`,
      });
    } catch (err) {
      console.error("Export error:", err);
      toast({
        title: "Export Failed",
        description: "Failed to generate Excel file.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Branch Inventory & Stock
            </h1>
            <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-mono font-bold">
              {filteredRows.length} {filteredRows.length === 1 ? "Item" : "Items"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Surveillance of local workstation stock levels, SKU allocations, and safety reorders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="text-xs h-10 gap-1.5 cursor-pointer"
            onClick={handleExportStockSheet}
          >
            <Download className="h-3.5 w-3.5" /> Export Stock (.xlsx)
          </Button>

          <Button
            variant="outline"
            className="text-xs h-10 gap-1.5 cursor-pointer"
            onClick={() => branch?.id && dispatch(getInventoryByBranch(branch.id))}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Sync
          </Button>

          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="text-xs font-bold h-10 gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Allocate Stock
          </Button>
        </div>
      </div>

      <InventoryFilters
        searchTerm={searchTerm}
        onSearch={(e) => setSearchTerm(e.target.value)}
        category={category}
        onCategoryChange={setCategory}
        products={products}
        inventoryRows={filteredRows}
      />

      <InventoryTable rows={filteredRows} onEdit={handleOpenEdit} />

      {/* Add Dialog */}
      <InventoryFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        selectedProductId={selectedProductId}
        setSelectedProductId={setSelectedProductId}
        quantity={quantity}
        setQuantity={setQuantity}
        onSubmit={handleAddInventory}
        mode="add"
      />

      {/* Edit Dialog */}
      <InventoryFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedProductId={editInventory?.productId}
        setSelectedProductId={() => {}}
        quantity={editQuantity}
        setQuantity={setEditQuantity}
        onSubmit={handleUpdateInventory}
        mode="edit"
      />
    </div>
  );
};

export default Inventory;
