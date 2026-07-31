import React from 'react';
import { MapPin } from 'lucide-react';
// Removed image logo in favor of clean text branding

interface FooterProps {
  onOpenBooking: () => void;
  onOpenCalendar: () => void;
  onOpenAdmin: () => void;
  onOpenPolicies?: () => void;
  onOpenSitemap?: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBooking,
  onOpenCalendar,
  onOpenAdmin,
  onOpenPolicies,
  onOpenSitemap,
  onNavigateSection,
}) => {
  const handleNav = (sectionId: string) => {
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
    <footer className="bg-[rgba(245,239,230,0.85)] backdrop-blur-2xl text-[#6F655B] border-t border-[rgba(199,168,109,0.35)] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[rgba(199,168,109,0.25)] text-xs">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center cursor-pointer group" onClick={() => handleNav('top')}>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-[#2E2A26] group-hover:text-[#C7A86D] transition-colors select-none whitespace-nowrap inline-block">
                KM <span className="text-[#C7A86D]">PALACE</span>
              </span>
            </div>
            <p className="text-[#6F655B] text-xs leading-relaxed">
              Kundrathur, Chennai • Turning every celebration into a beautiful memory since 2013.
            </p>
            <a
              href="https://www.instagram.com/the_km_palace"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 text-xs font-bold text-[#E1306C] hover:underline bg-pink-50 px-3 py-1.5 rounded-full border border-pink-200"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Follow @the_km_palace</span>
            </a>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <p className="font-serif font-bold text-[#2E2A26] text-sm uppercase tracking-widest">
              Quick Links
            </p>
            <ul className="space-y-1.5 text-[#6F655B]">
              <li>
                <button onClick={onOpenAdmin} className="hover:text-[#2E2A26] font-bold text-[#7A0019] transition-colors cursor-pointer">
                  Admin Portal (Booking Entry)
                </button>
              </li>
              <li>
                <button onClick={onOpenCalendar} className="hover:text-[#2E2A26] transition-colors cursor-pointer">
                  Availability Calendar
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('story-section')} className="hover:text-[#2E2A26] transition-colors cursor-pointer">
                  Our Story & Heritage
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('highlights-section')} className="hover:text-[#2E2A26] transition-colors cursor-pointer">
                  Venue Features & Amenities
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('tariff-section')} className="hover:text-[#2E2A26] transition-colors cursor-pointer">
                  View 24hr Tariff Packages
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('location-section')} className="hover:text-[#2E2A26] transition-colors cursor-pointer">
                  Location & Map
                </button>
              </li>
              {onOpenSitemap && (
                <li>
                  <button onClick={onOpenSitemap} className="hover:text-[#2E2A26] font-semibold text-[#7A0019] transition-colors cursor-pointer flex items-center space-x-1">
                    <span>Google Sitemap (XML)</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Contact & Address */}
          <div className="space-y-2">
            <p className="font-serif font-bold text-[#2E2A26] text-sm uppercase tracking-widest">
              Find KM Palace
            </p>
            <p className="flex items-start space-x-1.5 leading-relaxed">
              <MapPin className="w-4 h-4 text-[#C7A86D] shrink-0 mt-0.5" />
              <span>9/133, Sirukalathur Main Rd, Kavanur, Chembarambakkam, Tamil Nadu 600069, India</span>
            </p>
            <p className="pt-1 font-semibold text-[#2E2A26]">Manager hotline: <a href="tel:+919159277277" className="hover:underline text-[#9B7A46]">+91 9159277277</a></p>
            <p>Email: Kannan.d26@gmail.com</p>
          </div>

          {/* Direct Navigation Button Box */}
          <div className="space-y-3 bg-white/80 p-4 rounded-[20px] border border-[rgba(199,168,109,0.35)] shadow-xs">
            <p className="font-bold text-[#2E2A26] text-xs flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-[#C7A86D]" />
              <span>Directions & Location</span>
            </p>
            <p className="text-[11px] text-[#6F655B] leading-relaxed">
              Kalyana Mandapam in Kundrathur, Chennai.
            </p>
            <a
              href="https://maps.google.com/?q=KM+PALACE,+9/133,+Sirukalathur+Main+Rd,+Kavanur,+Chembarambakkam,+Tamil+Nadu+600069,+India"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#7A0019] hover:underline"
            >
              <span>Get Directions on Google Maps</span>
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8C7E6E] gap-2">
          <p>© {new Date().getFullYear()} KM Palace. All rights reserved. • Privacy | Terms | Book via www.kmpalace.com</p>
          <div className="flex items-center space-x-4">
            {onOpenSitemap && (
              <button onClick={onOpenSitemap} className="hover:underline text-[#6F655B] font-semibold cursor-pointer">
                Sitemap (XML)
              </button>
            )}
            <button onClick={onOpenAdmin} className="hover:underline text-[#6F655B] cursor-pointer">
              Manager Portal
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

