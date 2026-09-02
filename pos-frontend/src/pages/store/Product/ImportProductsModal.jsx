import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
  Sparkles,
  Database,
  Layers,
  Check,
  ArrowRight,
  RefreshCw,
  X,
  FileCheck,
  Zap,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";
import {
  bulkCreateProducts,
  getProductsByStore,
} from "@/Redux Toolkit/features/product/productThunks";
import { getCategoriesByStore } from "../../../Redux Toolkit/features/category/categoryThunks";
import { toast } from "@/components/ui/use-toast";

// Expected headers in exact order
const EXPECTED_HEADERS = [
  "Image URL",
  "Product Name",
  "SKU",
  "Brand",
  "Category",
  "Color",
  "MRP",
  "Selling Price",
  "Stock",
  "Description",
];

const SAMPLE_ROW = [
  "https://example.com/image.jpg",
  "Sample Product",
  "SKU-001",
  "Sample Brand",
  "Personal Care",
  "Red",
  100,
  90,
  10,
  "Sample product description",
];

const IMPORT_STAGES = [
  {
    id: "validate",
    title: "Sanitizing & Validating",
    desc: "Deduplicating SKUs and verifying data types",
    icon: FileCheck,
    threshold: 25,
  },
  {
    id: "taxonomy",
    title: "Mapping Categories & Attributes",
    desc: "Binding store catalog hierarchy and pricing",
    icon: Layers,
    threshold: 55,
  },
  {
    id: "transaction",
    title: "Writing to Database",
    desc: "Executing atomic bulk write to cloud inventory",
    icon: Database,
    threshold: 85,
  },
  {
    id: "indexing",
    title: "Catalog Sync & Search Indexes",
    desc: "Refreshing store search indexes and cache",
    icon: Zap,
    threshold: 100,
  },
];

/**
 * Normalize backend API error into a user-friendly message.
 */
function normalizeApiError(err) {
  const raw =
    (err && typeof err === "string" && err) ||
    err?.message ||
    err?.response?.data?.message ||
    err?.payload ||
    "Failed to create product";

  const lower = String(raw).toLowerCase();

  if (
    lower.includes("sku") &&
    (lower.includes("unique") ||
      lower.includes("exist") ||
      lower.includes("constraint") ||
      lower.includes("duplicate"))
  ) {
    return "SKU already exists";
  }
  if (lower.includes("category") && lower.includes("not found")) {
    return "Category not found";
  }
  if (lower.includes("sku")) {
    return "SKU already exists";
  }
  return raw;
}

/**
 * Parse a File into an array of row objects using SheetJS.
 */
async function parseFile(file) {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { rows: [], headers: [], error: "The file does not contain any sheets." };
    }
    const sheet = workbook.Sheets[firstSheetName];

    // Get header row
    const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    if (!aoa.length) {
      return { rows: [], headers: [], error: "The file is empty." };
    }
    const headers = aoa[0].map((h) => String(h).trim());

    // Validate headers
    const missing = EXPECTED_HEADERS.filter((h) => !headers.includes(h));
    if (missing.length > 0) {
      return {
        rows: [],
        headers,
        error: `Missing required columns: ${missing.join(
          ", "
        )}. Expected columns: ${EXPECTED_HEADERS.join(", ")}`,
      };
    }

    // Build row objects using header map
    const jsonRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    return { rows: jsonRows, headers, error: null };
  } catch (e) {
    return { rows: [], headers: [], error: `Failed to parse file: ${e.message}` };
  }
}

/**
 * Trim a value if it's a string.
 */
function trimVal(v) {
  return typeof v === "string" ? v.trim() : v;
}

/**
 * Coerce a value to a non-negative number, or return null if invalid.
 */
function toNumber(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
  if (isNaN(n) || n < 0) return null;
  return n;
}

/**
 * Format bytes to readable size
 */
function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

/**
 * Validate parsed rows and resolve categories.
 */
