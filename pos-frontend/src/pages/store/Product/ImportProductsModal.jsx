import React, { useState, useRef, useMemo, useCallback } from "react";
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
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
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
  0,
  "Sample product description",
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
 * Returns { rows, headers, error }.
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
 * Validate parsed rows and resolve categories.
 * Returns array of { row, errors, dto } where dto is null if invalid.
 */
function validateRows(rows, categoryMap) {
  const skuCount = {};
  // First pass: count SKUs
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
      rowIndex: idx + 2, // +2 because row 1 is header, and idx is 0-based
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

/**
 * Run tasks with a concurrency limit, calling onProgress after each settlement.
 */
async function runWithConcurrency(items, limit, taskFn, onProgress) {
  let index = 0;
  let completed = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const currentIndex = index++;
      await taskFn(items[currentIndex], currentIndex)
        .catch(() => {
          // error handled inside taskFn via its own try/catch
        })
        .finally(() => {
          completed++;
          onProgress(completed);
        });
    }
  });
  await Promise.all(workers);
}

export default function ImportProductsModal({ open, onOpenChange }) {
  const dispatch = useDispatch();
  const { store } = useSelector((state) => state.store);
  const { categories } = useSelector((state) => state.category);

  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [validatedRows, setValidatedRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importTotal, setImportTotal] = useState(0);
  const [results, setResults] = useState(null); // { successCount, failures: [{row, reason}] }
  const [showFailures, setShowFailures] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

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
  React.useEffect(() => {
    if (store?.id && open) {
      const token = localStorage.getItem("jwt");
      if (token && (!categories || categories.length === 0)) {
        dispatch(getCategoriesByStore({ storeId: store.id, token }));
      }
    }
  }, [store, open, dispatch, categories]);

  const validRows = useMemo(() => validatedRows.filter((r) => r.errors.length === 0), [validatedRows]);
  const errorRows = useMemo(() => validatedRows.filter((r) => r.errors.length > 0), [validatedRows]);

  const resetState = useCallback(() => {
    setFile(null);
    setParsing(false);
    setParseError(null);
    setValidatedRows([]);
    setImporting(false);
    setImportProgress(0);
    setImportTotal(0);
    setResults(null);
    setShowFailures(false);
    setDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleDialogChange = (openVal) => {
    if (!openVal) resetState();
    onOpenChange(openVal);
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

  const handleImport = async () => {
    if (!validRows.length || !store?.id) return;
    setImporting(true);
    setImportProgress(0);
    setImportTotal(validRows.length);
    setResults(null);

    // Build the batch of DTOs (backend resolves store from authenticated user,
    // and validates every DTO's storeId against it — a mismatch rejects the whole batch).
    const batch = validRows.map((row) => ({ ...row.dto, storeId: store.id }));

    let successCount = 0;
    let failures = [];

    try {
      // Single atomic backend call: pre-checks plan limit, rejects whole batch
      // if it would exceed maxProducts, and creates all rows in one transaction.
      const created = await dispatch(bulkCreateProducts(batch)).unwrap();
      successCount = created?.length || 0;

      setResults({ successCount, failures: [] });
      setImportProgress(successCount);
    } catch (err) {
      // Whole batch rejected (e.g. plan limit exceeded, IDOR mismatch, or
      // any row-level failure inside the transaction → atomic rollback).
      const reason = normalizeApiError(err);
      failures = validRows.map((row) => ({
        row: row.rowIndex,
        sku: row.sku,
        name: row.name,
        reason,
      }));
      setResults({ successCount: 0, failures });
      setImportProgress(0);
    } finally {
      setImporting(false);
    }

    // Refresh product list
    try {
      await dispatch(getProductsByStore(store.id)).unwrap();
    } catch (e) {
      // ignore refresh error
    }

    if (successCount > 0) {
      const skippedCount = failures.filter(f => 
        f.reason.toLowerCase().includes("already exists") || 
        f.reason.toLowerCase().includes("sku")
      ).length;
      const otherFailures = failures.length - skippedCount;

      let summary = `${successCount} product${successCount === 1 ? "" : "s"} imported successfully`;
      if (skippedCount > 0) {
        summary += `, ${skippedCount} skipped (already exist)`;
      }
      if (otherFailures > 0) {
        summary += `, ${otherFailures} failed`;
      }
      summary += ".";

      toast({
        title: "Import complete",
        description: summary,
      });
    } else {
      const skippedCount = failures.filter(f => 
        f.reason.toLowerCase().includes("already exists") || 
        f.reason.toLowerCase().includes("sku")
      ).length;
      const otherFailures = failures.length - skippedCount;
      
      let summary = "No products were imported.";
      if (skippedCount > 0) {
        summary += ` ${skippedCount} SKU${skippedCount === 1 ? "" : "s"} already exist`;
      }
      if (otherFailures > 0) {
        summary += ` ${otherFailures} other error${otherFailures === 1 ? "" : "s"}`;
      }
      
      toast({
        title: "Import failed",
        description: summary,
        variant: "destructive",
      });
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

  const progressPercent = importTotal > 0 ? Math.round((importProgress / importTotal) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[1100px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Products</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Template + File upload */}
          {!results && !importing && (
            <>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-sm text-muted-foreground">
                  Upload a CSV or Excel file to bulk import products. Category names must match
                  existing categories for your store.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Sample Template
                </Button>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <FileSpreadsheet className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                {file ? (
                  <p className="text-sm font-medium text-emerald-700">{file.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium">
                      Drag and drop your file here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports .csv, .xlsx, .xls
                    </p>
                  </>
                )}
              </div>

              {parsing && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-600 mr-2" />
                  <span className="text-sm">Parsing file...</span>
                </div>
              )}

              {parseError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm">
                  {parseError}
                </div>
              )}
            </>
          )}

          {/* Importing progress */}
          {importing && (
            <div className="space-y-4 py-8">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
                <span className="text-sm font-medium">
                  Importing {importProgress} of {importTotal}...
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-center text-xs text-muted-foreground">
                {progressPercent}% complete
              </p>
            </div>
          )}

          {/* Preview table */}
          {!importing && !results && validatedRows.length > 0 && (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm">
                  <span className="font-medium text-emerald-700">
                    {validRows.length} valid row{validRows.length === 1 ? "" : "s"}
                  </span>
                  {errorRows.length > 0 && (
                    <span className="text-red-600">
                      , {errorRows.length} row{errorRows.length === 1 ? "" : "s"} with errors
                    </span>
                  )}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetState}
                  >
                    Choose different file
                  </Button>
                  <Button
                    type="button"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={validRows.length === 0}
                    onClick={handleImport}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Import {validRows.length} Product{validRows.length === 1 ? "" : "s"}
                  </Button>
                </div>
              </div>

              <div className="border rounded-md max-h-[600px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>MRP</TableHead>
                      <TableHead>Selling Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validatedRows.map((row) => {
                      const hasError = row.errors.length > 0;
                      return (
                        <TableRow
                          key={row.rowIndex}
                          className={hasError ? "bg-red-50" : ""}
                        >
                          <TableCell className="text-muted-foreground">
                            {row.rowIndex}
                          </TableCell>
                          <TableCell className="font-medium">
                            {row.name || <span className="text-red-500">—</span>}
                          </TableCell>
                          <TableCell>{row.sku || <span className="text-red-500">—</span>}</TableCell>
                          <TableCell>{row.brand}</TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell>{row.mrp ?? <span className="text-red-500">—</span>}</TableCell>
                          <TableCell>
                            <span className="font-medium">₹{row.sellingPrice ?? <span className="text-red-500">—</span>}</span>
                          </TableCell>
                          <TableCell>{row.stock ?? "0"}</TableCell>
                          <TableCell>
                            {hasError ? (
                              <div className="text-red-600 text-xs space-y-0.5">
                                {row.errors.map((e, i) => (
                                  <div key={i}>{e}</div>
                                ))}
                              </div>
                            ) : (
                              <span className="inline-flex items-center text-emerald-600 text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
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
            </>
          )}

          {/* Results summary */}
          {!importing && results && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-md border ${
                  results.failures.length > 0
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-emerald-50 border-emerald-200 text-emerald-800"
                }`}
              >
                <p className="font-medium">
                  {results.successCount} product{results.successCount === 1 ? "" : "s"} imported
                  successfully
                  {results.failures.length > 0 &&
                    `, ${results.failures.length} failed`}
                  .
                </p>
              </div>

              {results.failures.length > 0 && (
                <div className="space-y-2">
                  <button
                    type="button"
                    className="flex items-center text-sm font-medium text-red-600 hover:text-red-700"
                    onClick={() => setShowFailures((s) => !s)}
                  >
                    {showFailures ? (
                      <ChevronDown className="h-4 w-4 mr-1" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-1" />
                    )}
                    View failed rows ({results.failures.length})
                  </button>

                  {showFailures && (
                    <div className="border rounded-md max-h-[300px] overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-8">#</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Reason</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.failures.map((f, i) => (
                            <TableRow key={i} className="bg-red-50">
                              <TableCell className="text-muted-foreground">{f.row}</TableCell>
                              <TableCell className="font-medium">{f.name}</TableCell>
                              <TableCell>{f.sku}</TableCell>
                              <TableCell className="text-red-600 text-xs">{f.reason}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadFailedRows}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download failed rows as CSV
                  </Button>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={resetState}>
                  Import another file
                </Button>
                <Button
                  type="button"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleDialogChange(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          )}

          {/* Footer buttons (only in upload/preview state) */}
          {!importing && !results && (
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogChange(false)}
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