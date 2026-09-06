import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Store,
  Building2,
  CreditCard,
  ShieldCheck,
  Zap,
  Printer,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ScanLine,
  Sparkles,
  QrCode,
  DollarSign,
  BadgeCheck,
  RefreshCw,
  AlertTriangle,
  Lock,
  Clock,
  Coins,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  Check,
  X,
  Sliders,
  TrendingUp,
  Boxes,
  Users,
  Sun,
  Moon,
  Receipt,
  FileCheck2,
  Layers,
} from "lucide-react";
import NexPOSLogo from "@/components/common/NexPOSLogo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

// ==========================================
// 1. STORE OWNER SIMULATOR STATE & DATA
// ==========================================
const INITIAL_BRANCH_DATA = {
  all: { name: "All Outlets (Consolidated)", revenue: "₹1,84,650", orders: 342, topProduct: "Cold Brew Coffee", activeStaff: 18, growth: "+22.4%" },
  delhi: { name: "Delhi Connaught Place", revenue: "₹92,400", orders: 178, topProduct: "Artisan Sourdough", activeStaff: 8, growth: "+28.1%" },
  mumbai: { name: "Mumbai Bandra Central", revenue: "₹64,250", orders: 114, topProduct: "Organic Dark Chocolate", activeStaff: 6, growth: "+16.8%" },
  bengaluru: { name: "Bengaluru Indiranagar", revenue: "₹28,000", orders: 50, topProduct: "Roasted Almonds", activeStaff: 4, growth: "+12.2%" },
};

const INITIAL_MASTER_CATALOG = [
  { id: 101, name: "Cold Brew Coffee 350ml", sku: "SKU-BEV-001", category: "Beverages", mrp: 180, cost: 95, gst: 18 },
  { id: 102, name: "Artisan Sourdough Loaf", sku: "SKU-BAK-042", category: "Bakery", mrp: 140, cost: 70, gst: 5 },
  { id: 103, name: "Organic Dark Chocolate 70%", sku: "SKU-SNK-109", category: "Snacks", mrp: 220, cost: 130, gst: 18 },
  { id: 104, name: "Farm Fresh Milk 1L", sku: "SKU-DAI-005", category: "Dairy", mrp: 65, cost: 52, gst: 0 },
];

// ==========================================
// 2. BRANCH MANAGER SIMULATOR STATE & DATA
// ==========================================
const INITIAL_BRANCH_INVENTORY = [
  { id: 201, name: "Organic Basmati Rice 1kg", sku: "SKU-GR-01", stock: 4, threshold: 10, category: "Grocery" },
  { id: 202, name: "Cold Pressed Olive Oil 500ml", sku: "SKU-GR-12", stock: 2, threshold: 5, category: "Grocery" },
  { id: 203, name: "Artisan Sourdough Loaf", sku: "SKU-BAK-042", stock: 38, threshold: 15, category: "Bakery" },
  { id: 204, name: "Cold Brew Coffee 350ml", sku: "SKU-BEV-001", stock: 45, threshold: 12, category: "Beverages" },
];

const INITIAL_REFUNDS = [
  { id: "REF-902", orderId: "ORD-8812", item: "Cold Pressed Olive Oil", amount: 320, cashier: "Rahul V.", reason: "Broken seal on delivery", status: "PENDING" },
  { id: "REF-903", orderId: "ORD-8825", item: "Artisan Sourdough", amount: 140, cashier: "Pooja S.", reason: "Customer changed mind", status: "PENDING" },
];

// ==========================================
// 3. CASHIER POS TERMINAL DATA
// ==========================================
const POS_CATALOG = [
  { id: 1, name: "Cold Brew Coffee", sku: "SKU-BEV-001", price: 180, category: "Beverages", gst: 18 },
  { id: 2, name: "Sourdough Bread", sku: "SKU-BAK-042", price: 140, category: "Bakery", gst: 5 },
  { id: 3, name: "Dark Chocolate", sku: "SKU-SNK-109", price: 220, category: "Snacks", gst: 18 },
  { id: 4, name: "Whole Milk 1L", sku: "SKU-DAI-005", price: 65, category: "Dairy", gst: 0 },
  { id: 5, name: "Lemonade Soda", sku: "SKU-BEV-088", price: 95, category: "Beverages", gst: 12 },
  { id: 6, name: "Roasted Almonds", sku: "SKU-NUT-023", price: 280, category: "Snacks", gst: 12 },
];

