import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard,
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
  Tag,
  BarChart2,
  FileText,
  Settings,
  Bell,
  CheckCircle,
  Package,
  RotateCcw,
} from "lucide-react";
import NexPOSLogo from "@/components/common/NexPOSLogo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

// =========================================================================
// REAL PLATFORM DATA PRELOADS
// =========================================================================
const REAL_BRANCHES = [
  { id: "all", name: "All Outlets (Consolidated)", city: "National Network", revenue: "₹1,84,650", orders: 342, topProduct: "Cold Brew Coffee", activeCashiers: 8 },
  { id: "delhi", name: "Delhi Connaught Place Flagship", city: "Delhi NCR", revenue: "₹92,400", orders: 178, topProduct: "Artisan Sourdough", activeCashiers: 4 },
  { id: "mumbai", name: "Mumbai Bandra Central", city: "Mumbai", revenue: "₹64,250", orders: 114, topProduct: "Organic Dark Chocolate", activeCashiers: 2 },
  { id: "bengaluru", name: "Bengaluru Indiranagar Hub", city: "Bengaluru", revenue: "₹28,000", orders: 50, topProduct: "Roasted Almonds", activeCashiers: 2 },
];

const REAL_PRODUCTS = [
  { id: 1, name: "Cold Brew Coffee (350ml)", sku: "SKU-BEV-001", category: "Beverages", price: 180, cost: 90, stock: 45, gst: 18 },
  { id: 2, name: "Artisan Sourdough Loaf", sku: "SKU-BAK-042", category: "Bakery", price: 140, cost: 65, stock: 18, gst: 5 },
  { id: 3, name: "Organic Dark Chocolate 70%", sku: "SKU-SNK-109", category: "Snacks", price: 220, cost: 110, stock: 32, gst: 18 },
  { id: 4, name: "Farm Fresh Whole Milk 1L", sku: "SKU-DAI-005", category: "Dairy", price: 65, cost: 48, stock: 4, gst: 0 },
  { id: 5, name: "Organic Basmati Rice 1kg", sku: "SKU-GRO-012", category: "Grocery", price: 150, cost: 105, stock: 3, gst: 5 },
  { id: 6, name: "Sparkling Mint Lemonade", sku: "SKU-BEV-088", category: "Beverages", price: 95, cost: 45, stock: 24, gst: 12 },
];

export default function PlatformGuide() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Active Role in simulated workstation
  const [activeRole, setActiveRole] = useState("cashier"); // 'store_owner' | 'branch_manager' | 'cashier' | 'super_admin'

  // -------------------------------------------------------------
  // STORE OWNER SIMULATOR STATE
  // -------------------------------------------------------------
  const [selectedBranchId, setSelectedBranchId] = useState("all");
  const [storeCatalog, setStoreCatalog] = useState(REAL_PRODUCTS);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Beverages");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [quotaBranches, setQuotaBranches] = useState(3);
  const [ownerTab, setOwnerTab] = useState("analytics"); // 'analytics' | 'catalog' | 'plan'

  // -------------------------------------------------------------
  // BRANCH MANAGER SIMULATOR STATE
  // -------------------------------------------------------------
  const [managerStock, setManagerStock] = useState(REAL_PRODUCTS);
  const [stockSearch, setStockSearch] = useState("");
  const [stockFilterCategory, setStockFilterCategory] = useState("ALL");
  const [refundItems, setRefundItems] = useState([
    { id: "REF-801", billNo: "INV-9812", item: "Cold Brew Coffee", amount: 180, customer: "Vikram Mehta", reason: "Damaged bottle seal", status: "PENDING" },
    { id: "REF-802", billNo: "INV-9824", item: "Farm Fresh Whole Milk 1L", amount: 65, customer: "Ananya Roy", reason: "Expired carton", status: "PENDING" },
  ]);
  const [tillAudited, setTillAudited] = useState(false);

  // -------------------------------------------------------------
  // CASHIER POS TERMINAL STATE
  // -------------------------------------------------------------
  const [posCategory, setPosCategory] = useState("ALL");
  const [posSearchTerm, setPosSearchTerm] = useState("");
  const [cart, setCart] = useState([
    { ...REAL_PRODUCTS[0], qty: 1 },
    { ...REAL_PRODUCTS[1], qty: 2 },
  ]);
  const [customerAttached, setCustomerAttached] = useState({ name: "Priya Sharma", phone: "+91 98765 43210" });
  const [paymentMode, setPaymentMode] = useState("upi"); // 'upi' | 'cash' | 'card'
  const [cashTendered, setCashTendered] = useState(500);
  const [discountPct, setDiscountPct] = useState(0);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [parkedBillsCount, setParkedBillsCount] = useState(2);
  const [lastScannedFeedback, setLastScannedFeedback] = useState(null);

  // -------------------------------------------------------------
  // SUPER ADMIN STATE
  // -------------------------------------------------------------
  const [pendingStores, setPendingStores] = useState([
    { id: "STR-001", name: "Sharma Retail Hypermarket", owner: "Ramesh Sharma", city: "Delhi", gstin: "07AAAAA1234A1Z5", date: "Today", status: "PENDING" },
    { id: "STR-002", name: "South Organic Fresh Co.", owner: "Lakshmi Narayanan", city: "Chennai", gstin: "33BBBBB5678B1Z9", date: "Yesterday", status: "PENDING" },
  ]);
  const [starterPrice, setStarterPrice] = useState(999);

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) return;
    const newP = {
      id: Date.now(),
      name: newProdName.trim(),
      sku: `SKU-${newProdCategory.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      category: newProdCategory,
      price: Number(newProdPrice),
      cost: Math.round(Number(newProdPrice) * 0.6),
      stock: 50,
      gst: 18,
    };
    setStoreCatalog([newP, ...storeCatalog]);
    setManagerStock([newP, ...managerStock]);
    setNewProdName("");
    setNewProdPrice("");
  };

  const handleRestock = (id, amount = 50) => {
    setManagerStock((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: p.stock + amount } : p))
    );
  };

  const handleApproveRefund = (refId) => {
    setRefundItems((prev) =>
      prev.map((r) => (r.id === refId ? { ...r, status: "APPROVED" } : r))
    );
  };

  const handleAddToCart = (product) => {
    setReceiptOpen(false);
    setLastScannedFeedback(product.name);
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setTimeout(() => setLastScannedFeedback(null), 1500);
  };

  const updateCartQty = (id, delta) => {
    setReceiptOpen(false);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const next = item.qty + delta;
            return next > 0 ? { ...item, qty: next } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleParkOrder = () => {
    if (cart.length === 0) return;
    setParkedBillsCount((c) => c + 1);
    setCart([]);
    setReceiptOpen(false);
  };

  const handleApproveStore = (id) => {
    setPendingStores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "APPROVED" } : s))
    );
  };

  // Cart Calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmt = Math.round((rawSubtotal * discountPct) / 100);
  const discountedSubtotal = rawSubtotal - discountAmt;
  const taxAmount = cart.reduce((sum, item) => sum + ((item.price * item.qty * item.gst) / 100), 0);
  const grandTotal = Math.round(discountedSubtotal + taxAmount);
  const changeToReturn = Math.max(0, cashTendered - grandTotal);

  const selectedBranchData = REAL_BRANCHES.find((b) => b.id === selectedBranchId) || REAL_BRANCHES[0];

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#121110] text-foreground antialiased selection:bg-[#B8860B]/20 selection:text-[#B8860B]">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/80 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </button>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <NexPOSLogo onClick={() => navigate("/")} size="sm" />
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#B8860B]/10 text-[#B8860B] border border-[#B8860B]/20">
              <Sparkles className="w-3 h-3" /> Exact Platform UI Simulator
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border bg-card hover:bg-secondary text-foreground transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-[#F5A623]" /> : <Moon className="w-4 h-4" />}
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/auth/login")}
              className="text-xs font-bold"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/auth/onboarding")}
              className="bg-[#B8860B] hover:bg-[#996e08] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Register Store <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* 2. SUB-BAR: FIDELITY GUARANTEE + ROLE SELECTOR */}
      <section className="bg-card border-b border-border py-4 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <h1 className="text-sm sm:text-base font-extrabold text-foreground">
                100% Exact Platform Mirror — What You See Is What You Get
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Every sidebar, button, layout, and table below is an exact pixel-for-pixel replica of our live production dashboards.
            </p>
          </div>

          {/* Role Switcher Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary/80 border border-border shrink-0">
            <button
              onClick={() => setActiveRole("store_owner")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeRole === "store_owner"
                  ? "bg-[#B8860B] text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Store className="w-3.5 h-3.5" /> Store Owner
            </button>

            <button
              onClick={() => setActiveRole("branch_manager")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeRole === "branch_manager"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Branch Manager
            </button>

            <button
              onClick={() => setActiveRole("cashier")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeRole === "cashier"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" /> Cashier POS
            </button>

            <button
              onClick={() => setActiveRole("super_admin")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeRole === "super_admin"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
            </button>
          </div>
        </div>
      </section>

      {/* 3. THE WORKSPACE VIEWPORT */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
        <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden flex flex-col min-h-[720px]">

          {/* ========================================================================= */}
          {/* A. STORE OWNER WORKSPACE (Exact replica of StoreDashboard & StoreSidebar) */}
          {/* ========================================================================= */}
          {activeRole === "store_owner" && (
            <div className="flex flex-1 min-h-[700px]">
              {/* REAL STORE SIDEBAR */}
              <aside className="w-56 bg-[#181614] text-[#FAF8F3] border-r border-[#2B2724] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
                <div className="space-y-6">
                  {/* Brand Header */}
                  <div className="flex items-center gap-2 px-2">
                    <NexPOSLogo size="sm" />
                  </div>

                  {/* Navigation Links (Exact from StoreSidebar.jsx) */}
                  <nav className="space-y-1">
                    {[
                      { name: "Dashboard", icon: LayoutDashboard, active: ownerTab === "analytics", onClick: () => setOwnerTab("analytics") },
                      { name: "Branches", icon: Store, active: false, badge: "3" },
                      { name: "Products", icon: ShoppingCart, active: ownerTab === "catalog", onClick: () => setOwnerTab("catalog") },
                      { name: "Categories", icon: Tag, active: false },
                      { name: "Employees", icon: Users, active: false, badge: "18" },
                      { name: "Alerts", icon: AlertTriangle, active: false },
                      { name: "Sales", icon: BarChart2, active: false },
                      { name: "Reports", icon: FileText, active: false },
                      { name: "Settings", icon: Settings, active: false },
                      { name: "Upgrade Plan", icon: Zap, active: ownerTab === "plan", onClick: () => setOwnerTab("plan"), highlight: true },
                    ].map((link) => {
                      const Icon = link.icon;
                      return (
                        <button
                          key={link.name}
                          onClick={link.onClick || (() => {})}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            link.active
                              ? "bg-[#B8860B] text-white font-bold shadow-xs"
                              : link.highlight
                              ? "bg-[#B8860B]/10 text-[#F5A623] hover:bg-[#B8860B]/20"
                              : "text-[#FAF8F3]/70 hover:bg-[#2B2724] hover:text-[#FAF8F3]"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 shrink-0" /> {link.name}
                          </span>
                          {link.badge && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-muted-foreground font-mono">
                              {link.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Profile Card Bottom */}
                <div className="p-3 rounded-xl bg-[#221F1C] border border-[#332E2A] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#B8860B] text-white flex items-center justify-center font-bold text-xs">
                    AR
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#FAF8F3] truncate">Apex Retail Admin</div>
                    <div className="text-[10px] text-[#B8860B] font-mono">ROLE_STORE_ADMIN</div>
                  </div>
                </div>
              </aside>

              {/* MAIN CONTENT AREA */}
              <div className="flex-1 flex flex-col min-w-0 bg-background">
                {/* REAL STORE TOPBAR */}
                <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-card shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-foreground flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Apex Retail Store Console
                    </div>
                    <div className="h-4 w-px bg-border" />
                    {/* Branch Switcher Dropdown */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-muted-foreground">Filter Branch:</span>
                      <select
                        value={selectedBranchId}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-border bg-secondary text-foreground cursor-pointer focus:outline-hidden"
                      >
                        {REAL_BRANCHES.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#B8860B]/10 text-[#B8860B] border border-[#B8860B]/20 font-bold">
                      Enterprise Tier • Razorpay Active
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </header>

                {/* TAB 1: ANALYTICS & STATS (Exact from Dashboard.jsx) */}
                {ownerTab === "analytics" && (
                  <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Subscription Quota Bar */}
                    <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-foreground flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-[#B8860B]" />
                          Subscription Quota: Professional Plan Active
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Branches: 3 of 5 used • Products: {storeCatalog.length} of 5,000 used • Employees: 18 of 25 active
                        </div>
                      </div>
                      <button
                        onClick={() => setOwnerTab("plan")}
                        className="px-3 py-1.5 rounded-lg bg-[#B8860B] hover:bg-[#996e08] text-white text-xs font-bold transition-all cursor-pointer shrink-0"
                      >
                        Upgrade via Razorpay
                      </button>
                    </div>

                    {/* 4 Exact Dashboard Metric Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl border border-border bg-card">
                        <div className="text-xs text-muted-foreground mb-1">Today's Revenue</div>
                        <div className="text-2xl font-black text-foreground">{selectedBranchData.revenue}</div>
                        <div className="text-[11px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> +22.4% vs last week
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-border bg-card">
                        <div className="text-xs text-muted-foreground mb-1">Total Orders</div>
                        <div className="text-2xl font-black text-foreground">{selectedBranchData.orders}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Real-time terminal sync</div>
                      </div>

                      <div className="p-4 rounded-xl border border-border bg-card">
                        <div className="text-xs text-muted-foreground mb-1">Top Selling SKU</div>
                        <div className="text-sm font-bold text-foreground truncate mt-1">{selectedBranchData.topProduct}</div>
                        <div className="text-[11px] text-[#B8860B] font-bold mt-1">High Margin Leader</div>
                      </div>

                      <div className="p-4 rounded-xl border border-border bg-card">
                        <div className="text-xs text-muted-foreground mb-1">Cashier Staff Active</div>
                        <div className="text-2xl font-black text-foreground">{selectedBranchData.activeCashiers} Cashiers</div>
                        <div className="text-[11px] text-emerald-500 font-bold mt-1">● All registers online</div>
                      </div>
                    </div>

                    {/* Branches Comparison Table */}
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                      <div className="p-4 border-b border-border flex items-center justify-between">
                        <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#B8860B]" /> Multi-Branch Live Performance Breakdown
                        </h3>
                        <button
                          onClick={() => setOwnerTab("catalog")}
                          className="text-xs font-bold text-[#B8860B] hover:underline"
                        >
                          View Master Catalog →
                        </button>
                      </div>
                      <table className="w-full text-left text-xs">
                        <thead className="bg-secondary/60 text-muted-foreground border-b border-border">
                          <tr>
                            <th className="py-2.5 px-4">Branch Outlet</th>
                            <th className="py-2.5 px-3">City</th>
                            <th className="py-2.5 px-3 text-right">Today's Revenue</th>
                            <th className="py-2.5 px-3 text-right">Orders</th>
                            <th className="py-2.5 px-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {REAL_BRANCHES.slice(1).map((b) => (
                            <tr key={b.id} className="hover:bg-secondary/20">
                              <td className="py-3 px-4 font-bold text-foreground">{b.name}</td>
                              <td className="py-3 px-3 text-muted-foreground">{b.city}</td>
                              <td className="py-3 px-3 text-right font-black text-[#B8860B]">{b.revenue}</td>
                              <td className="py-3 px-3 text-right text-foreground font-semibold">{b.orders}</td>
                              <td className="py-3 px-4 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  ONLINE
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 2: MASTER PRODUCT CATALOG (Exact from Products.jsx) */}
                {ownerTab === "catalog" && (
                  <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Global Master Product Catalog</h3>
                        <p className="text-xs text-muted-foreground">Add products here — all branch counters immediately receive the barcode.</p>
                      </div>
                      <button
                        onClick={() => setOwnerTab("analytics")}
                        className="text-xs font-bold text-muted-foreground hover:text-foreground"
                      >
                        ← Back to Analytics
                      </button>
                    </div>

                    {/* Add Product Form */}
                    <form onSubmit={handleAddProduct} className="p-4 rounded-xl border border-border bg-card grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Product Name (e.g. Green Tea 250g)"
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        className="px-3 py-2 text-xs rounded-lg border border-border bg-background sm:col-span-2 text-foreground"
                      />
                      <input
                        type="number"
                        placeholder="Selling Price (₹)"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        className="px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-bold rounded-lg bg-[#B8860B] text-white hover:bg-[#996e08] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Master SKU
                      </button>
                    </form>

                    {/* Catalog Table */}
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-secondary/60 text-muted-foreground border-b border-border">
                          <tr>
                            <th className="py-2.5 px-4">SKU Code</th>
                            <th className="py-2.5 px-4">Item Name</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3 text-right">Cost</th>
                            <th className="py-2.5 px-3 text-right">Selling Price</th>
                            <th className="py-2.5 px-4 text-center">GST %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {storeCatalog.map((prod) => (
                            <tr key={prod.id} className="hover:bg-secondary/20">
                              <td className="py-2.5 px-4 font-mono text-[11px] text-muted-foreground">{prod.sku}</td>
                              <td className="py-2.5 px-4 font-bold text-foreground">{prod.name}</td>
                              <td className="py-2.5 px-3 text-muted-foreground">{prod.category}</td>
                              <td className="py-2.5 px-3 text-right text-muted-foreground">₹{prod.cost}</td>
                              <td className="py-2.5 px-3 text-right font-black text-[#B8860B]">₹{prod.price}</td>
                              <td className="py-2.5 px-4 text-center font-bold text-xs">{prod.gst}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: SUBSCRIPTION UPGRADE SLIDER (Razorpay Quotas) */}
                {ownerTab === "plan" && (
                  <div className="p-6 space-y-6 overflow-y-auto max-w-2xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-foreground">Razorpay Subscription & Outlets Expansion</h3>
                      <button onClick={() => setOwnerTab("analytics")} className="text-xs font-bold text-muted-foreground hover:text-foreground">
                        ← Back to Analytics
                      </button>
                    </div>

                    <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span>Allowed Physical Branch Outlets:</span>
                          <span className="text-[#B8860B] font-black text-sm">{quotaBranches} Branches</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={quotaBranches}
                          onChange={(e) => setQuotaBranches(Number(e.target.value))}
                          className="w-full accent-[#B8860B] cursor-pointer"
                        />
                      </div>

                      <div className="p-4 rounded-xl bg-secondary border border-border space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Plan Level:</span>
                          <span className="font-bold text-foreground">{quotaBranches <= 2 ? "Starter Tier" : quotaBranches <= 5 ? "Professional Tier" : "Enterprise Retail Chain"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Products:</span>
                          <span className="font-bold text-foreground">{quotaBranches * 2000} SKUs</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Staff Logins:</span>
                          <span className="font-bold text-foreground">{quotaBranches * 5} Users</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-2 text-sm font-black">
                          <span>Monthly Rate:</span>
                          <span className="text-[#B8860B]">₹{quotaBranches <= 2 ? "999" : quotaBranches <= 5 ? "2,499" : "4,999"} / month</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => navigate("/auth/onboarding")}
                        className="w-full bg-[#B8860B] hover:bg-[#996e08] text-white text-xs font-bold h-10"
                      >
                        Subscribe Plan with Razorpay (Cards / UPI / Netbanking)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* B. CASHIER WORKSTATION (Exact replica of CreateOrderPage & POSHeader)    */}
          {/* ========================================================================= */}
          {activeRole === "cashier" && (
            <div className="flex flex-1 min-h-[700px]">
              {/* REAL CASHIER SIDEBAR (CashierSideBar.jsx) */}
              <aside className="w-48 bg-[#181614] text-[#FAF8F3] border-r border-[#2B2724] p-3 flex flex-col justify-between shrink-0 hidden md:flex">
                <div className="space-y-5">
                  <div className="px-2">
                    <NexPOSLogo size="sm" />
                  </div>
                  <nav className="space-y-1">
                    {[
                      { name: "POS Terminal", icon: ShoppingCart, active: true },
                      { name: "Order History", icon: Clock, active: false },
                      { name: "Returns/Refunds", icon: RotateCcw, active: false },
                      { name: "Customers", icon: Users, active: false },
                      { name: "Shift Summary", icon: Receipt, active: false },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.name}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold select-none cursor-pointer ${
                            item.active
                              ? "bg-emerald-600 text-white font-bold shadow-xs"
                              : "text-[#FAF8F3]/70 hover:bg-[#2B2724]"
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" /> {item.name}
                        </div>
                      );
                    })}
                  </nav>
                </div>

                <div className="p-2.5 rounded-xl bg-[#221F1C] border border-[#332E2A] text-xs">
                  <div className="font-bold text-[#FAF8F3]">Rahul V. (Cashier)</div>
                  <div className="text-[10px] text-emerald-400 font-mono">Shift #42 • ACTIVE</div>
                </div>
              </aside>

              {/* CASHIER MAIN: POSHeader + 2-Pane POS Billing Layout */}
              <div className="flex-1 flex flex-col min-w-0 bg-background">
                {/* REAL POS HEADER (POSHeader.jsx) */}
                <header className="bg-card border-b border-border/70 px-4 py-2 flex items-center justify-between shrink-0 h-12">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-emerald-500" /> Delhi Connaught Place — Station #1
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                      Counter Online ●
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleParkOrder}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 cursor-pointer flex items-center gap-1"
                    >
                      <Clock className="w-3 h-3" /> Park Current Bill ({parkedBillsCount})
                    </button>
                    {lastScannedFeedback && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 animate-pulse">
                        ⚡ Scanned: {lastScannedFeedback}
                      </span>
                    )}
                  </div>
                </header>

                {/* 2-PANE POS BODY (ProductSection + CartSection) */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                  {/* LEFT PANE: PRODUCT CATALOG GRID (7 cols) */}
                  <div className="lg:col-span-7 p-4 border-r border-border flex flex-col space-y-3 bg-secondary/20 overflow-y-auto">
                    {/* Search / Barcode Listener Bar */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <ScanLine className="w-4 h-4 text-emerald-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Scan barcode with scanner or search product..."
                          value={posSearchTerm}
                          onChange={(e) => setPosSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-hidden"
                        />
                      </div>
                      <button
                        onClick={() => handleAddToCart(REAL_PRODUCTS[Math.floor(Math.random() * REAL_PRODUCTS.length)])}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
                      >
                        ⚡ Simulate Scan
                      </button>
                    </div>

                    {/* Category Filter Pills (Exact from ProductSection.jsx) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {["ALL", "Beverages", "Bakery", "Snacks", "Dairy", "Grocery"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setPosCategory(cat)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            posCategory === cat
                              ? "bg-emerald-600 text-white shadow-2xs"
                              : "bg-card border border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Product Cards Grid (ProductCard.jsx replica) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {REAL_PRODUCTS
                        .filter((p) => (posCategory === "ALL" ? true : p.category === posCategory))
                        .filter((p) => p.name.toLowerCase().includes(posSearchTerm.toLowerCase()))
                        .map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => handleAddToCart(prod)}
                            className="p-3 rounded-xl border border-border bg-card hover:border-emerald-500 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group select-none"
                          >
                            <div>
                              <div className="flex justify-between text-[10px] text-muted-foreground font-mono mb-1">
                                <span>{prod.sku}</span>
                                <span className="text-emerald-600 font-bold">{prod.gst}% GST</span>
                              </div>
                              <div className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                {prod.name}
                              </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-border flex justify-between items-center">
                              <span className="text-xs font-black text-foreground">₹{prod.price}</span>
                              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                                <Plus className="w-3 h-3" /> Add
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* RIGHT PANE: CART & PAYMENT PANEL (5 cols) (CartSection.jsx replica) */}
                  <div className="lg:col-span-5 p-4 flex flex-col justify-between bg-card space-y-3 overflow-y-auto">
                    <div>
                      {/* Customer Attach Bar */}
                      <div className="p-2.5 rounded-xl bg-secondary border border-border flex items-center justify-between text-xs mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-muted-foreground" />
                          <div>
                            <span className="font-bold text-foreground">{customerAttached.name}</span>
                            <span className="text-[10px] text-muted-foreground ml-1.5">{customerAttached.phone}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold">LOYALTY ATTACHED</span>
                      </div>

                      {/* Cart Table Header */}
                      <div className="flex justify-between items-center text-xs font-bold text-foreground mb-2">
                        <span>Cart Items ({cart.reduce((s, i) => s + i.qty, 0)})</span>
                        {cart.length > 0 && (
                          <button onClick={() => setCart([])} className="text-[11px] text-muted-foreground hover:text-red-500 flex items-center gap-1 cursor-pointer">
                            <Trash2 className="w-3 h-3" /> Clear Cart
                          </button>
                        )}
                      </div>

                      {/* Item Rows */}
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {cart.length === 0 ? (
                          <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                            Cart empty. Scan items on the left.
                          </div>
                        ) : (
                          cart.map((item) => (
                            <div key={item.id} className="p-2 rounded-lg bg-secondary/40 border border-border flex items-center justify-between text-xs">
                              <div className="min-w-0 flex-1 pr-2">
                                <div className="font-bold text-foreground truncate">{item.name}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">₹{item.price} × {item.qty}</div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button onClick={() => updateCartQty(item.id, -1)} className="w-5 h-5 rounded flex items-center justify-center bg-card border border-border cursor-pointer">
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-bold w-4 text-center">{item.qty}</span>
                                <button onClick={() => updateCartQty(item.id, 1)} className="w-5 h-5 rounded flex items-center justify-center bg-card border border-border cursor-pointer">
                                  <Plus className="w-3 h-3" />
                                </button>
                                <span className="font-bold w-12 text-right">₹{item.price * item.qty}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Bottom Billing Section */}
                    <div className="space-y-2 border-t border-border pt-2">
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal:</span>
                          <span>₹{rawSubtotal}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground items-center">
                          <span>Discount:</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setDiscountPct((d) => (d === 10 ? 0 : 10))}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                discountPct > 0 ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground"
                              }`}
                            >
                              {discountPct > 0 ? "10% APPLIED" : "Apply 10%"}
                            </button>
                            <span>-₹{discountAmt}</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>GST (CGST + SGST):</span>
                          <span>₹{Math.round(taxAmount)}</span>
                        </div>
                        <div className="flex justify-between font-black text-foreground text-sm pt-1 border-t border-border">
                          <span>Total Amount:</span>
                          <span className="text-emerald-600 text-base">₹{grandTotal}</span>
                        </div>
                      </div>

                      {/* Payment Mode Selector */}
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => setPaymentMode("upi")}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            paymentMode === "upi" ? "bg-emerald-600 text-white border-emerald-700" : "bg-secondary text-foreground"
                          }`}
                        >
                          <QrCode className="w-3.5 h-3.5" /> UPI QR
                        </button>
                        <button
                          onClick={() => setPaymentMode("cash")}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            paymentMode === "cash" ? "bg-emerald-600 text-white border-emerald-700" : "bg-secondary text-foreground"
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5" /> Cash
                        </button>
                        <button
                          onClick={() => setPaymentMode("card")}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            paymentMode === "card" ? "bg-emerald-600 text-white border-emerald-700" : "bg-secondary text-foreground"
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Card
                        </button>
                      </div>

                      {paymentMode === "cash" && (
                        <div className="p-2 rounded-lg bg-secondary text-xs flex justify-between items-center">
                          <span className="text-muted-foreground">Cash Given:</span>
                          <input
                            type="number"
                            value={cashTendered}
                            onChange={(e) => setCashTendered(Number(e.target.value))}
                            className="w-16 px-1.5 py-0.5 rounded border border-border bg-background text-right font-bold"
                          />
                          <span className="text-emerald-600 font-bold">Change: ₹{changeToReturn}</span>
                        </div>
                      )}

                      <Button
                        disabled={cart.length === 0}
                        onClick={() => setReceiptOpen(true)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 shadow-sm cursor-pointer"
                      >
                        <Printer className="w-4 h-4 mr-1.5" /> Charge ₹{grandTotal} & Print Receipt
                      </Button>
                    </div>

                    {/* Exact Thermal Receipt Dialog */}
                    {receiptOpen && (
                      <div className="p-4 rounded-xl border-2 border-emerald-500/40 bg-white text-slate-900 shadow-xl font-mono text-[11px] leading-snug animate-in fade-in">
                        <div className="text-center border-b border-dashed border-slate-400 pb-2 mb-2">
                          <div className="font-bold text-xs">DELHI CONNAUGHT PLACE FLAGSHIP</div>
                          <div className="text-[10px] text-slate-600">GSTIN: 07AAAAA0000A1Z5 • Cashier: Rahul</div>
                          <div className="text-[9px] text-slate-500">Invoice: INV-2026-9812 • Date: {new Date().toLocaleDateString()}</div>
                        </div>
                        <div className="space-y-0.5 border-b border-dashed border-slate-400 pb-2 mb-2">
                          {cart.map((c) => (
                            <div key={c.id} className="flex justify-between">
                              <span>{c.name} ×{c.qty}</span>
                              <span>₹{c.price * c.qty}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between font-black text-xs">
                          <span>TOTAL PAID:</span>
                          <span>₹{grandTotal} ({paymentMode.toUpperCase()})</span>
                        </div>
                        <div className="text-center text-[9px] text-slate-500 mt-2">
                          *** Tax Invoice Generated ***
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* C. BRANCH MANAGER (Exact replica of Branch Manager layout & Inventory)    */}
          {/* ========================================================================= */}
          {activeRole === "branch_manager" && (
            <div className="flex flex-1 min-h-[700px]">
              {/* REAL BRANCH MANAGER SIDEBAR */}
              <aside className="w-52 bg-[#181614] text-[#FAF8F3] border-r border-[#2B2724] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
                <div className="space-y-6">
                  <div className="px-2">
                    <NexPOSLogo size="sm" />
                  </div>
                  <nav className="space-y-1">
                    {[
                      { name: "Dashboard", icon: LayoutDashboard, active: false },
                      { name: "Inventory", icon: Boxes, active: true },
                      { name: "Orders", icon: Clock, active: false },
                      { name: "Refunds", icon: RotateCcw, active: false, badge: "2" },
                      { name: "Staff", icon: Users, active: false },
                      { name: "Reports", icon: FileText, active: false },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.name}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                            item.active ? "bg-blue-600 text-white font-bold" : "text-[#FAF8F3]/70 hover:bg-[#2B2724]"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon className="w-4 h-4" /> {item.name}
                          </span>
                          {item.badge && <span className="text-[10px] px-1 rounded bg-red-500 text-white font-mono">{item.badge}</span>}
                        </div>
                      );
                    })}
                  </nav>
                </div>

                <div className="p-3 rounded-xl bg-[#221F1C] border border-[#332E2A] text-xs">
                  <div className="font-bold text-[#FAF8F3]">Pooja S. (Manager)</div>
                  <div className="text-[10px] text-blue-400 font-mono">Delhi Outlet Supervisor</div>
                </div>
              </aside>

              {/* BRANCH MANAGER BODY */}
              <div className="flex-1 flex flex-col min-w-0 bg-background">
                <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-card shrink-0">
                  <div className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    Delhi Flagship Branch — Shelf Stock & Shift Control
                  </div>
                  <button
                    onClick={() => setTillAudited(true)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-secondary hover:bg-card text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-blue-500" />
                    {tillAudited ? "✓ Shift Float Audited" : "Audit Cashier Till Drawer"}
                  </button>
                </header>

                <div className="p-6 space-y-6 overflow-y-auto">
                  {/* Real Inventory Table */}
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Branch Shelf Inventory</h3>
                        <p className="text-xs text-muted-foreground">Click "+50 Restock" to simulate replenishment from warehouse.</p>
                      </div>
                      <div className="relative w-48">
                        <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          placeholder="Filter shelf stock..."
                          value={stockSearch}
                          onChange={(e) => setStockSearch(e.target.value)}
                          className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-border bg-background text-foreground"
                        />
                      </div>
                    </div>

                    <table className="w-full text-left text-xs">
                      <thead className="bg-secondary/60 text-muted-foreground border-b border-border">
                        <tr>
                          <th className="py-2.5 px-4">SKU / Item</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3 text-center">Shelf Status</th>
                          <th className="py-2.5 px-3 text-right">In Stock</th>
                          <th className="py-2.5 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {managerStock
                          .filter((p) => p.name.toLowerCase().includes(stockSearch.toLowerCase()))
                          .map((item) => (
                            <tr key={item.id} className="hover:bg-secondary/20">
                              <td className="py-3 px-4">
                                <div className="font-bold text-foreground">{item.name}</div>
                                <div className="text-[10px] font-mono text-muted-foreground">{item.sku}</div>
                              </td>
                              <td className="py-3 px-3 text-muted-foreground">{item.category}</td>
                              <td className="py-3 px-3 text-center">
                                {item.stock <= 5 ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                    In Stock
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right font-black text-sm">{item.stock}</td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => handleRestock(item.id, 50)}
                                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                                >
                                  +50 Restock
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Customer Returns Queue */}
                  <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-blue-500" /> Pending Cashier Return Claims
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {refundItems.map((ref) => (
                        <div key={ref.id} className="p-3 rounded-lg border border-border bg-secondary/30 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="font-mono text-[10px] text-muted-foreground">{ref.id} • {ref.billNo}</span>
                            <span className="font-bold text-foreground">₹{ref.amount}</span>
                          </div>
                          <div className="font-bold text-foreground">{ref.item}</div>
                          <div className="text-muted-foreground text-[11px]">Reason: "{ref.reason}"</div>
                          <div className="pt-2 border-t border-border">
                            {ref.status === "APPROVED" ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Approved & Restocked ✓
                              </span>
                            ) : (
                              <button
                                onClick={() => handleApproveRefund(ref.id)}
                                className="w-full py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                              >
                                Approve Refund (₹{ref.amount})
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* D. SUPER ADMIN (Exact replica of SuperAdminDashboard)                     */}
          {/* ========================================================================= */}
          {activeRole === "super_admin" && (
            <div className="flex flex-1 min-h-[700px]">
              <aside className="w-52 bg-[#181614] text-[#FAF8F3] border-r border-[#2B2724] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
                <div className="space-y-6">
                  <div className="px-2">
                    <NexPOSLogo size="sm" />
                  </div>
                  <nav className="space-y-1">
                    {[
                      { name: "Platform Overview", icon: LayoutDashboard, active: false },
                      { name: "Stores", icon: Store, active: false },
                      { name: "Store Requests", icon: FileCheck2, active: true, badge: "2" },
                      { name: "Subscriptions", icon: Zap, active: false },
                      { name: "Audit Logs", icon: ShieldCheck, active: false },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.name}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                            item.active ? "bg-purple-600 text-white font-bold" : "text-[#FAF8F3]/70 hover:bg-[#2B2724]"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon className="w-4 h-4" /> {item.name}
                          </span>
                          {item.badge && <span className="text-[10px] px-1 rounded bg-purple-500 text-white font-mono">{item.badge}</span>}
                        </div>
                      );
                    })}
                  </nav>
                </div>

                <div className="p-3 rounded-xl bg-[#221F1C] border border-[#332E2A] text-xs">
                  <div className="font-bold text-[#FAF8F3]">Master Controller</div>
                  <div className="text-[10px] text-purple-400 font-mono">ROLE_ADMIN</div>
                </div>
              </aside>

              <div className="flex-1 flex flex-col min-w-0 bg-background">
                <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-card shrink-0">
                  <div className="text-xs font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-500" />
                    NexPOS SaaS Multi-Tenant Controller
                  </div>
                  <span className="text-xs font-bold text-purple-600 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                    148 Active Merchant Stores
                  </span>
                </header>

                <div className="p-6 space-y-6 overflow-y-auto">
                  <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                    <h3 className="text-sm font-bold text-foreground">New Store Verification Queue</h3>
                    <div className="space-y-3">
                      {pendingStores.map((s) => (
                        <div key={s.id} className="p-4 rounded-xl border border-border bg-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="font-bold text-sm text-foreground">{s.name}</div>
                            <div className="text-muted-foreground mt-0.5">Owner: {s.owner} • {s.city} • GST: {s.gstin}</div>
                          </div>
                          {s.status === "APPROVED" ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Merchant Verified & Active ✓
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApproveStore(s.id)}
                              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                            >
                              Approve Store Registration
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 rounded-xl border border-border bg-card space-y-3 text-xs">
                    <div className="flex justify-between font-bold">
                      <span>Starter Tier Subscription Pricing:</span>
                      <span className="text-purple-600 font-black text-sm">₹{starterPrice} / month</span>
                    </div>
                    <input
                      type="range"
                      min={499}
                      max={2499}
                      step={100}
                      value={starterPrice}
                      onChange={(e) => setStarterPrice(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="py-8 border-t border-border bg-card text-center text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">NexPOS High-Velocity Multi-Branch Retail Architecture</p>
        <p className="mt-1">All rights reserved. Designed for sub-second retail checkout and full multi-tenant governance.</p>
      </footer>
    </div>
  );
}
