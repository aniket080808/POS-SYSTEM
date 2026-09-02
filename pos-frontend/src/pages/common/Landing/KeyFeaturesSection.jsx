import React from "react";
import {
  ShoppingCart,
  Layers,
  Users,
  Shield,
  FileSpreadsheet,
  Store,
  RotateCcw,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useAnimations";

const keyFeatures = [
  {
    icon: <ShoppingCart className="w-6 h-6 text-[#B8860B]" />,
    iconBg: "bg-[#FDF6E2] border-[#EED896]",
    title: "Fast Counter Billing",
    description: "Scan barcodes, search products quickly, hold orders, and accept cash, card, or UPI payments.",
  },
  {
    icon: <Layers className="w-6 h-6 text-[#262422]" />,
    iconBg: "bg-secondary border-border",
    title: "Real-Time Stock Tracking",
    description: "Keep track of items in stock across counters with automatic updates and low-stock alerts.",
  },
  {
    icon: <Store className="w-6 h-6 text-[#B8860B]" />,
    iconBg: "bg-[#FDF6E2] border-[#EED896]",
    title: "Multi-Store Control",
    description: "Add multiple branches and checkout counters from a single admin dashboard.",
  },
  {
    icon: <Users className="w-6 h-6 text-[#262422]" />,
    iconBg: "bg-secondary border-border",
    title: "Staff Roles & Permissions",
    description: "Separate access levels for store owners, branch managers, and counter cashiers.",
  },
  {
    icon: <FileSpreadsheet className="w-6 h-6 text-[#B8860B]" />,
    iconBg: "bg-[#FDF6E2] border-[#EED896]",
    title: "Cashier Shift Reports",
    description: "Track opening cash, sales by payment type, and end-of-shift register balances.",
  },
  {
    icon: <RotateCcw className="w-6 h-6 text-[#262422]" />,
    iconBg: "bg-secondary border-border",
    title: "Returns & Refund Slips",
    description: "Look up previous receipts, process full or partial returns, and print refund slips easily.",
  },
];

const FeatureCard = ({ feature, index }) => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`bg-card rounded-2xl p-6 border border-border shadow-2xs hover:shadow-md hover:border-[#EED896] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div>
        <div
          className={`w-12 h-12 rounded-xl border ${feature.iconBg} flex items-center justify-center mb-5 shadow-2xs group-hover:scale-110 transition-transform duration-300`}
        >
          {feature.icon}
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">
          {feature.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );
};

const KeyFeaturesSection = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();

  return (
    <section id="features" className="py-20 bg-background scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-secondary text-foreground border border-border mb-3">
            Core Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
            Everything your store needs to sell and manage inventory
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Simple tools designed for daily store operations, from single shops to multi-branch chains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {keyFeatures.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyFeaturesSection;