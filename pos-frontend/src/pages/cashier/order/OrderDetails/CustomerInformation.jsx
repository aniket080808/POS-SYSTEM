import React from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '@/components/ui/badge';

const CustomerInformation = ({ selectedOrder }) => {
  const isWalkIn = !selectedOrder.customer || !selectedOrder.customer.fullName;

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-sm">Customer Information</h3>
          {isWalkIn && <Badge variant="secondary" className="text-[10px]">Walk-in</Badge>}
        </div>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Name:</span>
            <span className="text-xs font-medium">
              {selectedOrder.customer?.fullName || "Walk-in Customer"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Phone:</span>
            <span className="text-xs font-mono">{selectedOrder.customer?.phone || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Email:</span>
            <span className="text-xs">{selectedOrder.customer?.email || "—"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerInformation;