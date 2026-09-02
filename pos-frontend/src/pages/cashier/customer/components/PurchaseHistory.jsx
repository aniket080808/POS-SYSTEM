import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingBag, Calendar } from "lucide-react";
import { formatDate } from "../../order/data";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

const PurchaseHistory = ({ orders = [], loading = false }) => {
  const { format: formatCurrency } = useCurrencyFormatter();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
        <Loader2 className="animate-spin h-6 w-6 mb-2 text-[#B8860B]" />
        <p className="text-xs">Loading transaction history...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-1.5 border-t border-border/80">
        <ShoppingBag size={36} className="text-muted-foreground/60" />
        <p className="text-xs font-bold text-foreground">No Purchase History</p>
        <p className="text-[11px] text-muted-foreground">No settled invoices recorded for this profile yet</p>
      </div>
    );
  }

  return (
    <div className="p-5 border-t border-border/80">
      <Card className="border-border shadow-2xs">
        <CardHeader className="p-4 pb-2 border-b border-border/60">
          <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag className="h-3.5 w-3.5 text-[#B8860B]" />
            Order Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="border border-border/70 rounded-2xl p-3.5 space-y-2.5 bg-secondary/20 hover:bg-secondary/40 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-foreground">Invoice #{order.id}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5 font-mono">
                    <Calendar className="h-3 w-3 text-[#B8860B]" />
                    {formatDate(order.createdAt)}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <span className="font-black text-xs font-mono text-foreground block">
                    {formatCurrency(order.totalAmount || 0)}
                  </span>
                  <Badge variant="active" className="text-[9px] uppercase tracking-wider px-2 py-0.5">
                    {order.status || "COMPLETED"}
                  </Badge>
                </div>
              </div>

              {order.paymentType && (
                <div className="text-[11px] text-muted-foreground font-mono">
                  Tender: <span className="font-semibold text-foreground uppercase">{order.paymentType}</span>
                </div>
              )}

              {order.items && order.items.length > 0 && (
                <div className="border-t border-border/60 pt-2 space-y-1">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Line Items:</h4>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-foreground font-medium">{item.product?.name || item.productName || "Product"}</span>
                        <span className="text-muted-foreground font-mono text-[11px]">
                          {item.quantity || 1} × {formatCurrency(item.price || item.product?.sellingPrice || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseHistory;