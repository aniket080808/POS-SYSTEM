import React from "react";
import { useNavigate } from "react-router";
import {
  Store,
  Building2,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Zap,
  BarChart3,
  BadgeCheck,
  ChevronRight,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useAnimations";

const ROLES = [
  {
    id: "store_owner",
    title: "Store Owner",
    subtitle: "Merchant Admin",
    icon: Store,
    badge: "ROLE_STORE_ADMIN",
    tag: "Central Governance",
    accentColor: "text-amber-600 dark:text-amber-400",
    borderHover: "hover:border-amber-500/50",
    bgBadge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    description: "The business command center. Controls store subscription plans, physical branch locations, centralized inventory catalog, and multi-branch revenue analytics.",
    points: [
      "Branch network expansion & Razorpay billing",
      "Unified SKU product catalog with GST slabs",
      "Staff account provisioning (Managers & Cashiers)",
      "Centralized sales graphs & margin analytics",
    ],
  },
  {
    id: "branch_manager",
    title: "Branch Manager",
    subtitle: "Store Supervisor",
    icon: Building2,
    badge: "ROLE_BRANCH_MANAGER",
    tag: "Branch Scoped",
    accentColor: "text-blue-600 dark:text-blue-400",
    borderHover: "hover:border-blue-500/50",
    bgBadge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    description: "The on-ground operations lead. Manages branch shelf stock, audits cashier shifts, verifies customer returns, and ensures drawer cash matches bills.",
    points: [
      "Branch stock receiving & low-stock alerts",
      "Live order feed & invoice search",
      "Customer refund inspection & item restock",
      "Cash drawer variance & discrepancy auditing",
    ],
  },
  {
    id: "cashier",
    title: "Branch Cashier",
    subtitle: "POS Workstation",
    icon: CreditCard,
    badge: "ROLE_BRANCH_CASHIER",
    tag: "Sub-Second Billing",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    borderHover: "hover:border-emerald-500/50",
    bgBadge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    description: "The frontline billing operator. Equipped with high-speed barcode scanning, auto-computed GST, multi-tender payments, and thermal receipt printing.",
    points: [
      "Sub-second USB barcode scanner integration",
      "Dynamic GST tax breakdown & change helper",
      "Multi-tender: UPI QR, Cash, and Card payments",
      "80mm/58mm thermal receipt printing",
    ],
  },
  {
    id: "super_admin",
    title: "Super Admin",
    subtitle: "Platform Owner",
    icon: ShieldCheck,
    badge: "ROLE_ADMIN",
    tag: "SaaS Ecosystem",
    accentColor: "text-purple-600 dark:text-purple-400",
    borderHover: "hover:border-purple-500/50",
    bgBadge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    description: "The SaaS platform controller. Evaluates new merchant onboarding requests, engineers subscription plan tiers, and audits platform compliance.",
    points: [
      "Merchant onboarding verification queue",
      "Dynamic subscription tier quotas & limits",
      "Platform security logs & compliance trails",
      "Public inquiry & lead CRM resolution",
    ],
  },
];

const LiveDemoSection = () => {
  const navigate = useNavigate();
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollReveal();

  return (
    <section id="demo" className="py-20 bg-muted/20 border-b border-border scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-14 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FDF6E2] text-[#785600] border border-[#EED896] dark:bg-[#3A3530] dark:text-[#F5A623] dark:border-[#5A4F3D] mb-3">
            <Layers className="w-3.5 h-3.5" /> Architecture by Role
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
            Built for Every Role in Your Retail Chain
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            From business owners managing subscription limits to cashiers processing sub-second barcode checkouts — discover how each role connects seamlessly.
          </p>
        </div>

        {/* 4 Role Showcase Cards */}
        <div
          ref={cardsRef}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 transition-all duration-700 ${
            cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {ROLES.map((role, idx) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                className={`p-6 rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group ${role.borderHover}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div>
                  {/* Card Header: Icon + Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
                      <Icon className={`w-5 h-5 ${role.accentColor}`} />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${role.bgBadge}`}>
                      {role.tag}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-lg font-bold text-foreground group-hover:text-amber-600 transition-colors">
                    {role.title}
                  </h3>
                  <div className="text-xs text-muted-foreground font-medium mb-3">
                    {role.subtitle}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                    {role.description}
                  </p>

                  {/* Feature Checklist */}
                  <div className="space-y-2 mb-6">
                    {role.points.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-foreground/90">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer Button */}
                <button
                  onClick={() => navigate("/guide")}
                  className="w-full py-2 px-3 rounded-lg border border-border bg-secondary/60 hover:bg-secondary text-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer group-hover:border-border/80"
                >
                  <span>Explore Workflow</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Interactive Guide Launcher Banner */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-card to-amber-500/5 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">
              <Sparkles className="w-4 h-4" /> Dedicated Architecture & Live POS Simulator
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              Want to test the billing terminal or see the complete workflow?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Try our hands-on interactive cashier terminal simulator, inspect real-time stock sync diagrams, and view the full role permission matrix.
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => navigate("/guide")}
              className="bg-[#B8860B] hover:bg-[#996e08] text-white font-bold text-xs sm:text-sm h-10 px-5 shadow-xs cursor-pointer"
            >
              ⚡ Launch Interactive Role Guide <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/auth/onboarding")}
              className="font-bold text-xs sm:text-sm h-10 px-4 cursor-pointer"
            >
              Register Your Store
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveDemoSection;