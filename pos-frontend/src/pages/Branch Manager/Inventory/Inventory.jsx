import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Upload, Plus } from "lucide-react";
import { getInventoryByBranch, createInventory, updateInventory } from "@/Redux Toolkit/features/inventory/inventoryThunks";
import { getProductsByStore } from "@/Redux Toolkit/features/product/productThunks";
import { toast } from "@/components/ui/use-toast";
import InventoryTable from "./InventoryTable";
import InventoryStats from "./InventoryStats";
import InventoryFilters from "./InventoryFilters";
import InventoryFormDialog from "./InventoryFormDialog";

const Inventory = () => {
  const dispatch = useDispatch();
  const branch = useSelector((state) => state.branch.branch);
  const inventories = useSelector((state) => state.inventory.inventories);
  const products = useSelector((state) => state.product.products);
  const fileInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editInventory, setEditInventory] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editProductId, setEditProductId] = useState("");

  useEffect(() => {
    if (branch?.id) dispatch(getInventoryByBranch(branch?.id));
    if (branch?.storeId) dispatch(getProductsByStore(branch?.storeId));
  }, [branch, dispatch]);

  // Map inventory to table rows with product info
  const inventoryRows = (inventories || []).map((inv) => {
    const product = (products || []).find((p) => p?.id === inv.productId) || {};
    return {
      id: inv?.id,
      sku: product.sku || inv.productId,
      name: product.name || "Unknown Product",
      quantity: inv.quantity,
      category: product.category || "",
      productId: inv.productId,
    };
  });

  // Filter inventory based on search and filters
  const filteredRows = inventoryRows.filter((row) => {
    const matchesSearch =
      !searchTerm.trim() ||
      (row?.name && row.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (row?.sku && String(row.sku).toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      category === "all" || !category || row.category === category;
    return matchesSearch && matchesCategory;
  });

  // Add Inventory
  const handleAddInventory = async () => {
    if (!selectedProductId || !quantity || !branch?.id) return;
    try {
      await dispatch(
        createInventory({
          branchId: branch?.id,
          productId: Number(selectedProductId),
          quantity: Number(quantity),
        })
      ).unwrap();
      toast({
        title: "Inventory Added",
        description: `Successfully added inventory for selected product.`,
      });
      setIsAddDialogOpen(false);
      setSelectedProductId("");
      setQuantity(1);
      dispatch(getInventoryByBranch(branch?.id));
    } catch (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to add inventory",
        variant: "destructive",
      });
    }
  };

  // Edit Inventory
  const handleOpenEditDialog = (row) => {
    setEditInventory(row);
    setEditQuantity(row.quantity);
    setEditProductId(row.productId);
    setIsEditDialogOpen(true);
  };

  const handleUpdateInventory = async () => {
    if (!editInventory?.id || !branch?.id) return;
    try {
      await dispatch(
        updateInventory({
          id: editInventory.id,
          dto: {
            branchId: branch.id,
            productId: editInventory.productId,
            quantity: Number(editQuantity),
          },
        })
      ).unwrap();
      toast({
        title: "Inventory Updated",
        description: `Updated quantity to ${editQuantity}.`,
      });
      setIsEditDialogOpen(false);
      setEditInventory(null);
      setEditQuantity(1);
      setEditProductId("");
      dispatch(getInventoryByBranch(branch.id));
    } catch (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update inventory",
        variant: "destructive",
      });
    }
  };

  // CSV Import handler
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file || !branch?.id) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r\n|\n/).filter((line) => line.trim() !== "");
        if (lines.length < 2) {
          toast({
            title: "Invalid CSV",
            description: "CSV file must contain at least a header row and one data row.",
            variant: "destructive",
          });
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const skuIdx = headers.findIndex((h) => h.includes("sku") || h.includes("code"));
        const nameIdx = headers.findIndex((h) => h.includes("name") || h.includes("product"));
        const qtyIdx = headers.findIndex((h) => h.includes("qty") || h.includes("quantity") || h.includes("stock"));

        let importedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map((c) => c.trim());
          if (cols.length === 0) continue;

          let matchedProduct = null;
          if (skuIdx !== -1 && cols[skuIdx]) {
            matchedProduct = products.find((p) => p.sku && p.sku.toLowerCase() === cols[skuIdx].toLowerCase());
          }
          if (!matchedProduct && nameIdx !== -1 && cols[nameIdx]) {
            matchedProduct = products.find((p) => p.name && p.name.toLowerCase() === cols[nameIdx].toLowerCase());
          }

          const parsedQty = qtyIdx !== -1 && !isNaN(Number(cols[qtyIdx])) ? Number(cols[qtyIdx]) : 1;

          if (matchedProduct) {
            await dispatch(
              createInventory({
                branchId: branch.id,
                productId: matchedProduct.id,
                quantity: parsedQty,
              })
            ).unwrap();
            importedCount++;
          }
        }

        toast({
          title: "Import Completed",
          description: `Successfully imported / updated ${importedCount} items from CSV.`,
        });
        dispatch(getInventoryByBranch(branch.id));
      } catch (err) {
        toast({
          title: "Import Error",
          description: err?.message || "Failed to parse CSV file.",
          variant: "destructive",
        });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            className="hidden"
            onChange={handleImportCSV}
          />
          <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Inventory
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <InventoryFilters
        searchTerm={searchTerm}
        onSearch={(e) => setSearchTerm(e.target.value)}
        category={category}
        onCategoryChange={setCategory}
        products={products || []}
        inventoryRows={inventoryRows}
      />

      {/* Table */}
      <InventoryTable rows={filteredRows} onEdit={handleOpenEditDialog} />

      {/* Add/Edit Dialog (reused) */}
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
      <InventoryFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedProductId={editProductId}
        setSelectedProductId={setEditProductId}
        quantity={editQuantity}
        setQuantity={setEditQuantity}
        onSubmit={handleUpdateInventory}
        mode="edit"
      />
    </div>
  );
};

export default Inventory;
