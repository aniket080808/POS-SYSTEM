import React from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import { formatDate, getPaymentModeLabel } from '../data';
import { useCurrencyFormatter } from '@/utils/currencyUtils';

const OrderInformation = ({ selectedOrder }) => {
  const { format: formatCurrency } = useCurrencyFormatter();

  const subtotal = selectedOrder.subtotal !== undefined && selectedOrder.subtotal !== null
    ? selectedOrder.subtotal
    : selectedOrder.items?.reduce((sum, item) => sum + (item.price || 0), 0) || selectedOrder.totalAmount;

  const discount = selectedOrder.discount || 0;
  const tax = selectedOrder.tax || 0;

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-3">Order Information</h3>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Date:</span>
            <span className="text-xs font-medium">{formatDate(selectedOrder.createdAt)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Payment Method:</span>
            <span className="text-xs font-medium">{getPaymentModeLabel(selectedOrder.paymentType)}</span>
          </div>

          <div className="border-t pt-2 mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600">
                <span>Discount Applied:</span>
                <span>- {formatCurrency(discount)}</span>
              </div>
            )}

            {tax > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tax / GST:</span>
                <span>+ {formatCurrency(tax)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-sm pt-1 border-t">
              <span>Final Total:</span>
              <span className="text-emerald-700 dark:text-emerald-400">
                {formatCurrency(selectedOrder.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderInformation;