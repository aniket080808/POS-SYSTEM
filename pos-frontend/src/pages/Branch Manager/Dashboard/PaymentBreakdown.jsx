import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Wallet, Layers } from 'lucide-react';
import { getPaymentBreakdown } from "@/Redux Toolkit/features/branchAnalytics/branchAnalyticsThunks";
import { getPaymentIcon } from '../../../utils/getPaymentIcon';

const PaymentBreakdown = () => {
  const dispatch = useDispatch();
  const branchId = useSelector((state) => state.branch.branch?.id);
  const { paymentBreakdown, loading } = useSelector((state) => state.branchAnalytics);
  const [range, setRange] = useState('today'); // 'today' | 'all'

  useEffect(() => {
    if (branchId) {
      if (range === 'today') {
        const today = new Date().toISOString().slice(0, 10);
        dispatch(getPaymentBreakdown({ branchId, date: today }));
      } else {
        dispatch(getPaymentBreakdown({ branchId, date: null }));
      }
    }
  }, [branchId, range, dispatch]);

  const totalAmount = paymentBreakdown?.reduce((sum, item) => sum + (item.totalAmount || 0), 0) || 0;
  const totalTxns = paymentBreakdown?.reduce((sum, item) => sum + (item.transactionCount || 0), 0) || 0;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Payment Breakdown
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalTxns > 0 ? `${totalTxns} transactions totaling ₹${totalAmount.toLocaleString('en-IN')}` : "Breakdown by payment method"}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border">
          <Button
            variant={range === 'today' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-xs px-2.5"
            onClick={() => setRange('today')}
          >
            Today
          </Button>
          <Button
            variant={range === 'all' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-xs px-2.5"
            onClick={() => setRange('all')}
          >
            All-Time
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (!paymentBreakdown || paymentBreakdown.length === 0) ? (
          <div className="space-y-4 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="w-28 h-2.5 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : paymentBreakdown && paymentBreakdown.length > 0 ? (
          <div className="space-y-4 py-1">
            {paymentBreakdown.map((payment, index) => {
              const pct = payment.percentage !== undefined ? payment.percentage : totalAmount > 0 ? Math.round(((payment.totalAmount || 0) / totalAmount) * 100) : 0;
              return (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {getPaymentIcon(payment.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none text-foreground">{payment.type}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {payment.transactionCount || 0} order{payment.transactionCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block w-28 md:w-36 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">₹{(payment.totalAmount || 0).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-muted-foreground">{pct}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center justify-center">
            <Layers className="w-10 h-10 mb-2 opacity-20" />
            <p className="font-medium">No payment data recorded</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {range === 'today' ? "No orders processed yet today. Try switching to 'All-Time'." : "No completed orders found for this branch."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentBreakdown;