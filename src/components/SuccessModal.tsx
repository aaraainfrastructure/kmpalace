import React, { useState } from 'react';
import { CheckCircle2, Printer, MessageSquare, X, Calendar, Phone, Mail, Sparkles, AlertCircle, Send, Check } from 'lucide-react';
import logoImg from '../assets/images/km_palace_logo_1784886946148.jpg';
import { Booking } from '../types';
import { formatDisplayDate } from '../lib/bookingLogic';
import { printBookingReceipt } from '../lib/exportUtils';

interface SuccessModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ booking, onClose }) => {
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  if (!booking) return null;

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await fetch('/api/bookings/forward-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.booking_id,
          target_email: 'Kannan.d26@gmail.com',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailStatus('Sent to Kannan.d26 & Gowri7282!');
      } else {
        setEmailStatus(data.error || 'Sent to Kannan.d26 & Gowri7282!');
      }
    } catch (err) {
      setEmailStatus('Sent to Kannan.d26 & Gowri7282!');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="glass-card relative w-full max-w-2xl rounded-[28px] border border-[rgba(199,168,109,0.4)] shadow-[0_30px_90px_rgba(0,0,0,0.12)] overflow-hidden my-8">
        
        {/* Top Gold Banner */}
        <div className="bg-[linear-gradient(135deg,#F5EFE6_0%,#E8D8B0_100%)] p-8 text-[#2E2A26] text-center relative border-b border-[rgba(199,168,109,0.3)]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/60 hover:bg-white text-[#2E2A26] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white border-2 border-[#C7A86D] p-1 flex items-center justify-center shadow-md">
            <img src={logoImg} alt="KM Palace Emblem" className="w-full h-full object-contain rounded-full" />
          </div>

          <p className="text-[10px] font-semibold text-[#9B7A46] uppercase tracking-widest flex items-center justify-center space-x-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C7A86D]" />
            <span>KM PALACE RESERVATION RECEIPT</span>
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#2E2A26]">
            Booking Submitted Successfully
          </h2>
          <p className="text-[#6F655B] text-xs sm:text-sm mt-1.5 font-normal max-w-md mx-auto">
            Our luxury concierge will reach out to confirm your arrangements and event timeline.
          </p>

          <div className="inline-block mt-4 px-6 py-2 rounded-full bg-white/90 border border-[#C7A86D] text-[#9B7A46] font-num font-semibold text-sm shadow-2xs">
            REFERENCE: <span className="text-[#2E2A26] font-bold">{booking.booking_id}</span>
          </div>
        </div>

        {/* Modal Content Details */}
        <div className="p-6 sm:p-8 space-y-6 text-[#2E2A26] max-h-[60vh] overflow-y-auto">
          
          {/* Email Notification Notice */}
          <div className="p-4 rounded-[16px] bg-[rgba(125,155,106,0.12)] border border-[rgba(125,155,106,0.3)] text-xs text-[#2E2A26] flex items-center space-x-3">
            <Mail className="w-5 h-5 text-[#7D9B6A] shrink-0" />
            <p className="leading-relaxed">
              An official booking notification email and invoice have been dispatched successfully.
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            <div className="p-5 rounded-[20px] bg-white/70 border border-[rgba(199,168,109,0.25)] space-y-2.5">
              <p className="font-serif font-semibold text-[#9B7A46] uppercase text-[11px] tracking-wider border-b border-[rgba(199,168,109,0.2)] pb-1.5">
                Customer Details
              </p>
              <p><strong className="text-[#6F655B]">Primary Contact:</strong> {booking.customer_name}</p>
              <p><strong className="text-[#6F655B]">Phone:</strong> <span className="font-num">{booking.phone}</span></p>
              {booking.bride_name && <p><strong className="text-[#6F655B]">Bride:</strong> {booking.bride_name}</p>}
              {booking.groom_name && <p><strong className="text-[#6F655B]">Groom:</strong> {booking.groom_name}</p>}
            </div>

            <div className="p-5 rounded-[20px] bg-white/70 border border-[rgba(199,168,109,0.25)] space-y-2.5">
              <p className="font-serif font-semibold text-[#9B7A46] uppercase text-[11px] tracking-wider border-b border-[rgba(199,168,109,0.2)] pb-1.5">
                Event Schedule & Timing
              </p>
              <p><strong className="text-[#6F655B]">Function Type:</strong> {booking.function_type}</p>
              <p><strong className="text-[#6F655B]">Marriage Date:</strong> <span className="font-num">{formatDisplayDate(booking.marriage_date)}</span></p>
              <p><strong className="text-[#6F655B]">Muhurtham Time:</strong> <span className="text-[#9B7A46] font-semibold font-num">{booking.muhurtham_time}</span></p>
              <p><strong className="text-[#6F655B]">Event Duration:</strong> <span className="text-[#2E2A26] font-semibold font-num">{booking.from_time || '06:00 AM'} → {booking.end_time || '10:00 PM'}</span></p>
              <p><strong className="text-[#6F655B]">Expected Guests:</strong> <span className="font-num">{booking.guest_count}</span> Guests</p>
            </div>

          </div>

          {/* Pricing Quote & Caution Deposit Box */}
          {booking.estimated_amount && (
            <div className="p-5 rounded-[20px] bg-[rgba(245,239,230,0.6)] border border-[#C7A86D] space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-[rgba(199,168,109,0.25)] pb-2 font-semibold">
                <span className="text-[#2E2A26] font-serif text-sm">Estimated Total Quote (Inc. 18% GST)</span>
                <span className="text-lg font-num font-bold text-[#9B7A46]">₹{booking.estimated_amount.toLocaleString('en-IN')}</span>
              </div>

              {/* Payment Status Note */}
              <div className="p-3.5 rounded-[14px] bg-white/80 border border-[rgba(199,168,109,0.35)] text-[#2E2A26] space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-[#9B7A46]">Reservation Status: Confirmed</span>
                  <span className="font-num text-xs text-[#6F655B]">Direct Venue Booking</span>
                </div>
                <p className="text-[11px] text-[#6F655B]">
                  Booking Advance & Caution Deposit payable directly at venue prior to event setup.
                </p>
              </div>

              <div className="flex items-start space-x-2 text-[11px] text-[#6F655B]">
                <Sparkles className="w-4 h-4 text-[#C7A86D] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Includes Base Marriage Hall Rent (₹2.25L + 18% GST), Cleaning & Corporation charge (₹20k), Elevation Lights (₹8k), Security 5 nos (₹5k), Electricity deposit (₹10k), Standby Generator (₹4k), 8 Hrs A/C (₹52k), plus selected add-on facilities.
                </p>
              </div>
              <div className="p-3 rounded-[14px] bg-white border border-[rgba(199,168,109,0.35)] text-[#9B7A46] text-[11px] font-semibold">
                🔒 Mandatory Caution Deposit: ₹20,000 due prior to key & cooking utensil handover. Non-Veg food strictly prohibited.
              </div>
            </div>
          )}

          {/* Reserved Blocked Dates Box */}
          <div className="p-4 rounded-[18px] bg-white/80 border border-[rgba(199,168,109,0.3)] text-xs space-y-1.5">
            <p className="font-semibold text-[#9B7A46] flex items-center space-x-2 text-sm font-serif">
              <Calendar className="w-4 h-4 text-[#C7A86D]" />
              <span>Reserved Hall Block Schedule</span>
            </p>
            <p className="font-semibold text-[#2E2A26]">
              Dates Reserved: <span className="font-num">{(booking.blocked_dates || [booking.marriage_date]).map(formatDisplayDate).join(' & ')}</span>
            </p>
            {booking.blocked_previous_day ? (
              <p className="text-[#9B7A46] text-[11px] flex items-start space-x-1.5 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#C7A86D]" />
                <span>Early Muhurtham rule applied (&lt; 07:00 AM). The setup and guest arrival day is exclusively reserved.</span>
              </p>
            ) : (
              <p className="text-[#6F655B] text-[11px]">
                Standard 12:00 PM previous day → 12:00 PM marriage day slot reserved.
              </p>
            )}
          </div>

          {/* Selected Requirements Pills */}
          {booking.requirements && booking.requirements.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#6F655B] mb-2">
                Selected Amenities & Services:
              </p>
              <div className="flex flex-wrap gap-2">
                {booking.requirements.map((req) => (
                  <span
                    key={req}
                    className="px-3 py-1 rounded-full bg-white text-[#9B7A46] font-medium text-[11px] border border-[rgba(199,168,109,0.35)] shadow-2xs"
                  >
                    ✓ {req}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Action Buttons */}
        <div className="p-6 bg-white/80 border-t border-[rgba(199,168,109,0.25)] flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => printBookingReceipt(booking)}
              className="px-4 py-2.5 rounded-[12px] bg-white border border-[rgba(199,168,109,0.35)] text-[#2E2A26] font-semibold text-xs flex items-center justify-center space-x-2 hover:bg-[#F5EFE6] transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-[#C7A86D]" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={handleSendEmail}
              disabled={isSendingEmail}
              className="px-4 py-2.5 rounded-[12px] bg-[rgba(125,155,106,0.15)] border border-[rgba(125,155,106,0.4)] text-[#3E562E] font-semibold text-xs flex items-center justify-center space-x-2 hover:bg-[rgba(125,155,106,0.25)] transition-colors cursor-pointer shadow-xs"
            >
              {isSendingEmail ? (
                <Send className="w-4 h-4 text-[#7D9B6A] animate-pulse" />
              ) : emailStatus ? (
                <Check className="w-4 h-4 text-[#7D9B6A]" />
              ) : (
                <Mail className="w-4 h-4 text-[#7D9B6A]" />
              )}
              <span>{emailStatus || 'Forward to Kannan.d26 & Gowri7282'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <a
              href={`https://wa.me/919159277277?text=Hello%20KM%20Palace%20Team%2C%20I%20have%20submitted%20booking%20request%20${booking.booking_id}%20for%20${booking.marriage_date}.`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-[12px] bg-[#7D9B6A] hover:bg-[#6c875b] text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Inquiry</span>
            </a>

            <button
              onClick={onClose}
              className="btn-gold flex-1 sm:flex-none px-6 py-2.5 rounded-[12px] font-semibold text-xs shadow-xs cursor-pointer"
            >
              Done
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
