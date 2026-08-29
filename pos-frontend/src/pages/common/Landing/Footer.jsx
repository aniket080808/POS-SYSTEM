import React from 'react';
import { Store, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-card text-card-foreground border-t border-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start">
          {/* Company Brand */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-xs">
                <Store className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">NexPOS</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              Modern, multi-branch Point of Sale and inventory engine for retail businesses, supermarkets, and chain outlets.
            </p>
            <div className="pt-2 text-xs text-muted-foreground space-y-1">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span className="font-mono">support@nexpos.com</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span className="font-mono">+91 1800-NEXPOS-00</span>
              </p>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Core Capabilities</a></li>
              <li><a href="#demo" className="text-muted-foreground hover:text-foreground transition-colors">Interactive Terminal</a></li>
              <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Subscription Plans</a></li>
              <li><a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">Platform FAQ</a></li>
              <li><a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact Engineering</a></li>
            </ul>
          </div>
          
          {/* Portals Access */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Portals & Terminals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">Cashier Terminal Login</Link></li>
              <li><Link to="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">Branch Manager Portal</Link></li>
              <li><Link to="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">Store Admin Dashboard</Link></li>
              <li><Link to="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">Super Admin Center</Link></li>
              <li><Link to="/auth/onboarding" className="text-primary hover:underline font-semibold">Store Registration & Onboarding</Link></li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Footer */}
      <div className="border-t border-border/60 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {currentYear} NexPOS Systems Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span>256-Bit SSL Encrypted</span>
            <span>Multi-Tenant Architecture</span>
            <span>Zero Lock-in Contract</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;