import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, BarChart3, Users, Package, ChevronRight, Play, Pause, Store, Receipt, Layers, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

const LiveDemoSection = () => {
  const [activeTab, setActiveTab] = useState('pos');
  const navigate = useNavigate();
  
  const tabs = [
    { id: 'pos', label: 'Cashier Terminal', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'analytics', label: 'Store Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'inventory', label: 'Branch Inventory', icon: <Package className="w-4 h-4" /> },
    { id: 'customers', label: 'Shift Reconciliation', icon: <Receipt className="w-4 h-4" /> },
  ];

  const features = {
    pos: [
      'Touchscreen product card grid & categories',
      'Instant barcode scanning lookup',
      'Dynamic line-item quantity & discounts',
      'Automated invoice generation with thermal print',
    ],
    analytics: [
      'Daily, weekly & monthly gross sales tracking',
      'Category performance breakdown',
      'Top selling products & profit margins',
      '1-Click PDF and Excel report generation',
    ],
    inventory: [
      'Branch-level stock quantity allocations',
      'Configurable low-stock alert thresholds',
      'Bulk Excel product import & batch creation',
      'Category assignments and SKU management',
    ],
    customers: [
      'Cash drawer opening float recording',
      'Cash, Card, and UPI tender breakdowns',
      'Expected vs actual cash reconciliation',
      'Cashier shift reports and discrepancy logs',
    ]
  };

  return (
    <section id="demo" className="py-20 bg-background overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 block">
            Interactive Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Experience the NexPOS Interface
          </h2>
          <p className="text-base text-muted-foreground">
            Explore the high-speed checkout workflow, branch inventory matrix, and automated shift audits.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side - Demo Tabs */}
          <div className="lg:col-span-4 bg-card rounded-2xl border border-border/80 shadow-sm p-6 sticky top-24">
            <h3 className="text-base font-bold text-foreground mb-4">Module Showcase</h3>
            
            <div className="space-y-2 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-2xs'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                  {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </div>
            
            <div className="space-y-3 pt-2 border-t border-border/60">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Core Capabilities</h4>
              <ul className="space-y-2">
                {features[activeTab].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-foreground/80">
                    <div className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[10px]">
                      {index + 1}
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-6 pt-4 border-t border-border/60">
              <Button
                onClick={() => navigate('/auth/onboarding')}
                className="w-full h-10 rounded-xl text-xs font-semibold gap-1.5"
              >
                <span>Launch Your Store</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          
          {/* Right Side - Demo Display */}
          <div className="lg:col-span-8">
            <div className="bg-card rounded-2xl border border-border/80 shadow-md overflow-hidden">
              {/* Terminal Frame Top Bar */}
              <div className="bg-muted/80 border-b border-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    NexPOS Terminal 2.0 — {activeTab.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Active Session
                  </span>
                </div>
              </div>
              
              {/* Demo Mockup Content */}
              <div className="p-6 h-[460px] overflow-hidden relative bg-muted/10">
                {activeTab === 'pos' && (
                  <div className="h-full grid grid-cols-12 gap-4">
                    {/* Left: Product Grid */}
                    <div className="col-span-7 flex flex-col space-y-3">
                      <div className="p-2.5 rounded-xl bg-card border border-border flex items-center justify-between text-xs text-muted-foreground">
                        <span>Barcode Scanner Ready...</span>
                        <span className="font-mono text-primary font-bold">Press [F2]</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2.5 overflow-y-auto flex-1 pr-1">
                        {[
                          { name: 'Organic Milk 1L', price: 65, sku: 'DRY-101' },
                          { name: 'Whole Wheat Bread', price: 45, sku: 'BAK-204' },
                          { name: 'Arabica Coffee 250g', price: 320, sku: 'BEV-308' },
                          { name: 'Greek Yogurt 400g', price: 110, sku: 'DRY-112' },
                          { name: 'Cold Pressed Olive Oil', price: 480, sku: 'GRC-501' },
                          { name: 'Dark Chocolate 70%', price: 160, sku: 'CNF-099' }
                        ].map((prod, i) => (
                          <div key={i} className="bg-card border border-border/80 rounded-xl p-3 flex flex-col justify-between hover:border-primary transition-colors cursor-pointer shadow-2xs">
                            <span className="text-[10px] text-muted-foreground font-mono">{prod.sku}</span>
                            <span className="text-xs font-semibold text-foreground line-clamp-1">{prod.name}</span>
                            <span className="text-xs font-bold text-primary font-mono mt-2">₹{prod.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Cart Summary */}
                    <div className="col-span-5 bg-card rounded-xl border border-border/80 p-4 flex flex-col justify-between shadow-2xs">
                      <div>
                        <div className="flex justify-between items-center pb-2 border-b border-border">
                          <span className="text-xs font-bold text-foreground">Order #1042</span>
                          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">Cashier: Sarah</span>
                        </div>
                        <div className="space-y-2 py-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-foreground font-medium">Arabica Coffee 250g (×1)</span>
                            <span className="font-mono font-bold">₹320.00</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-foreground font-medium">Whole Wheat Bread (×2)</span>
                            <span className="font-mono font-bold">₹90.00</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 pt-3 border-t border-border">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Subtotal</span>
                          <span className="font-mono">₹410.00</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>GST (5%)</span>
                          <span className="font-mono">₹20.50</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t border-dashed border-border">
                          <span>Total</span>
                          <span className="font-mono text-primary text-base">₹430.50</span>
                        </div>
                        <Button size="sm" className="w-full h-9 rounded-xl text-xs font-semibold mt-2">
                          Complete Checkout (₹430.50)
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="h-full flex flex-col justify-between space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-card rounded-xl p-3.5 border border-border">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Today's Gross Sales</span>
                        <span className="text-xl font-bold font-mono text-foreground mt-1 block">₹54,230.00</span>
                        <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">+12.4% vs last week</span>
                      </div>
                      <div className="bg-card rounded-xl p-3.5 border border-border">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Completed Orders</span>
                        <span className="text-xl font-bold font-mono text-foreground mt-1 block">142</span>
                        <span className="text-[10px] text-muted-foreground mt-1 block">Avg ₹381.90 / order</span>
                      </div>
                      <div className="bg-card rounded-xl p-3.5 border border-border">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Cash vs UPI Ratio</span>
                        <span className="text-xl font-bold font-mono text-foreground mt-1 block">38% / 62%</span>
                        <span className="text-[10px] text-muted-foreground mt-1 block">Digital dominant</span>
                      </div>
                    </div>

                    <div className="flex-1 bg-card rounded-xl border border-border p-4 flex flex-col justify-center items-center text-center">
                      <BarChart3 className="w-10 h-10 text-primary mb-2 opacity-80" />
                      <span className="text-sm font-semibold text-foreground">Real-time Revenue & Hourly Peak Charts</span>
                      <span className="text-xs text-muted-foreground max-w-sm mt-1">Exportable to formatted PDF reports or raw XLSX spreadsheets with a single click.</span>
                    </div>
                  </div>
                )}

                {activeTab === 'inventory' && (
                  <div className="h-full flex flex-col space-y-3">
                    <div className="bg-card rounded-xl p-3 border border-border flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground">Centralized Catalog • 458 Items Active</span>
                      <span className="text-muted-foreground">Branch: Downtown Flagship</span>
                    </div>
                    <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase text-[10px] border-b border-border">
                          <tr>
                            <th className="p-2.5">Item Name</th>
                            <th className="p-2.5">SKU</th>
                            <th className="p-2.5">Branch Stock</th>
                            <th className="p-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          <tr>
                            <td className="p-2.5 font-medium">Arabica Coffee 250g</td>
                            <td className="p-2.5 font-mono text-muted-foreground">BEV-308</td>
                            <td className="p-2.5 font-mono">48 units</td>
                            <td className="p-2.5"><span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 font-semibold">In Stock</span></td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-medium">Greek Yogurt 400g</td>
                            <td className="p-2.5 font-mono text-muted-foreground">DRY-112</td>
                            <td className="p-2.5 font-mono text-amber-600 font-bold">4 units</td>
                            <td className="p-2.5"><span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-600 font-semibold">Low Stock</span></td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-medium">Cold Pressed Olive Oil</td>
                            <td className="p-2.5 font-mono text-muted-foreground">GRC-501</td>
                            <td className="p-2.5 font-mono">22 units</td>
                            <td className="p-2.5"><span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 font-semibold">In Stock</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'customers' && (
                  <div className="h-full flex flex-col justify-between space-y-3">
                    <div className="bg-card rounded-xl p-4 border border-border space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-foreground">Cashier Shift Report #882</span>
                        <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Terminal 01</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-xs">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Opening Drawer</span>
                          <span className="font-mono font-bold">₹2,000.00</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Cash Sales</span>
                          <span className="font-mono font-bold text-emerald-600">+₹18,450.00</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Refunds</span>
                          <span className="font-mono font-bold text-destructive">-₹450.00</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card rounded-xl p-4 border border-border flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-foreground block">Shift Reconciliation Audit</span>
                        <span className="text-muted-foreground text-[11px]">Calculates expected cash vs actual physical drawer count.</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 text-sm">₹0.00 Diff</span>
                    </div>

                    <Button onClick={() => navigate('/auth/login')} variant="outline" size="sm" className="h-9 rounded-xl text-xs">
                      Test Cashier Portal
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveDemoSection;