import React from "react";
import { UserPlus, Package, ShoppingCart, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useAnimations";

const steps = [
  {
    step: 1,
    icon: <UserPlus className="w-6 h-6" />,
    title: "Register Your Store",
    description: "Submit your store profile with owner details. A system admin verifies your account within hours.",
    accent: true,
  },
  {
    step: 2,
    icon: <Package className="w-6 h-6" />,
    title: "Add Products & Branches",
    description: "Import your product catalog, set up branch locations, and configure billing counters.",
    accent: false,
  },
  {
    step: 3,
    icon: <ShoppingCart className="w-6 h-6" />,
    title: "Start Billing Customers",
    description: "Cashiers log in, scan barcodes, process payments, and close shifts — all from day one.",
    accent: true,
  },
];

const StepCard = ({ step, index }) => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`flex flex-col items-center text-center transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Step number circle */}
      <div
        className={`w-[72px] h-[72px] rounded-2xl flex items-center justify-center mb-5 border shadow-sm ${
          step.accent
            ? "bg-[#FDF6E2] border-[#EED896] text-[#B8860B] dark:bg-[#3A3530] dark:border-[#5A4F3D] dark:text-[#F5A623]"
            : "bg-card border-border text-foreground"
        }`}
      >
        {step.icon}
      </div>

      {/* Step label */}
      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
        Step {step.step}
      </span>

      <h3 className="text-base font-bold text-foreground mb-2">
        {step.title}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-[240px]">
        {step.description}
      </p>
    </div>
  );
};

const HowItWorksSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FDF6E2] text-[#785600] border border-[#EED896] dark:bg-[#3A3530] dark:text-[#F5A623] dark:border-[#5A4F3D] mb-3">
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
            Up and running in three simple steps
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            From registration to first sale — get your retail operation started quickly.
          </p>
        </div>

        {/* Steps Grid with connecting line */}
        <div className="relative max-w-4xl mx-auto">
          {/* Horizontal connecting line (desktop) */}
          <div className="hidden md:block absolute top-[52px] left-[16.67%] right-[16.67%] h-0.5 bg-border" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((s, i) => (
              <StepCard key={s.step} step={s} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
