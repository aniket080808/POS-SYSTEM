import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Package,
  Store,
  FileSpreadsheet,
  ChevronRight,
  CheckCircle2,
  Search,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  QrCode,
  Banknote,
  RotateCcw,
  Check,
  Building2,
  Users,
  Receipt,
} from "lucide-react";
import { useNavigate } from "react-router";

const catalogPool = [
  { id: 1, name: "Organic Basmati Rice 1kg", sku: "SKU-GR01", category: "Grocery", price: 140, stock: "In Stock", stockQty: 85 },
  { id: 2, name: "Cold Pressed Olive Oil 500ml", sku: "SKU-GR12", category: "Grocery", price: 320, stock: "Low Stock", stockQty: 6 },
  { id: 3, name: "Whole Wheat Bread 400g", sku: "SKU-BK04", category: "Bakery", price: 45, stock: "In Stock", stockQty: 34 },
  { id: 4, name: "Organic Green Tea 250g", sku: "SKU-BV07", category: "Beverages", price: 210, stock: "In Stock", stockQty: 42 },
  { id: 5, name: "Almond Milk 1L", sku: "SKU-DY08", category: "Dairy", price: 180, stock: "In Stock", stockQty: 28 },
  { id: 6, name: "Dark Chocolate Bar 80g", sku: "SKU-SN02", category: "Snacks", price: 95, stock: "In Stock", stockQty: 50 },
];

const demoBranches = [
  { id: 1, name: "Downtown Supermarket", location: "Main Street, Sector 4", counters: 4, manager: "Rajesh Kumar", activeStaff: 6, status: "Active", dailySales: "₹48,250" },
  { id: 2, name: "Westside Retail Express", location: "West Avenue Mall", counters: 3, manager: "Priya Sharma", activeStaff: 4, status: "Active", dailySales: "₹32,800" },
  { id: 3, name: "Metro Transit Store", location: "Central Metro Hub", counters: 2, manager: "Amit Verma", activeStaff: 3, status: "Active", dailySales: "₹24,150" },
];

