
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ${
        isScrolled ? 'glass-effect' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">
              EduSync
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="font-medium text-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="font-medium text-foreground hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#testimonials" className="font-medium text-foreground hover:text-primary transition-colors">
              Testimonials
            </a>
            <a href="#pricing" className="font-medium text-foreground hover:text-primary transition-colors">
              Pricing
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="font-medium">
              Log In
            </Button>
            <Button className="font-medium">
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-foreground" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass-effect mt-4 p-4 rounded-lg animate-fade-in">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="font-medium text-foreground hover:text-primary transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="font-medium text-foreground hover:text-primary transition-colors">
                How It Works
              </a>
              <a href="#testimonials" className="font-medium text-foreground hover:text-primary transition-colors">
                Testimonials
              </a>
              <a href="#pricing" className="font-medium text-foreground hover:text-primary transition-colors">
                Pricing
              </a>
              <div className="flex flex-col space-y-2 pt-2 border-t border-border">
                <Button variant="ghost" className="font-medium w-full">
                  Log In
                </Button>
                <Button className="font-medium w-full">
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
