import React from 'react';
import { Heart, Building, Calendar, Users, ShieldCheck, Car, AlertTriangle } from 'lucide-react';
import kmPalaceStoryHall from '../assets/images/km_palace_story_hall_1784887903442.jpg';

export const StorySection: React.FC = () => {
  return (
    <section id="story-section" className="py-16 sm:py-20 bg-[#F9F5EF] border-t border-[rgba(199,168,109,0.25)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Visual Gallery Cards */}
          <div className="lg:col-span-5 relative space-y-4">
            <div className="rounded-[28px] overflow-hidden border border-[rgba(199,168,109,0.35)] shadow-lg relative group bg-white">
              <div className="w-full h-[260px] sm:h-[340px] relative overflow-hidden">
                <img
                  src={kmPalaceStoryHall}
                  alt="KM Palace Kalyana Mandapam Interior"
                  className="w-full h-full object-cover object-center max-w-full block transform group-hover:scale-105 transition-transform duration-700 select-none"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-5">
                <span className="text-white font-serif text-xs sm:text-sm font-semibold tracking-wide">
                  Established in 2024 • Kundrathur, Chennai
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 rounded-[20px] border border-[rgba(199,168,109,0.3)] shadow-xs flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-[#C7A86D] shrink-0" />
                <div>
                  <p className="text-xl font-serif font-bold text-[#2E2A26] font-num">2024</p>
                  <p className="text-[10px] text-[#6F655B] uppercase tracking-wider font-semibold">Serving families</p>
                </div>
              </div>

              <div className="glass-card p-4 rounded-[20px] border border-[rgba(199,168,109,0.3)] shadow-xs flex items-center space-x-3">
                <Users className="w-5 h-5 text-[#C7A86D] shrink-0" />
                <div>
                  <p className="text-xl font-serif font-bold text-[#2E2A26] font-num">2500+</p>
                  <p className="text-[10px] text-[#6F655B] uppercase tracking-wider font-semibold">Floating guest capacity</p>
                </div>
              </div>
            </div>
          </div>

          {/* Story Content */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/80 border border-[rgba(199,168,109,0.35)] text-xs font-semibold text-[#9B7A46] shadow-xs mb-3">
                <Heart className="w-3.5 h-3.5 text-[#C7A86D]" />
                <span className="uppercase tracking-widest text-[10px]">KM Palace Mandapam</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2E2A26]">
                Our Story
              </h2>
              <p className="text-base font-serif italic text-[#9B7A46] mt-1">
                Where every occasion turns into a beautiful memory
              </p>
            </div>

            {/* Strict Pure Veg Policy Banner */}
            <div className="p-4 rounded-[18px] bg-amber-50/90 border border-amber-300/80 text-amber-950 flex items-start space-x-3.5 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-amber-900">
                  Strict Pure Vegetarian Venue Policy
                </h4>
                <p className="text-xs font-bold text-amber-900 mt-0.5">
                  Cooking & serving non veg is strictly not allowed.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#6F655B] leading-relaxed">
              <p className="p-4 rounded-[16px] bg-white/80 border-l-4 border-[#C7A86D] text-[#2E2A26] font-medium shadow-2xs text-sm sm:text-base">
                Since 2024, KM Palace has welcomed families and friends to celebrate life's most meaningful moments in Kundrathur, Chennai.
              </p>

              <p>
                Step into the world of celebrations at KM Palace, a stunning kalyana Mandapam in Kundrathur, Chennai designed to turn every occasion into a beautiful memory. Known for its warm hospitality and modern amenities, this venue effortlessly blends style, space and comfort to give your event the ideal setting it deserves.
              </p>

              <p>
                With a capacity to host up to 2500+ guests (in floating), 800 seating in reception hall, 300 seating at a time for sit-down dining, and convenient parking for vehicles (70 cars and 300+ scooters) + valet promptly arranged on request, KM Palace ensures every guest arrives, celebrates and departs without hassle. The venue offers thoughtfully designed guest rooms, with 11 air conditioned rooms, 6 three people occupancy and 3 ten occupancy dormitory and a bride and groom's room, each maintained to deliver a comfortable homey stay experience for families, friends and wedding parties alike.
              </p>

              <p>
                The property features elegant indoor spaces and beautifully curated outdoor areas that can be tailored to fit your celebration theme. Hosting everything from opulent weddings and heartfelt family milestones to refined corporate gatherings, KM Palace creates an atmosphere that adapts beautifully to every occasion.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#2E2A26]">
              <div className="flex items-center space-x-1.5 text-[#7D9B6A]">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Power Generator Backup</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[#9B7A46]">
                <Car className="w-4 h-4 text-[#C7A86D]" />
                <span>70 Cars & 300+ Scooters Parking + Valet</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[#2E2A26]">
                <Building className="w-4 h-4 text-[#C7A86D]" />
                <span>Kalyana Mandapam Kundrathur, Chennai</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

