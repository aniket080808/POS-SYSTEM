import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Store,
  Building2,
  CreditCard,
  ShieldCheck,
  Zap,
  Printer,
  Receipt,
  Users,
  Boxes,
  BarChart3,
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
  Globe,
  Clock,
  Coins,
  ChevronRight,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  FileCheck2,
  Moon,
  Sun,
} from "lucide-react";
import NexPOSLogo from "@/components/common/NexPOSLogo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

// Sample products for interactive POS terminal simulation
const DEMO_PRODUCTS = [
  { id: 1, name: "Cold Brew Coffee (350ml)", sku: "SKU-BEV-001", price: 180, category: "Beverages", gst: 18 },
  { id: 2, name: "Artisan Sourdough Loaf", sku: "SKU-BAK-042", price: 140, category: "Bakery", gst: 5 },
  { id: 3, name: "Organic Dark Chocolate 70%", sku: "SKU-SNK-109", price: 220, category: "Snacks", gst: 18 },
  { id: 4, name: "Farm Fresh Whole Milk 1L", sku: "SKU-DAI-005", price: 65, category: "Dairy", gst: 0 },
  { id: 5, name: "Sparkling Mint Lemonade", sku: "SKU-BEV-088", price: 95, category: "Beverages", gst: 12 },
  { id: 6, name: "Roasted Almonds 200g", sku: "SKU-NUT-023", price: 280, category: "Dry Fruits", gst: 12 },
];

const ROLES_DATA = {
  store_owner: {
    id: "store_owner",
    title: "Store Owner / Merchant Admin",
    badge: "ROLE_STORE_ADMIN",
    icon: Store,
    accentColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/30",
    description: "The business decision-maker. Manages subscriptions, physical branches, product catalog, staff permissions, and store-wide revenue analytics.",
    lifecycle: [
      {
        step: 1,
        title: "Registration & Store Onboarding",
        route: "/auth/signup & /auth/onboarding",
        description: "Creates store profile with GSTIN, business category, store contact, logo, and sets up invoice tax details.",
        actions: ["Register account", "Input Store Profile", "Await admin verification", "Define currency & tax headers"],
      },
      {
        step: 2,
        title: "Subscription & Feature Tier",
        route: "/store/upgrade",
        description: "Selects subscription plan (Starter, Pro, Enterprise) via integrated Razorpay gateway (UPI/Cards).",
        actions: ["Compare plan limits", "Razorpay secure payment", "Instant automated tier upgrade", "Unlock branch & product limits"],
      },
      {
        step: 3,
        title: "Branch Network Expansion",
        route: "/store/branches",
        description: "Configures physical outlets across different locations (e.g. Connaught Place, Cyber City, Indiranagar).",
        actions: ["Create branch profile", "Set operating hours", "Assign physical address", "Manage branch active status"],
      },
      {
        step: 4,
        title: "Master Product Catalog & SKU",
        route: "/store/categories & /store/products",
        description: "Sets up product master list with barcodes/SKUs, cost price, selling MRP, and GST tax slabs.",
        actions: ["Define hierarchical categories", "Assign unique barcodes", "Set GST tax rates (0-28%)", "Configure low-stock alert limits"],
      },
      {
        step: 5,
        title: "Staff Provisioning & Role Delegation",
        route: "/store/employees",
        description: "Creates credentials for Branch Managers and Cashiers, assigning them to designated branch counters.",
        actions: ["Add Branch Managers", "Create Cashier logins", "Scoped access permissions", "Password reset & deactivate control"],
      },
      {
        step: 6,
        title: "Executive Reports & Multi-Branch Sales",
        route: "/store/sales & /store/reports",
        description: "Monitors centralized sales performance, top-selling items, payment mode distribution, and exports reports.",
        actions: ["Store-wide revenue ticker", "Branch vs Branch comparisons", "Payment split (Cash/UPI/Card)", "Export CSV & PDF invoices"],
      },
    ],
    features: [
      { name: "Multi-Branch Management", desc: "Manage multiple retail outlets under one central umbrella" },
      { name: "Subscription Plan Control", desc: "Scale branch, staff, and SKU limits seamlessly via Razorpay" },
      { name: "Unified Product Catalog", desc: "Add product once, auto-sync pricing & GST across all branches" },
      { name: "Employee Provisioning", desc: "Create and manage roles without exposing master credentials" },
      { name: "Executive Business BI", desc: "Live graphs, sales trends, profit margins, and tax audits" },
      { name: "Central Low-Stock Alerts", desc: "Instant visibility into warehouse and shelf depletion across outlets" },
    ],
  },
  branch_manager: {
    id: "branch_manager",
    title: "Branch Manager / Supervisor",
    badge: "ROLE_BRANCH_MANAGER",
    icon: Building2,
    accentColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/30",
    description: "The on-ground store supervisor. Controls branch stock inventory, audits cashier shifts, approves returns, and monitors daily cash drawer balances.",
    lifecycle: [
      {
        step: 1,
        title: "Scoped Branch Login",
        route: "/branch/dashboard",
        description: "Logs into the branch console. The system strictly scopes inventory and transactions to their assigned outlet.",
        actions: ["Authenticated login", "Automatic branch binding", "View today's branch revenue", "Inspect active cash registers"],
      },
      {
        step: 2,
        title: "Branch Inventory & Stock Adjustments",
        route: "/branch/inventory",
        description: "Receives new stock shipments from suppliers/central warehouse and updates real-time shelf counts.",
        actions: ["Update current stock counts", "Flag damaged/expired goods", "Low-stock replenishment alerts", "Product search & tracking"],
      },
      {
        step: 3,
        title: "Real-Time Cashier Orders Oversight",
        route: "/branch/orders",
        description: "Monitors live transactions happening at counters. Verifies invoice details and customer dispute logs.",
        actions: ["Live order feed", "Filter by cashier / payment mode", "Reprint customer tax invoices", "Inspect order audit trail"],
      },
      {
        step: 4,
        title: "Customer Returns & Refund Approval",
        route: "/branch/refunds",
        description: "Inspects return requests initiated by cashiers, verifies condition, and approves refund to adjust stock automatically.",
        actions: ["Review refund claims", "Approve/Reject return orders", "Automatic inventory re-stocking", "Discrepancy mitigation"],
      },
      {
        step: 5,
        title: "Cashier Shift Auditing & Drawer Tally",
        route: "/branch/reports",
        description: "Audits daily shift closing summaries submitted by cashiers to detect cash shortages or excess.",
        actions: ["Inspect opening cash float", "Verify collected cash/cards/UPI", "Identify cashier drawer variance", "Sign off on day-close report"],
      },
    ],
    features: [
      { name: "Scoped Data Isolation", desc: "Zero access to competitor branches or parent business banking settings" },
      { name: "Real-Time Stock Depletion", desc: "Branch inventory auto-decrements with every barcode scanned at counter" },
      { name: "Return & Refund Verification", desc: "Prevent cashier fraud by requiring manager sign-off on refunds" },
      { name: "Cash Drawer Float Tally", desc: "Compare expected cash vs physical drawer count with zero guesswork" },
      { name: "Cashier Performance Metrics", desc: "Track billing speed, total sales, and volume per cashier" },
      { name: "Branch Customer History", desc: "Identify repeat local shoppers and purchase patterns" },
    ],
  },
  cashier: {
    id: "cashier",
    title: "Branch Cashier / POS Terminal",
    badge: "ROLE_BRANCH_CASHIER",
    icon: CreditCard,
    accentColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/30",
    description: "The checkout operator. Powered by a lightning-fast POS workstation for barcode scanning, GST auto-calculation, multi-tender payments, and thermal printing.",
    lifecycle: [
      {
        step: 1,
        title: "Shift Opening & Cash Float",
        route: "/cashier",
        description: "Starts the morning duty by registering the physical starting cash drawer float for customer change.",
        actions: ["Login to workstation", "Declare opening drawer float", "Initialize thermal printer link", "Open counter for billing"],
      },
      {
        step: 2,
        title: "Sub-Second Barcode Scanning & Cart",
        route: "/cashier",
        description: "Scans product barcodes or taps category quick-keys to build cart with automated tax breakdowns.",
        actions: ["Hardware barcode scanning", "Dynamic category tap grid", "Apply line item discounts", "Link customer phone/loyalty"],
      },
      {
        step: 3,
        title: "Multi-Tender Payment Acceptance",
        route: "/cashier",
        description: "Offers instant customer checkout via UPI QR code, Cash with automatic change calculation, or Card.",
        actions: ["Instant UPI QR generation", "Cash tender change calculator", "Card POS terminal swipe", "Split-payment support"],
      },
      {
        step: 4,
        title: "Thermal Receipt & Tax Invoice",
        route: "/cashier",
        description: "Prints compliant 80mm/58mm thermal receipts with GSTIN, itemized tax slabs, barcode, and store logo.",
        actions: ["1-Click instant print", "Itemized GST (CGST+SGST)", "Digital SMS receipt logging", "Invoice sequence numbering"],
      },
      {
        step: 5,
        title: "Returns & Exchanges Processing",
        route: "/cashier/returns",
        description: "Processes customer returns by looking up original bill number and selecting damaged/unwanted items.",
        actions: ["Lookup order by invoice #", "Select item return quantity", "Submit for manager approval", "Dispense refund"],
      },
      {
        step: 6,
        title: "Shift Summary & Cash Drawer Close",
        route: "/cashier/shift-summary",
        description: "Counts physical cash in drawer, submits handover report, and closes the terminal for the day.",
        actions: ["View shift metrics", "Input counted physical cash", "Review calculated balance", "Submit shift report"],
      },
    ],
    features: [
      { name: "Sub-Second Barcode Processing", desc: "Zero-lag keyboard wedge / USB barcode scanner listener" },
      { name: "Dynamic GST Tax Calculation", desc: "Automatic CGST, SGST, IGST, and round-off auto-computation" },
      { name: "Cash Tender Change Helper", desc: "Never make mental math errors when handing back change" },
      { name: "Multi-Tender UPI & Card", desc: "Seamless acceptance of GPay, PhonePe, Paytm, and credit cards" },
      { name: "Thermal Receipt Engine", desc: "Optimized for standard ESC/POS 58mm and 80mm thermal printers" },
      { name: "Anti-Theft Shift Balancing", desc: "Transparent shift close with variance audit" },
    ],
  },
  super_admin: {
    id: "super_admin",
    title: "Super Admin / Platform Owner",
    badge: "ROLE_ADMIN",
    icon: ShieldCheck,
    accentColor: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/30",
    description: "The SaaS ecosystem controller. Oversees platform health, store verification approvals, global subscription pricing plans, and system audit logs.",
    lifecycle: [
      {
        step: 1,
        title: "Global Platform Health & Monitoring",
        route: "/super-admin/dashboard",
        description: "Real-time visibility into all stores, active subscriptions, platform volume, and system uptime.",
        actions: ["Global revenue metrics", "Active retail stores count", "Total platform transactions", "System health alerts"],
      },
      {
        step: 2,
        title: "Merchant Store Verification Queue",
        route: "/super-admin/requests",
        description: "Reviews newly registered businesses, validates GSTIN/store details, and approves legitimate merchants.",
        actions: ["Review onboarding requests", "Validate business legality", "1-Click Approve / Reject", "Trigger activation emails"],
      },
      {
        step: 3,
        title: "Subscription Tier Engineering",
        route: "/super-admin/subscriptions",
        description: "Configures commercial pricing tiers, branch quotas, staff quotas, and feature flags.",
        actions: ["Set plan pricing & cycles", "Configure max branches limit", "Configure max product limits", "Toggle Advanced Analytics flag"],
      },
      {
        step: 4,
        title: "Public Inquiries & Merchant Support",
        route: "/super-admin/inquiries",
        description: "Manages business inquiries sent from the public website contact form.",
        actions: ["Inspect customer inquiries", "Categorize merchant leads", "Assign support follow-ups", "Update resolution status"],
      },
      {
        step: 5,
        title: "Platform Security & Audit Trails",
        route: "/super-admin/audit-logs",
        description: "Full compliance tracking of authentication attempts, store state modifications, and admin actions.",
        actions: ["Track auth failures & lockouts", "Audit role escalations", "Inspect store deactivations", "Export platform data"],
      },
    ],
    features: [
      { name: "Multi-Tenant Architecture", desc: "Securely partitions data across hundreds of independent retail businesses" },
      { name: "Onboarding Gatekeeper", desc: "Protects platform integrity with merchant review workflows" },
      { name: "Dynamic Plan Configurator", desc: "Change pricing, features, and quotas on the fly without redeploying" },
      { name: "Compliance Audit Logging", desc: "Detailed activity records for every privileged administrative operation" },
      { name: "Lead & Inquiry Management", desc: "Built-in CRM for enterprise demo requests and merchant support" },
      { name: "Platform-Wide Data Exports", desc: "Aggregate reporting and data export tools for SaaS compliance" },
    ],
  },
};

const FEATURE_MATRIX = [
  { feature: "Access Public Landing & Pricing", roles: { store_owner: true, branch_manager: true, cashier: true, super_admin: true } },
  { feature: "Store Registration & Razorpay Billing", roles: { store_owner: true, branch_manager: false, cashier: false, super_admin: false } },
  { feature: "Approve/Reject Store Onboarding", roles: { store_owner: false, branch_manager: false, cashier: false, super_admin: true } },
  { feature: "Configure Platform Subscription Plans", roles: { store_owner: false, branch_manager: false, cashier: false, super_admin: true } },
  { feature: "Create & Manage Physical Branches", roles: { store_owner: true, branch_manager: false, cashier: false, super_admin: false } },
  { feature: "Master Product Catalog & SKU Setup", roles: { store_owner: true, branch_manager: false, cashier: false, super_admin: false } },
  { feature: "Branch Inventory Adjustment & Restock", roles: { store_owner: true, branch_manager: true, cashier: false, super_admin: false } },
  { feature: "Create Staff Logins (Manager & Cashier)", roles: { store_owner: true, branch_manager: false, cashier: false, super_admin: false } },
  { feature: "High-Speed POS Checkout & Barcode Billing", roles: { store_owner: false, branch_manager: false, cashier: true, super_admin: false } },
  { feature: "UPI QR, Cash & Card Payment Acceptance", roles: { store_owner: false, branch_manager: false, cashier: true, super_admin: false } },
  { feature: "Print 80mm/58mm GST Thermal Receipts", roles: { store_owner: false, branch_manager: false, cashier: true, super_admin: false } },
  { feature: "Initiate Customer Return / Refund", roles: { store_owner: false, branch_manager: false, cashier: true, super_admin: false } },
  { feature: "Approve Returns & Restock Items", roles: { store_owner: true, branch_manager: true, cashier: false, super_admin: false } },
  { feature: "Open & Close Shift (Cash Drawer Float)", roles: { store_owner: false, branch_manager: false, cashier: true, super_admin: false } },
  { feature: "Audit Cashier Drawer Variance & Discrepancies", roles: { store_owner: true, branch_manager: true, cashier: false, super_admin: false } },
  { feature: "Store-Wide Sales & Margin Analytics", roles: { store_owner: true, branch_manager: false, cashier: false, super_admin: false } },
  { feature: "Platform Audit Logs & Security Trails", roles: { store_owner: false, branch_manager: false, cashier: false, super_admin: true } },
];

