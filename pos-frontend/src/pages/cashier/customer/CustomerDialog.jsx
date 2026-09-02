import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDispatch, useSelector } from "react-redux";
import { getAllCustomers } from "@/Redux Toolkit/features/customer/customerThunks";
import CustomerForm from "./CustomerForm";
import { setSelectedCustomer } from "../../../Redux Toolkit/features/cart/cartSlice";
import { useToast } from "../../../components/ui/use-toast";
import { Search, UserPlus, Users, Check } from "lucide-react";

const CustomerDialog = ({
  showCustomerDialog,
  setShowCustomerDialog,
}) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { customers = [], loading } = useSelector((state) => state.customer);

  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  useEffect(() => {
    if (showCustomerDialog) {
      dispatch(getAllCustomers());
    }
  }, [showCustomerDialog, dispatch]);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
  );

  const handleCustomerSelect = (customer) => {
    dispatch(setSelectedCustomer(customer));
    setShowCustomerDialog(false);
    toast({
      title: "Customer Selected",
      description: `${customer.fullName || customer.name} attached to this order.`,
    });
  };

  return (
    <>
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="sm:max-w-2xl bg-card border-border">
          <DialogHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-[#B8860B]" />
                Customer CRM Directory (F3)
              </DialogTitle>
              <Button
                size="sm"
                className="text-xs font-bold h-8 gap-1"
                onClick={() => setShowCustomerForm(true)}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register New
              </Button>
            </div>
          </DialogHeader>

          <div className="py-2 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, phone number, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs h-10 rounded-xl"
                autoFocus
              />
            </div>

            <div className="max-h-72 overflow-y-auto rounded-xl border border-border/80">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/40 border-b border-border/80">
                    <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3">Customer</TableHead>
                    <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3">Phone</TableHead>
                    <TableHead className="text-sm font-bold text-foreground uppercase tracking-wider py-3">Email</TableHead>
                    <TableHead className="text-right text-sm font-bold text-foreground uppercase tracking-wider py-3">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-xs text-muted-foreground">
                        {loading ? "Loading customer list..." : "No matching customer found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id} className="border-b border-border/60 hover:bg-secondary/20">
                        <TableCell className="py-2.5">
                          <span className="text-xs font-bold text-foreground block">
                            {customer.fullName || customer.name}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5 text-xs font-mono text-muted-foreground">
                          {customer.phone || "—"}
                        </TableCell>
                        <TableCell className="py-2.5 text-xs text-muted-foreground truncate max-w-[160px]">
                          {customer.email || "—"}
                        </TableCell>
                        <TableCell className="py-2.5 text-right">
                          <Button
                            size="sm"
                            onClick={() => handleCustomerSelect(customer)}
                            className="text-xs font-bold h-7 px-3 gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomerDialog(false)}
              className="text-xs h-9"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CustomerForm
        showCustomerForm={showCustomerForm}
        setShowCustomerForm={setShowCustomerForm}
      />
    </>
  );
};

export default CustomerDialog;