import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Calendar, User, Phone, Mail, Users, Clock, MessageSquare, ShieldCheck } from 'lucide-react';

interface BlogLeadFormProps {
  blogTitle?: string;
  keyword?: string;
  pageUrl?: string;
}

export const BlogLeadForm: React.FC<BlogLeadFormProps> = ({
  blogTitle = 'Marriage Halls in Chennai Guide',
  keyword = 'Marriage Halls in Chennai',
  pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://kmpalace.com/blog',
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    weddingDate: '',
    guestCount: '500',
    functionType: 'Marriage & Reception',
    preferredTime: 'Morning (Muhurtham)',
    message: '',
    agreeTerms: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!formData.name.trim() || !formData.phone.trim()) {
      setSubmitError('Please enter both your name and phone number.');
      return;
    }

    if (!formData.agreeTerms) {
      setSubmitError('You must agree to the Privacy Policy to submit your enquiry.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        leadSource: 'Blog',
        leadMedium: 'Organic',
        leadCampaign: 'SEO',
        subject: 'Web Lead - Marriage Hall Enquiry',
        pageUrl,
        blogTitle,
        keyword,
        referrer: typeof document !== 'undefined' ? document.referrer || 'Direct Search' : 'Direct',
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitSuccess(data.message || 'Thank you! Your enquiry has been sent. Our team will contact you shortly.');
        setFormData({
          name: '',
          phone: '',
          email: '',
          weddingDate: '',
          guestCount: '500',
          functionType: 'Marriage & Reception',
          preferredTime: 'Morning (Muhurtham)',
          message: '',
          agreeTerms: true,
        });
      } else {
        setSubmitError(data.error || 'Failed to send enquiry. Please call us directly at +91 9159277277.');
      }
    } catch (err) {
      setSubmitError('Network error occurred. Please call +91 9159277277 or WhatsApp us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#2E2A26] via-[#1F1C19] to-[#2E2A26] rounded-[24px] p-6 sm:p-8 border border-[#C7A86D]/40 text-white shadow-xl relative overflow-hidden my-10">
      {/* Decorative Golden Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#C7A86D]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center space-x-2 text-[#C7A86D] text-xs uppercase font-extrabold tracking-widest mb-2">
          <ShieldCheck className="w-4 h-4 text-[#C7A86D]" />
          <span>Official Venue Consultation Lead Form</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
          Check Availability & Get Custom Tariff Quote
        </h3>
        <p className="text-xs sm:text-sm text-[#E5D9C5] mb-6 leading-relaxed max-w-2xl">
          Planning your wedding at KM PALACE? Fill out this quick form to receive immediate availability details, pure veg dining options, and transparent tariff packages directly from our team.
        </p>

        {submitSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs sm:text-sm flex items-start space-x-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-300">Enquiry Dispatched Successfully!</p>
              <p className="mt-1 text-emerald-100">{submitSuccess}</p>
            </div>
          </div>
        )}

        {submitError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs sm:text-sm flex items-start space-x-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-300">Notice</p>
              <p className="mt-1 text-rose-100">{submitError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#E5D9C5] mb-1 flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-[#C7A86D]" />
                <span>Bride / Groom / Contact Name <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Anand Kumar / Priya"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7A86D]/30 bg-white/10 text-white placeholder-white/40 text-xs sm:text-sm focus:outline-none focus:border-[#C7A86D] focus:ring-1 focus:ring-[#C7A86D] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#E5D9C5] mb-1 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-[#C7A86D]" />
                <span>Mobile Phone Number <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 91592 77277"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7A86D]/30 bg-white/10 text-white placeholder-white/40 text-xs sm:text-sm font-num focus:outline-none focus:border-[#C7A86D] focus:ring-1 focus:ring-[#C7A86D] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#E5D9C5] mb-1 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-[#C7A86D]" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                placeholder="e.g. name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7A86D]/30 bg-white/10 text-white placeholder-white/40 text-xs sm:text-sm focus:outline-none focus:border-[#C7A86D] focus:ring-1 focus:ring-[#C7A86D] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#E5D9C5] mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-[#C7A86D]" />
                <span>Wedding / Event Date</span>
              </label>
              <input
                type="date"
                value={formData.weddingDate}
                onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7A86D]/30 bg-white/10 text-white text-xs sm:text-sm font-num focus:outline-none focus:border-[#C7A86D] focus:ring-1 focus:ring-[#C7A86D] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#E5D9C5] mb-1 flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-[#C7A86D]" />
                <span>Expected Guests</span>
              </label>
              <select
                value={formData.guestCount}
                onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7A86D]/30 bg-[#2E2A26] text-white text-xs sm:text-sm focus:outline-none focus:border-[#C7A86D] transition-all"
              >
                <option value="200-300">200 - 300 Guests</option>
                <option value="500">500 Guests</option>
                <option value="750">750 Guests</option>
                <option value="1000+">1000+ Grand Reception</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#E5D9C5] mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-[#C7A86D]" />
                <span>Function Type</span>
              </label>
              <select
                value={formData.functionType}
                onChange={(e) => setFormData({ ...formData, functionType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7A86D]/30 bg-[#2E2A26] text-white text-xs sm:text-sm focus:outline-none focus:border-[#C7A86D] transition-all"
              >
                <option value="Marriage & Reception">Marriage & Reception (2 Days)</option>
                <option value="Reception Only">Reception Only (Evening)</option>
                <option value="Muhurtham Only">Muhurtham Only (Morning)</option>
                <option value="Engagement / Seemantham">Engagement / Seemantham</option>
                <option value="Sangeet / Party">Sangeet / Celebration</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#E5D9C5] mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-[#C7A86D]" />
                <span>Preferred Time Slot</span>
              </label>
              <select
                value={formData.preferredTime}
                onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7A86D]/30 bg-[#2E2A26] text-white text-xs sm:text-sm focus:outline-none focus:border-[#C7A86D] transition-all"
              >
                <option value="Morning (Muhurtham)">Morning (06:00 AM - 03:00 PM)</option>
                <option value="Evening (Reception)">Evening (03:00 PM - 10:00 PM)</option>
                <option value="Full Day 24 Hrs">Full 24-Hour Block</option>
                <option value="Full 2-Days Package">Full 2-Day Package</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#E5D9C5] mb-1 flex items-center space-x-1">
              <MessageSquare className="w-3.5 h-3.5 text-[#C7A86D]" />
              <span>Message / Specific Requirements</span>
            </label>
            <textarea
              rows={2}
              placeholder="Mention special catering preferences, room requirements, or decoration details..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#C7A86D]/30 bg-white/10 text-white placeholder-white/40 text-xs sm:text-sm focus:outline-none focus:border-[#C7A86D] focus:ring-1 focus:ring-[#C7A86D] transition-all"
            />
          </div>

          <div className="flex items-start space-x-2.5 pt-1">
            <input
              type="checkbox"
              id="privacyConsent"
              checked={formData.agreeTerms}
              onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
              className="mt-0.5 rounded border-[#C7A86D]/40 text-[#C7A86D] focus:ring-[#C7A86D] cursor-pointer"
            />
            <label htmlFor="privacyConsent" className="text-[11px] text-[#E5D9C5] leading-snug cursor-pointer select-none">
              I agree to the <span className="underline text-[#C7A86D]">Privacy Policy</span> and <span className="underline text-[#C7A86D]">Terms of Use</span>. I consent to receive official booking details via call, SMS, or WhatsApp.
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-gold py-3 px-6 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center space-x-2 cursor-pointer shadow-lg hover:shadow-xl transition-all disabled:opacity-50 mt-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Sending Lead Enquiry...' : 'Get Immediate Quote & Check Date'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