export default function PlatformGuide() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState("cashier");

  // State for interactive POS terminal simulation
  const [cart, setCart] = useState([
    { ...DEMO_PRODUCTS[0], qty: 1 },
    { ...DEMO_PRODUCTS[2], qty: 2 },
  ]);
  const [paymentMode, setPaymentMode] = useState("upi");
  const [cashTendered, setCashTendered] = useState(700);
  const [receiptGenerated, setReceiptGenerated] = useState(false);
  const [invoiceNumber] = useState("INV-2026-9812");

  const activeRoleData = ROLES_DATA[selectedRole];

  // Cart math
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxAmount = cart.reduce((sum, item) => sum + ((item.price * item.qty * item.gst) / 100), 0);
  const grandTotal = Math.round(subtotal + taxAmount);
  const changeToReturn = Math.max(0, cashTendered - grandTotal);

  const addToCart = (product) => {
    setReceiptGenerated(false);
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) => (p.id === product.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setReceiptGenerated(false);
    setCart((prev) =>
      prev
        .map((p) => {
          if (p.id === id) {
            const newQty = p.qty + delta;
            return newQty > 0 ? { ...p, qty: newQty } : null;
          }
          return p;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCart([]);
    setReceiptGenerated(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-amber-500/20 selection:text-amber-600">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </button>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <NexPOSLogo onClick={() => navigate("/")} size="sm" />
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Sparkles className="w-3 h-3" /> Architecture & Workflow Guide
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border bg-card hover:bg-secondary text-foreground transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/auth/login")}
              className="hidden sm:inline-flex text-xs font-bold"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/auth/onboarding")}
              className="bg-[#B8860B] hover:bg-[#996e08] text-white text-xs font-bold shadow-sm"
            >
              Get Started Free <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden py-14 border-b border-border/80 bg-gradient-to-b from-secondary/30 to-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[#FDF6E2] text-[#785600] border border-[#EED896] dark:bg-[#3A3530] dark:text-[#F5A623] dark:border-[#5A4F3D] mb-4 shadow-xs">
            <BadgeCheck className="w-4 h-4" /> End-to-End Retail OS
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            How NexPOS Works: <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 dark:from-amber-400 dark:to-yellow-300">Every Role, Step by Step</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From the business owner configuring store subscription limits to a cashier scanning barcodes at sub-second speeds — discover how our interconnected role architecture powers modern retail.
          </p>

          {/* Quick jump anchor bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <a href="#roles-section" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary transition-colors">
              👉 Role Journeys
            </a>
            <a href="#simulator-section" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-colors">
              ⚡ Try Interactive POS Terminal
            </a>
            <a href="#architecture-section" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary transition-colors">
              🔄 Data Architecture
            </a>
            <a href="#matrix-section" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary transition-colors">
              📊 Role Permission Matrix
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 1: Interactive Role Switcher & Lifecycles */}
      <section id="roles-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">
            Choose a Role to Explore Their Workflow
          </h2>
          <p className="text-sm text-muted-foreground">
            Select any role below to see their daily responsibilities, starting-to-ending steps, and exact in-app capabilities.
          </p>
        </div>

        {/* Role Selector Tabs (Segmented pills) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-12">
          {Object.values(ROLES_DATA).map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`flex flex-col items-center sm:flex-row sm:items-center gap-2.5 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-card border-amber-500 shadow-md ring-2 ring-amber-500/20"
                    : "bg-card/50 border-border hover:bg-card hover:border-border/80"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-amber-500 text-white" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate ${isSelected ? "text-foreground font-extrabold" : "text-foreground"}`}>
                    {role.title.split("/")[0]}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider truncate">
                    {role.badge.replace("ROLE_", "")}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Role Deep-Dive Card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all">
          {/* Role Header Banner */}
          <div className={`p-6 sm:p-8 border-b border-border ${activeRoleData.bgColor} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-background/80 border border-border text-foreground mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                Role: {activeRoleData.badge}
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                {activeRoleData.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-3xl leading-relaxed">
                {activeRoleData.description}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <Button
                onClick={() => navigate("/auth/login")}
                size="sm"
                className="bg-foreground text-background hover:bg-foreground/90 font-bold text-xs"
              >
                Sign In as this Role <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Step-by-Step Lifecycle (Left 2 cols) */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" /> Step-by-Step Daily Lifecycle
                </h4>
                <span className="text-xs text-muted-foreground font-medium">
                  {activeRoleData.lifecycle.length} Sequential Milestones
                </span>
              </div>

              <div className="space-y-4">
                {activeRoleData.lifecycle.map((item, idx) => (
                  <div
                    key={item.step}
                    className="flex gap-4 p-4 rounded-xl border border-border/80 bg-background hover:border-amber-500/40 transition-colors"
                  >
                    {/* Step badge */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#FDF6E2] text-[#B8860B] dark:bg-[#3A3530] dark:text-[#F5A623] border border-amber-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                        {item.step}
                      </div>
                      {idx !== activeRoleData.lifecycle.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-2" />
                      )}
                    </div>

                    {/* Step details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <h5 className="text-sm font-bold text-foreground">{item.title}</h5>
                        <code className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                          {item.route}
                        </code>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        {item.description}
                      </p>

                      {/* Action chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {item.actions.map((act, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {act}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Feature Arsenal (Right 1 col) */}
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-foreground flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-amber-500" /> Core Feature Capabilities
                </h4>
                <div className="space-y-3">
                  {activeRoleData.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-border bg-background"
                    >
                      <div className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1">
                        <BadgeCheck className="w-3.5 h-3.5 text-amber-500" /> {feat.name}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Boundary Notice */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  <Lock className="w-4 h-4" /> Role Isolation & Security
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Every API request verifies JWT claims, tenant store ID, and branch boundaries. A cashier cannot access branch manager reports, and a branch manager cannot view rival branch financials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Interactive POS Terminal Simulator */}
      <section id="simulator-section" className="py-16 bg-secondary/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-3">
              <Zap className="w-3.5 h-3.5" /> Hands-On Interactive Sandbox
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
              Try the Cashier Billing Counter Right Here
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Experience the sub-second speed of the NexPOS checkout terminal. Click products to scan, select payment method, and generate a real-time thermal receipt instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Product Catalog Grid (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ScanLine className="w-4 h-4 text-amber-500" /> Quick-Tap Product Catalog
                  </h3>
                  <p className="text-xs text-muted-foreground">Click any item to simulate barcode scanning</p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                  6 Demo SKUs
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {DEMO_PRODUCTS.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => addToCart(prod)}
                    className="p-3 rounded-xl border border-border/80 bg-background hover:border-amber-500 hover:shadow-xs transition-all text-left group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                          {prod.category}
                        </span>
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          {prod.gst}% GST
                        </span>
                      </div>
                      <div className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-amber-600 transition-colors">
                        {prod.name}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/60">
                      <span className="text-xs font-extrabold text-foreground">₹{prod.price}</span>
                      <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5">
                        <Plus className="w-3 h-3" /> Add
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Fast Barcode Simulator Button */}
              <div className="p-3 rounded-xl bg-secondary/50 border border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ScanLine className="w-4 h-4 text-amber-500" />
                  <span>Physical USB/Bluetooth barcode scanners emit instant ENTER keys</span>
                </div>
                <button
                  onClick={() => addToCart(DEMO_PRODUCTS[Math.floor(Math.random() * DEMO_PRODUCTS.length)])}
                  className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors cursor-pointer"
                >
                  ⚡ Simulate Barcode Scan
                </button>
              </div>
            </div>

            {/* Right: Live Cart & Thermal Receipt Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Cart Drawer */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-foreground">Terminal Cart</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold">
                      {cart.reduce((sum, item) => sum + item.qty, 0)} items
                    </span>
                  </div>
                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>

                {/* Cart Item List */}
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                    Cart is empty. Click a product on the left to begin billing.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 mb-4 pr-1">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-background border border-border text-xs"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="font-semibold text-foreground truncate">{item.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            ₹{item.price} × {item.qty} + {item.gst}% GST
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className="w-5 h-5 rounded flex items-center justify-center bg-secondary hover:bg-border text-foreground cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold w-4 text-center">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="w-5 h-5 rounded flex items-center justify-center bg-secondary hover:bg-border text-foreground cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="font-bold w-12 text-right">₹{item.price * item.qty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subtotals & Taxes */}
                <div className="space-y-1.5 text-xs border-t border-border pt-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxable Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST (CGST + SGST):</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-foreground text-sm pt-1 border-t border-border/60">
                    <span>Grand Total:</span>
                    <span className="text-amber-600 dark:text-amber-400">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Tender Mode Selector */}
                <div className="mt-4 pt-3 border-t border-border">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    Select Payment Mode:
                  </span>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <button
                      onClick={() => setPaymentMode("upi")}
                      className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMode === "upi"
                          ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                          : "bg-background border-border text-foreground hover:bg-secondary"
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" /> UPI QR
                    </button>
                    <button
                      onClick={() => setPaymentMode("cash")}
                      className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMode === "cash"
                          ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                          : "bg-background border-border text-foreground hover:bg-secondary"
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" /> Cash
                    </button>
                    <button
                      onClick={() => setPaymentMode("card")}
                      className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMode === "card"
                          ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                          : "bg-background border-border text-foreground hover:bg-secondary"
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Card
                    </button>
                  </div>

                  {paymentMode === "cash" && (
                    <div className="p-2.5 rounded-lg bg-secondary/60 border border-border text-xs mb-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Cash Tendered by Customer:</span>
                        <input
                          type="number"
                          value={cashTendered}
                          onChange={(e) => setCashTendered(Number(e.target.value))}
                          className="w-24 px-2 py-1 text-right font-bold rounded border border-border bg-background"
                        />
                      </div>
                      <div className="flex items-center justify-between font-bold text-emerald-600 dark:text-emerald-400">
                        <span>Change to Return:</span>
                        <span>₹{changeToReturn}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    disabled={cart.length === 0}
                    onClick={() => setReceiptGenerated(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 shadow-sm cursor-pointer"
                  >
                    <Printer className="w-4 h-4 mr-1.5" /> Complete Sale & Print Receipt
                  </Button>
                </div>
              </div>

              {/* Thermal Receipt Preview Modal/Card */}
              {receiptGenerated && (
                <div className="p-5 rounded-2xl border-2 border-emerald-500/30 bg-white text-slate-900 shadow-lg font-mono text-[11px] leading-tight animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-2">
                    <div className="font-bold text-sm uppercase tracking-wider">NEXPOS RETAIL PVT LTD</div>
                    <div className="text-[10px] text-slate-600">Connaught Place Flagship Branch</div>
                    <div className="text-[10px] text-slate-600">GSTIN: 07AAAAA0000A1Z5</div>
                    <div className="text-[10px] text-slate-500 mt-1">Tax Invoice #: {invoiceNumber}</div>
                    <div className="text-[9px] text-slate-400">Date: {new Date().toLocaleString()}</div>
                  </div>

                  {/* Items on receipt */}
                  <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2 mb-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span className="truncate pr-2">
                          {item.name} ×{item.qty}
                        </span>
                        <span className="shrink-0">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="space-y-1 border-b border-dashed border-slate-300 pb-2 mb-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST + SGST:</span>
                      <span>₹{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200">
                      <span>TOTAL PAID:</span>
                      <span>₹{grandTotal}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>Mode: {paymentMode.toUpperCase()}</span>
                      <span>STATUS: PAID ✓</span>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-slate-500 pt-1">
                    Thank you for shopping with us!<br />
                    * Powered by NexPOS Engine *
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: End-to-End Data Architecture Flow */}
      <section id="architecture-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FDF6E2] text-[#785600] border border-[#EED896] dark:bg-[#3A3530] dark:text-[#F5A623] dark:border-[#5A4F3D] mb-3">
            <Boxes className="w-3.5 h-3.5" /> Synchronized Ecosystem
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">
            How Data Flows Through NexPOS in Real Time
          </h2>
          <p className="text-sm text-muted-foreground">
            A single sale at a cashier terminal instantly ripples through inventory, manager shift audits, and executive revenue dashboards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs relative">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs mb-3 border border-amber-500/20">
              01
            </div>
            <h4 className="text-sm font-bold text-foreground mb-1">Catalog Defined</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Store Owner enters product name, SKU barcode, cost, MRP, and GST tax rate once in central catalog.
            </p>
            <div className="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-[11px] font-bold text-amber-600">
              <Store className="w-3.5 h-3.5" /> Store Owner Console
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs relative">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs mb-3 border border-blue-500/20">
              02
            </div>
            <h4 className="text-sm font-bold text-foreground mb-1">Stock Assigned</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Branch Manager receives shipment and assigns 100 units to Delhi Branch shelf inventory with low-stock alert set at 10.
            </p>
            <div className="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-[11px] font-bold text-blue-600">
              <Building2 className="w-3.5 h-3.5" /> Branch Manager Console
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs mb-3 border border-emerald-500/20">
              03
            </div>
            <h4 className="text-sm font-bold text-foreground mb-1">Customer Billed</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cashier scans barcode in 0.1s. Customer pays via UPI QR. Thermal receipt prints and stock automatically decrements to 99.
            </p>
            <div className="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
              <CreditCard className="w-3.5 h-3.5" /> Cashier POS Terminal
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs relative">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs mb-3 border border-purple-500/20">
              04
            </div>
            <h4 className="text-sm font-bold text-foreground mb-1">Executive Sync</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Owner dashboard ticks up by revenue amount. Shift audit automatically tracks cashier till balance. Zero reconciliation delay.
            </p>
            <div className="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-[11px] font-bold text-purple-600">
              <BarChart3 className="w-3.5 h-3.5" /> Real-time Analytics
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Role Permission & Feature Matrix Table */}
      <section id="matrix-section" className="py-16 bg-secondary/30 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
              Role Permission & Capability Matrix
            </h2>
            <p className="text-sm text-muted-foreground">
              A transparent view of what each role can access and execute across the platform.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-muted-foreground">
                    <th className="py-3.5 px-4 font-bold text-foreground">Platform Capability</th>
                    <th className="py-3.5 px-3 font-bold text-amber-600 text-center">👔 Store Owner</th>
                    <th className="py-3.5 px-3 font-bold text-blue-600 text-center">🏢 Branch Manager</th>
                    <th className="py-3.5 px-3 font-bold text-emerald-600 text-center">💳 Cashier</th>
                    <th className="py-3.5 px-3 font-bold text-purple-600 text-center">👑 Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {FEATURE_MATRIX.map((row, idx) => (
                    <tr key={idx} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-foreground">{row.feature}</td>
                      <td className="py-3 px-3 text-center">
                        {row.roles.store_owner ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">✓</span>
                        ) : (
                          <span className="text-muted-foreground/40 font-bold">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {row.roles.branch_manager ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">✓</span>
                        ) : (
                          <span className="text-muted-foreground/40 font-bold">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {row.roles.cashier ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">✓</span>
                        ) : (
                          <span className="text-muted-foreground/40 font-bold">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {row.roles.super_admin ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/10 text-purple-600 font-bold">✓</span>
                        ) : (
                          <span className="text-muted-foreground/40 font-bold">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Frequently Asked Questions */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-muted-foreground">
            Common questions from business owners onboarding their staff to NexPOS.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <h4 className="text-sm font-bold text-foreground mb-1">
              What hardware is required for the Cashier workstation?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              NexPOS runs directly in modern web browsers (Chrome, Edge, Safari, Firefox). You only need any computer, laptop, or tablet. For printing, standard 58mm or 80mm ESC/POS USB or Bluetooth thermal printers work out of the box. For barcode scanning, standard plug-and-play USB barcode scanners are supported without any drivers.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <h4 className="text-sm font-bold text-foreground mb-1">
              How does the system prevent cash drawer theft or cashier discrepancies?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every cashier starts duty by declaring an opening cash float. Throughout the shift, the system tracks every cash, UPI, and card transaction. When the cashier closes the shift, they submit their physical cash count. The system automatically calculates variance (Over / Short) and reports it directly to the Branch Manager for sign-off.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <h4 className="text-sm font-bold text-foreground mb-1">
              Can a business run 5 branches in different cities simultaneously?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Yes! The Store Owner has centralized visibility across all 5 branches. Each branch has its own Branch Manager and Cashiers who only see their local inventory and sales. The Store Owner sees consolidated revenue as well as individual branch breakdowns.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6: Call To Action Footer Banner */}
      <section className="py-16 border-t border-border bg-gradient-to-b from-background to-secondary/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
            Ready to Streamline Your Retail Operations?
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-8">
            Create your store in under 2 minutes. Add branches, import your catalog, and start billing customers today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => navigate("/auth/onboarding")}
              className="bg-[#B8860B] hover:bg-[#996e08] text-white font-bold text-sm h-11 px-6 shadow-sm cursor-pointer"
            >
              Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth/login")}
              className="font-bold text-sm h-11 px-6 cursor-pointer"
            >
              Log In to Workstation
            </Button>
          </div>
        </div>
      </section>

      {/* Mini Footer */}
      <footer className="py-6 border-t border-border bg-card text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} NexPOS Retail System. All rights reserved. High-Performance Multi-Branch POS Architecture.
      </footer>
    </div>
  );
}
