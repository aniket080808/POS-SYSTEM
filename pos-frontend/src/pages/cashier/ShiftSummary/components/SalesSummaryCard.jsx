import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const SalesSummaryCard = ({ shiftData }) => {
  const { format: formatCurrency } = useCurrencyFormatter();

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Sales Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Orders:</span>
            <span className="font-medium">{shiftData.totalOrders}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Sales:</span>
            <span className="font-medium">{formatCurrency(shiftData.totalSales)}</span>
          </div>
          <div className="flex justify-between text-destructive">
            <span>Total Refunds:</span>
            <span>-{formatCurrency(shiftData.totalRefunds)}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Net Sales:</span>
            <span>{formatCurrency(shiftData.netSales)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesSummaryCard; 