// ==========================================
// 4. SUPER ADMIN DATA
// ==========================================
const INITIAL_STORE_REQUESTS = [
  { id: "REQ-101", storeName: "Sharma Supermarket", owner: "Ramesh Sharma", city: "Delhi", gstin: "07AAAAA1234A1Z5", status: "PENDING" },
  { id: "REQ-102", storeName: "Organic Greens Mart", owner: "Sunita Rao", city: "Bengaluru", gstin: "29BBBBB5678B2Z1", status: "PENDING" },
];

export default function PlatformGuide() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeRole, setActiveRole] = useState("store_owner"); // 'store_owner' | 'branch_manager' | 'cashier' | 'super_admin'

  // --- STORE OWNER STATE ---
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [masterCatalog, setMasterCatalog] = useState(INITIAL_MASTER_CATALOG);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("Beverages");
  const [branchQuotaSlider, setBranchQuotaSlider] = useState(3);
  const [productAddedNotice, setProductAddedNotice] = useState(false);

  // --- BRANCH MANAGER STATE ---
  const [inventory, setInventory] = useState(INITIAL_BRANCH_INVENTORY);
  const [refunds, setRefunds] = useState(INITIAL_REFUNDS);
  const [invSearchQuery, setInvSearchQuery] = useState("");
  const [drawerAudited, setDrawerAudited] = useState(false);

  // --- CASHIER POS STATE ---
  const [cart, setCart] = useState([
    { ...POS_CATALOG[0], qty: 1 },
    { ...POS_CATALOG[1], qty: 2 },
  ]);
  const [paymentMode, setPaymentMode] = useState("upi");
  const [cashGiven, setCashGiven] = useState(500);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [receiptPrinted, setReceiptPrinted] = useState(false);
  const [lastScannedItem, setLastScannedItem] = useState(null);

  // --- SUPER ADMIN STATE ---
  const [storeRequests, setStoreRequests] = useState(INITIAL_STORE_REQUESTS);
  const [starterPlanPrice, setStarterPlanPrice] = useState(999);

  // ==========================================
  // HANDLERS
  // ==========================================
  // Store Owner: Add Product
  const handleAddMasterProduct = (e) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductPrice) return;
    const newProd = {
      id: Date.now(),
      name: newProductName.trim(),
      sku: `SKU-${newProductCategory.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      category: newProductCategory,
      mrp: Number(newProductPrice),
      cost: Math.round(Number(newProductPrice) * 0.6),
      gst: 18,
    };
    setMasterCatalog([newProd, ...masterCatalog]);
    setNewProductName("");
    setNewProductPrice("");
    setProductAddedNotice(true);
    setTimeout(() => setProductAddedNotice(false), 3000);
  };

  // Branch Manager: Restock
  const handleRestock = (id, count = 50) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: item.stock + count } : item))
    );
  };

  // Branch Manager: Approve Refund
  const handleApproveRefund = (refId) => {
    setRefunds((prev) =>
      prev.map((r) => (r.id === refId ? { ...r, status: "APPROVED" } : r))
    );
  };

  // Cashier: Cart Operations
  const addToCart = (product) => {
    setReceiptPrinted(false);
    setLastScannedItem(product.name);
    setCart((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => (p.id === product.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setTimeout(() => setLastScannedItem(null), 1500);
  };

  const updateCartQty = (id, delta) => {
    setReceiptPrinted(false);
    setCart((prev) =>
      prev
        .map((p) => {
          if (p.id === id) {
            const next = p.qty + delta;
            return next > 0 ? { ...p, qty: next } : null;
          }
          return p;
        })
        .filter(Boolean)
    );
  };

  // Super Admin: Approve Store
  const handleApproveStore = (id) => {
    setStoreRequests((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "APPROVED" } : s))
    );
  };

  // Cart Calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = Math.round((rawSubtotal * discountPercent) / 100);
  const discountedSubtotal = rawSubtotal - discountAmount;
  const taxAmount = cart.reduce((sum, item) => sum + ((item.price * item.qty * item.gst) / 100), 0);
  const grandTotal = Math.round(discountedSubtotal + taxAmount);
  const changeDue = Math.max(0, cashGiven - grandTotal);

  const activeBranch = INITIAL_BRANCH_DATA[selectedBranch];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-amber-500/20 selection:text-amber-600">
      {/* 1. TOP STICKY APP BAR */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </button>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <NexPOSLogo onClick={() => navigate("/")} size="sm" />
            <span className="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Sparkles className="w-3 h-3" /> Interactive Role Simulator
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border bg-card hover:bg-secondary text-foreground transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
            <Button
              size="sm"
              onClick={() => navigate("/auth/onboarding")}
              className="bg-[#B8860B] hover:bg-[#996e08] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Register Your Store <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* 2. HERO HEADLINE & ROLE SELECTOR PILLS */}
      <section className="pt-8 pb-6 border-b border-border/80 bg-gradient-to-b from-secondary/40 via-background to-background text-center px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FDF6E2] text-[#785600] border border-[#EED896] dark:bg-[#3A3530] dark:text-[#F5A623] dark:border-[#5A4F3D] mb-3">
            <Zap className="w-3.5 h-3.5 animate-pulse" /> Live Interactive Sandbox
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Experience NexPOS Through Any Role
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto mb-6">
            Click a role below. The simulated workstation screen will transform live to give you real hands-on controls — restock items, toggle branches, or print a receipt!
          </p>

          {/* 4 Interactive Segmented Role Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto p-1.5 rounded-2xl bg-secondary/80 border border-border">
            <button
              onClick={() => setActiveRole("store_owner")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeRole === "store_owner"
                  ? "bg-card text-amber-600 dark:text-amber-400 shadow-sm border border-amber-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Store className="w-4 h-4" /> Store Owner
            </button>

            <button
              onClick={() => setActiveRole("branch_manager")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeRole === "branch_manager"
                  ? "bg-card text-blue-600 dark:text-blue-400 shadow-sm border border-blue-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-4 h-4" /> Branch Manager
            </button>

            <button
              onClick={() => setActiveRole("cashier")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeRole === "cashier"
                  ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CreditCard className="w-4 h-4" /> Cashier POS
            </button>

            <button
              onClick={() => setActiveRole("super_admin")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeRole === "super_admin"
                  ? "bg-card text-purple-600 dark:text-purple-400 shadow-sm border border-purple-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Super Admin
            </button>
          </div>
        </div>
      </section>

      {/* 3. SIMULATED WORKSTATION SCREEN (THE INTERACTIVE PLAYGROUND) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border-2 border-border bg-card shadow-lg overflow-hidden transition-all">
          {/* Simulated Browser / OS Window Bar */}
          <div className="h-10 bg-secondary/80 border-b border-border px-4 flex items-center justify-between text-xs text-muted-foreground select-none">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="ml-2 font-mono text-[11px] text-foreground font-semibold flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-500" />
                {activeRole === "store_owner" && "app.nexpos.in/store/dashboard"}
                {activeRole === "branch_manager" && "app.nexpos.in/branch/inventory"}
                {activeRole === "cashier" && "app.nexpos.in/cashier/terminal"}
                {activeRole === "super_admin" && "app.nexpos.in/super-admin/overview"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-emerald-600 dark:text-emerald-400">LIVE WORKSPACE SIMULATOR</span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* VIEW 1: STORE OWNER INTERACTIVE CONSOLE                     */}
          {/* ============================================================ */}
          {activeRole === "store_owner" && (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-1">
                    <Store className="w-3.5 h-3.5" /> ROLE_STORE_ADMIN
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Apex Retail Chain — Executive Command Console
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Centralized management of subscription quotas, branch network, and global product catalog.
                  </p>
                </div>

                {/* Interactive Branch Switcher */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary border border-border shrink-0">
                  <span className="text-[11px] font-bold text-muted-foreground px-2">Branch:</span>
                  {["all", "delhi", "mumbai", "bengaluru"].map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBranch(b)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer capitalize ${
                        selectedBranch === b
                          ? "bg-amber-500 text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Metrics Cards (Changes when branch changes) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-border bg-background">
                  <div className="text-xs text-muted-foreground mb-1">Revenue Today</div>
                  <div className="text-xl sm:text-2xl font-black text-foreground">{activeBranch.revenue}</div>
                  <div className="text-[11px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {activeBranch.growth} vs yesterday
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-background">
                  <div className="text-xs text-muted-foreground mb-1">Orders Processed</div>
                  <div className="text-xl sm:text-2xl font-black text-foreground">{activeBranch.orders}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">Across all cashier counters</div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-background">
                  <div className="text-xs text-muted-foreground mb-1">Top Selling SKU</div>
                  <div className="text-sm font-bold text-foreground truncate mt-1">{activeBranch.topProduct}</div>
                  <div className="text-[11px] text-amber-600 font-bold mt-1">High Velocity Item</div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-background">
                  <div className="text-xs text-muted-foreground mb-1">Staff on Duty</div>
                  <div className="text-xl sm:text-2xl font-black text-foreground">{activeBranch.activeStaff}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">Logged into branch counters</div>
                </div>
              </div>

              {/* Two Column Layout: Add Product + Razorpay Quota Tuner */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Master Catalog & Live Add Product Form (7 cols) */}
                <div className="lg:col-span-7 p-5 rounded-2xl border border-border bg-secondary/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-amber-500" /> Master SKU Catalog
                      </h3>
                      <p className="text-xs text-muted-foreground">Add a product once — it auto-syncs to all branch inventories.</p>
                    </div>
                    {productAddedNotice && (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 animate-in fade-in">
                        ✓ Product Added!
                      </span>
                    )}
                  </div>

                  {/* Interactive Add Form */}
                  <form onSubmit={handleAddMasterProduct} className="p-3 rounded-xl bg-card border border-border grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Product Name (e.g. Green Tea)"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background sm:col-span-2 text-foreground"
                    />
                    <input
                      type="number"
                      placeholder="MRP (₹)"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add SKU
                    </button>
                  </form>

                  {/* Table */}
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-secondary/60 text-muted-foreground border-b border-border">
                        <tr>
                          <th className="py-2.5 px-3">SKU Code</th>
                          <th className="py-2.5 px-3">Item Name</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3 text-right">MRP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {masterCatalog.map((prod) => (
                          <tr key={prod.id} className="hover:bg-secondary/20">
                            <td className="py-2 px-3 font-mono text-[11px] text-muted-foreground">{prod.sku}</td>
                            <td className="py-2 px-3 font-bold text-foreground">{prod.name}</td>
                            <td className="py-2 px-3 text-muted-foreground">{prod.category}</td>
                            <td className="py-2 px-3 text-right font-bold text-amber-600">₹{prod.mrp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: Razorpay Subscription Quota Simulator (5 cols) */}
                <div className="lg:col-span-5 p-5 rounded-2xl border border-border bg-secondary/30 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-500" /> Plan & Multi-Branch Quota
                    </h3>
                    <p className="text-xs text-muted-foreground">Adjust branch quota to see automated tier calculation.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span>Physical Branches Allowed:</span>
                        <span className="text-amber-600 font-black">{branchQuotaSlider} Branches</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={branchQuotaSlider}
                        onChange={(e) => setBranchQuotaSlider(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>1 Branch (Solo)</span>
                        <span>5 Branches (Growth)</span>
                        <span>10 Branches (Enterprise)</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-secondary/70 border border-border space-y-1 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Current Tier:</span>
                        <span className="font-bold text-foreground">
                          {branchQuotaSlider <= 2 ? "Starter Tier" : branchQuotaSlider <= 5 ? "Professional Tier" : "Enterprise Retail"}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Max Employees:</span>
                        <span className="font-bold text-foreground">{branchQuotaSlider * 4} Staff Logins</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Monthly Subscription:</span>
                        <span className="font-extrabold text-amber-600 text-sm">
                          ₹{branchQuotaSlider <= 2 ? "999" : branchQuotaSlider <= 5 ? "2,499" : "4,999"} / mo
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => navigate("/auth/onboarding")}
                      className="w-full bg-[#B8860B] hover:bg-[#996e08] text-white text-xs font-bold h-9 cursor-pointer"
                    >
                      Subscribe & Activate via Razorpay
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 2: BRANCH MANAGER INTERACTIVE CONSOLE                  */}
          {/* ============================================================ */}
          {activeRole === "branch_manager" && (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 mb-1">
                    <Building2 className="w-3.5 h-3.5" /> ROLE_BRANCH_MANAGER (Delhi Flagship Branch)
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Branch Inventory, Shifts & Returns Oversight
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Strictly scoped to your assigned branch. Restock shelf inventory and verify customer refunds.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDrawerAudited(true)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-border bg-card hover:bg-secondary transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-blue-500" />
                    {drawerAudited ? "✓ Shift Drawer Audited" : "Audit Cashier Till Float"}
                  </button>
                </div>
              </div>

              {/* Two Column Layout: Interactive Inventory + Live Refund Claims */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Inventory Restock Table (7 cols) */}
                <div className="lg:col-span-7 p-5 rounded-2xl border border-border bg-secondary/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-blue-500" /> Branch Shelf Stock Levels
                      </h3>
                      <p className="text-xs text-muted-foreground">Click restock to increase units and resolve low-stock alert.</p>
                    </div>

                    <div className="relative w-48">
                      <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search stock..."
                        value={invSearchQuery}
                        onChange={(e) => setInvSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-border bg-background text-foreground"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-secondary/60 text-muted-foreground border-b border-border">
                        <tr>
                          <th className="py-2.5 px-3">Item Name</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3 text-right">Units in Stock</th>
                          <th className="py-2.5 px-3 text-right">Quick Restock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {inventory
                          .filter((i) => i.name.toLowerCase().includes(invSearchQuery.toLowerCase()))
                          .map((item) => (
                            <tr key={item.id} className="hover:bg-secondary/20">
                              <td className="py-3 px-3">
                                <div className="font-bold text-foreground">{item.name}</div>
                                <div className="text-[10px] font-mono text-muted-foreground">{item.sku}</div>
                              </td>
                              <td className="py-3 px-3 text-center">
                                {item.stock <= item.threshold ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                    In Stock
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right font-black text-sm text-foreground">
                                {item.stock}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  onClick={() => handleRestock(item.id, 50)}
                                  className="px-2 py-1 text-[11px] font-bold rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                                >
                                  +50 Units
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: Refund & Shift Approvals (5 cols) */}
                <div className="lg:col-span-5 p-5 rounded-2xl border border-border bg-secondary/30 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-blue-500" /> Pending Customer Return Claims
                    </h3>
                    <p className="text-xs text-muted-foreground">Approve refunds initiated by cashiers at billing counters.</p>
                  </div>

                  <div className="space-y-3">
                    {refunds.map((ref) => (
                      <div key={ref.id} className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                            {ref.id} • {ref.orderId}
                          </span>
                          <span className="text-xs font-extrabold text-foreground">₹{ref.amount}</span>
                        </div>

                        <div className="text-xs font-bold text-foreground">{ref.item}</div>
                        <div className="text-[11px] text-muted-foreground">
                          Cashier: <strong className="text-foreground">{ref.cashier}</strong> — <em>"{ref.reason}"</em>
                        </div>

                        <div className="pt-2 border-t border-border flex items-center justify-between">
                          {ref.status === "APPROVED" ? (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Refund Approved & Restocked
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApproveRefund(ref.id)}
                              className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                              ✓ Approve Refund (₹{ref.amount})
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cashier Till Float Discrepancy Box */}
                  <div className="p-3.5 rounded-xl border border-border bg-card text-xs space-y-1.5">
                    <div className="font-bold text-foreground flex items-center justify-between">
                      <span>Shift Till Float Audit:</span>
                      <span className="text-emerald-600 font-bold">BALANCED (₹0 Discrepancy)</span>
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      Expected Cash: ₹24,800 • Physical Count: ₹24,800 • Cashier: Rahul Verma
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 3: CASHIER POS BILLING TERMINAL                       */}
          {/* ============================================================ */}
          {activeRole === "cashier" && (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Terminal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-1">
                    <CreditCard className="w-3.5 h-3.5" /> ROLE_BRANCH_CASHIER (Workstation #1)
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Sub-Second POS Billing Counter
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Click items to simulate barcode scanning. Watch real-time tax calculate and print an authentic thermal invoice.
                  </p>
                </div>

                {lastScannedItem && (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 animate-bounce">
                    <ScanLine className="w-3.5 h-3.5" /> Scanned: {lastScannedItem}!
                  </div>
                )}
              </div>

              {/* Grid: 7 cols Catalog + 5 cols Cart/Printer */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Product Tiles (7 cols) */}
                <div className="lg:col-span-7 p-5 rounded-2xl border border-border bg-secondary/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <ScanLine className="w-4 h-4 text-emerald-500" /> Touch Catalog / Fast Barcode Grid
                    </h3>
                    <button
                      onClick={() => addToCart(POS_CATALOG[Math.floor(Math.random() * POS_CATALOG.length)])}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all cursor-pointer"
                    >
                      ⚡ Scan Random Barcode
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {POS_CATALOG.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => addToCart(item)}
                        className="p-3.5 rounded-xl border border-border bg-card hover:border-emerald-500 hover:shadow-sm text-left transition-all group cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1">
                            <span>{item.category}</span>
                            <span className="text-emerald-600 font-bold">{item.gst}% GST</span>
                          </div>
                          <div className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                            {item.name}
                          </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-border flex justify-between items-center">
                          <span className="text-xs font-black text-foreground">₹{item.price}</span>
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <Plus className="w-3 h-3" /> Add
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cart & Thermal Receipt Output (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-emerald-500" /> Current Bill
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                          {cart.reduce((s, i) => s + i.qty, 0)} Items
                        </span>
                      </h3>
                      {cart.length > 0 && (
                        <button
                          onClick={() => {
                            setCart([]);
                            setReceiptPrinted(false);
                          }}
                          className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Clear
                        </button>
                      )}
                    </div>

                    {/* Cart Items */}
                    <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                      {cart.length === 0 ? (
                        <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                          Cart empty. Click an item on the left to scan.
                        </div>
                      ) : (
                        cart.map((item) => (
                          <div key={item.id} className="p-2 rounded-lg bg-secondary/50 border border-border flex justify-between items-center text-xs">
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="font-bold text-foreground truncate">{item.name}</div>
                              <div className="text-[10px] text-muted-foreground">₹{item.price} × {item.qty}</div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => updateCartQty(item.id, -1)}
                                className="w-5 h-5 rounded flex items-center justify-center bg-card hover:bg-border text-foreground cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-bold w-4 text-center">{item.qty}</span>
                              <button
                                onClick={() => updateCartQty(item.id, 1)}
                                className="w-5 h-5 rounded flex items-center justify-center bg-card hover:bg-border text-foreground cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <span className="font-bold w-12 text-right">₹{item.price * item.qty}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Math Breakdown */}
                    <div className="pt-2 border-t border-border space-y-1.5 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal:</span>
                        <span>₹{rawSubtotal}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Discount:</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setDiscountPercent((p) => (p === 10 ? 0 : 10))}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              discountPercent > 0 ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {discountPercent > 0 ? "10% OFF APPLIED" : "Apply 10%"}
                          </button>
                          <span>-₹{discountAmount}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>GST (Auto CGST+SGST):</span>
                        <span>₹{Math.round(taxAmount)}</span>
                      </div>
                      <div className="flex justify-between font-black text-foreground text-sm pt-1 border-t border-border">
                        <span>Grand Total:</span>
                        <span className="text-emerald-600 text-base">₹{grandTotal}</span>
                      </div>
                    </div>

                    {/* Payment Mode Selector */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setPaymentMode("upi")}
                        className={`p-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          paymentMode === "upi" ? "bg-emerald-600 text-white border-emerald-700" : "bg-secondary text-foreground"
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5 mx-auto mb-1" /> UPI QR
                      </button>
                      <button
                        onClick={() => setPaymentMode("cash")}
                        className={`p-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          paymentMode === "cash" ? "bg-emerald-600 text-white border-emerald-700" : "bg-secondary text-foreground"
                        }`}
                      >
                        <Coins className="w-3.5 h-3.5 mx-auto mb-1" /> Cash
                      </button>
                      <button
                        onClick={() => setPaymentMode("card")}
                        className={`p-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          paymentMode === "card" ? "bg-emerald-600 text-white border-emerald-700" : "bg-secondary text-foreground"
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5 mx-auto mb-1" /> Card
                      </button>
                    </div>

                    {paymentMode === "cash" && (
                      <div className="p-2.5 rounded-lg bg-secondary border border-border text-xs flex justify-between items-center">
                        <span className="text-muted-foreground">Tendered:</span>
                        <input
                          type="number"
                          value={cashGiven}
                          onChange={(e) => setCashGiven(Number(e.target.value))}
                          className="w-20 px-2 py-0.5 rounded border border-border bg-background text-right font-bold"
                        />
                        <span className="text-emerald-600 font-bold">Return: ₹{changeDue}</span>
                      </div>
                    )}

                    <Button
                      disabled={cart.length === 0}
                      onClick={() => setReceiptPrinted(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 shadow-xs cursor-pointer"
                    >
                      <Printer className="w-4 h-4 mr-1.5" /> Complete Sale & Print Receipt
                    </Button>
                  </div>

                  {/* Thermal Receipt Print Animation */}
                  {receiptPrinted && (
                    <div className="p-5 rounded-2xl border-2 border-emerald-500/40 bg-white text-slate-900 shadow-xl font-mono text-[11px] leading-snug animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="text-center border-b border-dashed border-slate-400 pb-2 mb-2">
                        <div className="font-bold text-xs uppercase tracking-wider">APEX RETAIL STORE</div>
                        <div className="text-[10px] text-slate-600">Connaught Place Outlet • GSTIN: 07AAAAA0000A1Z5</div>
                        <div className="text-[9px] text-slate-500 mt-1">Invoice: INV-2026-0982 • Cashier: Rahul</div>
                      </div>

                      <div className="space-y-1 border-b border-dashed border-slate-400 pb-2 mb-2">
                        {cart.map((c) => (
                          <div key={c.id} className="flex justify-between">
                            <span>{c.name} ×{c.qty}</span>
                            <span>₹{c.price * c.qty}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-0.5 border-b border-dashed border-slate-400 pb-2 mb-2">
                        <div className="flex justify-between"><span>Subtotal:</span><span>₹{discountedSubtotal}</span></div>
                        <div className="flex justify-between"><span>GST:</span><span>₹{Math.round(taxAmount)}</span></div>
                        <div className="flex justify-between font-black text-xs pt-1">
                          <span>TOTAL PAID:</span><span>₹{grandTotal}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-600">
                          <span>Mode: {paymentMode.toUpperCase()}</span><span>STATUS: PAID ✓</span>
                        </div>
                      </div>

                      <div className="text-center text-[9px] text-slate-500">
                        *** Thank you for shopping! ***
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 4: SUPER ADMIN INTERACTIVE CONSOLE                     */}
          {/* ============================================================ */}
          {activeRole === "super_admin" && (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> ROLE_ADMIN (Platform SaaS Controller)
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    SaaS Platform Control, Store Verification & Tier Limits
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Global oversight of all retail merchants, subscription pricing packages, and system audit trails.
                  </p>
                </div>
              </div>

              {/* Two Column Layout: Store Approvals + Pricing Tier Adjuster */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Pending Store Approvals (7 cols) */}
                <div className="lg:col-span-7 p-5 rounded-2xl border border-border bg-secondary/30 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-purple-500" /> Merchant Verification Queue
                    </h3>
                    <p className="text-xs text-muted-foreground">Verify business credentials and approve new store registrations.</p>
                  </div>

                  <div className="space-y-3">
                    {storeRequests.map((req) => (
                      <div key={req.id} className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-foreground">{req.storeName}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                              {req.city}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Owner: <strong className="text-foreground">{req.owner}</strong> • GSTIN: {req.gstin}
                          </div>
                        </div>

                        <div>
                          {req.status === "APPROVED" ? (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Store Activated ✓
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApproveStore(req.id)}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer"
                            >
                              ✓ Approve Store
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Tier Tuner (5 cols) */}
                <div className="lg:col-span-5 p-5 rounded-2xl border border-border bg-secondary/30 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-purple-500" /> Subscription Pricing Tuner
                    </h3>
                    <p className="text-xs text-muted-foreground">Dynamically modify platform tier rates without code redeploy.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-card space-y-3 text-xs">
                    <div className="flex justify-between font-bold">
                      <span>Starter Tier Monthly Price:</span>
                      <span className="text-purple-600 font-black text-sm">₹{starterPlanPrice} / mo</span>
                    </div>
                    <input
                      type="range"
                      min={499}
                      max={2499}
                      step={100}
                      value={starterPlanPrice}
                      onChange={(e) => setStarterPlanPrice(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                    <div className="p-2.5 rounded-lg bg-secondary text-[11px] text-muted-foreground">
                      Setting this price automatically propagates to all public landing pricing tables and Razorpay payment orders.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 4. FOOTER CALL TO ACTION */}
      <footer className="py-12 border-t border-border bg-secondary/30 text-center px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <h3 className="text-xl font-bold text-foreground">
            Ready to deploy NexPOS for your retail business?
          </h3>
          <p className="text-xs text-muted-foreground">
            Create your account in 2 minutes, configure your branches, and begin billing immediately.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={() => navigate("/auth/onboarding")}
              className="bg-[#B8860B] hover:bg-[#996e08] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Start Free Trial <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/auth/login")}
              className="text-xs font-bold cursor-pointer"
            >
              Sign In to Workstation
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
