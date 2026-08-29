import React from 'react'
import {
  BarChart3,
  ShieldCheck,
  Store,
  FileSpreadsheet,
  Users,
  ScanBarcode,
  Layers,
  ReceiptText,
} from 'lucide-react'

const keyFeatures = [
  {
    icon: <ScanBarcode className="w-6 h-6" />,
    title: "Barcode Scanning & Checkout",
    description: "Instant barcode and SKU lookup with continuous item scanning and real-time total computation."
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: "Multi-Branch Inventory",
    description: "Track separate branch inventory allocations, low stock warnings, and out-of-stock guardrails."
  },
  {
    icon: <ReceiptText className="w-6 h-6" />,
    title: "Thermal Receipts & Invoices",
    description: "Generate instant print-ready receipts with discount line items and branch tax information."
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "5-Tier Role Access Control",
    description: "Strictly isolated views for Super Admins, Store Admins, Managers, and Cashier terminals."
  },
  {
    icon: <FileSpreadsheet className="w-6 h-6" />,
    title: "PDF & Excel Report Exports",
    description: "One-click export of sales records, employee lists, branch breakdowns, and return reports."
  },
  {
    icon: <Store className="w-6 h-6" />,
    title: "Cashier Shift Reconciliation",
    description: "Shift opening & closing cash drawer audits, expected vs actual cash tracking, and refund logs."
  }
]

const KeyFeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-muted/30 border-y border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 block">
            Core Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Everything Built for Real Retail Operations
          </h2>
          <p className="text-base text-muted-foreground">
            Engineered from ground up with specialized workflows for store owners, branch managers, and checkout cashiers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {keyFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-7 border border-border/80 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default KeyFeaturesSection