function validateRows(rows, categoryMap) {
  const skuCount = {};
  rows.forEach((r) => {
    const sku = trimVal(r["SKU"]);
    if (sku) {
      skuCount[sku] = (skuCount[sku] || 0) + 1;
    }
  });

  return rows.map((r, idx) => {
    const errors = [];
    const name = trimVal(r["Product Name"]);
    const sku = trimVal(r["SKU"]);
    const brand = trimVal(r["Brand"]);
    const categoryText = trimVal(r["Category"]);
    const color = trimVal(r["Color"]);
    const mrp = toNumber(r["MRP"]);
    const sellingPrice = toNumber(r["Selling Price"]);
    const stock = toNumber(r["Stock"]);
    const description = trimVal(r["Description"]);
    const image = trimVal(r["Image URL"]);

    if (!name) errors.push("Product Name is required");
    if (!sku) errors.push("SKU is required");
    if (sku && skuCount[sku] > 1) errors.push("Duplicate SKU in file");

    if (mrp === null) errors.push("MRP must be a valid number ≥ 0");
    if (sellingPrice === null) errors.push("Selling Price must be a valid number ≥ 0");

    let categoryId = null;
    if (categoryText) {
      const key = categoryText.toLowerCase().trim();
      categoryId = categoryMap[key] ?? null;
      if (categoryId === null) {
        errors.push(`Category '${categoryText}' not found`);
      }
    } else {
      errors.push("Category is required");
    }

    const dto =
      errors.length === 0
        ? {
            name,
            sku,
            description: description || "",
            mrp,
            sellingPrice,
            stock: stock !== null && stock !== undefined ? Math.floor(stock) : 0,
            brand: brand || "",
            categoryId,
            image: image || "",
            color: color || "",
          }
        : null;

    return {
      rowIndex: idx + 2,
      raw: r,
      name,
      sku,
      brand,
      category: categoryText,
      color,
      mrp,
      sellingPrice,
      stock: stock !== null && stock !== undefined ? Math.floor(stock) : 0,
      description,
      image,
      errors,
      dto,
    };
  });
}

