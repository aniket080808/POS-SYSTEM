import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, ArrowRight, Check, Loader2, AlertCircle } from "lucide-react";
import siteConfig from "@/config/siteConfig";
import api from "@/utils/api";

const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    storeName: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg("Please fill in your name, email, and message.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/public/contact-inquiries", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        storeName: formData.storeName.trim() || null,
        message: formData.message.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Could not send your message right now. Please try again or reach us by phone/email.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-card border-t border-border scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#262422] rounded-3xl p-8 sm:p-12 text-[#FAF8F3] shadow-xl overflow-hidden relative">
          {/* Subtle Accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A227]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Column */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-[#FAF8F3] border border-white/15 mb-4">
                Get in Touch
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Have questions about setting up NexPOS?
              </h2>
              <p className="text-sm sm:text-base text-[#D4CEBF] leading-relaxed mb-8">
                Send us a message or reach out directly. We can help you configure your branches, import products, or answer questions about hardware compatibility.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#C9A227] text-[#262422] flex items-center justify-center shrink-0 font-bold">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-[#FAF8F3]">
                    Support Email: {siteConfig.contact.email}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#C9A227] text-[#262422] flex items-center justify-center shrink-0 font-bold">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-[#FAF8F3]">
                    Support Phone: {siteConfig.contact.phone}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#C9A227] text-[#262422] flex items-center justify-center shrink-0 font-bold">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-[#FAF8F3]">
                    {siteConfig.contact.hours}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="bg-card rounded-2xl p-6 sm:p-8 text-foreground border border-border shadow-lg">
              <h3 className="text-lg font-bold mb-4">Send a Message</h3>

              {submitted ? (
                <div className="p-6 bg-secondary/60 rounded-xl text-center space-y-2">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Check className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Message Received!</h4>
                  <p className="text-xs text-muted-foreground">
                    Thank you, <span className="font-semibold text-foreground">{formData.name}</span>. Our support team will get back to you at <span className="font-semibold text-foreground">{formData.email}</span>.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs mt-3"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", storeName: "", message: "" });
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                        Your Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        disabled={loading}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Store Owner Name"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                        Email Address <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        disabled={loading}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@store.com"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                      Store or Business Name
                    </label>
                    <input
                      type="text"
                      disabled={loading}
                      value={formData.storeName}
                      onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                      placeholder="e.g. City Supermarket"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                      Message <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      disabled={loading}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us what you need help with (e.g. number of branches, counter setups)..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none disabled:opacity-50"
                    ></textarea>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full h-11 text-xs font-bold gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        Send Message
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;