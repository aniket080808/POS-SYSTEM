import React from "react";
import { Button } from "../../../components/ui/button";
import { ArrowRight, ShoppingCart, BarChart3, Shield, Zap, RefreshCw, Layers } from "lucide-react";
import { useNavigate } from "react-router";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="pt-32 pb-20 bg-linear-to-b from-muted/60 via-background to-background relative overflow-hidden border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-foreground px-4 py-1.5 rounded-full text-xs font-bold mb-8 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            NexPOS Enterprise Retail Architecture
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.15] mb-6">
            Multi-Branch Point of Sale & <br className="hidden sm:inline" />
            <span className="text-accent underline decoration-accent/40 decoration-wavy underline-offset-8">
              Real-Time Store Operations
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Unified retail operations: high-speed barcode checkout, live inventory synchronization, automated cashier shift auditing, 5-tier role-based security, and instant financial reports.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center mb-14">
            <Button
              onClick={() => navigate("/auth/onboarding")}
              size="lg"
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 h-12 rounded-xl shadow-sm text-sm"
            >
              Start Free Store Setup
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto font-semibold px-8 h-12 rounded-xl border-border bg-card text-foreground hover:bg-muted text-sm shadow-2xs"
              onClick={() => navigate("/auth/login")}
            >
              Cashier & Admin Sign In
            </Button>
          </div>

          {/* Real Capability Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 text-left max-w-4xl mx-auto">
            <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent-foreground flex items-center justify-center font-bold">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Fast Terminal</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Barcode scanning, quick discounts, and instant PDF invoice generation.
              </p>
            </div>

            <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Live WebSocket</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                STOMP live alerts for low inventory thresholds and branch activity.
              </p>
            </div>

            <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent-foreground flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">5-Tier RBAC</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Super Admin, Store Admin, Store Manager, Branch Manager & Cashier.
              </p>
            </div>

            <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Data Exports</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sales analytics with one-click multi-format PDF and Excel reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