export default function ImportProductsModal({
  open,
  isOpen,
  onOpenChange,
  onClose,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const { format: formatCurrency } = useCurrencyFormatter();
  const { store } = useSelector((state) => state.store);
  const { userProfile } = useSelector((state) => state.user);
  const { categories } = useSelector((state) => state.category);

  const activeStoreId = store?.id || userProfile?.storeId || userProfile?.store?.id;
  const isDialogOpen = open !== undefined ? open : (isOpen !== undefined ? isOpen : false);

  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [validatedRows, setValidatedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Buttery smooth import states
  const [importing, setImporting] = useState(false);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [results, setResults] = useState(null);
  const [showFailures, setShowFailures] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);
  const animFrameRef = useRef(null);

  // Build category lookup map
  const categoryMap = useMemo(() => {
    const map = {};
    (categories || []).forEach((c) => {
      if (c && c.name) {
        map[c.name.toLowerCase().trim()] = c.id;
      }
    });
    return map;
  }, [categories]);

  // Ensure categories are loaded for the current store
  useEffect(() => {
    if (activeStoreId && isDialogOpen) {
      const token = localStorage.getItem("jwt");
      if (token && (!categories || categories.length === 0)) {
        dispatch(getCategoriesByStore({ storeId: activeStoreId, token }));
      }
    }
  }, [activeStoreId, isDialogOpen, dispatch, categories]);

  const validRows = useMemo(
    () => validatedRows.filter((r) => r.errors.length === 0),
    [validatedRows]
  );
  const errorRows = useMemo(
    () => validatedRows.filter((r) => r.errors.length > 0),
    [validatedRows]
  );

  // Filtered preview rows based on search & filter
  const displayedPreviewRows = useMemo(() => {
    return validatedRows.filter((row) => {
      if (selectedFilter === "valid" && row.errors.length > 0) return false;
      if (selectedFilter === "error" && row.errors.length === 0) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        row.name?.toLowerCase().includes(q) ||
        row.sku?.toLowerCase().includes(q) ||
        row.brand?.toLowerCase().includes(q) ||
        row.category?.toLowerCase().includes(q)
      );
    });
  }, [validatedRows, selectedFilter, searchQuery]);

  // Summary statistics for celebration screen
  const importMetrics = useMemo(() => {
    if (!validRows.length) return { uniqueCategories: 0, totalStock: 0, totalValue: 0 };
    const uniqueCats = new Set(validRows.map((r) => r.category).filter(Boolean));
    const totalStock = validRows.reduce((acc, r) => acc + (r.stock || 0), 0);
    const totalValue = validRows.reduce((acc, r) => acc + (r.sellingPrice || 0) * (r.stock || 0), 0);
    return {
      uniqueCategories: uniqueCats.size,
      totalStock,
      totalValue,
    };
  }, [validRows]);

  const resetState = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setFile(null);
    setParsing(false);
    setParseError(null);
    setValidatedRows([]);
    setImporting(false);
    setSmoothProgress(0);
    setCurrentProductIndex(0);
    setResults(null);
    setShowFailures(false);
    setDragOver(false);
    setSearchQuery("");
    setSelectedFilter("all");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleDialogChange = (openVal) => {
    if (!openVal) resetState();
    if (onOpenChange) onOpenChange(openVal);
    if (!openVal && onClose) onClose();
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([EXPECTED_HEADERS, SAMPLE_ROW]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "product_import_template.xlsx");
  };

  const handleFileSelected = async (selectedFile) => {
    if (!selectedFile) return;
    const ext = selectedFile.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      setParseError("Please upload a .csv, .xlsx, or .xls file.");
      return;
    }
    setFile(selectedFile);
    setParsing(true);
    setParseError(null);
    setValidatedRows([]);
    setResults(null);

    const { rows, error } = await parseFile(selectedFile);
    if (error) {
      setParseError(error);
      setValidatedRows([]);
    } else if (!rows.length) {
      setParseError("The file contains no data rows.");
      setValidatedRows([]);
    } else {
      const validated = validateRows(rows, categoryMap);
      setValidatedRows(validated);
    }
    setParsing(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFileSelected(droppedFile);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFileSelected(selectedFile);
  };

  /**
   * Buttery Smooth Import Animation and Execution
   */
  const handleImport = async () => {
    if (!validRows.length || !store?.id) return;

    setImporting(true);
    setSmoothProgress(0);
    setCurrentProductIndex(0);
    setResults(null);

    const totalItems = validRows.length;
    const batch = validRows.map((row) => ({ ...row.dto, storeId: store.id }));

    // Animation interpolation state
    let currentAnimValue = 0;
    let isApiResolved = false;
    let finalSuccess = false;
    let apiResultData = null;
    let apiErrorData = null;
    const beginTime = Date.now();

    // 60FPS smooth requestAnimationFrame engine
    const animate = () => {
      const elapsed = Date.now() - beginTime;

      if (!isApiResolved) {
        // Target progress stages while waiting for server response
        let target = 0;
        if (elapsed < 800) {
          // Stage 1: Validation & data packing (0 - 30%)
          target = (elapsed / 800) * 30;
        } else if (elapsed < 2000) {
          // Stage 2: Category mapping & integrity (30 - 62%)
          target = 30 + ((elapsed - 800) / 1200) * 32;
        } else if (elapsed < 4000) {
          // Stage 3: Database transaction writes (62 - 88%)
          target = 62 + ((elapsed - 2000) / 2000) * 26;
        } else {
          // Stage 4: Indexing & catalog caching (88 - 94% asymptote)
          target = 88 + Math.min(6, (elapsed - 4000) / 1500);
        }

        // Smooth physics-based easing
        currentAnimValue += (target - currentAnimValue) * 0.08;
      } else {
        // API finished: smooth fast-forward to 100%
        currentAnimValue += (100 - currentAnimValue) * 0.18 + 0.8;
      }

      const clamped = Math.min(Math.max(currentAnimValue, 0), 100);
      setSmoothProgress(clamped);

      // Smoothly update live preview item ticker
      if (totalItems > 0) {
        const itemIdx = Math.min(
          Math.floor((clamped / 100) * totalItems),
          totalItems - 1
        );
        setCurrentProductIndex(itemIdx);
      }

      // Check for completion
      if (isApiResolved && clamped >= 99.8) {
        setSmoothProgress(100);
        setCurrentProductIndex(totalItems - 1);

        // Allow user to admire the 100% complete state for a brief buttery pause
        setTimeout(() => {
          setImporting(false);
          if (finalSuccess) {
            const successCount = apiResultData?.length || totalItems;
            setResults({ successCount, failures: [] });
            toast({
              title: "Import complete ✨",
              description: `Successfully imported ${successCount} products into your store.`,
            });
            if (typeof onSuccess === "function") {
              onSuccess();
            }
            try {
              const channel = new BroadcastChannel("products_catalog_channel");
              channel.postMessage({ type: "CATALOG_UPDATED" });
              channel.close();
            } catch (e) {}
          } else {
            const reason = normalizeApiError(apiErrorData);
            const failures = validRows.map((row) => ({
              row: row.rowIndex,
              sku: row.sku,
              name: row.name,
              reason,
            }));
            setResults({ successCount: 0, failures });
            toast({
              title: "Import failed",
              description: reason,
              variant: "destructive",
            });
          }
        }, 450);
        return;
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Perform actual API operation
    try {
      const created = await dispatch(bulkCreateProducts(batch)).unwrap();
      apiResultData = created;
      finalSuccess = true;
    } catch (err) {
      apiErrorData = err;
      finalSuccess = false;
    } finally {
      isApiResolved = true;
    }

    // Refresh products catalog in background
    try {
      await dispatch(getProductsByStore(store.id)).unwrap();
    } catch (e) {
      // ignore refresh error
    }
  };

  const handleDownloadFailedRows = () => {
    if (!results?.failures?.length) return;
    const header = [...EXPECTED_HEADERS, "Error Reason"];
    const data = [header];
    results.failures.forEach((f) => {
      const row = validatedRows.find((r) => r.rowIndex === f.row);
      if (row) {
        data.push([
          row.image || "",
          row.name || "",
          row.sku || "",
          row.brand || "",
          row.category || "",
          row.color || "",
          row.mrp ?? "",
          row.sellingPrice ?? "",
          row.stock ?? "",
          row.description || "",
          f.reason,
        ]);
      }
    });
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Failed Rows");
    XLSX.writeFile(wb, "failed_import_rows.csv", { bookType: "csv" });
  };

  // Determine current active pipeline stage based on progress
  const currentStage = useMemo(() => {
    if (smoothProgress < 25) return IMPORT_STAGES[0];
    if (smoothProgress < 55) return IMPORT_STAGES[1];
    if (smoothProgress < 85) return IMPORT_STAGES[2];
    return IMPORT_STAGES[3];
  }, [smoothProgress]);

  const currentlyProcessingItem = validRows[currentProductIndex] || validRows[0];
  const roundedProgress = Math.round(smoothProgress);
  const itemsProcessedCount = Math.min(
    Math.round((smoothProgress / 100) * validRows.length),
    validRows.length
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[1100px] max-h-[92vh] overflow-y-auto p-0 border-0 bg-gradient-to-b from-card to-card/95 shadow-2xl rounded-2xl">
        {/* Custom scoped animations */}
        <style>{`
          @keyframes importShimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          @keyframes glowPulse {
            0%, 100% { opacity: 0.35; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
          }
          @keyframes spinSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes spinReverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          @keyframes floatItem {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
          }
          @keyframes celebrationPop {
            0% { transform: scale(0.6); opacity: 0; }
            70% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-import-shimmer {
            animation: importShimmer 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
          .animate-glow-pulse {
            animation: glowPulse 2.5s ease-in-out infinite;
          }
          .animate-spin-slow {
            animation: spinSlow 8s linear infinite;
          }
          .animate-spin-reverse {
            animation: spinReverse 6s linear infinite;
          }
          .animate-float-item {
            animation: floatItem 3s ease-in-out infinite;
          }
          .animate-celebration-pop {
            animation: celebrationPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
        `}</style>

        {/* Header with gradient accent */}
        <div className="relative px-6 pt-6 pb-4 border-b bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  Bulk Product Importer
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Import hundreds of products instantly with automatic category mapping and SKU validation
                </p>
              </div>
            </div>

            {!importing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="gap-2 text-xs font-medium border-border hover:bg-muted"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Sample Template (.xlsx)
              </Button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* ========================================================================= */}
          {/* STEP 1: FILE UPLOAD ZONE (When not importing and no results) */}
          {/* ========================================================================= */}
          {!results && !importing && validatedRows.length === 0 && (
            <div className="space-y-4">
              {/* Interactive Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
                className={`relative group overflow-hidden border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                  dragOver
                    ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 scale-[1.01]"
                    : "border-border/80 hover:border-emerald-500/60 bg-muted/20 hover:bg-muted/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-base font-semibold text-foreground">
                      Drag & drop your inventory file here, or{" "}
                      <span className="text-emerald-600 dark:text-emerald-400 underline underline-offset-4 decoration-emerald-500/30 group-hover:decoration-emerald-500">
                        browse computer
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: <span className="font-medium text-foreground">CSV (.csv)</span>, <span className="font-medium text-foreground">Excel (.xlsx, .xls)</span> • Maximum 5,000 items per file
                    </p>
                  </div>
                </div>

                {/* Ambient glow behind dropzone */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
              </div>

              {/* Parsing state loader */}
              {parsing && (
                <div className="flex items-center justify-center gap-3 py-6 px-4 bg-muted/40 rounded-xl border border-border">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                  <span className="text-sm font-medium text-foreground">
                    Reading and sanitizing spreadsheet records...
                  </span>
                </div>
              )}

              {/* Parsing error box */}
              {parseError && (
                <div className="p-4 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl border border-red-500/20 text-sm flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">File Format Issue</p>
                    <p className="text-xs mt-0.5 opacity-90">{parseError}</p>
                  </div>
                </div>
              )}

              {/* Instruction Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl border bg-card/60 backdrop-blur-sm space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Exact Column Matching
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Ensure headers match: Product Name, SKU, Brand, Category, MRP, Selling Price, Stock.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border bg-card/60 backdrop-blur-sm space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <Layers className="h-3.5 w-3.5 text-teal-500" />
                    Store Categories
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Categories in the file will automatically link with your existing store category library.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border bg-card/60 backdrop-blur-sm space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    Atomic Batch Sync
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    All items are validated for duplicates and written in a secure atomic cloud transaction.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: PREVIEW TABLE (When file parsed, before clicking import) */}
          {/* ========================================================================= */}
          {!importing && !results && validatedRows.length > 0 && (
            <div className="space-y-4">
              {/* File Info & Action Bar */}
              <div className="flex items-center justify-between flex-wrap gap-3 p-3.5 bg-muted/40 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <FileCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{file?.name}</span>
                      <span className="text-[11px] text-muted-foreground">({formatFileSize(file?.size)})</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-0.5">
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {validRows.length} valid product{validRows.length === 1 ? "" : "s"} ready
                      </span>
                      {errorRows.length > 0 && (
                        <span className="text-red-500 font-medium">
                          • {errorRows.length} row{errorRows.length === 1 ? "" : "s"} with issues
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetState}
                    className="text-xs"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Choose different file
                  </Button>
                  <Button
                    type="button"
                    disabled={validRows.length === 0}
                    onClick={handleImport}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 text-xs font-semibold px-4 gap-2"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Import {validRows.length} Product{validRows.length === 1 ? "" : "s"} Now
                  </Button>
                </div>
              </div>

              {/* Filters & Search in Preview */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedFilter("all")}
                    className={`px-3 py-1 rounded-md font-medium transition-all ${
                      selectedFilter === "all"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All ({validatedRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFilter("valid")}
                    className={`px-3 py-1 rounded-md font-medium transition-all ${
                      selectedFilter === "valid"
                        ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Valid ({validRows.length})
                  </button>
                  {errorRows.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedFilter("error")}
                      className={`px-3 py-1 rounded-md font-medium transition-all ${
                        selectedFilter === "error"
                          ? "bg-background text-red-500 shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Errors ({errorRows.length})
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Filter by name, SKU, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground w-64 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Preview Table */}
              <div className="border rounded-xl max-h-[380px] overflow-auto shadow-xs">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
                    <TableRow>
                      <TableHead className="w-10 text-center">#</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Selling Price</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedPreviewRows.slice(0, 100).map((row) => {
                      const hasError = row.errors.length > 0;
                      return (
                        <TableRow
                          key={row.rowIndex}
                          className={hasError ? "bg-red-500/5 hover:bg-red-500/10" : "hover:bg-muted/40"}
                        >
                          <TableCell className="text-xs text-center font-mono text-muted-foreground">
                            {row.rowIndex}
                          </TableCell>
                          <TableCell className="text-xs font-semibold max-w-[220px] truncate">
                            {row.name || <span className="text-red-500">—</span>}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {row.sku || <span className="text-red-500">—</span>}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{row.brand || "—"}</TableCell>
                          <TableCell className="text-xs">
                            <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium">
                              {row.category || "—"}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-right font-medium">
                            {row.sellingPrice !== null && row.sellingPrice !== undefined
                              ? formatCurrency(row.sellingPrice)
                              : <span className="text-red-500">—</span>}
                          </TableCell>
                          <TableCell className="text-xs text-center font-medium">
                            {row.stock ?? "0"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {hasError ? (
                              <div className="text-red-500 text-[11px] space-y-0.5">
                                {row.errors.map((e, i) => (
                                  <div key={i} className="flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3 shrink-0" />
                                    <span>{e}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="h-3 w-3" />
                                Valid
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {displayedPreviewRows.length > 100 && (
                <p className="text-center text-xs text-muted-foreground">
                  Showing first 100 of {displayedPreviewRows.length} items in preview. All valid items will be imported.
                </p>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: BUTTERY SMOOTH 60FPS IMPORTING STATE */}
          {/* ========================================================================= */}
          {importing && (
            <div className="relative py-4 px-2 space-y-8 overflow-hidden">
              {/* Ambient Radiant Glow in Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-cyan-500/10 rounded-full blur-3xl -z-10 animate-glow-pulse pointer-events-none" />

              {/* Central Orbital Spinner with Live Percentage */}
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  {/* Outer spinning gradient ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/40 animate-spin-slow" />
                  
                  {/* Middle counter-spinning ring with glowing dots */}
                  <div className="absolute inset-2 rounded-full border border-teal-500/30 animate-spin-reverse" />
                  
                  {/* Inner glass disc */}
                  <div className="absolute inset-4 rounded-full bg-gradient-to-b from-card to-background border border-emerald-500/30 shadow-xl flex flex-col items-center justify-center p-2">
                    <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                      {roundedProgress}%
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Syncing
                    </span>
                  </div>

                  {/* Orbiting Satellite Particle */}
                  <div
                    className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                    style={{
                      transform: `rotate(${smoothProgress * 3.6}deg) translate(58px) rotate(-${smoothProgress * 3.6}deg)`,
                      transition: "transform 0.05s linear",
                    }}
                  />
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center justify-center gap-2">
                    {currentStage.title}
                    <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {currentStage.desc}
                  </p>
                </div>
              </div>

              {/* Liquid Shimmer Progress Bar */}
              <div className="space-y-2 max-w-xl mx-auto">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">
                    Processed <span className="text-foreground font-bold">{itemsProcessedCount}</span> of <span className="text-foreground font-bold">{validRows.length}</span> products
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    {roundedProgress}%
                  </span>
                </div>

                {/* Progress bar container */}
                <div className="relative h-3.5 w-full bg-muted/80 rounded-full overflow-hidden p-0.5 border border-border shadow-inner">
                  <div
                    className="relative h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-75 ease-out"
                    style={{ width: `${smoothProgress}%` }}
                  >
                    {/* Shimmer sweep overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-import-shimmer" />
                  </div>
                </div>
              </div>

              {/* Live Streaming Item Ticker (Micro-Card) */}
              {currentlyProcessingItem && (
                <div className="max-w-xl mx-auto p-3.5 rounded-2xl bg-card/80 backdrop-blur-md border border-emerald-500/20 shadow-lg space-y-2 animate-float-item">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Active Record Stream
                    </span>
                    <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      Item #{currentProductIndex + 1}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 bg-muted/40 p-2.5 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {currentlyProcessingItem.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">
                          SKU: {currentlyProcessingItem.sku} • {currentlyProcessingItem.category}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(currentlyProcessingItem.sellingPrice || 0)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Stock: {currentlyProcessingItem.stock || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Multi-Stage Pipeline Status Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-2xl mx-auto pt-2">
                {IMPORT_STAGES.map((stage) => {
                  const isPassed = smoothProgress >= stage.threshold;
                  const isCurrent = currentStage.id === stage.id && !isPassed;
                  const StageIcon = stage.icon;

                  return (
                    <div
                      key={stage.id}
                      className={`p-2.5 rounded-xl border text-center transition-all duration-300 ${
                        isPassed
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : isCurrent
                          ? "bg-card border-emerald-500 shadow-md shadow-emerald-500/10 scale-105"
                          : "bg-muted/20 border-border/60 text-muted-foreground opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        {isPassed ? (
                          <div className="p-1 rounded-full bg-emerald-500 text-white">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : isCurrent ? (
                          <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <StageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-[11px] font-bold truncate">{stage.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: CELEBRATION & RESULTS SCREEN (When finished) */}
          {/* ========================================================================= */}
          {!importing && results && (
            <div className="space-y-6 py-2 animate-celebration-pop">
              {results.successCount > 0 ? (
                <>
                  {/* Glorious Success Hero Card */}
                  <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 text-center space-y-3 shadow-xl">
                    <div className="relative inline-flex items-center justify-center p-4 rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 mx-auto">
                      <CheckCircle2 className="h-10 w-10" />
                      <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-30" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-black tracking-tight text-foreground">
                        Import Completed Successfully!
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-md mx-auto">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {results.successCount} products
                        </span>{" "}
                        have been verified and successfully written into your store catalog.
                      </p>
                    </div>

                    {/* Ambient Glow */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl border bg-card/60 backdrop-blur-sm space-y-1 text-center">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Total Added
                      </span>
                      <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {results.successCount}
                      </p>
                      <span className="text-[10px] text-muted-foreground">Products</span>
                    </div>

                    <div className="p-3.5 rounded-xl border bg-card/60 backdrop-blur-sm space-y-1 text-center">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Categories
                      </span>
                      <p className="text-lg font-black text-foreground">
                        {importMetrics.uniqueCategories}
                      </p>
                      <span className="text-[10px] text-muted-foreground">Mapped</span>
                    </div>

                    <div className="p-3.5 rounded-xl border bg-card/60 backdrop-blur-sm space-y-1 text-center">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Total Stock
                      </span>
                      <p className="text-lg font-black text-foreground">
                        {importMetrics.totalStock.toLocaleString()}
                      </p>
                      <span className="text-[10px] text-muted-foreground">Units</span>
                    </div>

                    <div className="p-3.5 rounded-xl border bg-card/60 backdrop-blur-sm space-y-1 text-center">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Database Status
                      </span>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 pt-1">
                        <Check className="h-4 w-4" />
                        Live & Ready
                      </p>
                      <span className="text-[10px] text-muted-foreground">Store Synced</span>
                    </div>
                  </div>
                </>
              ) : (
                /* Failure Notice */
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-3">
                  <div className="inline-flex p-3 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 mx-auto">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">No Products Were Imported</h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Please check the error details below and resolve duplicate SKUs or plan limitations.
                    </p>
                  </div>
                </div>
              )}

              {/* Failures Accordion */}
              {results.failures?.length > 0 && (
                <div className="space-y-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="flex items-center text-xs font-bold text-red-600 dark:text-red-400 hover:underline gap-1.5"
                      onClick={() => setShowFailures((s) => !s)}
                    >
                      {showFailures ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      View {results.failures.length} Unresolved Item{results.failures.length === 1 ? "" : "s"}
                    </button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadFailedRows}
                      className="text-xs border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Download Failed Rows (.csv)
                    </Button>
                  </div>

                  {showFailures && (
                    <div className="border rounded-lg max-h-[220px] overflow-auto bg-background/80">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10 text-xs">#</TableHead>
                            <TableHead className="text-xs">Product Name</TableHead>
                            <TableHead className="text-xs">SKU</TableHead>
                            <TableHead className="text-xs">Error Reason</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.failures.map((f, i) => (
                            <TableRow key={i} className="hover:bg-red-500/5 text-xs">
                              <TableCell className="font-mono text-muted-foreground">{f.row}</TableCell>
                              <TableCell className="font-medium">{f.name}</TableCell>
                              <TableCell className="font-mono">{f.sku}</TableCell>
                              <TableCell className="text-red-500 font-medium">{f.reason}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetState}
                  className="gap-2 text-xs font-semibold"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Import Another File
                </Button>
                <Button
                  type="button"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 gap-2 text-xs font-semibold px-5"
                  onClick={() => handleDialogChange(false)}
                >
                  Done
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODAL FOOTER (Only when in upload / preview before import starts) */}
          {/* ========================================================================= */}
          {!importing && !results && validatedRows.length === 0 && (
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDialogChange(false)}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}