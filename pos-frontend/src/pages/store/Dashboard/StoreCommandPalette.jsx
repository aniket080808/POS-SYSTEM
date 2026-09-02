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
  Store,
  ShoppingCart,
  Tag,
  Users,
  BarChart2,
  FileText,
  AlertTriangle,
  BadgeDollarSign,
  Settings,
  Plus,
  ArrowRight,
  Package,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { getProductsByStore } from "@/Redux Toolkit/features/product/productThunks";
import { getAllBranchesByStore } from "@/Redux Toolkit/features/branch/branchThunks";
import { useCurrencyFormatter } from "@/utils/currencyUtils";

export default function StoreCommandPalette({ open, setOpen }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { format: formatCurrency } = useCurrencyFormatter();

  const { store } = useSelector((state) => state.store);
  const { userProfile } = useSelector((state) => state.user);
  const { products = [] } = useSelector((state) => state.product);
  const { branches = [] } = useSelector((state) => state.branch);

  const [query, setQuery] = useState("");

  const activeStoreId = store?.id || userProfile?.storeId || userProfile?.store?.id;

  useEffect(() => {
    if (open && activeStoreId) {
      const jwt = localStorage.getItem("jwt");
      if (!products || products.length === 0) {
        dispatch(getProductsByStore(activeStoreId));
      }
      if (!branches || branches.length === 0) {
        dispatch(getAllBranchesByStore({ storeId: activeStoreId, jwt }));
      }
    }
  }, [open, activeStoreId, dispatch, products, branches]);

  const NAV_ITEMS = useMemo(
    () => [
      {
        title: "Store Dashboard",
        path: "/store/dashboard",
        icon: <LayoutDashboard className="w-4 h-4 text-[#B8860B]" />,
        category: "Navigation",
      },
      {
        title: "Branch Outlets & Workstations",
        path: "/store/branches",
        icon: <Store className="w-4 h-4 text-foreground" />,
        category: "Navigation",
      },
      {
        title: "Product Inventory & Barcodes",
        path: "/store/products",
        icon: <ShoppingCart className="w-4 h-4 text-emerald-600" />,
        category: "Navigation",
      },
      {
        title: "Product Categories",
        path: "/store/categories",
        icon: <Tag className="w-4 h-4 text-amber-600" />,
        category: "Navigation",
      },
      {
        title: "Store Staff & Cashiers",
        path: "/store/employees",
        icon: <Users className="w-4 h-4 text-blue-600" />,
        category: "Navigation",
      },
      {
        title: "Sales Orders & Receipts",
        path: "/store/sales",
        icon: <BarChart2 className="w-4 h-4 text-purple-600" />,
        category: "Navigation",
      },
      {
        title: "Analytical Business Reports",
        path: "/store/reports",
        icon: <FileText className="w-4 h-4 text-rose-600" />,
        category: "Navigation",
      },
      {
        title: "Stock & Operational Alerts",
        path: "/store/alerts",
        icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
        category: "Navigation",
      },
      {
        title: "Subscription & Plan Upgrades",
        path: "/store/upgrade",
        icon: <BadgeDollarSign className="w-4 h-4 text-[#B8860B]" />,
        category: "Navigation",
      },
      {
        title: "Store Settings & Preferences",
        path: "/store/settings",
        icon: <Settings className="w-4 h-4 text-muted-foreground" />,
        category: "Navigation",
      },
    ],
    []
  );

  const QUICK_ACTIONS = useMemo(
    () => [
      {
        title: "Add New Product SKU",
        action: () => {
          navigate("/store/products");
          setOpen(false);
        },
        icon: <Plus className="w-4 h-4 text-[#B8860B]" />,
        badge: "Product",
      },
      {
        title: "Register New Branch Location",
        action: () => {
          navigate("/store/branches");
          setOpen(false);
        },
        icon: <Store className="w-4 h-4 text-blue-600" />,
        badge: "Branch",
      },
      {
        title: "Launch POS Cashier Terminal",
        action: () => {
          navigate("/cashier");
          setOpen(false);
        },
        icon: <ExternalLink className="w-4 h-4 text-emerald-600" />,
        badge: "POS Checkout",
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

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return (products || []).slice(0, 4);
    const q = query.toLowerCase();
    return (products || [])
      .filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [products, query]);

  const filteredBranches = useMemo(() => {
    if (!query.trim()) return (branches || []).slice(0, 3);
    const q = query.toLowerCase();
    return (branches || [])
      .filter(
        (b) =>
          b.name?.toLowerCase().includes(q) ||
          b.address?.toLowerCase().includes(q)
      )
      .slice(0, 4);
  }, [branches, query]);

  const handleSelectNav = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden bg-card border-border shadow-2xl rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Store Command Palette</DialogTitle>
        </DialogHeader>

        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-border/80 bg-secondary/20">
          <Search className="w-4 h-4 text-muted-foreground shrink-0 mr-3" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, SKUs, branches, or jump to page... (Esc to exit)"
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

        {/* Results List */}
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

          {/* Products Search */}
          {filteredProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-2.5 mb-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Products ({products.length})
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/store/products");
                    setOpen(false);
                  }}
                  className="text-[11px] text-[#B8860B] hover:underline font-semibold cursor-pointer"
                >
                  View All
                </button>
              </div>
              <div className="space-y-1">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      navigate("/store/products");
                      setOpen(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-card border border-border/60 hover:border-primary/50 hover:bg-secondary/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-secondary/80 border border-border flex items-center justify-center shrink-0">
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground truncate">
                          {prod.name}
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-2">
                          <span>SKU: {prod.sku}</span>
                          <span>•</span>
                          <span>{formatCurrency(prod.sellingPrice)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <Badge
                        variant={(prod.stock ?? 0) <= 5 ? "error" : "active"}
                        className="text-[10px] font-mono"
                      >
                        {prod.stock ?? 0} in stock
                      </Badge>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Branches Search */}
          {filteredBranches.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 mb-1">
                Branch Locations ({branches.length})
              </div>
              <div className="space-y-1">
                {filteredBranches.map((br) => (
                  <div
                    key={br.id}
                    onClick={() => {
                      navigate("/store/branches");
                      setOpen(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-card border border-border/60 hover:border-primary/50 hover:bg-secondary/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-secondary/80 border border-border flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground truncate">
                          {br.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {br.address}
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
              Store Navigation
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

        {/* Footer Shortcut Helper */}
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
          <span className="font-semibold text-foreground">Store Workstation Search</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
