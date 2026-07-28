import React from 'react';
import { Clock, AlertTriangle, ShieldCheck, Check, Sparkles, ArrowRight } from 'lucide-react';

export const MuhurthamRuleBanner: React.FC = () => {
  return (
    <section id="rules-section" className="py-16 bg-[rgba(245,239,230,0.4)] border-y border-[rgba(199,168,109,0.25)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-white/80 border border-[rgba(199,168,109,0.35)] text-xs font-semibold text-[#9B7A46] mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C7A86D]" />
            <span className="uppercase tracking-widest text-[10px]">KM PALACE Booking Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#2E2A26]">
            Intelligent Muhurtham Conflict Prevention
          </h2>
          <p className="mt-2 text-[#6F655B] text-sm leading-relaxed max-w-2xl mx-auto font-normal">
            To eliminate event overlap and ensure seamless stage setup, catering preparation, and guest reception, our intelligent engine evaluates your Muhurtham time automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Rule 1: Early Muhurtham (< 07:00 AM) */}
          <div className="glass-card p-8 rounded-[24px] border border-[rgba(199,168,109,0.35)] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-[16px] bg-[linear-gradient(135deg,#E8D8B0_0%,#C7A86D_100%)] text-[#2E2A26] flex items-center justify-center font-bold text-lg shadow-xs">
                  <Clock className="w-6 h-6 text-[#2E2A26]" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[rgba(199,168,109,0.2)] text-[#9B7A46] font-semibold text-[11px] border border-[rgba(199,168,109,0.3)]">
                  EARLY MUHURTHAM RULE
                </span>
              </div>

              <div>
                <h3 className="text-xl font-serif font-semibold text-[#2E2A26]">
                  Muhurtham Before 07:00 AM
                </h3>
                <p className="text-xs text-[#9B7A46] font-medium mt-0.5 font-num">
                  e.g., 04:00 AM, 05:00 AM, 06:00 AM, 06:30 AM
                </p>
              </div>

              <div className="p-4 rounded-[16px] bg-[rgba(245,239,230,0.7)] border border-[rgba(199,168,109,0.3)] space-y-2 my-5 text-xs">
                <p className="font-semibold text-[#2E2A26] flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C7A86D]" />
                  <span>SYSTEM ACTION: AUTOMATICALLY BLOCKS BOTH DATES</span>
                </p>
                <p className="text-[#6F655B] leading-relaxed">
                  Because guest arrivals, stage floral setup, and kitchen preparation start the previous evening, the booking engine reserves both days:
                </p>
                <div className="flex items-center space-x-2 pt-1 font-semibold text-[#9B7A46]">
                  <span>Previous Setup Day</span>
                  <ArrowRight className="w-4 h-4 text-[#C7A86D]" />
                  <span>Marriage Date</span>
                </div>
              </div>

              <div className="text-xs text-[#6F655B] space-y-1 bg-white/70 p-4 rounded-[16px] border border-[rgba(199,168,109,0.25)]">
                <p className="font-semibold text-[#2E2A26]">Example Scenario:</p>
                <p>Marriage Date: <strong className="text-[#2E2A26] font-num">21 July 2026</strong> | Muhurtham: <strong className="text-[#2E2A26] font-num">06:00 AM</strong></p>
                <p className="text-[#9B7A46] font-semibold pt-1">
                  🔒 Blocked Dates: <span className="font-num">20 July 2026</span> AND <span className="font-num">21 July 2026</span> exclusively.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[rgba(199,168,109,0.25)] text-[11px] text-[#A09384] flex items-center justify-between">
              <span>Guarantees exclusive preparation time</span>
              <ShieldCheck className="w-4 h-4 text-[#7D9B6A]" />
            </div>
          </div>

          {/* Rule 2: Standard Muhurtham (>= 07:00 AM) */}
          <div className="glass-card p-8 rounded-[24px] border border-[rgba(199,168,109,0.35)] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-[16px] bg-[rgba(125,155,106,0.15)] text-[#7D9B6A] border border-[rgba(125,155,106,0.3)] flex items-center justify-center font-bold text-lg shadow-xs">
                  <Check className="w-6 h-6 text-[#7D9B6A]" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[rgba(125,155,106,0.15)] text-[#7D9B6A] font-semibold text-[11px] border border-[rgba(125,155,106,0.3)]">
                  STANDARD MUHURTHAM RULE
                </span>
              </div>

              <div>
                <h3 className="text-xl font-serif font-semibold text-[#2E2A26]">
                  Muhurtham After 07:00 AM
                </h3>
                <p className="text-xs text-[#7D9B6A] font-medium mt-0.5 font-num">
                  e.g., 08:00 AM, 09:30 AM, 11:00 AM, 06:00 PM
                </p>
              </div>

              <div className="p-4 rounded-[16px] bg-[rgba(125,155,106,0.08)] border border-[rgba(125,155,106,0.25)] space-y-2 my-5 text-xs">
                <p className="font-semibold text-[#2E2A26] flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#7D9B6A]" />
                  <span>SYSTEM ACTION: STANDARD 24-HOUR BLOCK</span>
                </p>
                <p className="text-[#6F655B] leading-relaxed">
                  Standard hall booking slot applies (12:00 PM previous day to 12:00 PM on marriage day).
                </p>
                <div className="flex items-center space-x-2 pt-1 font-semibold text-[#7D9B6A]">
                  <span>Single Marriage Date Blocked</span>
                </div>
              </div>

              <div className="text-xs text-[#6F655B] space-y-1 bg-white/70 p-4 rounded-[16px] border border-[rgba(199,168,109,0.25)]">
                <p className="font-semibold text-[#2E2A26]">Example Scenario:</p>
                <p>Marriage Date: <strong className="text-[#2E2A26] font-num">21 July 2026</strong> | Muhurtham: <strong className="text-[#2E2A26] font-num">09:30 AM</strong></p>
                <p className="text-[#7D9B6A] font-semibold pt-1">
                  🔒 Blocked Date: <span className="font-num">21 July 2026</span> slot reserved.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[rgba(199,168,109,0.25)] text-[11px] text-[#A09384] flex items-center justify-between">
              <span>Standard 24-hour venue slot</span>
              <ShieldCheck className="w-4 h-4 text-[#7D9B6A]" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
