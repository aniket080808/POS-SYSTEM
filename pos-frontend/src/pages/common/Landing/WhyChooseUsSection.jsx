import { Check, BarChart3, Zap, ShieldCheck, RefreshCw } from "lucide-react";
import React from "react";
import { useScrollReveal } from "@/hooks/useAnimations";

const WhyChooseUsSection = () => {
  const { ref: sectionRef, isVisible } = useScrollReveal();

  const benefits = [
    {
      title: "Fast Barcode Scanning",
      desc: "Ring up items quickly using keyboard shortcuts and handheld barcode scanners.",
    },
    {
      title: "Accurate Register Balancing",
      desc: "Easily verify cash drawer amounts against digital sales at the end of every shift.",
    },
    {
      title: "Clear User Permissions",
      desc: "Keep management settings safe by giving staff only the access they need.",
    },
    {
      title: "Clean, Simple Design",
      desc: "Easy for new cashiers to learn and start billing without extensive training.",
    },
  ];

  return (
    <section className="py-20 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={sectionRef}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FDF6E2] text-[#785600] border border-[#EED896] mb-4">
              Built for Daily Retail
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
              Designed to keep checkout lines moving
            </h2>
            <p className="text-base text-muted-foreground mb-8 leading-relaxed">
              We focus on speed and clarity so your cashiers can process orders quickly, handle returns easily, and close daily registers without errors.
            </p>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3.5 transition-all duration-500 ${
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  }`}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                >
                  <div className="w-6 h-6 rounded-full bg-[#262422] text-[#C9A227] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{benefit.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary/60 rounded-3xl p-6 sm:p-8 border border-border">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-9 h-9 rounded-xl bg-[#FDF6E2] border border-[#EED896] flex items-center justify-center text-[#B8860B]">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Quick Checkout</h3>
                <p className="text-xs text-muted-foreground">Scan barcodes and collect payments in seconds</p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Live Stock Sync</h3>
                <p className="text-xs text-muted-foreground">Inventory counts update instantly as sales happen</p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Secure Roles</h3>
                <p className="text-xs text-muted-foreground">Admins control prices, discounts, and staff access</p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-9 h-9 rounded-xl bg-[#FDF6E2] border border-[#EED896] flex items-center justify-center text-[#B8860B]">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Daily Summaries</h3>
                <p className="text-xs text-muted-foreground">Clear sales and payment breakdown reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;