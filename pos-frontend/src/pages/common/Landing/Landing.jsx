import React from "react";
import Header from "./Header";
import HeroSection from "./HeroSection";
import KeyFeaturesSection from "./KeyFeaturesSection";
import WhyChooseUsSection from "./WhyChooseUsSection";
import PricingSection from "./PricingSection";
import FAQSection from "./FAQSection";
import ContactSection from "./ContactSection";
import Footer from "./Footer";

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      {/* Header / Navbar */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Core Platform Modules */}
      <KeyFeaturesSection />

      {/* Technical Architecture & Operational Advantages */}
      <WhyChooseUsSection />

      {/* Subscription Pricing */}
      <PricingSection />

      {/* Frequently Asked Questions */}
      <FAQSection />

      {/* Contact & Enterprise Inquiries */}
      <ContactSection id="contact" />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Landing;