const LiveDemoSection = () => {
  const [activeTab, setActiveTab] = useState("pos");
  const navigate = useNavigate();

  // POS Interactive State
  const [cart, setCart] = useState([
    { id: 1, name: "Organic Basmati Rice 1kg", price: 140, qty: 2 },
    { id: 2, name: "Cold Pressed Olive Oil 500ml", price: 320, qty: 1 },
  ]);
  const [paymentMode, setPaymentMode] = useState("UPI"); // 'CASH' | 'UPI'
  const [checkoutDone, setCheckoutDone] = useState(false);

  // Inventory Interactive State
  const [invSearch, setInvSearch] = useState("");
  const [invCategory, setInvCategory] = useState("All");

  // Shift Interactive State
  const [openingFloat, setOpeningFloat] = useState(2000);

  const tabs = [
    { id: "pos", label: "Cashier Terminal", icon: <ShoppingCart className="w-4 h-4" /> },
    { id: "inventory", label: "Inventory Catalog", icon: <Package className="w-4 h-4" /> },
    { id: "branches", label: "Branch Management", icon: <Store className="w-4 h-4" /> },
    { id: "shifts", label: "Shift Balancing", icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  // Cart math
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  const gst = useMemo(() => subtotal * 0.05, [subtotal]);
  const netTotal = useMemo(() => subtotal + gst, [subtotal, gst]);

  const updateQty = (id, delta) => {
    setCheckoutDone(false);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.qty + delta;
            return nextQty > 0 ? { ...item, qty: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const addItemToCart = (item) => {
    setCheckoutDone(false);
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  const removeItem = (id) => {
    setCheckoutDone(false);
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutDone(true);
  };

  const handleResetCart = () => {
    setCart([
      { id: 1, name: "Organic Basmati Rice 1kg", price: 140, qty: 2 },
      { id: 2, name: "Cold Pressed Olive Oil 500ml", price: 320, qty: 1 },
    ]);
    setCheckoutDone(false);
  };

  // Filtered inventory
  const filteredCatalog = useMemo(() => {
    return catalogPool.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(invSearch.toLowerCase()) ||
        item.sku.toLowerCase().includes(invSearch.toLowerCase());
      const matchesCat = invCategory === "All" || item.category === invCategory;
      return matchesSearch && matchesCat;
    });
  }, [invSearch, invCategory]);

  return (
    <section id="demo" className="py-20 bg-muted/20 border-b border-border scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FDF6E2] text-[#785600] border border-[#EED896] dark:bg-[#3A3530] dark:text-[#F5A623] dark:border-[#5A4F3D] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#B8860B] dark:text-[#F5A623]" />
            Interactive Product Tour
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
            See how the platform works
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Test the live cashier terminal, explore product inventory, and see multi-branch & shift controls in action.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Pills */}
          <div className="lg:col-span-4 bg-card rounded-2xl border border-border p-5 space-y-2 shadow-2xs">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              Select Module
            </h3>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#262422] text-[#FAF8F3] shadow-xs"
                    : "bg-transparent text-foreground hover:bg-secondary"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg ${
                      activeTab === tab.id ? "text-[#C9A227]" : "text-muted-foreground"
                    }`}
                  >
                    {tab.icon}
                  </div>
                  <span>{tab.label}</span>
                </div>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4 text-[#C9A227]" />}
              </button>
            ))}

            <div className="pt-4 mt-4 border-t border-border space-y-2">
              <Button
                onClick={() => navigate("/auth/onboarding")}
                className="w-full text-xs font-bold h-10 gap-1.5"
              >
                Register Your Store
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Right Interactive Display */}
          <div className="lg:col-span-8 bg-card rounded-2xl border border-border shadow-md overflow-hidden">
            {/* View Header */}
            <div className="bg-[#262422] text-[#FAF8F3] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#C9A227] animate-pulse" />
                <span className="text-xs font-bold tracking-wide">
                  {activeTab === "pos" && "Interactive Cashier Terminal – Live Billing Simulation"}
                  {activeTab === "inventory" && "Central Stock & Product Catalog"}
                  {activeTab === "branches" && "Multi-Branch & Station Management"}
                  {activeTab === "shifts" && "Shift Till Balancing & Close Summary"}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#D4CEBF] bg-white/10 px-2 py-0.5 rounded">
                Live Simulator
              </span>
            </div>

            {/* View Body */}
            <div className="p-6 min-h-[460px] bg-card flex flex-col justify-between">
              {/* 1. POS Terminal Interactive Simulator */}
              {activeTab === "pos" && (
                <div className="space-y-4">
                  {/* Quick item insertion pill bar */}
                  <div className="flex flex-wrap items-center gap-2 pb-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase mr-1">
                      Quick Add:
                    </span>
                    {catalogPool.map((catItem) => (
                      <button
                        key={catItem.id}
                        onClick={() => addItemToCart(catItem)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary text-foreground hover:bg-[#FDF6E2] hover:text-[#785600] hover:border-[#EED896] dark:hover:bg-[#3A3530] dark:hover:text-[#F5A623] dark:hover:border-[#5A4F3D] border border-border text-xs font-semibold transition-colors cursor-pointer"
                        title={`Click to add ${catItem.name}`}
                      >
                        <Plus className="w-3 h-3 text-[#B8860B] dark:text-[#F5A623]" />
                        {catItem.name.split(" ")[0]} (₹{catItem.price})
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Active Cart Items */}
                    <div className="md:col-span-7 space-y-3">
                      <div className="border border-border rounded-xl overflow-hidden divide-y divide-border/60">
                        <div className="p-2.5 bg-secondary/40 grid grid-cols-12 text-[11px] font-bold text-muted-foreground">
                          <span className="col-span-5">Item</span>
                          <span className="col-span-3 text-center">Qty</span>
                          <span className="col-span-2 text-right">Price</span>
                          <span className="col-span-2 text-right">Total</span>
                        </div>

                        {cart.length === 0 ? (
                          <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
                            <ShoppingCart className="w-6 h-6 mx-auto text-muted-foreground/50" />
                            <p>Cart is empty. Click any item above to add to cart.</p>
                            <Button size="sm" variant="outline" className="text-xs" onClick={handleResetCart}>
                              Reset Demo Items
                            </Button>
                          </div>
                        ) : (
                          cart.map((item) => (
                            <div key={item.id} className="p-2.5 grid grid-cols-12 text-xs items-center gap-1">
                              <div className="col-span-5 font-bold text-foreground truncate pr-1">
                                {item.name}
                              </div>
                              <div className="col-span-3 flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateQty(item.id, -1)}
                                  className="w-5 h-5 rounded bg-secondary hover:bg-muted border border-border flex items-center justify-center text-foreground font-bold cursor-pointer"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="font-mono font-bold text-xs w-4 text-center">
                                  {item.qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQty(item.id, 1)}
                                  className="w-5 h-5 rounded bg-secondary hover:bg-muted border border-border flex items-center justify-center text-foreground font-bold cursor-pointer"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>
                              <div className="col-span-2 text-right font-mono text-muted-foreground">
                                ₹{item.price}
                              </div>
                              <div className="col-span-2 text-right font-mono font-bold text-foreground">
                                ₹{item.price * item.qty}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {checkoutDone && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400 stroke-[3]" />
                            <span>
                              Sale Completed via <strong>{paymentMode}</strong>! Receipt #NX-4912 generated.
                            </span>
                          </div>
                          <button
                            onClick={handleResetCart}
                            className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 underline cursor-pointer"
                          >
                            New Sale
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Order Summary & Payment Mode */}
                    <div className="md:col-span-5 p-4 rounded-xl bg-secondary/40 border border-border space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
                          <span>Bill Summary</span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {cart.length} item{cart.length === 1 ? "" : "s"}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>GST (5%)</span>
                            <span className="font-mono">₹{gst.toFixed(2)}</span>
                          </div>
                          <div className="pt-2 border-t border-border flex justify-between font-bold text-sm text-foreground">
                            <span>Net Total</span>
                            <span className="font-mono text-[#B8860B]">₹{netTotal.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Payment Selection */}
                        <div className="mt-4 pt-3 border-t border-border">
                          <span className="text-[11px] font-bold text-muted-foreground uppercase block mb-2">
                            Payment Method
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setPaymentMode("CASH")}
                              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                paymentMode === "CASH"
                                  ? "bg-[#262422] text-[#FAF8F3] shadow-xs"
                                  : "bg-card border border-border text-foreground hover:bg-secondary"
                              }`}
                            >
                              <Banknote className="w-3.5 h-3.5" />
                              Cash
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentMode("UPI")}
                              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                paymentMode === "UPI"
                                  ? "bg-[#262422] text-[#FAF8F3] shadow-xs"
                                  : "bg-card border border-border text-foreground hover:bg-secondary"
                              }`}
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              UPI / QR
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3">
                        <Button
                          onClick={handleCheckout}
                          disabled={cart.length === 0}
                          className="w-full text-xs font-bold h-9 gap-1.5"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          Simulate Fast Checkout
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Inventory Catalog Interactive Tab */}
              {activeTab === "inventory" && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={invSearch}
                        onChange={(e) => setInvSearch(e.target.value)}
                        placeholder="Search sample items by name or SKU..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-input bg-card outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                      {["All", "Grocery", "Bakery", "Beverages", "Dairy", "Snacks"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setInvCategory(cat)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
                            invCategory === cat
                              ? "bg-[#262422] text-[#FAF8F3]"
                              : "bg-secondary text-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border border-border rounded-xl overflow-hidden divide-y divide-border/60">
                    <div className="p-2.5 bg-secondary/40 grid grid-cols-12 text-[11px] font-bold text-muted-foreground">
                      <span className="col-span-4">Product Name</span>
                      <span className="col-span-3">SKU</span>
                      <span className="col-span-2">Category</span>
                      <span className="col-span-1 text-right">Price</span>
                      <span className="col-span-2 text-right">Stock</span>
                    </div>
                    {filteredCatalog.map((item) => (
                      <div key={item.id} className="p-2.5 grid grid-cols-12 text-xs items-center">
                        <span className="col-span-4 font-bold text-foreground truncate">{item.name}</span>
                        <span className="col-span-3 font-mono text-muted-foreground text-[11px]">{item.sku}</span>
                        <span className="col-span-2 text-muted-foreground">{item.category}</span>
                        <span className="col-span-1 text-right font-mono font-bold">₹{item.price}</span>
                        <span className="col-span-2 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.stock === "Low Stock"
                                ? "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                            }`}
                          >
                            {item.stock} ({item.stockQty})
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Multi-Branch Management Interactive Tab */}
              {activeTab === "branches" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {demoBranches.map((branch) => (
                      <div
                        key={branch.id}
                        className="p-4 rounded-xl bg-card border border-border space-y-2 hover:border-[#B8860B]/50 transition-colors shadow-2xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#B8860B]" />
                            {branch.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                            {branch.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{branch.location}</p>
                        <div className="pt-2 border-t border-border text-[11px] space-y-1">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Billing Counters:</span>
                            <span className="font-mono font-bold text-foreground">{branch.counters} Stations</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Manager:</span>
                            <span className="font-medium text-foreground">{branch.manager}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Today's Sales:</span>
                            <span className="font-mono font-bold text-[#B8860B]">{branch.dailySales}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Shift Balancing Tab */}
              {activeTab === "shifts" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <span className="text-xs font-bold text-foreground">Cashier Register Summary</span>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-bold text-muted-foreground">Opening Float:</label>
                        <input
                          type="number"
                          value={openingFloat}
                          onChange={(e) => setOpeningFloat(Number(e.target.value) || 0)}
                          className="w-24 px-2 py-0.5 rounded border border-input text-xs font-mono font-bold text-foreground bg-card"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="p-3 bg-card rounded-xl border border-border">
                        <div className="text-[11px] text-muted-foreground uppercase font-bold">
                          Opening Till Float
                        </div>
                        <div className="text-sm font-bold text-foreground font-mono mt-1">
                          ₹{openingFloat.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-3 bg-card rounded-xl border border-border">
                        <div className="text-[11px] text-muted-foreground uppercase font-bold">
                          Digital / UPI Sales
                        </div>
                        <div className="text-sm font-bold text-foreground font-mono mt-1">
                          ₹14,350.00
                        </div>
                      </div>
                      <div className="p-3 bg-[#FDF6E2] dark:bg-[#3A3530] rounded-xl border border-[#EED896] dark:border-[#5A4F3D]">
                        <div className="text-[11px] text-[#785600] dark:text-[#F5A623] uppercase font-bold">
                          Expected Cash in Drawer
                        </div>
                        <div className="text-sm font-bold text-[#785600] dark:text-[#F5A623] font-mono mt-1">
                          ₹{(openingFloat + 8420).toLocaleString()}.00
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Automated drawer reconciliation gives store managers full audit transparency over daily cash sales, digital transactions, and register floats.
                  </p>
                </div>
              )}

              {/* Bottom Feature Tagline */}
              <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B8860B]" />
                  Clean, fast interface designed for daily retail speed.
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Press any interactive control to preview
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveDemoSection;