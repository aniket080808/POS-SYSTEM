import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  Store,
  Building2,
  CreditCard,
  Zap,
  Printer,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ScanLine,
  Sparkles,
  QrCode,
  BadgeCheck,
  Clock,
  Coins,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  TrendingUp,
  Boxes,
  Users,
  Sun,
  Moon,
  Receipt,
  Tag,
  BarChart2,
  FileText,
  Settings,
  Bell,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  MapPin,
  PieChart,
} from "lucide-react";
import NexPOSLogo from "@/components/common/NexPOSLogo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

// =========================================================================
// REAL PLATFORM PRELOADED DATA
// =========================================================================
const INITIAL_BRANCHES = [
  { id: "delhi", name: "Delhi Connaught Place Flagship", city: "Delhi NCR", manager: "Pooja Sharma", revenue: "₹92,400", orders: 178, activeCashiers: 4, status: "ONLINE" },
  { id: "mumbai", name: "Mumbai Bandra Central", city: "Mumbai", manager: "Vikram Malhotra", revenue: "₹64,250", orders: 114, activeCashiers: 2, status: "ONLINE" },
  { id: "bengaluru", name: "Bengaluru Indiranagar Hub", city: "Bengaluru", manager: "Kiran Rao", revenue: "₹28,000", orders: 50, activeCashiers: 2, status: "ONLINE" },
];

const INITIAL_PRODUCTS = [
  { id: 1, name: "Cold Brew Coffee (350ml)", sku: "SKU-BEV-001", category: "Beverages", price: 180, cost: 90, stock: 45, gst: 18 },
  { id: 2, name: "Artisan Sourdough Loaf", sku: "SKU-BAK-042", category: "Bakery", price: 140, cost: 65, stock: 18, gst: 5 },
  { id: 3, name: "Organic Dark Chocolate 70%", sku: "SKU-SNK-109", category: "Snacks", price: 220, cost: 110, stock: 32, gst: 18 },
  { id: 4, name: "Farm Fresh Whole Milk 1L", sku: "SKU-DAI-005", category: "Dairy", price: 65, cost: 48, stock: 4, gst: 0 },
  { id: 5, name: "Organic Basmati Rice 1kg", sku: "SKU-GRO-012", category: "Grocery", price: 150, cost: 105, stock: 3, gst: 5 },
  { id: 6, name: "Sparkling Mint Lemonade", sku: "SKU-BEV-088", category: "Beverages", price: 95, cost: 45, stock: 24, gst: 12 },
];

const INITIAL_CATEGORIES = [
  { id: 1, name: "Beverages", gst: 18, itemCount: 14, hsn: "2202" },
  { id: 2, name: "Bakery & Breads", gst: 5, itemCount: 9, hsn: "1905" },
  { id: 3, name: "Snacks & Confectionery", gst: 18, itemCount: 22, hsn: "2106" },
  { id: 4, name: "Dairy & Eggs", gst: 0, itemCount: 8, hsn: "0401" },
  { id: 5, name: "Organic Grocery", gst: 5, itemCount: 31, hsn: "1006" },
];

const INITIAL_EMPLOYEES = [
  { id: 1, name: "Aniket Sharma", email: "aniket@apexretail.com", role: "ROLE_STORE_ADMIN", branch: "All Outlets (HQ)", status: "Active" },
  { id: 2, name: "Pooja Sharma", email: "pooja.delhi@apexretail.com", role: "ROLE_BRANCH_MANAGER", branch: "Delhi Connaught Place", status: "Active" },
  { id: 3, name: "Vikram Malhotra", email: "vikram.mumbai@apexretail.com", role: "ROLE_BRANCH_MANAGER", branch: "Mumbai Bandra", status: "Active" },
  { id: 4, name: "Rahul Verma", email: "rahul.v@apexretail.com", role: "ROLE_BRANCH_CASHIER", branch: "Delhi Connaught Place (Station #1)", status: "On Duty" },
  { id: 5, name: "Neha Gupta", email: "neha.g@apexretail.com", role: "ROLE_BRANCH_CASHIER", branch: "Delhi Connaught Place (Station #2)", status: "On Duty" },
  { id: 6, name: "Karan Patel", email: "karan.p@apexretail.com", role: "ROLE_BRANCH_CASHIER", branch: "Mumbai Bandra (Station #1)", status: "On Duty" },
];

const INITIAL_SALES = [
  { id: "INV-2026-9812", branch: "Delhi Connaught Place", cashier: "Rahul V.", customer: "Priya Sharma", items: 3, total: 540, method: "UPI", time: "2 mins ago", status: "COMPLETED" },
  { id: "INV-2026-9811", branch: "Delhi Connaught Place", cashier: "Neha G.", customer: "Rohan Kapoor", items: 1, total: 220, method: "CARD", time: "8 mins ago", status: "COMPLETED" },
  { id: "INV-2026-9810", branch: "Mumbai Bandra", cashier: "Karan P.", customer: "Aarti Sen", items: 4, total: 680, method: "CASH", time: "14 mins ago", status: "COMPLETED" },
  { id: "INV-2026-9809", branch: "Bengaluru Indiranagar", cashier: "Suresh M.", customer: "Walk-in Buyer", items: 2, total: 275, method: "UPI", time: "22 mins ago", status: "COMPLETED" },
  { id: "INV-2026-9808", branch: "Delhi Connaught Place", cashier: "Rahul V.", customer: "Deepak Verma", items: 5, total: 1120, method: "CARD", time: "35 mins ago", status: "COMPLETED" },
];

const INITIAL_REFUNDS = [
  { id: "REF-401", billNo: "INV-2026-9780", customer: "Rohan K.", item: "Cold Brew Coffee (350ml)", amount: 180, reason: "Defective seal packaging", status: "PENDING" },
  { id: "REF-402", billNo: "INV-2026-9762", customer: "Amit M.", item: "Organic Basmati Rice 1kg", amount: 150, reason: "Duplicate purchase by mistake", status: "PENDING" },
];

const INITIAL_CUSTOMERS = [
  { id: 1, name: "Priya Sharma", phone: "+91 98765 43210", visits: 18, totalSpent: "₹14,800", points: 450, tier: "Gold VIP" },
  { id: 2, name: "Rohan Kapoor", phone: "+91 98111 22334", visits: 9, totalSpent: "₹6,450", points: 180, tier: "Silver" },
  { id: 3, name: "Aarti Sen", phone: "+91 97222 33445", visits: 24, totalSpent: "₹22,100", points: 720, tier: "Platinum VIP" },
  { id: 4, name: "Deepak Verma", phone: "+91 99333 44556", visits: 5, totalSpent: "₹3,200", points: 90, tier: "Standard" },
];

export default function PlatformGuide() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Active Role in workstation (Store Owner, Branch Manager, Cashier)
  const [activeRole, setActiveRole] = useState(
    location.state?.initialRole && ["store_owner", "branch_manager", "cashier"].includes(location.state.initialRole)
      ? location.state.initialRole
      : "store_owner"
  );

  // -------------------------------------------------------------
  // TAB STATES (100% UNLOCKED & INTERACTIVE)
  // -------------------------------------------------------------
  const [ownerTab, setOwnerTab] = useState("dashboard"); // dashboard, branches, products, categories, employees, alerts, sales, reports, settings, upgrade
  const [managerTab, setManagerTab] = useState("inventory"); // dashboard, inventory, orders, refunds, employees, reports, settings
  const [cashierTab, setCashierTab] = useState("pos"); // pos, orders, returns, customers, shift

  // -------------------------------------------------------------
  // LIVE INTERACTIVE REPOSITORY STATES
  // -------------------------------------------------------------
  const [branches, setBranches] = useState(INITIAL_BRANCHES);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [salesFeed, setSalesFeed] = useState(INITIAL_SALES);
  const [refundClaims, setRefundClaims] = useState(INITIAL_REFUNDS);
  const [customersList, setCustomersList] = useState(INITIAL_CUSTOMERS);

  // Filters & Form States
  const [selectedBranchId, setSelectedBranchId] = useState("all");
  const [quotaBranches, setQuotaBranches] = useState(3);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Beverages");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchCity, setNewBranchCity] = useState("");
  const [newBranchManager, setNewBranchManager] = useState("");
  const [stockSearch, setStockSearch] = useState("");
  const [posCategory, setPosCategory] = useState("ALL");
  const [posSearchTerm, setPosSearchTerm] = useState("");
  const [cart, setCart] = useState([
    { ...INITIAL_PRODUCTS[0], qty: 1 },
    { ...INITIAL_PRODUCTS[1], qty: 2 },
  ]);
  const [paymentMode, setPaymentMode] = useState("upi");
  const [cashTendered, setCashTendered] = useState(500);
  const [discountPct, setDiscountPct] = useState(0);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [lastScannedFeedback, setLastScannedFeedback] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(INITIAL_CUSTOMERS[0]);

  // -------------------------------------------------------------
  // ACTIONS
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
    setProducts([newP, ...products]);
    setNewProdName("");
    setNewProdPrice("");
  };

  const handleAddBranch = (e) => {
    e.preventDefault();
    if (!newBranchName.trim() || !newBranchCity.trim()) return;
    const newB = {
      id: `branch-${Date.now()}`,
      name: newBranchName.trim(),
      city: newBranchCity.trim(),
      manager: newBranchManager.trim() || "New Branch Supervisor",
      revenue: "₹0",
      orders: 0,
      activeCashiers: 1,
      status: "ONLINE",
    };
    setBranches([...branches, newB]);
    setNewBranchName("");
    setNewBranchCity("");
    setNewBranchManager("");
  };

  const handleRestock = (id, amount = 50) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: p.stock + amount } : p))
    );
  };

  const handleApproveRefund = (refId) => {
    const claim = refundClaims.find((r) => r.id === refId);
    if (claim) {
      setRefundClaims((prev) =>
        prev.map((r) => (r.id === refId ? { ...r, status: "APPROVED" } : r))
      );
      // Auto-restock product
      setProducts((prev) =>
        prev.map((p) => (p.name === claim.item ? { ...p, stock: p.stock + 1 } : p))
      );
    }
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

  // Cart Calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmt = Math.round((rawSubtotal * discountPct) / 100);
  const discountedSubtotal = rawSubtotal - discountAmt;
  const taxAmount = cart.reduce((sum, item) => sum + (item.price * item.qty * item.gst) / 100, 0);
  const grandTotal = Math.round(discountedSubtotal + taxAmount);
  const changeToReturn = Math.max(0, cashTendered - grandTotal);

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
              {theme === "dark" ? <Sun className="w-4 h-4 text-[#F5A623]" /> : <Moon className="w-4 h-4 text-slate-700" />}
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

      {/* 2. SUB-BAR: FIDELITY GUARANTEE + ROLE SELECTOR (3 CORE ROLES) */}
      <section className="bg-card border-b border-border py-4 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <h1 className="text-sm sm:text-base font-extrabold text-foreground">
                Exact Production Workstations — 100% Unlocked Role Simulator
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click any role or sidebar tab below. Every feature, table, and form is live and interactive without any locked screens.
            </p>
          </div>

          {/* 3 Focused Role Switcher Pills */}
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
          </div>
        </div>
      </section>

      {/* 3. THE WORKSPACE VIEWPORT */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
        <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden flex flex-col min-h-[720px]">

          {/* ========================================================================= */}
          {/* A. STORE OWNER WORKSPACE (10 ACTIVE MODULES - ZERO LOCKS)                  */}
          {/* ========================================================================= */}
          {activeRole === "store_owner" && (
            <div className="flex flex-1 min-h-[700px]">
              {/* REAL STORE SIDEBAR */}
              <aside className="w-56 bg-[#181614] text-[#FAF8F3] border-r border-[#2B2724] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
                <div className="space-y-5">
                  <div className="px-2">
                    <NexPOSLogo size="sm" />
                  </div>

                  {/* Navigation Links - All 10 Interactive */}
                  <nav className="space-y-1">
                    {[
                      { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
                      { id: "branches", name: "Branches", icon: Store, badge: `${branches.length}` },
                      { id: "products", name: "Products", icon: ShoppingCart, badge: `${products.length}` },
                      { id: "categories", name: "Categories", icon: Tag, badge: `${categories.length}` },
                      { id: "employees", name: "Employees", icon: Users, badge: `${employees.length}` },
                      { id: "alerts", name: "Alerts", icon: AlertTriangle, badge: "2", alert: true },
                      { id: "sales", name: "Sales", icon: BarChart2 },
                      { id: "reports", name: "Reports", icon: FileText },
                      { id: "settings", name: "Settings", icon: Settings },
                      { id: "upgrade", name: "Upgrade Plan", icon: Zap, highlight: true },
                    ].map((link) => {
                      const Icon = link.icon;
                      const isActive = ownerTab === link.id;
                      return (
                        <button
                          key={link.id}
                          onClick={() => setOwnerTab(link.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isActive
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
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                                link.alert
                                  ? "bg-red-500/30 text-red-300"
                                  : isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-[#2B2724] text-[#FAF8F3]/70"
                              }`}
                            >
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

              {/* STORE OWNER CONTENT AREA */}
              <div className="flex-1 flex flex-col min-w-0 bg-background">
                {/* REAL STORE TOPBAR */}
                <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-card shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-foreground flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Apex Retail Store Console
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-muted-foreground">Filter Branch:</span>
                      <select
                        value={selectedBranchId}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-border bg-secondary text-foreground cursor-pointer focus:outline-hidden"
                      >
                        <option value="all">All Outlets (Consolidated)</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#B8860B]/10 text-[#B8860B] border border-[#B8860B]/20 font-bold">
                      Enterprise Tier • Razorpay Active
                    </span>
                    <button
                      onClick={() => setOwnerTab("alerts")}
                      className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer relative"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                    </button>
                  </div>
                </header>

                {/* Mobile Tab Bar for Store Owner */}
                <div className="md:hidden flex items-center gap-1.5 p-2.5 bg-secondary/50 border-b border-border overflow-x-auto">
                  {[
                    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
                    { id: "branches", name: "Branches", icon: Store },
                    { id: "products", name: "Products", icon: ShoppingCart },
                    { id: "categories", name: "Categories", icon: Tag },
                    { id: "employees", name: "Employees", icon: Users },
                    { id: "alerts", name: "Alerts", icon: AlertTriangle },
                    { id: "sales", name: "Sales", icon: BarChart2 },
                    { id: "reports", name: "Reports", icon: FileText },
                    { id: "settings", name: "Settings", icon: Settings },
                    { id: "upgrade", name: "Upgrade", icon: Zap },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setOwnerTab(t.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                        ownerTab === t.id
                          ? "bg-[#B8860B] text-white shadow-xs"
                          : "bg-card text-muted-foreground border border-border"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>

                {/* TAB 1: DASHBOARD */}
                {ownerTab === "dashboard" && (
                  <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Subscription Quota Bar */}
                    <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-foreground flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-[#B8860B]" />
                          Subscription Quota: Professional Plan Active
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Branches: {branches.length} of 5 used • Products: {products.length} of 5,000 used • Employees: {employees.length} of 25 active
                        </div>
                      </div>
                      <button
                        onClick={() => setOwnerTab("upgrade")}
                        className="px-3 py-1.5 rounded-lg bg-[#B8860B] hover:bg-[#996e08] text-white text-xs font-bold transition-all cursor-pointer shrink-0"
                      >
                        Upgrade via Razorpay
                      </button>
                    </div>

                    {/* 4 Dashboard Metric Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl border border-border bg-card">
                        <div className="text-xs text-muted-foreground mb-1">Today's Revenue</div>
                        <div className="text-2xl font-black text-foreground">₹1,84,650</div>
                        <div className="text-[11px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> +22.4% vs last week
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-border bg-card">
                        <div className="text-xs text-muted-foreground mb-1">Total Orders</div>
                        <div className="text-2xl font-black text-foreground">342</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Real-time terminal sync</div>
                      </div>

                      <div className="p-4 rounded-xl border border-border bg-card">
                        <div className="text-xs text-muted-foreground mb-1">Top Selling SKU</div>
                        <div className="text-sm font-bold text-foreground truncate mt-1">Cold Brew Coffee</div>
                        <div className="text-[11px] text-[#B8860B] font-bold mt-1">High Margin Leader</div>
                      </div>

                      <div className="p-4 rounded-xl border border-border bg-card">
                        <div className="text-xs text-muted-foreground mb-1">Cashier Staff Active</div>
                        <div className="text-2xl font-black text-foreground">8 Cashiers</div>
                        <div className="text-[11px] text-emerald-500 font-bold mt-1">● All registers online</div>
                      </div>
                    </div>

                    {/* Multi-Branch Comparison Table */}
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                      <div className="p-4 border-b border-border flex items-center justify-between">
                        <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#B8860B]" /> Multi-Branch Live Performance Breakdown
                        </h3>
                        <button
                          onClick={() => setOwnerTab("branches")}
                          className="text-xs font-bold text-[#B8860B] hover:underline cursor-pointer"
                        >
                          Manage All Branches →
                        </button>
                      </div>
                      <table className="w-full text-left text-xs">
                        <thead className="bg-secondary/60 text-muted-foreground border-b border-border">
                          <tr>
                            <th className="py-2.5 px-4">Branch Outlet</th>
                            <th className="py-2.5 px-3">City</th>
                            <th className="py-2.5 px-3">Manager</th>
                            <th className="py-2.5 px-3 text-right">Today's Revenue</th>
                            <th className="py-2.5 px-3 text-right">Orders</th>
                            <th className="py-2.5 px-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {branches.map((b) => (
                            <tr key={b.id} className="hover:bg-secondary/20">
                              <td className="py-3 px-4 font-bold text-foreground">{b.name}</td>
                              <td className="py-3 px-3 text-muted-foreground">{b.city}</td>
                              <td className="py-3 px-3 text-foreground">{b.manager}</td>
                              <td className="py-3 px-3 text-right font-black text-[#B8860B]">{b.revenue}</td>
                              <td className="py-3 px-3 text-right text-foreground font-semibold">{b.orders}</td>
                              <td className="py-3 px-4 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  {b.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 2: BRANCHES */}
                {ownerTab === "branches" && (
                  <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Store Outlets & Branch Network</h3>
                        <p className="text-xs text-muted-foreground">Manage physical branch locations, register counters, and branch managers.</p>
                      </div>
                      <span className="text-xs font-bold text-[#B8860B] px-3 py-1 rounded-lg bg-[#B8860B]/10 border border-[#B8860B]/20 self-start">
                        {branches.length} Outlets Operational
                      </span>
                    </div>

                    {/* Add New Branch Inline Form */}
                    <form onSubmit={handleAddBranch} className="p-4 rounded-xl border border-border bg-card grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Branch Name (e.g. Pune Koregaon Park)"
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                        className="px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground"
                      />
                      <input
                        type="text"
                        placeholder="City (e.g. Pune)"
                        value={newBranchCity}
                        onChange={(e) => setNewBranchCity(e.target.value)}
                        className="px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground"
                      />
                      <input
                        type="text"
                        placeholder="Supervisor Name (e.g. Rahul Patil)"
                        value={newBranchManager}
                        onChange={(e) => setNewBranchManager(e.target.value)}
                        className="px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-bold rounded-lg bg-[#B8860B] text-white hover:bg-[#996e08] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Open New Branch
                      </button>
                    </form>

                    {/* Branch Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {branches.map((b) => (
                        <div key={b.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-sm text-foreground">{b.name}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-[#B8860B]" /> {b.city}
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              {b.status}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-secondary/50 border border-border space-y-1 text-xs">
                            <div className="flex justify-between text-muted-foreground">
                              <span>Manager:</span>
                              <span className="font-bold text-foreground">{b.manager}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Active Registers:</span>
                              <span className="font-bold text-foreground">{b.activeCashiers} Cashiers</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Today's Sales:</span>
                              <span className="font-black text-[#B8860B]">{b.revenue}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: PRODUCTS */}
                {ownerTab === "products" && (
                  <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Global Master Products Catalog</h3>
                        <p className="text-xs text-muted-foreground">Add products here — all branch counters immediately receive the barcode.</p>
                      </div>
                      <span className="text-xs font-bold text-[#B8860B]">{products.length} Master SKUs</span>
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
                          {products.map((prod) => (
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

                {/* TAB 4: CATEGORIES */}
                {ownerTab === "categories" && (
                  <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Product Categories & Tax Slabs</h3>
                        <p className="text-xs text-muted-foreground">Configure GST rates and HSN codes mapped automatically during POS checkout.</p>
                      </div>
                      <span className="text-xs font-bold text-[#B8860B]">{categories.length} Categories</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {categories.map((c) => (
                        <div key={c.id} className="p-4 rounded-xl border border-border bg-card space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm text-foreground">{c.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#B8860B]/10 text-[#B8860B] border border-[#B8860B]/20">
                              {c.gst}% GST
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground flex justify-between">
                            <span>HSN Code: {c.hsn}</span>
                            <span>{c.itemCount} SKUs</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5: EMPLOYEES */}
                {ownerTab === "employees" && (
                  <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Store Staff & Cashier Roster</h3>
                        <p className="text-xs text-muted-foreground">Multi-branch employee roles and terminal access permissions.</p>
                      </div>
                      <span className="text-xs font-bold text-[#B8860B]">{employees.length} Staff Accounts</span>
                    </div>

                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-secondary/60 text-muted-foreground border-b border-border">
                          <tr>
                            <th className="py-2.5 px-4">Employee Name</th>
                            <th className="py-2.5 px-3">Role Badge</th>
                            <th className="py-2.5 px-4">Branch Location</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {employees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-secondary/20">
                              <td className="py-3 px-4">
                                <div className="font-bold text-foreground">{emp.name}</div>
                                <div className="text-[10px] text-muted-foreground">{emp.email}</div>
                              </td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-secondary border border-border text-foreground">
                                  {emp.role}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-muted-foreground">{emp.branch}</td>
                              <td className="py-3 px-3 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  {emp.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 6: ALERTS */}
                {ownerTab === "alerts" && (
                  <div className="p-6 space-y-4 overflow-y-auto max-w-3xl">
                    <h3 className="text-sm font-bold text-foreground">Critical Store & Stock Notifications</h3>
                    <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-red-700 dark:text-red-400">Critical Low Stock: Farm Fresh Whole Milk 1L</div>
                          <div className="text-muted-foreground mt-0.5">Only 4 units left in Delhi Connaught Place. Warehouse replenishment needed.</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRestock(4, 50)}
                        className="px-3 py-1 text-[11px] font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 shrink-0 cursor-pointer"
                      >
                        +50 Restock Now
                      </button>
                    </div>

                    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-amber-700 dark:text-amber-400">Threshold Alert: Organic Basmati Rice 1kg</div>
                          <div className="text-muted-foreground mt-0.5">Stock below buffer level (3 units remaining in Mumbai Bandra).</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRestock(5, 50)}
                        className="px-3 py-1 text-[11px] font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 shrink-0 cursor-pointer"
                      >
                        +50 Restock Now
                      </button>
                    </div>

                    <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-2.5 text-xs">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-emerald-700 dark:text-emerald-400">Sales Milestone Achieved</div>
                        <div className="text-muted-foreground mt-0.5">Delhi Connaught Place crossed ₹90,000 daily sales milestone ahead of evening peak.</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 7: SALES */}
                {ownerTab === "sales" && (
                  <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Consolidated Live Sales Feed</h3>
                        <p className="text-xs text-muted-foreground">Real-time receipts generated across all terminal counters in network.</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">● Live Sync Active</span>
                    </div>

                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-secondary/60 text-muted-foreground border-b border-border">
                          <tr>
                            <th className="py-2.5 px-4">Invoice #</th>
                            <th className="py-2.5 px-4">Branch</th>
                            <th className="py-2.5 px-3">Cashier</th>
                            <th className="py-2.5 px-3">Customer</th>
                            <th className="py-2.5 px-3 text-right">Amount</th>
                            <th className="py-2.5 px-3 text-center">Tender</th>
                            <th className="py-2.5 px-4 text-right">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {salesFeed.map((s) => (
                            <tr key={s.id} className="hover:bg-secondary/20">
                              <td className="py-3 px-4 font-mono font-bold text-foreground">{s.id}</td>
                              <td className="py-3 px-4 text-muted-foreground">{s.branch}</td>
                              <td className="py-3 px-3 text-foreground">{s.cashier}</td>
                              <td className="py-3 px-3 text-muted-foreground">{s.customer}</td>
                              <td className="py-3 px-3 text-right font-black text-[#B8860B]">₹{s.total}</td>
                              <td className="py-3 px-3 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary border border-border text-foreground">
                                  {s.method}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right text-muted-foreground">{s.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 8: REPORTS */}
                {ownerTab === "reports" && (
                  <div className="p-6 space-y-6 overflow-y-auto">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Revenue Analytics & Profit Margins</h3>
                      <p className="text-xs text-muted-foreground">Consolidated commercial metrics computed from live register transactions.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                        <div className="text-xs font-bold text-foreground flex items-center gap-2">
                          <PieChart className="w-4 h-4 text-[#B8860B]" /> Revenue by Category Share
                        </div>
                        <div className="space-y-2 text-xs">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span>Beverages (Cold Brew & Juices)</span>
                              <span className="font-bold">42%</span>
                            </div>
                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full bg-[#B8860B] w-[42%]" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span>Bakery & Sourdough Breads</span>
                              <span className="font-bold">28%</span>
                            </div>
                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full bg-amber-500 w-[28%]" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span>Snacks & Confectionery</span>
                              <span className="font-bold">18%</span>
                            </div>
                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full bg-blue-500 w-[18%]" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span>Dairy & Grocery</span>
                              <span className="font-bold">12%</span>
                            </div>
                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full bg-emerald-500 w-[12%]" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                        <div className="text-xs font-bold text-foreground flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-500" /> Commercial Margins Overview
                        </div>
                        <div className="space-y-3 text-xs">
                          <div className="p-3 rounded-lg bg-secondary/50 flex justify-between items-center">
                            <span className="text-muted-foreground">Average Gross Margin:</span>
                            <span className="font-black text-emerald-600 text-sm">48.2%</span>
                          </div>
                          <div className="p-3 rounded-lg bg-secondary/50 flex justify-between items-center">
                            <span className="text-muted-foreground">Tax Collected (CGST + SGST):</span>
                            <span className="font-black text-foreground text-sm">₹24,180</span>
                          </div>
                          <div className="p-3 rounded-lg bg-secondary/50 flex justify-between items-center">
                            <span className="text-muted-foreground">Average Basket Size:</span>
                            <span className="font-black text-[#B8860B] text-sm">₹539</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 9: SETTINGS */}
                {ownerTab === "settings" && (
                  <div className="p-6 space-y-6 overflow-y-auto max-w-2xl">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Retail Chain Configuration</h3>
                      <p className="text-xs text-muted-foreground">Master store identity, currency, and tax credentials.</p>
                    </div>

                    <div className="p-5 rounded-xl border border-border bg-card space-y-4 text-xs">
                      <div>
                        <label className="font-bold block mb-1">Chain Brand Name</label>
                        <input
                          type="text"
                          defaultValue="Apex Retail Stores Pvt Ltd"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold block mb-1">Corporate GSTIN</label>
                          <input
                            type="text"
                            defaultValue="07AAAAA0000A1Z5"
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono text-foreground"
                          />
                        </div>
                        <div>
                          <label className="font-bold block mb-1">Operational Currency</label>
                          <input
                            type="text"
                            defaultValue="INR (₹)"
                            disabled
                            className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-muted-foreground"
                          />
                        </div>
                      </div>
                      <div className="pt-2">
                        <Button className="bg-[#B8860B] hover:bg-[#996e08] text-white text-xs font-bold">
                          Save Store Policies
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 10: UPGRADE PLAN */}
                {ownerTab === "upgrade" && (
                  <div className="p-6 space-y-6 overflow-y-auto max-w-2xl">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Razorpay Subscription & Outlets Expansion</h3>
                      <p className="text-xs text-muted-foreground">Adjust branch quota slider to simulate instant plan tier change.</p>
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
                          <span className="font-bold text-foreground">
                            {quotaBranches <= 2 ? "Starter Tier" : quotaBranches <= 5 ? "Professional Tier" : "Enterprise Retail Chain"}
                          </span>
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
                        className="w-full bg-[#B8860B] hover:bg-[#996e08] text-white text-xs font-bold h-10 cursor-pointer"
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
          {/* B. BRANCH MANAGER WORKSPACE (7 ACTIVE MODULES - ZERO LOCKS)                */}
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
                      { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
                      { id: "inventory", name: "Inventory", icon: Boxes, badge: `${products.length}` },
                      { id: "orders", name: "Orders", icon: Clock, badge: "178" },
                      { id: "refunds", name: "Refunds", icon: RotateCcw, badge: `${refundClaims.filter((r) => r.status === "PENDING").length}`, alert: true },
                      { id: "employees", name: "Employees", icon: Users, badge: "4" },
                      { id: "reports", name: "Reports", icon: FileText },
                      { id: "settings", name: "Settings", icon: Settings },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = managerTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setManagerTab(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? "bg-blue-600 text-white shadow-xs"
                              : "text-[#FAF8F3]/70 hover:bg-[#2B2724] hover:text-[#FAF8F3]"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon className="w-4 h-4 shrink-0" /> {item.name}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                item.alert
                                  ? "bg-amber-500 text-black font-bold"
                                  : isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-[#2B2724] text-[#FAF8F3]/60"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="p-3 rounded-xl bg-[#221F1C] border border-[#332E2A] text-xs">
                  <div className="font-bold text-[#FAF8F3]">Pooja S. (Manager)</div>
                  <div className="text-[10px] text-blue-400 font-mono">Delhi Outlet Supervisor</div>
                </div>
              </aside>

              {/* BRANCH MANAGER CONTENT AREA */}
              <div className="flex-1 flex flex-col min-w-0 bg-background">
                <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-card shrink-0">
                  <div className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    Delhi Flagship Branch — Workstation ({managerTab.toUpperCase()})
                  </div>
                  <span className="text-xs font-bold text-blue-600 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    Active Supervisor Terminal
                  </span>
                </header>

                {/* Mobile Tab Bar for Branch Manager */}
                <div className="md:hidden flex items-center gap-1.5 p-2 bg-secondary/50 border-b border-border overflow-x-auto">
                  {["dashboard", "inventory", "orders", "refunds", "employees", "reports", "settings"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setManagerTab(tab)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize shrink-0 ${
                        managerTab === tab ? "bg-blue-600 text-white" : "bg-card text-muted-foreground border border-border"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* TAB 1: MANAGER DASHBOARD */}
                {managerTab === "dashboard" && (
                  <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl border border-border bg-card">
                        <div className="text-xs text-muted-foreground mb-1">Branch Daily Sales</div>
                        <div className="text-2xl font-black text-foreground">₹92,400</div>
                        <div className="text-[11px] text-emerald-500 font-bold mt-1">178 Invoices Billed</div>
                      </div>
                      <div className="p-4 rounded-xl border border-border bg-card">
                        <div className="text-xs text-muted-foreground mb-1">Active Cashiers</div>
                        <div className="text-2xl font-black text-foreground">4 On Duty</div>
                        <div className="text-[11px] text-blue-500 font-bold mt-1">Registers #1 to #4 Online</div>
                      </div>
                      <div className="p-4 rounded-xl border border-border bg-card">
                        <div className="text-xs text-muted-foreground mb-1">Low Stock Alerts</div>
                        <div className="text-2xl font-black text-red-500">2 Items</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Immediate restock required</div>
                      </div>
                      <div className="p-4 rounded-xl border border-border bg-card">
                        <div className="text-xs text-muted-foreground mb-1">Pending Returns</div>
                        <div className="text-2xl font-black text-amber-500">
                          {refundClaims.filter((r) => r.status === "PENDING").length} Claims
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1">Awaiting manager sign-off</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: INVENTORY */}
                {managerTab === "inventory" && (
                  <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-foreground">Branch Shelf Inventory & Restock Station</h3>
                          <p className="text-xs text-muted-foreground">Click "+50 Restock" to replenish shelf units from central store warehouse.</p>
                        </div>

                        {/* Search Bar */}
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
                            <th className="py-2.5 px-4">SKU / Item Name</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3 text-center">Shelf Status</th>
                            <th className="py-2.5 px-3 text-right">Units in Stock</th>
                            <th className="py-2.5 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {products
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
                  </div>
                )}

                {/* TAB 3: ORDERS */}
                {managerTab === "orders" && (
                  <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Delhi Branch Shift Orders</h3>
                        <p className="text-xs text-muted-foreground">Live transaction log for today's shifts at this outlet.</p>
                      </div>
                      <span className="text-xs font-bold text-blue-600">178 Completed Today</span>
                    </div>

                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-secondary/60 text-muted-foreground border-b border-border">
                          <tr>
                            <th className="py-2.5 px-4">Order / Invoice</th>
                            <th className="py-2.5 px-3">Counter</th>
                            <th className="py-2.5 px-3">Customer</th>
                            <th className="py-2.5 px-3 text-right">Bill Total</th>
                            <th className="py-2.5 px-3 text-center">Payment</th>
                            <th className="py-2.5 px-4 text-right">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {salesFeed
                            .filter((s) => s.branch.includes("Delhi"))
                            .map((ord) => (
                              <tr key={ord.id} className="hover:bg-secondary/20">
                                <td className="py-3 px-4 font-mono font-bold text-foreground">{ord.id}</td>
                                <td className="py-3 px-3 text-foreground">{ord.cashier}</td>
                                <td className="py-3 px-3 text-muted-foreground">{ord.customer}</td>
                                <td className="py-3 px-3 text-right font-black text-blue-600">₹{ord.total}</td>
                                <td className="py-3 px-3 text-center">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-foreground">
                                    {ord.method}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right text-muted-foreground">{ord.time}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 4: REFUNDS */}
                {managerTab === "refunds" && (
                  <div className="p-6 space-y-6 overflow-y-auto max-w-3xl">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Customer Returns & Refund Claims Queue</h3>
                      <p className="text-xs text-muted-foreground">Approve cashier customer return requests to issue refund and auto-restock shelf inventory.</p>
                    </div>

                    <div className="space-y-3">
                      {refundClaims.map((ref) => (
                        <div key={ref.id} className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-foreground">{ref.id}</span>
                              <span className="text-muted-foreground">• Original Invoice: {ref.billNo}</span>
                            </div>
                            <div className="font-bold text-sm text-foreground mt-1">{ref.item}</div>
                            <div className="text-muted-foreground">Customer: {ref.customer} • Reason: "{ref.reason}"</div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-base font-black text-foreground">₹{ref.amount}</span>
                            {ref.status === "APPROVED" ? (
                              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Approved & Restocked
                              </span>
                            ) : (
                              <button
                                onClick={() => handleApproveRefund(ref.id)}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors cursor-pointer"
                              >
                                Approve Refund
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5: EMPLOYEES */}
                {managerTab === "employees" && (
                  <div className="p-6 space-y-6 overflow-y-auto">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Delhi Branch Staff Roster</h3>
                      <p className="text-xs text-muted-foreground">Manage cashiers assigned to this location.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {employees
                        .filter((e) => e.branch.includes("Delhi"))
                        .map((emp) => (
                          <div key={emp.id} className="p-4 rounded-xl border border-border bg-card space-y-2 text-xs">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold text-sm text-foreground">{emp.name}</div>
                                <div className="text-muted-foreground">{emp.email}</div>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                                {emp.status}
                              </span>
                            </div>
                            <div className="pt-2 border-t border-border flex justify-between text-muted-foreground">
                              <span>Role: <strong className="text-foreground">{emp.role}</strong></span>
                              <span>{emp.branch}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* TAB 6: REPORTS */}
                {managerTab === "reports" && (
                  <div className="p-6 space-y-4 overflow-y-auto max-w-xl">
                    <h3 className="text-sm font-bold text-foreground">Delhi Flagship Shift Reconciliation</h3>
                    <div className="p-4 rounded-xl border border-border bg-card space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cash Collections:</span>
                        <span className="font-bold text-foreground">₹32,400</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">UPI QR Settlements:</span>
                        <span className="font-bold text-foreground">₹48,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Card Swipes:</span>
                        <span className="font-bold text-foreground">₹12,000</span>
                      </div>
                      <div className="pt-2 border-t border-border flex justify-between font-black text-sm">
                        <span>Total Shift Gross:</span>
                        <span className="text-blue-600">₹92,400</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 7: SETTINGS */}
                {managerTab === "settings" && (
                  <div className="p-6 space-y-4 overflow-y-auto max-w-md">
                    <h3 className="text-sm font-bold text-foreground">Branch Operating Settings</h3>
                    <div className="p-4 rounded-xl border border-border bg-card space-y-3 text-xs">
                      <div>
                        <label className="font-bold block mb-1">Outlet Timing</label>
                        <input
                          type="text"
                          defaultValue="09:00 AM - 10:00 PM"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Receipt Printer Format</label>
                        <select className="w-full px-3 py-2 rounded-lg border border-border bg-background">
                          <option>80mm Standard Thermal (USB/ESC-POS)</option>
                          <option>58mm Compact Thermal</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* C. CASHIER POS WORKSTATION (5 ACTIVE MODULES - ZERO LOCKS)                 */}
          {/* ========================================================================= */}
          {activeRole === "cashier" && (
            <div className="flex flex-1 min-h-[700px]">
              {/* REAL CASHIER SIDEBAR */}
              <aside className="w-48 bg-[#181614] text-[#FAF8F3] border-r border-[#2B2724] p-3 flex flex-col justify-between shrink-0 hidden md:flex">
                <div className="space-y-5">
                  <div className="px-2">
                    <NexPOSLogo size="sm" />
                  </div>
                  <nav className="space-y-1">
                    {[
                      { id: "pos", name: "POS Terminal", icon: ShoppingCart },
                      { id: "orders", name: "Order History", icon: Clock, badge: "Today" },
                      { id: "returns", name: "Returns / Refunds", icon: RotateCcw },
                      { id: "customers", name: "Customers", icon: Users, badge: `${customersList.length}` },
                      { id: "shift", name: "Shift Summary", icon: Receipt },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = cashierTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setCashierTab(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "text-[#FAF8F3]/70 hover:bg-[#2B2724] hover:text-[#FAF8F3]"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon className="w-4 h-4 shrink-0" /> {item.name}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                isActive ? "bg-white/20 text-white" : "bg-[#2B2724] text-[#FAF8F3]/60"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="p-2.5 rounded-xl bg-[#221F1C] border border-[#332E2A] text-xs">
                  <div className="font-bold text-[#FAF8F3]">Rahul V. (Cashier)</div>
                  <div className="text-[10px] text-emerald-400 font-mono">Shift #42 • ACTIVE</div>
                </div>
              </aside>

              {/* CASHIER MAIN CONTENT AREA */}
              <div className="flex-1 flex flex-col min-w-0 bg-background">
                {/* REAL POS HEADER */}
                <header className="bg-card border-b border-border/70 px-4 py-2 flex items-center justify-between shrink-0 h-12">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-emerald-500" /> Delhi Connaught Place — Station #1
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                      Counter Online ●
                    </span>
                  </div>

                  {lastScannedFeedback && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 animate-pulse">
                      ⚡ Scanned: {lastScannedFeedback}
                    </span>
                  )}
                </header>

                {/* Mobile Tab Bar for Cashier */}
                <div className="md:hidden flex items-center gap-1.5 p-2 bg-secondary/50 border-b border-border overflow-x-auto">
                  {["pos", "orders", "returns", "customers", "shift"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setCashierTab(tab)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize shrink-0 ${
                        cashierTab === tab ? "bg-emerald-600 text-white" : "bg-card text-muted-foreground border border-border"
                      }`}
                    >
                      {tab === "pos" ? "POS Terminal" : tab}
                    </button>
                  ))}
                </div>

                {/* TAB 1: POS TERMINAL (2-PANE CHECKOUT) */}
                {cashierTab === "pos" && (
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                    {/* LEFT PANE: PRODUCT CATALOG (7 cols) */}
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
                          onClick={() => handleAddToCart(products[Math.floor(Math.random() * products.length)])}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
                        >
                          ⚡ Simulate Scan
                        </button>
                      </div>

                      {/* Category Filter Pills */}
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

                      {/* Product Cards Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {products
                          .filter((p) => (posCategory === "ALL" ? true : p.category.includes(posCategory)))
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

                    {/* RIGHT PANE: CART & BILLING PANEL (5 cols) */}
                    <div className="lg:col-span-5 p-4 flex flex-col justify-between bg-card space-y-3 overflow-y-auto">
                      <div>
                        {/* Customer Attach Bar */}
                        <div className="p-2.5 rounded-xl bg-secondary border border-border flex items-center justify-between text-xs mb-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            <div>
                              <span className="font-bold text-foreground">{selectedCustomer.name}</span>
                              <span className="text-[10px] text-muted-foreground ml-1.5">{selectedCustomer.phone}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setCashierTab("customers")}
                            className="text-[10px] text-emerald-600 font-bold hover:underline cursor-pointer"
                          >
                            CHANGE CUSTOMER
                          </button>
                        </div>

                        {/* Cart Table Header */}
                        <div className="flex justify-between items-center text-xs font-bold text-foreground mb-2">
                          <span>Cart Items ({cart.reduce((s, i) => s + i.qty, 0)})</span>
                          {cart.length > 0 && (
                            <button
                              onClick={() => setCart([])}
                              className="text-[11px] text-muted-foreground hover:text-red-500 flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Clear Cart
                            </button>
                          )}
                        </div>

                        {/* Item Rows */}
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {cart.length === 0 ? (
                            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                              Cart empty. Click products or scan barcode on the left.
                            </div>
                          ) : (
                            cart.map((item) => (
                              <div
                                key={item.id}
                                className="p-2 rounded-lg bg-secondary/40 border border-border flex items-center justify-between text-xs"
                              >
                                <div className="min-w-0 flex-1 pr-2">
                                  <div className="font-bold text-foreground truncate">{item.name}</div>
                                  <div className="text-[10px] text-muted-foreground font-mono">
                                    ₹{item.price} × {item.qty}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => updateCartQty(item.id, -1)}
                                    className="w-5 h-5 rounded flex items-center justify-center bg-card border border-border cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="font-bold w-4 text-center">{item.qty}</span>
                                  <button
                                    onClick={() => updateCartQty(item.id, 1)}
                                    className="w-5 h-5 rounded flex items-center justify-center bg-card border border-border cursor-pointer"
                                  >
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
                )}

                {/* TAB 2: ORDER HISTORY */}
                {cashierTab === "orders" && (
                  <div className="p-6 space-y-4 overflow-y-auto">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Counter Station #1 Receipt History</h3>
                      <p className="text-xs text-muted-foreground">Recent transactions billed during this shift.</p>
                    </div>

                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-secondary/60 text-muted-foreground border-b border-border">
                          <tr>
                            <th className="py-2.5 px-4">Invoice #</th>
                            <th className="py-2.5 px-3">Customer</th>
                            <th className="py-2.5 px-3 text-right">Items</th>
                            <th className="py-2.5 px-3 text-right">Bill Total</th>
                            <th className="py-2.5 px-3 text-center">Tender</th>
                            <th className="py-2.5 px-4 text-right">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {salesFeed
                            .filter((s) => s.cashier === "Rahul V.")
                            .map((s) => (
                              <tr key={s.id} className="hover:bg-secondary/20">
                                <td className="py-3 px-4 font-mono font-bold text-foreground">{s.id}</td>
                                <td className="py-3 px-3 text-muted-foreground">{s.customer}</td>
                                <td className="py-3 px-3 text-right text-foreground">{s.items}</td>
                                <td className="py-3 px-3 text-right font-black text-emerald-600">₹{s.total}</td>
                                <td className="py-3 px-3 text-center">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-foreground">
                                    {s.method}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right text-muted-foreground">{s.time}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: RETURNS */}
                {cashierTab === "returns" && (
                  <div className="p-6 space-y-4 overflow-y-auto max-w-lg">
                    <h3 className="text-sm font-bold text-foreground">Counter Item Return Intake</h3>
                    <p className="text-xs text-muted-foreground">Scan or enter the customer invoice number to start return inspection.</p>
                    <div className="p-4 rounded-xl border border-border bg-card space-y-3 text-xs">
                      <div>
                        <label className="font-bold block mb-1">Invoice Number</label>
                        <input
                          type="text"
                          placeholder="e.g. INV-2026-9812"
                          defaultValue="INV-2026-9812"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono"
                        />
                      </div>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                        Fetch Bill & Verify Returnable Items
                      </Button>
                    </div>
                  </div>
                )}

                {/* TAB 4: CUSTOMERS */}
                {cashierTab === "customers" && (
                  <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Loyalty Customer Directory</h3>
                        <p className="text-xs text-muted-foreground">Click "Select for POS" to attach customer phone number to active cart.</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">
                        Active: {selectedCustomer.name} ({selectedCustomer.phone})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {customersList.map((cust) => (
                        <div
                          key={cust.id}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            selectedCustomer.id === cust.id
                              ? "border-emerald-500 bg-emerald-500/10 shadow-xs"
                              : "border-border bg-card hover:border-emerald-500/50"
                          }`}
                          onClick={() => {
                            setSelectedCustomer(cust);
                            setCashierTab("pos");
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-foreground">{cust.name}</div>
                              <div className="text-xs text-muted-foreground">{cust.phone}</div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-foreground">
                              {cust.tier}
                            </span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-border flex justify-between text-xs">
                            <span className="text-muted-foreground">Loyalty Points: <strong className="text-emerald-600">{cust.points} pts</strong></span>
                            <span className="text-emerald-600 font-bold">Click to Attach →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5: SHIFT SUMMARY */}
                {cashierTab === "shift" && (
                  <div className="p-6 space-y-4 overflow-y-auto max-w-lg">
                    <h3 className="text-sm font-bold text-foreground">Counter #1 Shift Drawer Reconciliation</h3>
                    <div className="p-5 rounded-xl border border-border bg-card space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cashier On Duty:</span>
                        <span className="font-bold text-foreground">Rahul Verma</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shift Start Float:</span>
                        <span className="font-bold text-foreground">₹2,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cash Billed:</span>
                        <span className="font-bold text-foreground">₹14,250</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">UPI QR Billed:</span>
                        <span className="font-bold text-foreground">₹22,100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Card Swipes:</span>
                        <span className="font-bold text-foreground">₹8,400</span>
                      </div>
                      <div className="pt-2 border-t border-border flex justify-between font-black text-sm">
                        <span>Expected Cash in Drawer:</span>
                        <span className="text-emerald-600">₹16,250</span>
                      </div>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs mt-2">
                        Close Register Shift & Print Z-Report
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="py-8 border-t border-border bg-card text-center text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">NexPOS High-Velocity Multi-Branch Retail Architecture</p>
        <p className="mt-1">Designed for sub-second retail billing, live inventory sync, and multi-branch control.</p>
      </footer>
    </div>
  );
}
