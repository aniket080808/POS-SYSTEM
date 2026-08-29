import React from 'react'
import { CheckCircle2, Shield, Zap, RefreshCw, BarChart3, Database } from 'lucide-react'

const WhyChooseUsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 block">
                Why NexPOS
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
                Engineered for High-Velocity Retail and Accurate Auditing
              </h2>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">
              NexPOS eliminates checkout bottlenecks while giving store management granular oversight of stock movements, cashier shifts, and sales performance across every branch.
            </p>
            
            <div className="space-y-3.5 pt-2">
              {[
                { title: "Reliable Cash Drawer Audits", desc: "Prevents cashier discrepancies with automatic expected vs actual shift balancing." },
                { title: "Excel Bulk Product Imports", desc: "Easily import hundreds of SKUs with batch validation and category mappings." },
                { title: "Instant Thermal Invoicing", desc: "Supports dynamic line-item discounts, GST tax rules, and customizable store footers." },
                { title: "Role-Isolated Environments", desc: "Cashiers cannot alter store settings, and branch managers only access their own unit." }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Capability Highlights */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Rapid Checkout</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add products by code, category filter, or barcode scanning with instant cart calculation.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Return & Refund Flow</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Process partial or full order returns with automatic stock restoration to the branch inventory.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Financial Analytics</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Real-time graphs for daily gross sales, top-selling categories, and cashier throughput.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Low Stock Safeguards</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Visual badges and automated stock alerts when quantities drop below minimum branch levels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUsSection