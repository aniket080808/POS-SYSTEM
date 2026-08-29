import React from "react";
import {
  ShoppingCart,
  Store,
  Layers,
  FileSpreadsheet,
  BellRing,
  Clock3,
} from "lucide-react";

const realPlatformModules = [
  {
    icon: <ShoppingCart className="w-6 h-6 text-accent" />,
    title: "Cashier Terminal & Quick Tender",
    description:
      "Barcode & SKU searching, dynamic cart calculation, percentage and fixed discounts, partial tenders, and automated thermal/PDF invoice rendering.",
    tag: "Cashier Portal",
  },
  {
    icon: <Store className="w-6 h-6 text-accent" />,
    title: "Multi-Branch Inventory Synchronization",
    description:
      "Maintain a centralized master product catalog with branch-specific stock levels, price variations, SKU lookups, and branch operational hours.",
    tag: "Store Admin",
  },
  {
    icon: <Clock3 className="w-6 h-6 text-accent" />,
    title: "Shift Auditing & Cash Reconciliation",
    description:
      "Track shift opening amounts, cash-in/cash-out drawer transactions, real-time sales tallies, refund logs, and end-of-shift reconciliation reports.",
    tag: "Shift Management",
  },
  {
    icon: <Layers className="w-6 h-6 text-accent" />,
    title: "5-Tier Role-Based Access Control",
    description:
      "Strict route gating and API permission boundaries across Super Admin, Store Admin, Store Manager, Branch Manager, and Branch Cashier roles.",
    tag: "Security & Auth",
  },
  {
    icon: <BellRing className="w-6 h-6 text-accent" />,
    title: "STOMP WebSocket Operational Alerts",
    description:
      "Instant live push notifications for low inventory thresholds, inactive cashier alerts, daily branch opening status, and refund anomalies.",
    tag: "Live Alerts",
  },
  {
    icon: <FileSpreadsheet className="w-6 h-6 text-accent" />,
    title: "Analytics & Multi-Format Exports",
    description:
      "Comprehensive daily/monthly sales volume breakdowns, cashier performance metrics, customer histories, and formatted Excel & PDF downloads.",
    tag: "Reporting Engine",
  },
];

const KeyFeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-muted/30 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            Core Modules
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-2 mb-4">
            Built for High-Throughput Retail Operations
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Every feature is natively integrated into the NexPOS platform to eliminate redundant tooling and maintain operational data integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {realPlatformModules.map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow border border-border/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center border border-border/60">
                    {feature.icon}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground border border-border/60">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyFeaturesSection;