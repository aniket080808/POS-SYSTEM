import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  LayoutDashboard,
  ShoppingBag,
  RotateCcw,
  CreditCard,
  Package,
  Users,
  UserCircle,
  FileText,
  Settings,
  ExternalLink,
  ArrowRight,
  Receipt,
  Phone,
} from "lucide-react";
import { getInventoryByBranch } from "@/Redux Toolkit/features/inventory/inventoryThunks";
import { getOrdersByBranch } from "@/Redux Toolkit/features/order/orderThunks";
import { getAllCustomers } from "@/Redux Toolkit/features/customer/customerThunks";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

export default function BranchCommandPalette({ open, setOpen }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { format: formatCurrency } = useCurrencyFormatter();

  const { branch } = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);
  const { inventories = [] } = useSelector((state) => state.inventory);
  const { products = [] } = useSelector((state) => state.product);
  const { orders = [] } = useSelector((state) => state.order);
  const { customers = [] } = useSelector((state) => state.customer);

  const branchId = branch?.id || userProfile?.branchId || userProfile?.branch?.id;
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open && branchId) {
      if (!inventories || inventories.length === 0) {
        dispatch(getInventoryByBranch(branchId));
      }
      if (!orders || orders.length === 0) {
        dispatch(getOrdersByBranch({ branchId }));
      }
      if (!customers || customers.length === 0) {
        dispatch(getAllCustomers());
      }
    }
  }, [open, branchId, dispatch, inventories, orders, customers]);

  const NAV_ITEMS = useMemo(
    () => [
      {
        title: "Branch Overview & KPIs",
        path: "/branch/dashboard",
        icon: <LayoutDashboard className="w-4 h-4 text-[#F5A623]" />,
      },
      {
        title: "Branch Orders & Bills",
        path: "/branch/orders",
        icon: <ShoppingBag className="w-4 h-4 text-emerald-600" />,
      },
      {
        title: "Returns & Refund Requests",
        path: "/branch/refunds",
        icon: <RotateCcw className="w-4 h-4 text-rose-500" />,
      },
      {
        title: "Transactions Settlement Ledger",
        path: "/branch/transactions",
        icon: <CreditCard className="w-4 h-4 text-purple-600" />,
      },
      {
        title: "Branch Stock & Shelf Inventory",
        path: "/branch/inventory",
        icon: <Package className="w-4 h-4 text-blue-600" />,
      },
      {
        title: "Branch Staff & Cashier Roster",
        path: "/branch/employees",
        icon: <Users className="w-4 h-4 text-amber-600" />,
      },
      {
        title: "Customer Directory & History",
        path: "/branch/customers",
        icon: <UserCircle className="w-4 h-4 text-indigo-600" />,
      },
      {
        title: "Branch Analytical Reports",
        path: "/branch/reports",
        icon: <FileText className="w-4 h-4 text-[#8C5800]" />,
      },
      {
        title: "Branch Peripherals & Settings",
        path: "/branch/settings",
        icon: <Settings className="w-4 h-4 text-muted-foreground" />,
      },
    ],
    []
  );

  const QUICK_ACTIONS = useMemo(
    () => [
      {
        title: "Launch POS Cashier Terminal",
        action: () => {
          navigate("/cashier");
          setOpen(false);
        },
        icon: <ExternalLink className="w-4 h-4 text-emerald-600" />,
        badge: "Checkout Counter",
      },
      {
        title: "Check Branch Shelf Stock",
        action: () => {
          navigate("/branch/inventory");
          setOpen(false);
        },
        icon: <Package className="w-4 h-4 text-blue-600" />,
        badge: "Stock",
      },
      {
        title: "Audit Today's Returns",
        action: () => {
          navigate("/branch/refunds");
          setOpen(false);
        },
        icon: <RotateCcw className="w-4 h-4 text-rose-500" />,
        badge: "Returns",
      },
    ],
    [navigate, setOpen]
  );

  const filteredNav = useMemo(() => {
    if (!query.trim()) return NAV_ITEMS;
    const q = query.toLowerCase();
    return NAV_ITEMS.filter((item) => item.title.toLowerCase().includes(q));
  }, [NAV_ITEMS, query]);

  const filteredActions = useMemo(() => {
    if (!query.trim()) return QUICK_ACTIONS;
    const q = query.toLowerCase();
    return QUICK_ACTIONS.filter((action) =>
      action.title.toLowerCase().includes(q)
    );
  }, [QUICK_ACTIONS, query]);

  // Map inventory items with products
  const inventoryItems = useMemo(() => {
    return (inventories || []).map((inv) => {
      const prod = products.find((p) => p.id === inv.productId) || {};
      return {
        id: inv.id,
        name: prod.name || `SKU ${inv.productId}`,
        sku: prod.sku || `SKU-${inv.productId}`,
        quantity: inv.quantity ?? 0,
        price: prod.sellingPrice || prod.mrp || 0,
      };
    });
  }, [inventories, products]);

  const filteredStock = useMemo(() => {
    if (!query.trim()) return inventoryItems.slice(0, 4);
    const q = query.toLowerCase();
    return inventoryItems
      .filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [inventoryItems, query]);

  const filteredOrders = useMemo(() => {
    if (!query.trim()) return (orders || []).slice(0, 3);
    const q = query.toLowerCase();
    return (orders || [])
      .filter(
        (o) =>
          String(o.id).includes(q) ||
          o.orderNumber?.toLowerCase().includes(q) ||
          o.customer?.fullName?.toLowerCase().includes(q) ||
          o.customer?.phone?.includes(q)
      )
      .slice(0, 4);
  }, [orders, query]);

  const filteredCustomers = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return (customers || [])
      .filter(
        (c) =>
          c.fullName?.toLowerCase().includes(q) ||
          c.phone?.includes(q) ||
          c.email?.toLowerCase().includes(q)
      )
      .slice(0, 3);
  }, [customers, query]);

  const handleSelectNav = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden bg-card border-border shadow-2xl rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Branch Command Palette</DialogTitle>
        </DialogHeader>

        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-border/80 bg-secondary/20">
          <Search className="w-4 h-4 text-muted-foreground shrink-0 mr-3" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders, SKU stock, customers, or jump to page... (Esc to exit)"
            className="h-13 text-sm bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 shadow-none text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-xs text-muted-foreground hover:text-foreground font-semibold px-1.5 py-0.5 rounded bg-muted cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-[65vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 mb-1">
                Quick Actions
              </div>
              <div className="space-y-0.5">
                {filteredActions.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={action.action}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-secondary transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-secondary/80 border border-border group-hover:border-primary/40 transition-colors">
                        {action.icon}
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        {action.title}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-medium">
                      {action.badge}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Branch Stock Search */}
          {filteredStock.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-2.5 mb-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Branch Inventory ({inventoryItems.length})
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/branch/inventory");
                    setOpen(false);
                  }}
                  className="text-[11px] text-[#F5A623] hover:underline font-semibold cursor-pointer"
                >
                  View All
                </button>
              </div>
              <div className="space-y-1">
                {filteredStock.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      navigate("/branch/inventory");
                      setOpen(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-card border border-border/60 hover:border-primary/50 hover:bg-secondary/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-secondary/80 border border-border flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-2">
                          <span>SKU: {item.sku}</span>
                          <span>•</span>
                          <span>{formatCurrency(item.price)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <Badge
                        variant={item.quantity <= 5 ? "error" : "active"}
                        className="text-[10px] font-mono"
                      >
                        {item.quantity} in stock
                      </Badge>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Search */}
          {filteredOrders.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-2.5 mb-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Recent Branch Orders
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/branch/orders");
                    setOpen(false);
                  }}
                  className="text-[11px] text-[#F5A623] hover:underline font-semibold cursor-pointer"
                >
                  View Orders
                </button>
              </div>
              <div className="space-y-1">
                {filteredOrders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => {
                      navigate("/branch/orders");
                      setOpen(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-card border border-border/60 hover:border-primary/50 hover:bg-secondary/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-secondary/80 border border-border flex items-center justify-center shrink-0">
                        <Receipt className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground truncate">
                          Order #{o.id || o.orderNumber}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {o.customer?.fullName || "Walk-in"} • {o.paymentType || "CASH"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-xs font-mono font-bold text-foreground">
                        {formatCurrency(o.totalAmount || 0)}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers Search */}
          {filteredCustomers.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 mb-1">
                Customers
              </div>
              <div className="space-y-1">
                {filteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      navigate("/branch/customers");
                      setOpen(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-card border border-border/60 hover:border-primary/50 hover:bg-secondary/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-secondary/80 border border-border flex items-center justify-center shrink-0">
                        <UserCircle className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground truncate">
                          {c.fullName}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{c.phone}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Pages */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 mb-1">
              Branch Modules
            </div>
            <div className="space-y-0.5">
              {filteredNav.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleSelectNav(item.path)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-secondary transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-secondary/80 border border-border group-hover:border-primary/40 transition-colors">
                      {item.icon}
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      {item.title}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-border/80 bg-secondary/30 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono font-bold text-[10px]">Esc</kbd> to close
            </span>
            <span>•</span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono font-bold text-[10px]">Ctrl+K</kbd> anywhere
            </span>
          </div>
          <span className="font-semibold text-foreground">Branch Floor Search</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
