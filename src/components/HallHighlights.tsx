import React from 'react';
import { ShieldCheck, Sparkles, UtensilsCrossed, Car, Zap, BedDouble, Users, Fan } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: Fan,
    title: 'Centralized Air Conditioning',
    desc: 'State-of-the-art climate control throughout the main hall, dining area, and suite rooms for complete guest comfort.',
  },
  {
    icon: Sparkles,
    title: 'Royal Mandapam Stage',
    desc: 'Grand stage backdrop with gold-plated pillars, crystal chandeliers, and customizable lighting setups for wedding photos.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Dining Hall (300 Seating)',
    desc: 'Hygienic, spacious dining hall equipped with modern stainless steel serving tables and modern kitchen facilities.',
  },
  {
    icon: BedDouble,
    title: '11 Deluxe AC Rooms',
    desc: 'Comfortable private dressing rooms for bride & groom plus air-conditioned guest rooms with attached baths.',
  },
  {
    icon: Car,
    title: '70 Cars, 300+ Scooters Vehicle Parking & Valet',
    desc: 'Vast paved parking ground with security personnel and valet service management on request.',
  },
  {
    icon: Zap,
    title: '100% Uninterrupted Power Backup',
    desc: 'Heavy-duty automatic acoustic diesel generator backup ensuring zero downtime during your auspicious Muhurtham.',
  },
];

export const HallHighlights: React.FC = () => {
  return (
    <section id="highlights-section" className="py-20 bg-[#F9F5EF] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-white/80 border border-[rgba(199,168,109,0.35)] text-xs font-semibold text-[#9B7A46] mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C7A86D]" />
            <span className="uppercase tracking-widest text-[10px]">World-Class Venue Facilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-[#2E2A26]">
            Why KM PALACE is Chosen for Royal Celebrations
          </h2>
          <p className="mt-3 text-[#6F655B] text-sm leading-relaxed font-normal">
            Thoughtfully engineered to host timeless grand weddings with uncompromised aesthetic elegance, comfort, and hospitality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HIGHLIGHTS.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="glass-card p-8 rounded-[24px] border border-[rgba(199,168,109,0.3)] shadow-[0_20px_60px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.08)] hover:border-[#C7A86D] transition-all group duration-300"
              >
                <div className="w-12 h-12 rounded-[16px] bg-[linear-gradient(135deg,#E8D8B0_0%,#C7A86D_100%)] text-[#2E2A26] flex items-center justify-center font-bold shadow-xs mb-5 group-hover:scale-105 transition-transform">
                  <IconComponent className="w-5 h-5 text-[#2E2A26]" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-[#2E2A26] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[#6F655B] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
