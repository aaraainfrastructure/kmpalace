import React, { useState } from 'react';
import { Phone, MessageSquare, Calendar, Shield, Menu, X, BookOpen } from 'lucide-react';
// Removed image logo in favor of clean text branding
interface NavbarProps {
  onOpenBooking: (date?: string) => void;
  onOpenCalendar: () => void;
  onOpenAdmin: () => void;
  onOpenBlog?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  isDbConnected?: boolean | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenCalendar,
  onOpenAdmin,
  onOpenBlog,
  onNavigateSection,
  isDbConnected,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      const elem = document.getElementById(sectionId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 py-3 px-4 sm:px-6 lg:px-8 transition-all">
      <div className="max-w-7xl mx-auto rounded-full bg-[rgba(255,255,255,0.7)] backdrop-blur-2xl border border-[rgba(199,168,109,0.35)] shadow-[0_15px_40px_rgba(0,0,0,0.05)] px-5 sm:px-6 py-2">
        <div className="flex items-center justify-between">
          
          {/* Clean Text Branding: KM PALACE */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center cursor-pointer py-1 group" onClick={() => onNavigateSection ? onNavigateSection('top') : window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <span className="font-serif text-lg sm:text-xl font-bold tracking-wider text-[#2E2A26] group-hover:text-[#C7A86D] transition-colors select-none whitespace-nowrap inline-block">
                KM <span className="text-[#C7A86D]">PALACE</span>
              </span>
            </div>
          </div>

          {/* Desktop Nav Links - Rounded Pill Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[rgba(245,239,230,0.6)] p-1 rounded-full border border-[rgba(199,168,109,0.2)]">
            <button
              onClick={onOpenCalendar}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium text-[#2E2A26] hover:text-[#C7A86D] hover:bg-white/80 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C7A86D]" />
              <span>Availability</span>
            </button>
            {onOpenBlog && (
              <button
                onClick={onOpenBlog}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-[#2E2A26] hover:text-[#C7A86D] hover:bg-white/80 transition-all cursor-pointer bg-white/40 shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#C7A86D]" />
                <span>Wedding Guide & Blog</span>
              </button>
            )}
            <a
              href="#story-section"
              onClick={(e) => handleSectionClick(e, 'story-section')}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-[#2E2A26] hover:text-[#C7A86D] hover:bg-white/80 transition-all"
            >
              Our Story
            </a>
            <a
              href="#highlights-section"
              onClick={(e) => handleSectionClick(e, 'highlights-section')}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-[#2E2A26] hover:text-[#C7A86D] hover:bg-white/80 transition-all"
            >
              Features
            </a>
            <a
              href="https://www.instagram.com/the_km_palace"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full text-[#E1306C] hover:bg-pink-50 transition-all flex items-center justify-center cursor-pointer"
              title="Official Instagram @the_km_palace"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <button
              onClick={onOpenAdmin}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium text-[#2E2A26] hover:text-[#C7A86D] hover:bg-white/80 transition-all cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-[#C7A86D]" />
              <span>Admin Portal</span>
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center space-x-3">
            <a
              href="tel:+919159277277"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-[rgba(199,168,109,0.35)] text-[#2E2A26] hover:bg-[rgba(199,168,109,0.1)] transition-colors text-xs font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-[#C7A86D]" />
              <span className="font-num whitespace-nowrap">+91 9159277277</span>
            </a>

            <a
              href="https://wa.me/919159277277?text=Hello%20KM%20Palace%20Team%2C%20I%20would%20like%20to%20enquire%20about%20wedding%20hall%20availability."
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-[rgba(125,155,106,0.15)] border border-[rgba(125,155,106,0.3)] text-[#5E7A4E] hover:bg-[rgba(125,155,106,0.25)] transition-colors text-xs font-medium flex items-center justify-center cursor-pointer"
              title="WhatsApp Chat"
              aria-label="WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
            </a>

            <button
              onClick={() => onOpenCalendar()}
              className="btn-gold px-5 text-xs font-semibold uppercase tracking-wider cursor-pointer flex items-center space-x-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Check Availability</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#2E2A26]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 mx-auto max-w-7xl rounded-3xl bg-[rgba(255,255,255,0.92)] backdrop-blur-2xl border border-[rgba(199,168,109,0.3)] p-5 space-y-3 shadow-xl">
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenCalendar(); }}
            className="w-full text-left py-2.5 px-4 rounded-xl bg-[rgba(232,216,176,0.4)] font-semibold text-[#2E2A26] border border-[#C7A86D]/40 flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4 text-[#C7A86D]" />
            <span>📅 Check Availability Calendar</span>
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenCalendar(); }}
            className="w-full text-left py-2 px-3 text-[#2E2A26] flex items-center space-x-2 font-medium text-sm"
          >
            <Calendar className="w-4 h-4 text-[#C7A86D]" />
            <span>Availability Calendar</span>
          </button>
          {onOpenBlog && (
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenBlog(); }}
              className="w-full text-left py-2 px-3 text-[#2E2A26] flex items-center space-x-2 font-bold text-sm"
            >
              <BookOpen className="w-4 h-4 text-[#C7A86D]" />
              <span>Wedding Guide & SEO Blog</span>
            </button>
          )}
          <a
            href="#story-section"
            onClick={(e) => { setMobileMenuOpen(false); handleSectionClick(e, 'story-section'); }}
            className="block py-2 px-3 text-[#2E2A26] text-sm font-medium"
          >
            Our Story
          </a>
          <a
            href="#highlights-section"
            onClick={(e) => { setMobileMenuOpen(false); handleSectionClick(e, 'highlights-section'); }}
            className="block py-2 px-3 text-[#2E2A26] text-sm font-medium"
          >
            Features & Amenities
          </a>
          <a
            href="https://www.instagram.com/the_km_palace"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-2 py-2 px-3 text-[#E1306C] text-sm font-bold"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>Instagram @the_km_palace</span>
          </a>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }}
            className="w-full text-left py-2 px-3 text-[#2E2A26] flex items-center space-x-2 font-medium text-sm"
          >
            <Shield className="w-4 h-4 text-[#C7A86D]" />
            <span>Admin Portal</span>
          </button>

          <div className="pt-3 border-t border-[rgba(199,168,109,0.25)] flex flex-col space-y-2">
            <a
              href="tel:+919159277277"
              className="flex items-center justify-center space-x-2 py-2 rounded-xl border border-[rgba(199,168,109,0.4)] text-[#2E2A26] text-sm font-medium"
            >
              <Phone className="w-4 h-4 text-[#C7A86D]" />
              <span>Call Manager: +91 9159277277</span>
            </a>
            <a
              href="https://wa.me/919159277277?text=Hello%20KM%20Palace%20Team%2C%20I%20would%20like%20to%20enquire%20about%20wedding%20hall%20availability."
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center space-x-2 py-2 rounded-xl bg-[rgba(125,155,106,0.2)] text-[#5E7A4E] text-sm font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Inquiry</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

