import {
  ShoppingCart,
  Layers,
  Users,
  Shield,
  FileSpreadsheet,
  Store,
  RotateCcw,
  PauseCircle,
  Award,
  Printer,
  Barcode,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useAnimations";

const keyFeatures = [
  {
    icon: <Barcode className="w-6 h-6 text-[#B8860B]" />,
    iconBg: "bg-[#FDF6E2] border-[#EED896] dark:bg-[#3A3530] dark:border-[#5A4F3D]",
    title: "Sub-Second Barcode Checkout",
    description: "Lightning-fast item entry with USB/wireless barcode scanners, dynamic CGST/SGST split, and multi-tender UPI QR payments.",
  },
  {
    icon: <PauseCircle className="w-6 h-6 text-[#262422] dark:text-[#F5A623]" />,
    iconBg: "bg-secondary border-border",
    title: "Held Orders & Cart Parking",
    description: "Never hold up checkout queues. Cashiers can park an active bill in 1-click, serve the next shopper, and resume the held cart instantly.",
  },
  {
    icon: <Layers className="w-6 h-6 text-[#B8860B]" />,
    iconBg: "bg-[#FDF6E2] border-[#EED896] dark:bg-[#3A3530] dark:border-[#5A4F3D]",
    title: "Multi-Branch Live Stock Sync",
    description: "Central master catalog with automated stock deduction across branches, low-stock alerts, and warehouse replenishment workflows.",
  },
  {
    icon: <Award className="w-6 h-6 text-[#262422] dark:text-[#F5A623]" />,
    iconBg: "bg-secondary border-border",
    title: "Customer Loyalty & VIP Points",
    description: "Built-in customer retention directory: track shopper visit frequency, lifetime spend, and auto-issue redeemable reward points per rupee.",
  },
  {
    icon: <FileSpreadsheet className="w-6 h-6 text-[#B8860B]" />,
    iconBg: "bg-[#FDF6E2] border-[#EED896] dark:bg-[#3A3530] dark:border-[#5A4F3D]",
    title: "Shift Till Balancing & Z-Reports",
    description: "Audit register opening floats, cash collections, UPI QR totals, and cash drawer discrepancies with automatic shift-end reports.",
  },
  {
    icon: <Printer className="w-6 h-6 text-[#262422] dark:text-[#F5A623]" />,
    iconBg: "bg-secondary border-border",
    title: "Thermal Printers & Hardware Ready",
    description: "Plug-and-play standard 80mm & 58mm ESC-POS thermal receipt printers, electronic cash drawers (RJ11), and USB barcode scanners.",
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