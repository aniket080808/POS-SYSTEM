import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getPaymentIcon } from '../../../../utils/getPaymentIcon';
import { getPaymentMethodLabel } from '../../../../utils/paymentMethodLable';
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const PaymentSummaryCard = ({ shiftData }) => {
  const { format: formatCurrency } = useCurrencyFormatter();

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
        <div className="space-y-4">
          {shiftData.paymentSummaries?.map((payment) => (
            <div key={payment.type} className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                {getPaymentIcon(payment.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">{getPaymentMethodLabel(payment.type)}</span>
                  <span className="font-bold">{formatCurrency(payment.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{payment.transactionCount} transactions</span>
                  <span>{shiftData.totalSales > 0 ? ((payment.totalAmount / shiftData.totalSales) * 100).toFixed(1) : (payment.percentage ? Number(payment.percentage).toFixed(1) : "0.0")}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSummaryCard; 