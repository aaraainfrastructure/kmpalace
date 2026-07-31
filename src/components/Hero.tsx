import React, { useState, useEffect } from 'react';
import { Calendar, Sparkles, ChevronDown, Building2, Phone, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import heroImg from '../assets/images/km_palace_hero_1784800774868.jpg';

interface HeroProps {
  onBookNow: () => void;
  onViewCalendar: () => void;
}

const HERO_TAGLINES = [
  "Where love finds its perfect setting.",
  "Where dreams are celebrated together.",
  "Where families come together to celebrate."
];

export const Hero: React.FC<HeroProps> = ({ onBookNow, onViewCalendar }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [activeTaglineIndex, setActiveTaglineIndex] = useState(0);

  // Auto-cycle through the 3 hero tagline phrases every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTaglineIndex((prev) => (prev + 1) % HERO_TAGLINES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Ensure video loaded fallback state triggers smoothly
  useEffect(() => {
    const videoTimer = setTimeout(() => {
      setVideoLoaded(true);
    }, 800);
    return () => clearTimeout(videoTimer);
  }, []);

  const scrollToTariff = () => {
    const el = document.getElementById('tariff-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToStory = () => {
    const el = document.getElementById('story-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative w-full h-screen min-h-[650px] bg-[#0A0908] text-white overflow-hidden flex flex-col justify-between transition-colors duration-500">
      
      {/* FULL-SCREEN CINEMATIC BACKGROUND YOUTUBE VIDEO LAYER */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* YouTube Video Background Banner */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
          <iframe
            src="https://www.youtube-nocookie.com/embed/2kfWwPAjxPE?autoplay=1&mute=1&loop=1&playlist=2kfWwPAjxPE&controls=0&showinfo=0&autohide=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&iv_load_policy=3"
            title="KM Palace Kalyana Mandapam Hero Video"
            allow="autoplay; encrypted-media; picture-in-picture"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] min-w-full min-h-full object-cover pointer-events-none filter brightness-95 contrast-[1.05] opacity-90"
          />
        </div>

        {/* Dark Overlays for high text readability */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* TOP DECORATIVE GOLD LINE */}
      <div className="relative z-10 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-75" />

      {/* HERO MAIN CONTENT CONTAINER */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-10 my-auto flex-1 flex flex-col justify-center animate-fadeIn">
        
        <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-7">
          
          {/* Location & Heritage Badge */}
          <div className="inline-flex items-center space-x-2.5 px-5 py-2 rounded-full bg-[#111111]/85 backdrop-blur-xl border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.25em] shadow-2xl">
            <Building2 className="w-4 h-4 text-[#D4AF37]" />
            <span>Kundrathur, Chennai • Royal Marriage & Convention Hall</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>

          {/* Animated Headline & Tagline Sequence */}
          <div className="space-y-4">
            <div className="min-h-[90px] sm:min-h-[120px] flex items-center justify-center">
              <h1
                key={activeTaglineIndex}
                className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-[1.15] transition-all duration-700 animate-fadeIn"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#C7A86D] italic font-serif">
                  {HERO_TAGLINES[activeTaglineIndex]}
                </span>
              </h1>
            </div>

            {/* Sequence Dots Indicator */}
            <div className="flex items-center justify-center space-x-2">
              {HERO_TAGLINES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTaglineIndex(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                    activeTaglineIndex === idx
                      ? 'w-8 bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.8)]'
                      : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            <p className="text-stone-300 text-sm sm:text-base lg:text-lg font-normal max-w-2xl mx-auto leading-relaxed pt-1">
              Chennai's premier fully air-conditioned wedding hall with 2,500+ floating guest capacity, 800-seat reception hall, 11 AC guest rooms, and 24-hour transparent tariff.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-1">
            <button
              onClick={onViewCalendar}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#C7A86D] to-[#B89755] text-[#0D0C0A] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:scale-105 cursor-pointer flex items-center justify-center space-x-2.5"
            >
              <Calendar className="w-4 h-4 text-[#0D0C0A]" />
              <span>Check Availability Calendar</span>
            </button>

            <a
              href="https://wa.me/919159277277?text=Hello%20KM%20Palace%20Team%2C%20I%20want%20to%20enquire%20about%20booking%20availability."
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#1A1917]/90 hover:bg-[#2A2824] border border-[#D4AF37]/50 text-[#FCFBF7] font-semibold text-xs uppercase tracking-[0.2em] transition-all backdrop-blur-md cursor-pointer flex items-center justify-center space-x-2 hover:border-[#D4AF37]"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>WhatsApp Booking Enquiry</span>
            </a>

            <button
              onClick={scrollToTariff}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-transparent hover:bg-white/5 border border-white/20 text-stone-300 font-medium text-xs uppercase tracking-[0.15em] transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Clock className="w-4 h-4 text-[#C7A86D]" />
              <span>View 24h Tariff</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-6 sm:pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 text-center max-w-3xl mx-auto">
            <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <p className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#D4AF37] font-num">2,500+</p>
              <p className="text-[10px] sm:text-xs font-medium text-stone-300 uppercase tracking-wider mt-0.5">Floating Capacity</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <p className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#D4AF37] font-num">800</p>
              <p className="text-[10px] sm:text-xs font-medium text-stone-300 uppercase tracking-wider mt-0.5">Hall Seating</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <p className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#D4AF37] font-num">300</p>
              <p className="text-[10px] sm:text-xs font-medium text-stone-300 uppercase tracking-wider mt-0.5">Dining Seating</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <p className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#D4AF37] font-num">11</p>
              <p className="text-[10px] sm:text-xs font-medium text-stone-300 uppercase tracking-wider mt-0.5">A/C Guest Rooms</p>
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM FLOATING BAR & SCROLL CHEVRON */}
      <div className="relative z-10 py-3.5 px-4 border-t border-white/10 bg-[#0A0908]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-2.5">
          
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 text-stone-300">
              <CheckCircle2 className="w-4 h-4 text-[#7D9B6A]" />
              <span>Direct Booking Verified</span>
            </span>
            <span className="hidden sm:inline text-stone-600">•</span>
            <span className="flex items-center space-x-1.5 text-stone-300">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>No Agent Markup</span>
            </span>
          </div>

          <button
            onClick={scrollToStory}
            className="flex items-center space-x-2 text-[#D4AF37] hover:text-white transition-colors cursor-pointer text-xs uppercase tracking-widest font-semibold"
          >
            <span>EXPLORE OUR HERITAGE</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-[#D4AF37]" />
          </button>

          <div className="hidden lg:flex items-center space-x-2 text-stone-300">
            <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
            <a href="tel:+919159277277" className="hover:text-[#D4AF37] transition-colors font-semibold">
              Manager hotline : +91 9159277277
            </a>
          </div>

        </div>
      </div>

    </div>
  );
};


