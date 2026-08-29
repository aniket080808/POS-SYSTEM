import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Play,
  ArrowRight,
  X,
  CheckCircle,
  Store,
  BarChart3,
  Shield,
  Layers,
  Sparkles,
  Terminal,
  Receipt,
  Users
} from "lucide-react";
import { useNavigate } from "react-router";
import { TypewriterText } from "./components";

const HeroSection = () => {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section className="pt-28 pb-20 bg-background relative overflow-hidden selection:bg-primary/20">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Retail & Multi-Branch POS</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            Unified Point of Sale for{" "}
            <span className="bg-gradient-to-r from-primary via-teal-500 to-emerald-600 bg-clip-text text-transparent block sm:inline">
              Modern Enterprise Retail
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Fast barcode checkouts, branch-level inventory control, cashier shift auditing, and automated financial reports — all unified in one cloud terminal.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-9">
            {[
              { icon: <Terminal className="w-3.5 h-3.5" />, text: "Tablet-Ready Cashier Terminal" },
              { icon: <Layers className="w-3.5 h-3.5" />, text: "Multi-Branch Catalog Sync" },
              { icon: <Receipt className="w-3.5 h-3.5" />, text: "Instant Thermal Invoicing" },
              { icon: <Shield className="w-3.5 h-3.5" />, text: "Role-Based Gated Portals" },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm rounded-full px-3.5 py-1 text-xs font-medium text-foreground shadow-2xs border border-border/80"
              >
                <span className="text-primary">{feature.icon}</span>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center">
            <Button
              onClick={() => navigate("/auth/onboarding")}
              size="lg"
              className="h-12 px-7 text-sm font-semibold rounded-xl gap-2 shadow-sm cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-7 text-sm font-semibold rounded-xl gap-2 cursor-pointer"
              onClick={() => {
                const el = document.getElementById("demo");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Terminal className="w-4 h-4 text-primary" />
              <span>Explore Interactive Terminal</span>
            </Button>
          </div>
        </div>

        {/* Real Architecture Pillar Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto mt-16 pt-8 border-t border-border/60">
          <div className="bg-card/70 backdrop-blur-sm rounded-2xl p-5 border border-border/80 text-center shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold font-mono text-foreground">5 Dedicated Portals</div>
            <div className="text-xs text-muted-foreground mt-1">Super Admin, Store Admin, Store Manager, Branch Manager & Cashier</div>
          </div>

          <div className="bg-card/70 backdrop-blur-sm rounded-2xl p-5 border border-border/80 text-center shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Store className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold font-mono text-foreground">Branch Inventory Hub</div>
            <div className="text-xs text-muted-foreground mt-1">Independent branch stock levels, alert thresholds, and product catalog controls</div>
          </div>

          <div className="bg-card/70 backdrop-blur-sm rounded-2xl p-5 border border-border/80 text-center shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold font-mono text-foreground">Shift & Report Auditing</div>
            <div className="text-xs text-muted-foreground mt-1">Opening/closing drawer totals, payment breakdowns, and PDF/Excel export reports</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

