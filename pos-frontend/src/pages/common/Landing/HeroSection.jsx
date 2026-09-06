import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { ArrowRight, ShoppingCart, BarChart3, Shield, Store, Sparkles, CheckCircle2, ScanLine, Layers, UserCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { useCountUp, useScrollReveal } from "@/hooks/useAnimations";

const rotatingWords = ["Stores", "Supermarkets", "Pharmacy Chains", "Grocery Outlets", "Retail Chains"];

const HeroSection = () => {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Animated counters
  const counter1 = useCountUp(500, 2200);
  const counter2 = useCountUp(12000, 2400);
  const counter3 = useCountUp(50, 1800);

  // Text rotation every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % rotatingWords.length);
        setIsFading(false);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStartedClick = () => {
    navigate("/auth/onboarding");
  };

  const handleSignInClick = () => {
    navigate("/auth/login");
  };

  return (
    <section className="pt-32 pb-20 bg-background relative overflow-hidden">
      {/* Subtle Background Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#F3E6C4]/30 via-[#FAF8F3]/50 to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 bg-[#FDF6E2] text-[#785600] border border-[#EED896] dark:bg-[#3A3530] dark:text-[#F5A623] dark:border-[#5A4F3D] rounded-full px-4 py-1.5 text-xs font-bold mb-8 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#B8860B] dark:text-[#F5A623]" />
            Retail Point of Sale & Multi-Branch Management
          </div>

          {/* Main Hero Heading with rotating text */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.15] mb-6">
            Fast, Simple POS for{" "}
            <br className="hidden sm:inline" />
            <span className="text-[#B8860B] dark:text-[#F5A623] underline decoration-[#EED896] dark:decoration-[#5A4F3D] decoration-4 underline-offset-8 inline-block min-w-[220px] sm:min-w-[320px]">
              <span
                className={`inline-block transition-all duration-300 ${
                  isFading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                }`}
              >
                {rotatingWords[wordIndex]}
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Manage checkout counters, track live inventory, and balance cashier registers across all your locations in one reliable platform.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-10">
            <Button
              onClick={() => navigate("/guide")}
              size="lg"
              className="bg-[#B8860B] hover:bg-[#996e08] text-white text-base px-8 py-3.5 shadow-md hover:shadow-lg font-bold gap-2 cursor-pointer transition-all w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4" />
              ⚡ Try Live Role Simulator
            </Button>
            <Button
              onClick={handleGetStartedClick}
              variant="outline"
              size="lg"
              className="text-base px-7 py-3.5 font-bold gap-2 cursor-pointer border-border hover:bg-secondary w-full sm:w-auto"
            >
              Register Store Free
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSignInClick}
              variant="ghost"
              size="lg"
              className="text-base px-5 py-3.5 font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Sign In
            </Button>
          </div>

          {/* Feature Highlights Pills */}
          <div className="flex flex-wrap justify-center gap-2.5">
            {[
              { icon: <ShoppingCart className="w-4 h-4 text-[#B8860B]" />, text: "Sub-Second Barcode Billing" },
              { icon: <Store className="w-4 h-4 text-[#262422] dark:text-amber-400" />, text: "Multi-Branch Cloud Hub" },
              { icon: <BarChart3 className="w-4 h-4 text-[#B8860B]" />, text: "Shift Till Balancing" },
              { icon: <Shield className="w-4 h-4 text-[#262422] dark:text-blue-400" />, text: "GST & HSN Tax Compliant" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 text-xs font-semibold text-foreground shadow-2xs"
              >
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Preview Card (Authentic POS Workstation Twin Preview) */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="bg-card rounded-3xl p-4 sm:p-6 border border-border shadow-xl">
            {/* Window header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/80 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
                <span className="text-xs font-mono font-medium text-muted-foreground ml-2">
                  NexPOS High-Velocity Terminal / Station #1
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/guide")}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#B8860B]/10 text-[#B8860B] border border-[#B8860B]/30 hover:bg-[#B8860B]/20 transition-colors cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Launch Interactive Twin →
                </button>
              </div>
            </div>

            {/* Workflow Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Fast Cashier Billing */}
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Counter Checkout
                  </span>
                  <ScanLine className="w-4 h-4 text-[#B8860B]" />
                </div>
                <div className="text-base font-bold text-foreground">
                  Barcode Scanner & Hotkeys
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Instant SKU entry, quantity adjustments, itemized CGST + SGST tax split, and 80mm thermal receipt printing.
                </p>
              </div>

              {/* Card 2: Shift Balancing */}
              <div className="p-4 rounded-2xl bg-[#FDF6E2] dark:bg-[#3A3530] border border-[#EED896] dark:border-[#5A4F3D] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#785600] dark:text-[#F5A623] uppercase tracking-wider">
                    Cashier Shifts
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-[#785600] dark:text-[#F5A623]" />
                </div>
                <div className="text-base font-bold text-foreground">
                  Till Float & Z-Report Audit
                </div>
                <p className="text-xs text-[#785600] dark:text-[#D4CEBF] leading-relaxed">
                  Starting cash drawer float tracking, split UPI/Cash reconciliation, and automated shift close reports.
                </p>
              </div>

              {/* Card 3: Multi-Branch Sync */}
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Store Network
                  </span>
                  <Layers className="w-4 h-4 text-foreground" />
                </div>
                <div className="text-base font-bold text-foreground">
                  Live Multi-Branch Sync
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Centralized master catalog, real-time shelf stock deductions, low-stock notifications, and branch oversight.
                </p>
              </div>
            </div>
          </div>

          {/* Verified Retail Performance Benchmarks (Replaces fake counters) */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto px-2">
            <div className="p-3.5 rounded-2xl bg-card border border-border text-center shadow-xs">
              <div className="text-xl sm:text-2xl font-black text-[#B8860B] font-mono tracking-tight flex items-center justify-center gap-1.5">
                <ScanLine className="w-4 h-4 text-emerald-500" /> &lt; 0.2s
              </div>
              <div className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                Barcode Scan Latency
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-card border border-border text-center shadow-xs">
              <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono tracking-tight flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> 100%
              </div>
              <div className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                GST & Dynamic UPI QR Ready
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-card border border-border text-center shadow-xs">
              <div className="text-xl sm:text-2xl font-black text-foreground font-mono tracking-tight flex items-center justify-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-500" /> 0.00%
              </div>
              <div className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                Cash Drawer Discrepancy
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
