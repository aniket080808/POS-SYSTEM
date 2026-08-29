import { Store, Menu, X, ArrowRight } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { Button } from '../../../components/ui/button'
import { useNavigate } from 'react-router'
import { ThemeToggle } from '../../../components/theme-toggle'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/90 backdrop-blur-md border-b border-border/80 shadow-2xs'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => navigate('/')}
          >
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-xs">
              <Store className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              NexPOS
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Capabilities
            </a>
            <a
              href="#demo"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Interactive Terminal
            </a>
            <a
              href="#pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Plans
            </a>
            <a
              href="#faq"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </a>
            <a
              href="#contact"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            <Button
              onClick={() => navigate('/auth/login')}
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-xl font-medium"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate('/auth/onboarding')}
              size="sm"
              className="h-9 px-4 rounded-xl font-medium gap-1.5 shadow-xs"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground p-2 rounded-xl border border-border bg-card"
              aria-label="Toggle Navigation Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border bg-background/95 backdrop-blur-md rounded-b-2xl shadow-xl px-2 space-y-3">
            <nav className="flex flex-col space-y-2 text-sm font-medium">
              <a
                href="#features"
                onClick={() => setIsMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Capabilities
              </a>
              <a
                href="#demo"
                onClick={() => setIsMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Interactive Terminal
              </a>
              <a
                href="#pricing"
                onClick={() => setIsMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Plans
              </a>
              <a
                href="#faq"
                onClick={() => setIsMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                FAQ
              </a>
              <a
                href="#contact"
                onClick={() => setIsMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Contact
              </a>
            </nav>
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Button
                onClick={() => {
                  setIsMenuOpen(false)
                  navigate('/auth/login')
                }}
                variant="outline"
                className="w-full h-10 rounded-xl"
              >
                Sign In
              </Button>
              <Button
                onClick={() => {
                  setIsMenuOpen(false)
                  navigate('/auth/onboarding')
                }}
                className="w-full h-10 rounded-xl"
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header