import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarIcon, PlusIcon, Loader2, UserIcon, ShoppingBag, CreditCard, Calendar } from "lucide-react";
import { useCurrencyFormatter } from "@/utils/currencyUtils";
import { useDateFormatter } from "@/utils/dateUtils";

const CustomerDetails = ({ customer, onAddPoints, loading = false }) => {
  const { format: formatCurrency } = useCurrencyFormatter();
  const { formatDate } = useDateFormatter();

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 space-y-2">
        <UserIcon size={44} strokeWidth={1.5} className="text-muted-foreground/60" />
        <p className="text-sm font-bold text-foreground">Select a Customer</p>
        <p className="text-xs text-muted-foreground">Select from the directory on the left to view lifetime transactions</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
        <Loader2 className="animate-spin h-6 w-6 mb-2 text-[#B8860B]" />
        <p className="text-xs">Fetching customer profile data...</p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">
      <div className="flex justify-between items-start pb-4 border-b border-border/80">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {customer.fullName || "Guest Profile"}
          </h2>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">{customer.phone || "No phone number"}</p>
          <p className="text-xs text-muted-foreground">{customer.email || "No email address registered"}</p>
        </div>
        <Button onClick={onAddPoints} size="sm" className="text-xs font-bold h-9 gap-1.5">
          <PlusIcon className="h-3.5 w-3.5" />
          Add Loyalty Points
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-border shadow-2xs">
          <CardHeader className="p-3.5 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
              Loyalty Points
              <StarIcon className="h-3.5 w-3.5 text-[#B8860B]" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-2xl font-black font-mono text-foreground mt-1">
              {customer.loyaltyPoints || 0} <span className="text-xs font-normal text-muted-foreground">pts</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardHeader className="p-3.5 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
              Total Invoices
              <ShoppingBag className="h-3.5 w-3.5 text-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-2xl font-black font-mono text-foreground mt-1">
              {customer.totalOrders || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardHeader className="p-3.5 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
              Lifetime Spent
              <CreditCard className="h-3.5 w-3.5 text-[#B8860B]" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-2xl font-black font-mono text-foreground mt-1">
              {formatCurrency(customer.totalSpent || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {customer.lastVisit && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 font-mono">
          <Calendar className="w-3.5 h-3.5 text-[#B8860B]" />
          <span>Last Visit: {formatDate(customer.lastVisit)}</span>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;