import React from "react";
import { Check, X, ArrowRight, ShieldCheck, Zap, Cloud, Smartphone, AlertOctagon } from "lucide-react";
import { useNavigate } from "react-router";
import { useScrollReveal } from "@/hooks/useAnimations";

const WhyChooseUsSection = () => {
  const { ref: sectionRef, isVisible } = useScrollReveal();
  const navigate = useNavigate();

  const comparisons = [
    {
      feature: "Multi-Branch Inventory",
      legacy: "Disconnected branch spreadsheets; painful manual stock counting",
      nexpos: "Real-time consolidated cloud inventory synced across every outlet",
    },
    {
      feature: "Hardware & Reliability",
      legacy: "Single local PC crash shuts down entire store checkout line",
      nexpos: "Runs in any browser on PC, tablet, or POS terminal with instant recovery",
    },
    {
      feature: "Cash Drawer Governance",
      legacy: "No shift float logs; untracked drawer shortages at shift end",
      nexpos: "Strict opening float, split UPI/Cash tracking, and closing Z-reports",
    },
    {
      feature: "Tax & Invoice Compliance",
      legacy: "Manual GST tax calculation and slow paper bills",
      nexpos: "Auto CGST/SGST itemized tax slabs, HSN codes, and dynamic UPI QR",
    },
    {
      feature: "Customer Retention",
      legacy: "No customer purchase history or repeat incentives",
      nexpos: "Built-in loyalty points accumulation, lifetime spend, and VIP tiers",
    },
  ];

  return (
    <section className="py-20 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={sectionRef}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FDF6E2] text-[#785600] border border-[#EED896] dark:bg-[#3A3530] dark:text-[#F5A623] dark:border-[#5A4F3D] mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Modern Cloud Advantage
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
            Why Retailers Are Upgrading from Legacy POS
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Stop losing sales to single-computer crashes and manual Excel sheets. See how NexPOS transforms retail operations.
          </p>
        </div>

        {/* Side-by-Side Comparison Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          {/* Legacy POS Column */}
          <div className="p-6 sm:p-8 rounded-3xl border border-red-500/20 bg-red-500/5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 flex items-center justify-center font-bold">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Legacy Desktop Softwares</h3>
                <p className="text-xs text-muted-foreground">Outdated, brittle, single-PC setups</p>
              </div>
            </div>

            <div className="space-y-4">
              {comparisons.map((c, i) => (
                <div key={i} className="flex items-start gap-3 text-xs leading-relaxed">
                  <div className="w-5 h-5 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <X className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block mb-0.5">{c.feature}</span>
                    <span className="text-muted-foreground">{c.legacy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NexPOS Modern Cloud Column */}
          <div className="p-6 sm:p-8 rounded-3xl border-2 border-[#B8860B]/40 bg-gradient-to-b from-[#B8860B]/10 via-card to-background shadow-lg space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B8860B] text-white flex items-center justify-center font-bold shadow-xs">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">NexPOS Retail Cloud</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B8860B] text-white font-bold">Recommended</span>
                  </div>
                  <p className="text-xs text-muted-foreground">High-velocity multi-branch architecture</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {comparisons.map((c, i) => (
                <div key={i} className="flex items-start gap-3 text-xs leading-relaxed">
                  <div className="w-5 h-5 rounded-full bg-[#B8860B] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block mb-0.5">{c.feature}</span>
                    <span className="text-muted-foreground">{c.nexpos}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Simulator Hook */}
        <div className="text-center">
          <button
            onClick={() => navigate("/guide")}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#B8860B] hover:underline cursor-pointer"
          >
            <span>See the difference for yourself — Launch the Live Interactive Role Simulator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;