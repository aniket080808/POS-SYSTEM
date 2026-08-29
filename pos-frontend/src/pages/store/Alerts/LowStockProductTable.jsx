import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tag, IndianRupee, BellOff } from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { dismissAlert } from '@/Redux Toolkit/features/storeAnalytics/storeAnalyticsThunks';

const LowStockProductTable = () => {
  const dispatch = useDispatch();
  const { storeAlerts, loading } = useSelector((state) => state.storeAnalytics);
  const user = useSelector((state) => state.user.userProfile);

  const handleDismiss = (productId, stock) => {
    if (user?.id) {
      dispatch(dismissAlert({
        storeAdminId: user.id,
        alertType: 'LOW_STOCK',
        referenceId: productId,
        snapshotValue: stock
      }));
    }
  };

  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              <div className="flex justify-center items-center">
                <svg className="animate-spin h-6 w-6 text-emerald-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading products...
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  const products = storeAlerts?.lowStockAlerts || [];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Image</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
              All product stock levels are healthy above threshold.
            </TableCell>
          </TableRow>
        ) : (
          products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {product.image && (
                  <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-md" />
                )}
              </TableCell>
              <TableCell>
                <div className="space-y-0.5">
                  <div className="font-medium text-sm">{product.name ? product.name.slice(0, 32) : 'Unnamed'}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-xs">{product.description ? product.description.slice(0, 30) : ''}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Tag className="h-3.5 w-3.5 text-gray-400" />
                  {product.category || 'Uncategorized'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 font-medium text-sm">
                  <IndianRupee className="h-3.5 w-3.5 text-gray-400" />
                  {product.sellingPrice ? product.sellingPrice.toFixed(2) : (product.mrp ? product.mrp.toFixed(2) : '0.00')}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-semibold text-red-600 text-sm">{product.stock ?? 'N/A'}</div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDismiss(product.id, product.stock)}
                >
                  <BellOff className="h-3.5 w-3.5 mr-1" /> Dismiss
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default LowStockProductTable;