
import React, { useState, useEffect } from "react";
import { Menu, X, ArrowRight, Moon, Sun } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router";
import NexPOSLogo from "@/components/common/NexPOSLogo";
import { useTheme } from "@/hooks/useTheme";

const navItems = [
  { href: "#features", id: "features", label: "Features" },
  { href: "#demo", id: "demo", label: "Product Tour" },
  { href: "#pricing", id: "pricing", label: "Pricing" },
  { href: "#calculator", id: "calculator", label: "Cost Estimator" },
  { href: "#faq", id: "faq", label: "FAQ" },
  { href: "#contact", id: "contact", label: "Contact" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);

      // Scrollspy calculation
      const sections = navItems.map((item) => document.getElementById(item.id)).filter(Boolean);
      const scrollPos = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec && sec.offsetTop <= scrollPos) {
          setActiveSection(sec.id);
          return;
        }
      }
      setActiveSection("");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLoginClick = () => {
    navigate("/auth/login");
  };

  const handleOnboardingClick = () => {
    navigate("/auth/onboarding");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-card/95 shadow-sm backdrop-blur-md border-b border-border"
          : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo */}
          <NexPOSLogo onClick={() => navigate("/")} size="md" />

          {/* Desktop Navigation with Active Scrollspy */}
          <nav className="hidden md:flex items-center space-x-7">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`text-sm font-semibold transition-colors relative py-1 ${isActive
                      ? "text-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B8860B] rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* CTA Buttons + Theme Toggle */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border bg-card hover:bg-secondary text-foreground transition-all cursor-pointer"
              aria-label="Toggle theme"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-[#F5A623]" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <Button
              onClick={handleLoginClick}
              variant="outline"
              size="sm"
              className="font-semibold text-xs cursor-pointer"
            >
              Sign In
            </Button>
            <Button
              onClick={handleOnboardingClick}
              size="sm"
              className="font-semibold text-xs gap-1.5 cursor-pointer shadow-xs"
            >
              Register Store
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border bg-card hover:bg-secondary text-foreground transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-[#F5A623]" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground p-2 rounded-xl border border-border bg-card hover:bg-secondary transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border bg-card rounded-b-2xl shadow-xl px-4 space-y-3">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`py-2 text-sm font-semibold transition-colors ${activeSection === item.id
                      ? "text-[#B8860B] font-bold"
                      : "text-foreground hover:text-primary"
                    }`}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <Button
                  onClick={handleLoginClick}
                  variant="outline"
                  className="w-full text-xs cursor-pointer"
                >
                  Sign In
                </Button>
                <Button
                  onClick={handleOnboardingClick}
                  className="w-full text-xs cursor-pointer"
                >
                  Register Store
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;