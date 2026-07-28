import React, { useState } from 'react';
import {
  FileText,
  Clock,
  ShieldCheck,
  Check,
  AlertTriangle,
  Info,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  PlusCircle,
  HelpCircle,
  DollarSign
} from 'lucide-react';

export const OFFICIAL_TARIFF_ITEMS = [
  {
    sno: 1,
    service: 'Marriage Hall Rent including Tables, Chairs, Kitchen utensils, Bride and Groom room',
    notes: '*GST 18% additional*',
    price: 225000,
    priceDisplay: '₹2,25,000',
    highlight: true,
  },
  {
    sno: 2,
    service: 'Cleaning Charges, Garbage disposal + Corporation charge',
    notes: '11 persons – ₹1,500 each + ₹3,500 Corporation fee',
    price: 20000,
    priceDisplay: '₹20,000',
  },
  {
    sno: 3,
    service: 'Elevation lights',
    notes: 'Architectural grand exterior illumination',
    price: 8000,
    priceDisplay: '₹8,000',
  },
  {
    sno: 4,
    service: 'Security – 5 nos',
    notes: '3 for Reception and 2 for Muhurtham – ₹1,000 each',
    price: 5000,
    priceDisplay: '₹5,000',
  },
  {
    sno: 5,
    service: 'Electricity deposit',
    notes: 'Adjustable deposit @ ₹25/Unit based on meter reading',
    price: 10000,
    priceDisplay: '₹10,000',
  },
  {
    sno: 6,
    service: 'Standby generator setup',
    notes: 'Heavy-duty acoustic generator standby charge',
    price: 4000,
    priceDisplay: '₹4,000',
  },
  {
    sno: 7,
    service: 'A/C - 8 Hours (₹6,500/hr) based on usage',
    notes: '4 hours Reception & 4 hours Muhurtham',
    price: 52000,
    priceDisplay: '₹52,000',
  },
];

export const ADD_ON_SERVICES = [
  { name: 'Triple occupancy rooms (6 nos)', rate: '₹2,000 / room', unitCost: 2000, isOptional: false },
  { name: '8-Person occupancy room (3 nos)', rate: '₹3,000 / room', unitCost: 3000, isOptional: false },
  { name: 'Decoration package (Reception + Muhurtham + Entrance)', rate: 'Starts from ₹1,50,000', unitCost: 150000, isOptional: true },
  { name: 'LPG Gas cylinder (Venue provided)', rate: '₹2,100–₹2,200 / cylinder', unitCost: 2200, isOptional: true, note: 'Prevailing market rate' },
  { name: 'Generator running charge', rate: '₹1,500 / hour', unitCost: 1500, isOptional: true },
  { name: '2 LED Screens (Reception)', rate: '₹10,000', unitCost: 10000, isOptional: true },
  { name: '2 LED Screens (Reception & Muhurtham)', rate: '₹20,000', unitCost: 20000, isOptional: true },
  { name: 'Traditional banana trees', rate: '₹2,500', unitCost: 2500, isOptional: true },
  { name: 'Valet drivers', rate: '₹1,000 / driver / session', unitCost: 1000, isOptional: true },
  { name: 'Additional security personnel', rate: '₹1,000 / person / session', unitCost: 1000, isOptional: true },
];

export const VENUE_RULES = [
  {
    title: 'Strict Pure Vegetarian Policy',
    desc: 'Non-Veg food is strictly NOT allowed inside the hall or kitchen premises under any circumstances.',
    alert: true,
  },
  {
    title: 'DJ & Light Music Time Limit',
    desc: 'DJ sound systems and light music performances are allowed strictly only till 10:00 PM.',
    alert: false,
  },
  {
    title: 'Gas Cylinder Restriction',
    desc: 'Outside gas cylinders strictly NOT allowed. Venue supplies cylinders at market price (₹2,100 - ₹2,200 per cylinder) on event day.',
    alert: true,
  },
  {
    title: 'Mandatory Caution Deposit & Handover',
    desc: 'Keys and cooking vessels will ONLY be handed over after clearing full payment including mandatory refundable caution deposit of ₹20,000.',
    alert: false,
  },
  {
    title: 'Damage & Usage Deduction Policy',
    desc: 'Any damages to property or extra usage of AC / Generator will be appropriately deducted from the ₹20,000 caution deposit.',
    alert: false,
  },
  {
    title: 'Vendor Policy',
    desc: 'Outside flower decorators / vendors are strictly not encouraged at the venue to preserve decor standards.',
    alert: false,
  },
  {
    title: 'Non-Refundable Booking Policy',
    desc: 'Booking advance amount is strictly non-refundable upon confirmation.',
    alert: true,
  },
];

export const TariffCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tariff' | 'addons' | 'pg' | 'terms'>('tariff');

  const baseSubtotal = OFFICIAL_TARIFF_ITEMS.reduce((sum, item) => sum + item.price, 0);
  const gstAmount = Math.round(225000 * 0.18); // 18% GST on Hall rent ₹2,25,000
  const grandBaseTotal = baseSubtotal + gstAmount;

  return (
    <section id="tariff-section" className="py-16 bg-handmade-paper transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-[rgba(255,255,255,0.7)] backdrop-blur-md border border-[rgba(199,168,109,0.35)] text-xs font-medium text-[#9B7A46] mb-3 shadow-sm">
            <FileText className="w-3.5 h-3.5 text-[#C7A86D]" />
            <span className="uppercase tracking-widest text-[10px] font-semibold">Official 24-Hour Tariff Quote & Payment Gateway</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2E2A26]">
            Transparent Investment & Deluxe Accommodations
          </h2>
          <p className="mt-2 text-[#6F655B] text-sm leading-relaxed">
            Itemized investment structure with zero hidden fees. Instant online advance reservation via Payment Gateway (PG) with UPI, Cards & NetBanking.
          </p>
        </div>

        {/* Tab Switcher - Rounded Pill Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-[rgba(255,255,255,0.6)] backdrop-blur-2xl inline-flex p-1.5 rounded-full border border-[rgba(199,168,109,0.3)] shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex-wrap justify-center gap-1">
            <button
              onClick={() => setActiveTab('tariff')}
              className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'tariff'
                  ? 'btn-gold shadow-md'
                  : 'text-[#2E2A26] hover:text-[#C7A86D] hover:bg-white/60'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Standard Tariff (24 Hrs)</span>
            </button>

            <button
              onClick={() => setActiveTab('addons')}
              className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'addons'
                  ? 'btn-gold shadow-md'
                  : 'text-[#2E2A26] hover:text-[#C7A86D] hover:bg-white/60'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Additional Services</span>
            </button>

            <button
              onClick={() => setActiveTab('pg')}
              className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'pg'
                  ? 'btn-gold shadow-md'
                  : 'text-[#2E2A26] hover:text-[#C7A86D] hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>PG Payment & Accommodations</span>
            </button>

            <button
              onClick={() => setActiveTab('terms')}
              className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'terms'
                  ? 'btn-gold shadow-md'
                  : 'text-[#2E2A26] hover:text-[#C7A86D] hover:bg-white/60'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Terms & Rules</span>
            </button>
          </div>
        </div>

        {/* TAB 1: STANDARD TARIFF TABLE */}
        {activeTab === 'tariff' && (
          <div className="glass-card rounded-[24px] overflow-hidden transition-all animate-fade-in p-6 sm:p-8 space-y-6">
            
            {/* Special Rates for Brahmin Weddings Callout Banner */}
            <div className="p-6 rounded-[20px] bg-gradient-to-r from-[rgba(245,239,230,0.95)] via-[#FFFDF9] to-[rgba(245,239,230,0.95)] border-2 border-[#C7A86D] shadow-md flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#9B7A46] text-white font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-bl-lg shadow-2xs">
                SPECIAL OFFER
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-[#C7A86D]/20 border border-[#C7A86D]/50 flex items-center justify-center text-[#9B7A46] shrink-0 mt-1">
                  <Sparkles className="w-6 h-6 text-[#C7A86D]" />
                </div>
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <span>Vedic & Vaithika Muhurtham</span>
                  </div>
                  <h4 className="text-xl font-serif font-bold text-[#2E2A26]">
                    Special Rates for Brahmin Weddings
                  </h4>
                  <p className="text-xs text-[#6F655B] mt-1 max-w-2xl leading-relaxed">
                    Customized tariff packages for traditional Tamil Brahmin marriages (covering Vrutham, Janavasam, Muhurtham & Oonjal ceremonies). Includes early morning Muhurtham hall access, dedicated 100% Pure Veg steam kitchen, 300-seat banana leaf dining hall, and 11 AC guest rooms.
                  </p>
                </div>
              </div>

              <div className="text-center md:text-right shrink-0 bg-white/80 p-3.5 rounded-[16px] border border-[rgba(199,168,109,0.35)] w-full md:w-auto shadow-2xs">
                <p className="text-[10px] text-[#9B7A46] font-bold uppercase tracking-widest">Brahmin Package Rates</p>
                <p className="text-lg font-serif font-bold text-[#2E2A26]">Exclusive Discounts Available</p>
                <a
                  href="tel:+919159277277"
                  className="mt-1.5 inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-full bg-[#9B7A46] text-white text-xs font-bold hover:bg-[#826122] transition-colors"
                >
                  <span>Inquire Brahmin Tariff</span>
                </a>
              </div>
            </div>

            {/* Translucent Frosted Glass Hero Card */}
            <div className="bg-[rgba(245,239,230,0.7)] backdrop-blur-2xl p-6 sm:p-8 rounded-[20px] border border-[rgba(199,168,109,0.35)] flex flex-col sm:flex-row items-center justify-between gap-6 mb-2">
              <div className="flex items-center space-x-4 text-center sm:text-left">
                <div className="w-14 h-14 rounded-2xl bg-[rgba(255,255,255,0.8)] border border-[rgba(199,168,109,0.4)] flex items-center justify-center text-[#C7A86D] shadow-sm shrink-0">
                  <Clock className="w-7 h-7 text-[#C7A86D]" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-[#2E2A26]">Standard 24-Hour Palace Package</h3>
                  <p className="text-xs text-[#6F655B] mt-1">Slot Duration: <strong className="text-[#2E2A26]">12:00 PM (Start) to 12:00 PM (Next Day Exit)</strong></p>
                </div>
              </div>

              <div className="px-6 py-3 rounded-[16px] bg-[rgba(255,255,255,0.8)] border border-[rgba(199,168,109,0.4)] text-right shadow-sm">
                <p className="text-[10px] text-[#9B7A46] uppercase tracking-widest font-semibold">Standard Base Package</p>
                <p className="text-3xl font-serif font-bold text-[#2E2A26] font-num">₹3,24,000 <span className="text-xs text-[#6F655B] font-sans font-normal">+ 18% GST</span></p>
              </div>
            </div>

            <div className="w-full h-[1px] bg-[rgba(199,168,109,0.25)] my-6" />

            {/* Tariff Table with subtle ivory rows & thin gold separators */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[rgba(199,168,109,0.3)] text-[#9B7A46] font-serif uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-16 text-center font-bold">S.NO</th>
                    <th className="py-3 px-4 font-bold">SERVICE / DESCRIPTION</th>
                    <th className="py-3 px-4 text-right font-bold w-36">PRICE (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(199,168,109,0.15)] text-[#2E2A26]">
                  {OFFICIAL_TARIFF_ITEMS.map((item, idx) => (
                    <tr
                      key={item.sno}
                      className={
                        idx % 2 === 0
                          ? 'bg-[rgba(245,239,230,0.35)] hover:bg-[rgba(255,255,255,0.7)] transition-colors'
                          : 'bg-transparent hover:bg-[rgba(255,255,255,0.7)] transition-colors'
                      }
                    >
                      <td className="py-4 px-4 text-center font-semibold text-[#9B7A46] font-num">
                        {item.sno}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-[#2E2A26]">
                          {item.service}
                        </div>
                        {item.notes && (
                          <div className="text-[11px] text-[#9B7A46] font-normal mt-0.5">
                            {item.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold font-num text-[#2E2A26] text-base">
                        {item.priceDisplay}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Subtotal & GST Calculation Box */}
              <div className="mt-8 p-6 rounded-[20px] bg-[rgba(245,239,230,0.5)] border border-[rgba(199,168,109,0.3)] space-y-3">
                <div className="flex justify-between items-center text-xs text-[#6F655B]">
                  <span>Subtotal Base Services (1 to 7)</span>
                  <span className="font-num font-semibold text-sm text-[#2E2A26]">₹{baseSubtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-xs text-[#9B7A46] font-medium">
                  <span>GST 18% Additional (Applicable on Hall Rent ₹2,25,000)</span>
                  <span className="font-num font-semibold text-sm">+ ₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-3 border-t border-[rgba(199,168,109,0.25)] flex justify-between items-center text-sm font-bold text-[#2E2A26]">
                  <span className="font-serif text-lg text-[#2E2A26]">Total Base Tariff Estimate</span>
                  <span className="font-num text-2xl font-bold text-[#C7A86D]">
                    ₹{grandBaseTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-4 rounded-[16px] bg-[rgba(255,255,255,0.75)] border border-[rgba(199,168,109,0.35)] flex items-start space-x-3 text-xs mt-3">
                  <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-[#C7A86D]" />
                  <div>
                    <p className="font-semibold text-[#2E2A26] text-sm">Mandatory Caution Deposit: ₹20,000</p>
                    <p className="text-[#6F655B] text-[11px] mt-0.5 leading-relaxed">
                      Keys and cooking vessels will only be handed over after clearing the full & final payment including the mandatory caution deposit of ₹20,000. Refunded post-event after inspecting property and AC meter usage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADDITIONAL SERVICES & RATES */}
        {activeTab === 'addons' && (
          <div className="glass-card rounded-[24px] p-6 sm:p-8 transition-all animate-fade-in space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-[rgba(199,168,109,0.25)]">
              <PlusCircle className="w-6 h-6 text-[#C7A86D]" />
              <div>
                <h3 className="text-xl font-serif font-bold text-[#2E2A26]">Additional Charges & Optional Add-ons</h3>
                <p className="text-xs text-[#6F655B]">Customizable facilities available upon request for your marriage event</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ADD_ON_SERVICES.map((addon, index) => (
                <div
                  key={index}
                  className="p-4 rounded-[18px] bg-[rgba(255,255,255,0.7)] border border-[rgba(199,168,109,0.25)] hover:border-[rgba(199,168,109,0.5)] transition-all flex items-center justify-between shadow-xs gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.6px] font-sans ${
                        addon.isOptional
                          ? 'bg-[rgba(199,168,109,0.15)] text-[#735826] border border-[rgba(199,168,109,0.3)]'
                          : 'bg-[rgba(125,155,106,0.15)] text-[#3e562e] border border-[rgba(125,155,106,0.3)]'
                      }`}>
                        {addon.isOptional ? 'OPTIONAL' : 'STANDARD'}
                      </span>
                      <span className="text-[15px] font-medium text-[#2A2216] font-sans">{addon.name}</span>
                    </div>
                    {addon.note && (
                      <p className="text-[12.5px] text-[#6B5F4D] font-sans pl-1">{addon.note}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[15px] font-semibold text-[#2A2216] font-num block">
                      {addon.rate}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-[16px] bg-[rgba(245,239,230,0.6)] border border-[rgba(199,168,109,0.3)] text-xs text-[#6F655B] space-y-1">
              <p className="font-semibold text-[#2E2A26]">💡 Add-on Notes:</p>
              <p>• LPG Commercial Cooking Cylinders will be charged at exact prevailing market price on event day (₹2,100 - ₹2,200 per cylinder).</p>
              <p>• Decoration Package starts at ₹1,50,000 including Reception, Muhurtham stage and main entrance gate setup.</p>
            </div>
          </div>
        )}

        {/* TAB 3: PG ONLINE PAYMENT GATEWAY & PG GUEST ROOMS */}
        {activeTab === 'pg' && (
          <div className="glass-card rounded-[24px] p-6 sm:p-8 transition-all animate-fade-in space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-[rgba(199,168,109,0.25)]">
              <ShieldCheck className="w-6 h-6 text-[#C7A86D]" />
              <div>
                <h3 className="text-xl font-serif font-bold text-[#2E2A26]">Payment Gateway (PG) & PG Deluxe Guest Accommodations</h3>
                <p className="text-xs text-[#6F655B]">Secure online payment authorization and PG guest room facilities at KM PALACE</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PG Payment Gateway Box */}
              <div className="p-6 rounded-[20px] bg-[rgba(255,255,255,0.75)] border border-[rgba(199,168,109,0.35)] space-y-4 shadow-sm">
                <div className="flex items-center space-x-2 text-[#2E2A26] font-semibold text-sm">
                  <Zap className="w-4 h-4 text-[#C7A86D]" />
                  <h4>Online Payment Gateway (PG) Features</h4>
                </div>
                <ul className="space-y-3 text-xs text-[#6F655B]">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7D9B6A] shrink-0 mt-0.5" />
                    <span><strong>Instant UPI / QR Code:</strong> Pay via Google Pay, PhonePe, Paytm, or BHIM directly to VPA <code className="text-[#2E2A26]">kmpalace@upi</code>.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7D9B6A] shrink-0 mt-0.5" />
                    <span><strong>Cards & NetBanking:</strong> Secure instant debit/credit card processing with immediate digital receipt generation.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7D9B6A] shrink-0 mt-0.5" />
                    <span><strong>Flexible Booking Deposit:</strong> Pay ₹50,000 booking advance or ₹20,000 caution deposit to lock the dates instantly.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7D9B6A] shrink-0 mt-0.5" />
                    <span><strong>Automatic Email Confirmation:</strong> Instant digital invoice & reservation voucher dispatched to <code className="text-[#2E2A26]">Kannan.d26@gmail.com</code>.</span>
                  </li>
                </ul>
              </div>

              {/* PG Deluxe Rooms Box */}
              <div className="p-6 rounded-[20px] bg-[rgba(255,255,255,0.75)] border border-[rgba(199,168,109,0.35)] space-y-4 shadow-sm">
                <div className="flex items-center space-x-2 text-[#2E2A26] font-semibold text-sm">
                  <Sparkles className="w-4 h-4 text-[#C7A86D]" />
                  <h4>PG & Guest Accommodation Facilities</h4>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-[14px] bg-[rgba(245,239,230,0.5)] border border-[rgba(199,168,109,0.25)] flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#2E2A26]">6 Triple Occupancy PG Deluxe Rooms</p>
                      <p className="text-[11px] text-[#6F655B]">Air-conditioned, attached bath, keyless entry</p>
                    </div>
                    <span className="font-num font-bold text-sm text-[#C7A86D]">₹2,000 / room</span>
                  </div>

                  <div className="p-3.5 rounded-[14px] bg-[rgba(245,239,230,0.5)] border border-[rgba(199,168,109,0.25)] flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#2E2A26]">3 Eight-Person Group PG Rooms</p>
                      <p className="text-[11px] text-[#6F655B]">Spacious hall suite for extended family</p>
                    </div>
                    <span className="font-num font-bold text-sm text-[#C7A86D]">₹3,000 / room</span>
                  </div>

                  <p className="text-[11px] text-[#6F655B] italic pt-1">
                    * Bride & Groom air-conditioned rooms are complimentary with the standard hall rental package.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TERMS & VENUE RULES */}
        {activeTab === 'terms' && (
          <div className="glass-card rounded-[24px] p-6 sm:p-8 transition-all animate-fade-in space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-[rgba(199,168,109,0.25)]">
              <Lock className="w-6 h-6 text-[#C7A86D]" />
              <div>
                <h3 className="text-xl font-serif font-bold text-[#2E2A26]">Venue Terms & Booking Conditions</h3>
                <p className="text-xs text-[#6F655B]">Important rules and operational policies for KM PALACE wedding hall</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VENUE_RULES.map((rule, index) => (
                <div
                  key={index}
                  className="p-5 rounded-[18px] bg-[rgba(255,255,255,0.7)] border border-[rgba(199,168,109,0.25)] space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center space-x-2">
                    {rule.alert ? (
                      <AlertTriangle className="w-4 h-4 text-[#C7A86D] shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-[#7D9B6A] shrink-0" />
                    )}
                    <h4 className="text-sm font-semibold text-[#2E2A26]">
                      {rule.title}
                    </h4>
                  </div>
                  <p className="text-xs text-[#6F655B] leading-relaxed pl-6">
                    {rule.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-[16px] bg-[rgba(245,239,230,0.8)] border border-[rgba(199,168,109,0.35)] text-center text-xs font-semibold text-[#2E2A26] space-y-1">
              <p className="font-serif text-sm text-[#C7A86D]">KM PALACE ROYAL WEDDING & CONVENTION HALL</p>
              <p className="text-[#6F655B] font-normal">All bookings are subject to approval and clearance of initial booking advance & caution deposit.</p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
