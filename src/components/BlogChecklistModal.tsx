import React, { useState } from 'react';
import { X, Download, CheckSquare, Square, CheckCircle2, ShieldCheck, Phone } from 'lucide-react';

interface BlogChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHECKLIST_ITEMS = [
  { id: '1', title: 'Horoscope Matching & Subha Muhurtham Date Fix', category: '6 Months Before' },
  { id: '2', title: 'Book KM PALACE Marriage Hall & Pay Token', category: '6 Months Before' },
  { id: '3', title: 'Confirm Brahmin / Tamil Vadhyar (Priests)', category: '5 Months Before' },
  { id: '4', title: 'Select Pure Veg Catering Chef & Sample Tasting', category: '4 Months Before' },
  { id: '5', title: 'Kanchipuram Silk Saree & Bridal Attire Shopping', category: '3 Months Before' },
  { id: '6', title: 'Stage Flower Decoration & Lighting Themes', category: '3 Months Before' },
  { id: '7', title: 'Wedding Photographer & Candid Reels Videographer', category: '3 Months Before' },
  { id: '8', title: 'Print Kalyana Pathirikai (Invitations) & E-Invites', category: '2 Months Before' },
  { id: '9', title: 'Book Nadaswaram, Chenda Melam & DJ Artists', category: '2 Months Before' },
  { id: '10', title: 'Book Bridal Makeup Artist & HD Trial Session', category: '2 Months Before' },
  { id: '11', title: 'Distribute Physical Cards & Confirm Outstation Guests', category: '1 Month Before' },
  { id: '12', title: 'Finalize Pure Veg Menu Items with Catering Team', category: '2 Weeks Before' },
  { id: '13', title: 'Arrange Guest Transportation & KM PALACE Suite Allocation', category: '1 Week Before' },
  { id: '14', title: 'Pack Thali, Turmeric, Coconuts & Puja Items', category: 'Wedding Eve' },
];

export const BlogChecklistModal: React.FC<BlogChecklistModalProps> = ({ isOpen, onClose }) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({
    '1': true,
    '2': true,
  });

  if (!isOpen) return null;

  const toggleCheck = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checked).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100);

  const handleDownloadPDF = () => {
    alert('Downloading KM PALACE Traditional Tamil Wedding Checklist PDF guide...');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-[#C7A86D]/40 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2E2A26] to-[#1F1C19] text-white p-6 flex items-center justify-between border-b border-[#C7A86D]/30">
          <div>
            <span className="text-[#C7A86D] text-[10px] uppercase font-extrabold tracking-widest block mb-1 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Interactive Wedding Planner</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Tamil Wedding Planning Checklist
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-[#FDFBF7] p-4 border-b border-[#E5D9C5]/50 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#2E2A26]">Your Planning Progress</p>
            <p className="text-[11px] text-[#7A6E65]">{completedCount} of {CHECKLIST_ITEMS.length} milestones completed ({progressPercent}%)</p>
          </div>
          <div className="w-36 bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Scrollable Checklist */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {CHECKLIST_ITEMS.map((item) => {
            const isChecked = !!checked[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                  isChecked
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : 'bg-white border-[#E5D9C5] text-[#2E2A26] hover:bg-[#FDFBF7]'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-xs sm:text-sm font-semibold ${isChecked ? 'line-through text-emerald-800' : 'text-[#2E2A26]'}`}>
                    {item.title}
                  </p>
                  <span className="text-[10px] font-bold text-[#C7A86D] uppercase tracking-wider block mt-0.5">
                    {item.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#FDFBF7] border-t border-[#E5D9C5]/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto btn-gold px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download Printable PDF Checklist</span>
          </button>
          <a
            href="tel:+919159277277"
            className="text-xs font-bold text-[#2E2A26] hover:text-[#C7A86D] flex items-center space-x-1"
          >
            <Phone className="w-3.5 h-3.5 text-[#C7A86D]" />
            <span>Questions? Call +91 9159277277</span>
          </a>
        </div>
      </div>
    </div>
  );
};
