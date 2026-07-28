import React from 'react';
import { Utensils, Music, HeartHandshake, ShieldCheck, CheckCircle2, Ban, DollarSign, Sparkles, Phone, MessageCircle } from 'lucide-react';

interface ExperienceProps {
  onBookNow: () => void;
}

export const ExperienceSection: React.FC<ExperienceProps> = ({ onBookNow }) => {
  return (
    <section className="py-20 bg-handmade-paper border-t border-[rgba(199,168,109,0.25)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/80 border border-[rgba(199,168,109,0.35)] text-xs font-semibold text-[#9B7A46] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C7A86D]" />
            <span className="uppercase tracking-widest text-[10px]">KM Palace Hospitality</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2E2A26]">
            The Experience
          </h2>
          <p className="text-[#6F655B] text-sm sm:text-base font-serif italic">
            Exceptional hospitality & seamless celebrations
          </p>
        </div>

        {/* 3 Core Experience Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-card p-6 rounded-[24px] border border-[rgba(199,168,109,0.3)] shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(199,168,109,0.15)] border border-[rgba(199,168,109,0.3)] flex items-center justify-center text-[#9B7A46]">
              <Utensils className="w-6 h-6 text-[#C7A86D]" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#2E2A26]">
              In-House Catering On Request
            </h3>
            <p className="text-xs text-[#6F655B] leading-relaxed">
              In-house catering team serves a variety of delicious vegetarian cuisines. Transparent pricing and justified value for every guest.
            </p>
          </div>

          <div className="glass-card p-6 rounded-[24px] border border-[rgba(199,168,109,0.3)] shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(199,168,109,0.15)] border border-[rgba(199,168,109,0.3)] flex items-center justify-center text-[#9B7A46]">
              <Music className="w-6 h-6 text-[#C7A86D]" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#2E2A26]">
              In-House DJ On Request
            </h3>
            <p className="text-xs text-[#6F655B] leading-relaxed">
              Professional DJ setup and sound systems keep the energy high. DJ and light music allowed till 10 PM in compliance with venue policies and local law & order.
            </p>
          </div>

          <div className="glass-card p-6 rounded-[24px] border border-[rgba(199,168,109,0.3)] shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(199,168,109,0.15)] border border-[rgba(199,168,109,0.3)] flex items-center justify-center text-[#9B7A46]">
              <HeartHandshake className="w-6 h-6 text-[#C7A86D]" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#2E2A26]">
              End To End Wedding Service
            </h3>
            <p className="text-xs text-[#6F655B] leading-relaxed">
              Professional staff takes care of every little detail so you can focus on celebrating with your loved ones.
            </p>
          </div>

        </div>

        {/* Venue Policies Grid Box */}
        <div className="glass-card p-8 rounded-[32px] border border-[rgba(199,168,109,0.35)] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[rgba(199,168,109,0.25)]">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#2E2A26]">
                Venue Rules & Policy Summary
              </h3>
              <p className="text-xs text-[#6F655B]">
                Clear rules for smooth event execution
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-white/80 border border-[rgba(199,168,109,0.3)] text-xs font-bold text-[#9B7A46]">
              KM Palace Operational Norms
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            
            <div className="p-4 rounded-[16px] bg-white/70 border border-amber-200/80 flex items-center space-x-3">
              <Ban className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <p className="font-bold text-[#2E2A26]">Decorators</p>
                <p className="text-[#6F655B] text-[11px]">Outside decorators strictly not allowed</p>
              </div>
            </div>

            <div className="p-4 rounded-[16px] bg-white/70 border border-amber-200/80 flex items-center space-x-3">
              <Ban className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <p className="font-bold text-[#2E2A26]">Outside DJ</p>
                <p className="text-[#6F655B] text-[11px]">Outside DJ strictly not allowed</p>
              </div>
            </div>

            <div className="p-4 rounded-[16px] bg-white/70 border border-emerald-200/80 flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-[#2E2A26]">Outside Food</p>
                <p className="text-[#6F655B] text-[11px]">Outside Pure Veg food allowed (Spacious kitchen)</p>
              </div>
            </div>

            <div className="p-4 rounded-[16px] bg-white/70 border border-rose-200/80 flex items-center space-x-3">
              <Ban className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold text-[#2E2A26]">Alcohol Policy</p>
                <p className="text-[#6F655B] text-[11px]">Outside Alcohol strictly NOT allowed</p>
              </div>
            </div>

            <div className="p-4 rounded-[16px] bg-white/70 border border-emerald-200/80 flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-[#2E2A26]">Cuisine Preference</p>
                <p className="text-[#6F655B] text-[11px]">Strictly 100% Pure Veg Only</p>
              </div>
            </div>

            <div className="p-4 rounded-[16px] bg-white/70 border border-amber-200/80 flex items-center space-x-3">
              <Music className="w-5 h-5 text-[#C7A86D] shrink-0" />
              <div>
                <p className="font-bold text-[#2E2A26]">Music Timings</p>
                <p className="text-[#6F655B] text-[11px]">DJ & Light music allowed till 10 PM</p>
              </div>
            </div>

          </div>
        </div>

        {/* Ready to Celebrate Box */}
        <div className="bg-[#2E2A26] text-[#E8D8B0] p-8 sm:p-10 rounded-[32px] border border-[rgba(199,168,109,0.4)] shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left">
            <h3 className="text-2xl font-serif font-bold text-white">
              Ready to celebrate with us?
            </h3>
            <p className="text-xs sm:text-sm text-[#D4C5A9] max-w-xl leading-relaxed">
              Book online via kmpalace.com or Mandap.com, or directly call / WhatsApp our hall booking desk for instant availability and tariff assistance.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href="tel:+919159277277"
              className="px-5 py-3 rounded-[16px] bg-[#3B352E] hover:bg-[#4A433A] text-white border border-[rgba(199,168,109,0.4)] text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-md"
            >
              <Phone className="w-4 h-4 text-[#C7A86D]" />
              <span>Call: 9159277277</span>
            </a>

            <a
              href="https://wa.me/919159277277?text=Hello%20KM%20PALACE%20team,%20I%20would%20like%20to%20book%20or%20inquire%20about%20hall%20availability."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-[16px] bg-[#128C7E] hover:bg-[#075E54] text-white font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-md"
            >
              <MessageCircle className="w-4 h-4 text-emerald-200" />
              <span>WhatsApp: 9159277277</span>
            </a>

            <button
              onClick={onBookNow}
              className="btn-gold px-6 py-3 rounded-[16px] text-xs font-bold uppercase tracking-widest cursor-pointer shadow-lg"
            >
              Book via kmpalace.com
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
