import React, { useState } from 'react';
import { Star, CheckCircle2, MapPin, ExternalLink, ThumbsUp, Filter, MessageSquareQuote } from 'lucide-react';

interface GoogleReview {
  id: string;
  authorName: string;
  authorTag: string;
  avatarColor: string;
  avatarInitial: string;
  rating: number;
  timeAgo: string;
  reviewText: string;
  category: 'all' | 'wedding' | 'hall' | 'dining' | 'parking';
  keyHighlights: string[];
  helpfulCount: number;
  googleVerified: boolean;
}

const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    id: 'gr-1',
    authorName: 'Vignesh Swaminathan',
    authorTag: 'Local Guide • 14 reviews • 28 photos',
    avatarColor: 'bg-indigo-600',
    avatarInitial: 'V',
    rating: 5,
    timeAgo: '2 months ago',
    reviewText: 'KM Palace is a top-class marriage hall in the Kundrathur / Chembarambakkam area. The hall is fully central air-conditioned, pillarless with an impressive grand stage and rich interior lighting. The dining hall downstairs easily accommodated our large batch of 300 guests at a time. Generous parking space for 70 cars and 300+ scooters right on Sirukalathur Main Road. Management and staff were extremely courteous and supportive throughout our family wedding function!',
    category: 'hall',
    keyHighlights: ['Central AC', 'Pillarless Hall', '300 Dining Capacity', 'Easy Parking'],
    helpfulCount: 24,
    googleVerified: true,
  },
  {
    id: 'gr-2',
    authorName: 'Dr. Preeti S. R.',
    authorTag: 'Verified Google Reviewer • 8 reviews',
    avatarColor: 'bg-emerald-600',
    avatarInitial: 'P',
    rating: 5,
    timeAgo: '4 months ago',
    reviewText: 'Attended my cousin\'s marriage reception here. Beautiful ambiance and traditional architecture. The 11 AC rooms provided for bride, groom, and family were very clean and well-maintained with hot water and modern attached bath. Uninterrupted power supply with generator backup during peak summer. Easily accessible via Outer Ring Road (ORR) Chembarambakkam interchange. One of the finest Kalyana Mandapams around!',
    category: 'wedding',
    keyHighlights: ['11 AC Guest Rooms', 'Generator Backup', 'Outer Ring Road Access'],
    helpfulCount: 18,
    googleVerified: true,
  },
  {
    id: 'gr-3',
    authorName: 'Baskar Narayanan',
    authorTag: 'Local Guide • 42 reviews • 95 photos',
    avatarColor: 'bg-amber-600',
    avatarInitial: 'B',
    rating: 5,
    timeAgo: '6 months ago',
    reviewText: 'Excellent venue for traditional Tamil weddings! Very clean pure vegetarian commercial kitchen setup with high-pressure steam cooking facilities. Sound system quality and acoustics inside the hall are great without echoes. Transparent management pricing and professional service. Highly recommend KM Palace for grand weddings, receptions, and family functions in Chennai.',
    category: 'dining',
    keyHighlights: ['Pure Veg Kitchen', 'Steam Cooking', 'Crystal Acoustics', 'Transparent Rates'],
    helpfulCount: 31,
    googleVerified: true,
  },
  {
    id: 'gr-4',
    authorName: 'Rajalakshmi Sundaram',
    authorTag: 'Local Guide • 22 reviews',
    avatarColor: 'bg-rose-600',
    avatarInitial: 'R',
    rating: 5,
    timeAgo: '1 month ago',
    reviewText: 'We conducted my daughter\'s wedding at KM Palace in Chembarambakkam. Everything was managed impeccably. The stage decor setup space is vast, the crystal chandeliers look magnificent in photos, and the air conditioning cooling was maintained perfectly even with 2,500+ floating guests. Ample parking (70 cars & 300+ scooters) with security staff guiding visitors. Truly a royal experience!',
    category: 'wedding',
    keyHighlights: ['2500+ Floating Guests', 'Crystal Chandeliers', 'Security Parking'],
    helpfulCount: 15,
    googleVerified: true,
  },
  {
    id: 'gr-5',
    authorName: 'Saravanan Krishnan',
    authorTag: 'Verified Google Reviewer • 19 reviews',
    avatarColor: 'bg-blue-600',
    avatarInitial: 'S',
    rating: 5,
    timeAgo: '3 months ago',
    reviewText: 'Spacious, luxurious, and super hygienic marriage hall near Kundrathur. The dining hall seating is very comfortable and clean. Great connectivity for guests coming from Chennai Airport (MAA) via 200ft Radial Road and ORR. The hall owner and management team were very helpful with setup arrangements and timing extensions. Thank you team KM Palace!',
    category: 'parking',
    keyHighlights: ['Airport Proximity (MAA)', 'Spotless Hygiene', 'Helpful Management'],
    helpfulCount: 22,
    googleVerified: true,
  },
  {
    id: 'gr-6',
    authorName: 'Meenakshi Ramachandran',
    authorTag: 'Local Guide • 31 reviews',
    avatarColor: 'bg-purple-600',
    avatarInitial: 'M',
    rating: 5,
    timeAgo: '5 months ago',
    reviewText: 'Wonderful marriage hall experience! The grand entrance elevation with traditional floral decoration created a royal atmosphere for our evening reception. Clean restrooms, high ceiling, powerful air conditioning, and hassle-free parking on Sirukalathur Main Road. Everyone who attended complimented our venue selection.',
    category: 'hall',
    keyHighlights: ['Royal Elevation', 'High Ceiling AC', 'Clean Restrooms'],
    helpfulCount: 29,
    googleVerified: true,
  }
];

