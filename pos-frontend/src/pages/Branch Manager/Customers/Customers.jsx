import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, ShoppingBag, Phone, Mail, User, Eye, Users, Award, TrendingUp, Loader2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { getAllCustomers, getCustomerOverview } from "../../../Redux Toolkit/features/customer/customerThunks";
import { clearCustomerOrders } from "../../../Redux Toolkit/features/order/orderSlice";
import { getOrdersByCustomer } from "../../../Redux Toolkit/features/order/orderThunks";
import { calculateCustomerStats } from "../../cashier/customer/utils/customerUtils";
import { formatDateTime } from "../../../utils/formateDate";

const Customers = () => {
  const { customerOrders = [], loading: ordersLoading } = useSelector((state) => state.order);
  const { customers = [], customerOverview, loading: customersLoading } = useSelector((state) => state.customer);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCustomerDetailsOpen, setIsCustomerDetailsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const dispatch = useDispatch();

  const filteredCustomers = (customers || []).filter((customer) => {
    const term = searchTerm.toLowerCase();
    return (
      customer.fullName?.toLowerCase().includes(term) ||
      customer.phone?.includes(term) ||
      customer.email?.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    dispatch(getAllCustomers());
    dispatch(getCustomerOverview());
  }, [dispatch]);

  const openCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setIsCustomerDetailsOpen(true);
    dispatch(clearCustomerOrders());
    if (customer.id) {
      dispatch(getOrdersByCustomer(customer.id));
    }
  };

  const customerStats = selectedCustomer ? calculateCustomerStats(customerOrders) : null;
  const displayCustomer = selectedCustomer ? { ...selectedCustomer, ...customerStats } : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Customer CRM Directory
            </h1>
            <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-mono font-bold">
              {customers.length} {customers.length === 1 ? "Profile" : "Profiles"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Customer lifetime purchases, loyalty status tiers, and order frequency histories
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Registered Clients
              </p>
              <p className="text-2xl font-black font-mono text-foreground mt-1">
                {customerOverview?.totalCustomers ?? customers.length}
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-secondary flex items-center justify-center text-foreground">
              <Users className="h-5 w-5 text-[#B8860B]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                VIP / Gold Members
              </p>
              <p className="text-2xl font-black font-mono text-[#785600] mt-1">
                {customerOverview?.goldMembersCount ?? customers.filter((c) => c.loyaltyStatus === "Gold").length}
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-[#FDF6E2] border border-[#EED896] flex items-center justify-center text-[#785600]">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Avg. Invoices per Client
              </p>
              <p className="text-2xl font-black font-mono text-foreground mt-1">
                {customerOverview?.avgOrdersPerCustomer ?? (
                  customers.length > 0
                    ? Math.round(
                        customers.reduce((sum, c) => sum + (Number(c.totalOrders) || 0), 0) /
                          customers.length
                      )
                    : 0
                )}
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-secondary flex items-center justify-center text-foreground">
              <TrendingUp className="h-5 w-5 text-[#B8860B]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="space-y-3 bg-card p-4 rounded-2xl border border-border shadow-2xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by customer name, phone, or email..."
            className="pl-9 text-xs h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Profile</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>Loyalty Tier</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customersLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-xs font-semibold text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin inline-block mr-2 text-[#B8860B]" />
                  Loading client directory...
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-xs font-semibold text-muted-foreground">
                  No customers found matching search query.
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-xs text-foreground">
                        {customer.fullName?.[0] || "C"}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-foreground">{customer.fullName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">ID: #{customer.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs font-mono text-foreground">
                      <Phone className="w-3 h-3 text-[#B8860B]" />
                      {customer.phone || "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground">{customer.email || "No email on file"}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={customer.loyaltyStatus === "Gold" ? "warning" : "secondary"}
                      className="text-[10px] font-bold"
                    >
                      {customer.loyaltyStatus || "Standard"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 gap-1.5"
                      onClick={() => openCustomerDetails(customer)}
                    >
                      <Eye className="h-3.5 w-3.5" /> Order History
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Customer Details Dialog */}
      <Dialog open={isCustomerDetailsOpen} onOpenChange={setIsCustomerDetailsOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader className="pb-3 border-b border-border/60">
            <DialogTitle className="text-base font-bold">
              Customer Profile: {displayCustomer?.fullName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-secondary/30 border border-border/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Phone</span>
                <span className="text-xs font-mono font-bold text-foreground mt-0.5 block">{displayCustomer?.phone || "—"}</span>
              </div>
              <div className="p-3 rounded-2xl bg-secondary/30 border border-border/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Email</span>
                <span className="text-xs font-medium text-foreground mt-0.5 block truncate">{displayCustomer?.email || "—"}</span>
              </div>
              <div className="p-3 rounded-2xl bg-secondary/30 border border-border/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Total Lifetime</span>
                <span className="text-xs font-mono font-bold text-foreground mt-0.5 block">
                  ₹{Number(displayCustomer?.totalSpent || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wider mb-2">Purchase History</h4>
              {ordersLoading ? (
                <div className="text-center py-6 text-xs text-muted-foreground">Loading orders...</div>
              ) : customerOrders.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">No orders recorded for this customer.</div>
              ) : (
                <div className="border border-border/70 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerOrders.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-mono text-xs font-bold text-foreground">#{o.id}</TableCell>
                          <TableCell className="font-mono text-[11px] text-muted-foreground">
                            {o.createdAt ? formatDateTime(o.createdAt) : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[9px] font-bold font-mono">
                              {o.paymentType || "CASH"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-xs text-foreground">
                            ₹{Number(o.totalAmount || 0).toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
