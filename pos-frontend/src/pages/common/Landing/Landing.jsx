import React from "react";
import Header from "./Header";
import HeroSection from "./HeroSection";
import KeyFeaturesSection from "./KeyFeaturesSection";
import WhyChooseUsSection from "./WhyChooseUsSection";
import LiveDemoSection from "./LiveDemoSection";
import PricingSection from "./PricingSection";
import FAQSection from "./FAQSection";
import ContactSection from "./ContactSection";
import Footer from "./Footer";

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Header / Navbar with ThemeToggle */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Key Architecture Features */}
      <KeyFeaturesSection />

      {/* Why Choose NexPOS */}
      <WhyChooseUsSection />

      {/* Interactive Terminal Demo */}
      <LiveDemoSection />

      {/* Pricing Plans */}
      <PricingSection />

      {/* Platform FAQ */}
      <FAQSection />

      {/* Direct Contact */}
      <ContactSection />

      {/* Standardized Footer */}
      <Footer />
    </div>
  );
}

export default Landing;