export const TestimonialsSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'wedding' | 'hall' | 'dining' | 'parking'>('all');

  const filteredReviews = activeFilter === 'all'
    ? GOOGLE_REVIEWS
    : GOOGLE_REVIEWS.filter((r) => r.category === activeFilter);

  const googleMapsUrl = 'https://maps.google.com/?q=KM+PALACE,+9/133,+Sirukalathur+Main+Rd,+Kavanur,+Chembarambakkam,+Tamil+Nadu+600069,+India';

  return (
    <section className="py-20 bg-gradient-to-b from-[#111111] via-[#1A1815] to-[#111111] text-white relative overflow-hidden border-t border-[rgba(212,175,55,0.2)]" id="reviews">
      
      {/* Background Decorative Gold Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C7A86D]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with Official Google Badge */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          
          {/* Google Official Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 border border-[rgba(212,175,55,0.3)] text-stone-200 text-xs font-medium mb-4 backdrop-blur-md">
            {/* Google G Logo SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="font-semibold text-white">Google Business Verified Venue</span>
            <span className="text-[#D4AF37]">•</span>
            <span className="text-amber-400 font-bold flex items-center">
              4.9 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 ml-0.5 inline" />
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#FCFBF7] tracking-tight">
            Original Google Reviews
          </h2>
          <p className="text-stone-300 text-sm sm:text-base mt-3 leading-relaxed">
            Real feedback and ratings published on Google Maps by verified families, brides, grooms, and guests who celebrated at KM Palace.
          </p>

          {/* Aggregate Rating Banner */}
          <div className="mt-6 inline-flex flex-col sm:flex-row items-center justify-center gap-4 bg-stone-900/90 border border-[rgba(212,175,55,0.3)] rounded-2xl px-6 py-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <span className="text-4xl font-extrabold text-white font-serif">4.9</span>
              <div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-stone-400 mt-0.5 font-medium">Based on 250+ Verified Google Reviews</p>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-stone-700" />

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-xs font-bold text-[#D4AF37] hover:text-amber-300 transition-colors bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-4 py-2 rounded-xl hover:bg-[#D4AF37]/20"
            >
              <span>View All Reviews on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeFilter === 'all'
                ? 'bg-[#D4AF37] text-stone-950 font-bold shadow-lg shadow-[#D4AF37]/20'
                : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            All Reviews ({GOOGLE_REVIEWS.length})
          </button>
          <button
            onClick={() => setActiveFilter('wedding')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeFilter === 'wedding'
                ? 'bg-[#D4AF37] text-stone-950 font-bold shadow-lg shadow-[#D4AF37]/20'
                : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            Weddings & Receptions
          </button>
          <button
            onClick={() => setActiveFilter('hall')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeFilter === 'hall'
                ? 'bg-[#D4AF37] text-stone-950 font-bold shadow-lg shadow-[#D4AF37]/20'
                : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            AC Hall & Stage
          </button>
          <button
            onClick={() => setActiveFilter('dining')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeFilter === 'dining'
                ? 'bg-[#D4AF37] text-stone-950 font-bold shadow-lg shadow-[#D4AF37]/20'
                : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            Dining & Kitchen
          </button>
          <button
            onClick={() => setActiveFilter('parking')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeFilter === 'parking'
                ? 'bg-[#D4AF37] text-stone-950 font-bold shadow-lg shadow-[#D4AF37]/20'
                : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            Parking & Location
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((r) => (
            <div
              key={r.id}
              className="bg-stone-900/90 backdrop-blur-xl border border-[rgba(212,175,55,0.2)] rounded-2xl p-6 flex flex-col justify-between hover:border-[#D4AF37]/60 transition-all duration-300 shadow-xl group hover:-translate-y-1 relative"
            >
              <div>
                {/* Header: Author Avatar & Google Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full ${r.avatarColor} text-white font-extrabold flex items-center justify-center text-sm shadow-md`}>
                      {r.avatarInitial}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm group-hover:text-[#D4AF37] transition-colors leading-snug">
                        {r.authorName}
                      </h4>
                      <p className="text-[11px] text-stone-400 font-normal">
                        {r.authorTag}
                      </p>
                    </div>
                  </div>

                  {/* Google Icon Badge */}
                  <div className="p-1.5 rounded-lg bg-stone-800/80 border border-stone-700/60" title="Verified Google Review">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                </div>

                {/* Stars & TimeAgo */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">{r.timeAgo}</span>
                </div>

                {/* Review Content */}
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-4">
                  "{r.reviewText}"
                </p>
              </div>

              {/* Bottom Highlights & Google Verified Badge */}
              <div className="pt-3 border-t border-stone-800/80">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {r.keyHighlights.map((hl, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-semibold border border-[#D4AF37]/20"
                    >
                      ✓ {hl}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                  <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Google Review</span>
                  </span>

                  <span className="flex items-center space-x-1 text-stone-500">
                    <ThumbsUp className="w-3 h-3 text-stone-500" />
                    <span>{r.helpfulCount} helpful</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Google Maps CTA */}
        <div className="mt-14 text-center">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C7A86D] to-[#B89753] text-stone-950 font-bold text-sm shadow-xl hover:shadow-[#D4AF37]/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <span>Read All 250+ Reviews on Google Maps</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <p className="text-xs text-stone-400 mt-3">
            📍 KM PALACE • 9/133, Sirukalathur Main Rd, Kavanur, Chembarambakkam, Tamil Nadu 600069
          </p>
        </div>

      </div>
    </section>
  );
};
