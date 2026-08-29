import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Tag, Package, Eye } from "lucide-react";
import { useDispatch } from 'react-redux';
import { deleteProduct } from '@/Redux Toolkit/features/product/productThunks';
import { toast } from '@/components/ui/use-toast';
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const ProductTable = ({ products, loading, onEdit, onView }) => {
  const dispatch = useDispatch();
  const { format: formatCurrency } = useCurrencyFormatter();

  const handleDeleteProduct = async (id) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast({ title: "Success", description: "Product deleted successfully" });
    } catch (err) {
      toast({ title: "Error", description: err || "Failed to delete product", variant: "destructive" });
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
            <TableHead className="text-right">Actions</TableHead>
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

  if (products.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              No products found. Add your first product to get started.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Image</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              
                #{product.id}
              
            </TableCell>
            <TableCell>
              {product.image && (
                <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
              )}
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="font-medium">{product.name.slice(0,70)}...</div>
                <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4 text-gray-400" />
                {product.category}
              </div>
            </TableCell>
            <TableCell>
              {(() => {
                const mrp = Number(product.mrp);
                const sellingPrice = Number(product.sellingPrice);
                const hasDiscount = mrp > 0 && sellingPrice > 0 && mrp > sellingPrice;
                const discountPercent = hasDiscount ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

                return (
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-0.5 font-semibold text-gray-900">
                      <span>{formatCurrency(sellingPrice)}</span>
                    </div>
                    {hasDiscount && discountPercent > 0 && (
                      <div className="flex items-center gap-1.5 text-xs flex-wrap">
                        <span className="line-through text-gray-400 font-normal">
                          {formatCurrency(mrp)}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded text-[10px] leading-none">
                          {discountPercent}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </TableCell>
            
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {onView && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-500 border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => onView(product)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(product)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProductTable;