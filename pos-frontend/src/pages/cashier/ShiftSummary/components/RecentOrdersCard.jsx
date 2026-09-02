import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTime } from "../../../../utils/formateDate";
import { getPaymentIcon } from "../../../../utils/getPaymentIcon";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { Receipt } from "lucide-react";

const RecentOrdersCard = ({ shiftData }) => {
  const { format: formatCurrency } = useCurrencyFormatter();

  return (
    <Card className="border-border shadow-2xs">
      <CardContent className="p-5 space-y-3">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/60 pb-2.5">
          <Receipt className="w-3.5 h-3.5 text-[#B8860B]" />
          Recent Shift Invoices
        </h2>
        <div className="rounded-xl border border-border/80 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40 border-b border-border/80">
                <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3">Order ID</TableHead>
                <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3">Time</TableHead>
                <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3">Tender</TableHead>
                <TableHead className="text-right text-sm font-bold text-foreground uppercase tracking-wider py-3">Gross Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shiftData.recentOrders?.map((order) => (
                <TableRow key={order.id} className="border-b border-border/60">
                  <TableCell className="font-mono text-xs font-bold text-foreground py-2.5">
                    #{order.id}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono py-2.5">
                    {formatTime(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-xs py-2.5">
                    <div className="flex items-center gap-1.5 font-mono uppercase text-foreground">
                      {getPaymentIcon(order.paymentType)}
                      <span>{order.paymentType || "CASH"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-foreground py-2.5">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrdersCard;