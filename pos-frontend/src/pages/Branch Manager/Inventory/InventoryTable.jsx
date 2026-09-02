import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Package } from "lucide-react";

const InventoryTable = ({ rows = [], onEdit }) => (
  <div className="border border-border rounded-2xl bg-card overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Item</TableHead>
          <TableHead>SKU Barcode</TableHead>
          <TableHead>Product Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Quantity on Hand</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length > 0 ? (
          rows.map((row, idx) => (
            <TableRow key={`inv-row-${row?.id ?? idx}-${idx}`}>
              <TableCell>
                <div className="w-8 h-8 rounded-lg border border-border bg-secondary/40 flex items-center justify-center overflow-hidden shrink-0">
                  {row.image ? (
                    <img src={row.image} alt={row.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs font-bold text-foreground">
                {row.sku}
              </TableCell>
              <TableCell>
                <span className="text-xs font-semibold text-foreground">
                  {row.name ? (row.name.length > 60 ? `${row.name.slice(0, 60)}...` : row.name) : "Unknown Product"}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">{row.category || "General"}</span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={row.quantity <= 5 ? "error" : "active"}
                  className="font-mono text-[11px] font-bold px-2 py-0.5"
                >
                  {row.quantity} units
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-8 gap-1.5"
                  onClick={() => onEdit(row)}
                >
                  <Edit className="h-3.5 w-3.5" /> Adjust Stock
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-10 text-xs font-semibold text-muted-foreground">
              No inventory records found for this branch workstation.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);

export default InventoryTable;