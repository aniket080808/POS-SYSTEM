import React from "react";
import { CheckCircle2, Zap, ShieldCheck, Database, Sliders } from "lucide-react";

const architecturalAdvantages = [
  {
    title: "Optimized High-Speed Terminal",
    desc: "Keyboard shortcut navigation (F1 Search, F2 Discount, F3 Customer, Ctrl+Enter Pay) designed for rapid checkout lane operations.",
  },
  {
    title: "Granular Multi-Store Governance",
    desc: "Manage multiple retail branches with distinct tax rates, currency configurations, and localized operating hours under one account.",
  },
  {
    title: "Automated Razorpay Subscription Integration",
    desc: "Built-in subscription lifecycle management with instant plan activation, status verification, and automated renewals.",
  },
  {
    title: "Strict Role Partitioning & Audit Readiness",
    desc: "Every transaction, refund, discount, and cashier shift is tracked with timestamps and operator identity for complete accountability.",
  },
];

const WhyChooseUsSection = () => {
  return (
    <section className="py-20 bg-background border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Engineering Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-2 mb-6 leading-tight">
              Enterprise Stability Built for Demanding Retail Environments
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-8 leading-relaxed">
              NexPOS is engineered for speed, data consistency, and reliable daily operation across all store branches.
            </p>

            <div className="space-y-4">
              {architecturalAdvantages.map((adv, index) => (
                <div key={index} className="flex items-start gap-3.5">
                  <div className="mt-1 w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      {adv.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-0.5">
                      {adv.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/40 rounded-2xl p-6 sm:p-8 border border-border/80 shadow-xs">
            <div className="bg-card rounded-xl border border-border p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                    POS
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">NexPOS System Architecture</h4>
                    <p className="text-[11px] text-muted-foreground">Monorepo Production Stack</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-accent/15 text-accent-foreground rounded font-bold border border-accent/20">
                  LIVE READY
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-muted/60 border border-border/60">
                  <span className="text-muted-foreground">Frontend Stack:</span>
                  <span className="font-semibold text-foreground">React 19 + Vite + Tailwind CSS</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-muted/60 border border-border/60">
                  <span className="text-muted-foreground">Live Telemetry:</span>
                  <span className="font-semibold text-foreground">STOMP WebSockets (/topic/activities)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-muted/60 border border-border/60">
                  <span className="text-muted-foreground">Payment Gateway:</span>
                  <span className="font-semibold text-foreground">Razorpay Checkout SDK</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-muted/60 border border-border/60">
                  <span className="text-muted-foreground">Data Pipeline:</span>
                  <span className="font-semibold text-foreground">jsPDF, autoTable & XLSX Formats</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;