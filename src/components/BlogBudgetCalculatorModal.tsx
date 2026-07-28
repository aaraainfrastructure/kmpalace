import React, { useState } from 'react';
import { X, Calculator, IndianRupee, Send, ShieldCheck, Phone } from 'lucide-react';

interface BlogBudgetCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlogBudgetCalculatorModal: React.FC<BlogBudgetCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [guests, setGuests] = useState(500);
  const [days, setDays] = useState(2);
  const [decorTier, setDecorTier] = useState<'standard' | 'grand' | 'royal'>('grand');
  const [cateringTier, setCateringTier] = useState<'standard' | 'deluxe' | 'royal'>('deluxe');

  if (!isOpen) return null;

  // Pricing calculation formulas
  const hallCost = days === 1 ? 140000 : 250000;
  
  const cateringCostPerLeaf = cateringTier === 'standard' ? 450 : cateringTier === 'deluxe' ? 650 : 900;
  // 2 meals for 2 days or 1 meal for 1 day
  const mealsCount = days === 1 ? 1 : 2.5;
  const totalCatering = Math.round(guests * cateringCostPerLeaf * mealsCount);

  const decorCost = decorTier === 'standard' ? 50000 : decorTier === 'grand' ? 100000 : 200000;
  const photoCost = 100000;
  const attireCost = 150000;

  const totalEstimate = hallCost + totalCatering + decorCost + photoCost + attireCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[24px] max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-[#C7A86D]/40 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2E2A26] to-[#1F1C19] text-white p-6 flex items-center justify-between border-b border-[#C7A86D]/30">
          <div>
            <span className="text-[#C7A86D] text-[10px] uppercase font-extrabold tracking-widest block mb-1 flex items-center space-x-1">
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive Financial Tool</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Chennai Wedding Budget Calculator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Controls */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-[#2E2A26]">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-[#2E2A26]">Expected Guests Count</label>
              <span className="text-xs font-extrabold text-[#C7A86D] font-num">{guests} Guests</span>
            </div>
            <input
              type="range"
              min="200"
              max="2000"
              step="50"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full accent-[#C7A86D] cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#2E2A26] block mb-1.5">Wedding Duration</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDays(1)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  days === 1
                    ? 'bg-[#2E2A26] text-[#C7A86D] border-[#C7A86D]'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                1 Day (Reception / Muhurtham)
              </button>
              <button
                type="button"
                onClick={() => setDays(2)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  days === 2
                    ? 'bg-[#2E2A26] text-[#C7A86D] border-[#C7A86D]'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                2 Days (Reception + Muhurtham)
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#2E2A26] block mb-1.5">Pure Veg Catering Tier (Per Leaf)</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'standard', label: 'Standard (₹450)', desc: '18 Items' },
                { id: 'deluxe', label: 'Deluxe (₹650)', desc: '24 Items + Sweets' },
                { id: 'royal', label: 'Royal (₹900)', desc: '30 Items + Live Stalls' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCateringTier(item.id as any)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    cateringTier === item.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#2E2A26] block mb-1.5">Stage Decoration Tier</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'standard', label: 'Classic Floral', price: '₹50,000' },
                { id: 'grand', label: 'Grand Stage', price: '₹1,00,000' },
                { id: 'royal', label: 'Royal LED & Crystal', price: '₹2,00,000' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDecorTier(item.id as any)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    decorTier === item.id
                      ? 'bg-[#2E2A26] border-[#C7A86D] text-[#C7A86D] font-bold'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="text-[10px] text-gray-500 font-num mt-0.5">{item.price}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown Summary Box */}
          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E5D9C5] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">KM PALACE Hall Rental & 11 AC Rooms:</span>
              <span className="font-bold font-num">₹{hallCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pure Veg Catering ({guests} guests):</span>
              <span className="font-bold font-num">₹{totalCatering.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Stage Decoration & Lighting:</span>
              <span className="font-bold font-num">₹{decorCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Photography, Makeup & Attire Est:</span>
              <span className="font-bold font-num">₹2,50,000</span>
            </div>

            <div className="pt-2 border-t border-[#E5D9C5] flex justify-between items-center text-sm">
              <span className="font-extrabold text-[#2E2A26]">Estimated Total Budget:</span>
              <span className="font-black text-emerald-800 text-base font-num">
                ₹{totalEstimate.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#FDFBF7] border-t border-[#E5D9C5]/50 flex items-center justify-between">
          <a
            href="https://wa.me/919159277277?text=Hello%20KM%20Palace%2C%20I%20used%20your%20wedding%20budget%20calculator%20for%20a%20quote."
            target="_blank"
            rel="noreferrer"
            className="btn-gold px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>Send Estimate to WhatsApp</span>
          </a>
          <a
            href="tel:+919159277277"
            className="text-xs font-bold text-[#2E2A26] hover:text-[#C7A86D] flex items-center space-x-1"
          >
            <Phone className="w-3.5 h-3.5 text-[#C7A86D]" />
            <span>+91 9159277277</span>
          </a>
        </div>
      </div>
    </div>
  );
};
