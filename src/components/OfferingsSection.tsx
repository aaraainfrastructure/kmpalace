import React from 'react';
import {
  Bed,
  Car,
  Zap,
  Sparkles,
  Music,
  Utensils,
  Volume2,
  HeartHandshake,
  CheckCircle2,
  Users,
  Award,
  Camera
} from 'lucide-react';

export const OfferingsSection: React.FC = () => {
  const amenitiesList = [
    {
      icon: Bed,
      title: '11 A/C Guest Rooms',
      desc: '11 fully air-conditioned guest rooms available for wedding parties and family stays.',
    },
    {
      icon: Car,
      title: 'Ample Parking',
      desc: 'Convenient on-site parking for 70 cars and 300+ scooters inside premises + valet.',
    },
    {
      icon: Sparkles,
      title: 'In-House Wedding Decoration',
      desc: 'Our experienced wedding décor team offers fully customized decorations and a wide selection of pre-designed themes, ensuring the perfect setup for every style and budget.',
    },
    {
      icon: Utensils,
      title: 'In-House Catering (Pure Veg)',
      desc: 'In-house catering veg only (pure veg). Spacious kitchen setup equipped for traditional dining.',
    },
    {
      icon: Zap,
      title: '100% Electricity Back-up',
      desc: 'Heavy-duty acoustic standby generator setup for uninterrupted events.',
    },
    {
      icon: HeartHandshake,
      title: 'Bridal & Groom Rooms',
      desc: 'Private air-conditioned bridal and groom dressing rooms included with standard hall package.',
    },
  ];

  const highlightPoints = [
    {
      title: 'Professional Lighting & Sound',
      desc: 'Top-notch audio systems and ambient elevation lights for grand stage impact.',
      icon: Volume2,
    },
    {
      title: 'Power Backup Guarantee',
      desc: '100% electricity backup ensures seamless ceremonies without power halts.',
      icon: Zap,
    },
    {
      title: 'Photography & Videography',
      desc: 'Professional wedding photography and media arrangements available on request.',
      icon: Camera,
    },
    {
      title: 'DJ & Music Ready',
      desc: 'Acoustically tuned hall setup for DJ music and cultural performances.',
      icon: Music,
    },
  ];

  const perfectForEvents = [
    'Opulent Weddings',
    'Family Milestones',
    'Corporate Gatherings',
    'Grand Receptions',
    'Engagement & Betrothal',
    'Special Occasions',
  ];

  return (
    <section className="py-20 bg-handmade-paper border-t border-[rgba(199,168,109,0.25)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/80 border border-[rgba(199,168,109,0.35)] text-xs font-semibold text-[#9B7A46] shadow-xs">
            <Award className="w-3.5 h-3.5 text-[#C7A86D]" />
            <span className="uppercase tracking-widest text-[10px]">What This Place Has To Offer</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2E2A26]">
            Everything You Need
          </h2>
          <p className="text-[#6F655B] text-sm sm:text-base">
            Thoughtfully designed for comfort, convenience and celebration.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenitiesList.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="glass-card p-6 rounded-[24px] border border-[rgba(199,168,109,0.3)] hover:border-[rgba(199,168,109,0.6)] transition-all shadow-xs space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-[rgba(199,168,109,0.15)] border border-[rgba(199,168,109,0.3)] flex items-center justify-center text-[#9B7A46]">
                  <Icon className="w-6 h-6 text-[#C7A86D]" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#2E2A26]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#6F655B] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Highlight Features Box */}
        <div className="glass-card p-8 rounded-[32px] border border-[rgba(199,168,109,0.35)] shadow-md space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-2xl font-serif font-bold text-[#2E2A26]">
              Modern Amenities & Facilities
            </h3>
            <p className="text-xs text-[#6F655B]">
              Premium inclusions ensuring a stress-free event execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {highlightPoints.map((pt, i) => {
              const Icon = pt.icon;
              return (
                <div key={i} className="p-5 rounded-[20px] bg-white/70 border border-[rgba(199,168,109,0.25)] flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(199,168,109,0.15)] flex items-center justify-center shrink-0 text-[#9B7A46]">
                    <Icon className="w-5 h-5 text-[#C7A86D]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#2E2A26]">{pt.title}</h4>
                    <p className="text-xs text-[#6F655B] mt-1 leading-relaxed">{pt.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Perfect For Badges */}
          <div className="pt-6 border-t border-[rgba(199,168,109,0.2)] text-center space-y-3">
            <p className="text-xs font-serif font-bold text-[#9B7A46] uppercase tracking-widest">
              Ideal Setting Perfect For
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {perfectForEvents.map((evt, idx) => (
                <span
                  key={idx}
                  className="px-4 py-1.5 rounded-full bg-white/80 border border-[rgba(199,168,109,0.3)] text-xs font-semibold text-[#2E2A26] flex items-center space-x-1.5 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C7A86D]" />
                  <span>{evt}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
