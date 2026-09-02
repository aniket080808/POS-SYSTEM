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
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              onClick={handleGetStartedClick}
              size="lg"
              className="text-base px-8 py-3.5 shadow-md hover:shadow-lg font-bold gap-2 cursor-pointer"
            >
              Start Free Store Setup
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSignInClick}
              variant="outline"
              size="lg"
              className="text-base px-8 py-3.5 font-semibold cursor-pointer"
            >
              Sign In to Store
            </Button>
          </div>

          {/* Feature Highlights Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: <ShoppingCart className="w-4 h-4 text-[#B8860B]" />, text: "Fast Barcode Billing" },
              { icon: <Store className="w-4 h-4 text-[#262422]" />, text: "Central Multi-Store Hub" },
              { icon: <BarChart3 className="w-4 h-4 text-[#B8860B]" />, text: "Shift Till Balancing" },
              { icon: <Shield className="w-4 h-4 text-[#262422]" />, text: "Manager & Cashier Roles" },
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

        {/* Feature Preview Card (Clean, Authentic POS workflow preview without fake numbers) */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="bg-card rounded-3xl p-4 sm:p-6 border border-border shadow-xl">
            {/* Window header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/80 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#E4DFD3]" />
                <div className="w-3 h-3 rounded-full bg-[#E4DFD3]" />
                <div className="w-3 h-3 rounded-full bg-[#E4DFD3]" />
                <span className="text-xs font-mono font-medium text-muted-foreground ml-2">
                  NexPOS Terminal / Active Cashier Session
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#262422] text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse" /> Register Active
                </span>
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
                  Barcode & SKU Lookup
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Fast item entry, discount handling, split cash/UPI payments, and instant receipt printing.
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
                  Till Float & Close Reports
                </div>
                <p className="text-xs text-[#785600] dark:text-[#D4CEBF] leading-relaxed">
                  Automated shift summary tracking starting cash, sales breakdown, and register balance.
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
                  Branch Inventory Sync
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Real-time stock deduction across counters with low-stock alerts and branch management.
                </p>
              </div>
            </div>
          </div>

          {/* Animated Social Proof Counters */}
          <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto px-2">
            <div ref={counter1.ref} className="text-center px-1">
              <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground font-mono tracking-tight">
                {counter1.displayValue}+
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground font-semibold mt-1">
                Stores Registered
              </div>
            </div>
            <div ref={counter2.ref} className="text-center border-x border-border px-1">
              <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground font-mono tracking-tight">
                {counter2.displayValue.toLocaleString()}+
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground font-semibold mt-1">
                Bills Processed
              </div>
            </div>
            <div ref={counter3.ref} className="text-center px-1">
              <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground font-mono tracking-tight">
                {counter3.displayValue}+
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground font-semibold mt-1">
                Cities Covered
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
