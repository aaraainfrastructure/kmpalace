import React from 'react';
import { MapPin, Phone, Mail, Navigation, MessageSquare, Clock } from 'lucide-react';

export const LocationSection: React.FC = () => {
  return (
    <section className="py-20 bg-[rgba(245,239,230,0.5)] border-t border-[rgba(199,168,109,0.25)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-white/80 border border-[rgba(199,168,109,0.35)] text-xs font-semibold text-[#9B7A46] shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-[#C7A86D]" />
              <span className="uppercase tracking-widest text-[10px]">Location & Directions</span>
            </div>

            <h2 className="text-3xl font-serif font-semibold text-[#2E2A26]">
              Visit KM PALACE
            </h2>

            <div className="space-y-4 text-xs text-[#6F655B]">
              <div className="glass-card flex items-start space-x-3.5 p-5 rounded-[20px] border border-[rgba(199,168,109,0.3)] shadow-xs">
                <MapPin className="w-5 h-5 text-[#C7A86D] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#2E2A26] text-sm">Palace Address</p>
                  <p className="mt-0.5 leading-relaxed font-semibold text-[#2E2A26]">
                    9/133, Sirukalathur Main Rd, Kavanur, Chembarambakkam, Tamil Nadu 600069, India
                  </p>
                </div>
              </div>

              <div className="glass-card flex items-start space-x-3.5 p-5 rounded-[20px] border border-[rgba(199,168,109,0.3)] shadow-xs">
                <Phone className="w-5 h-5 text-[#C7A86D] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#2E2A26] text-sm">Manager Hotline & Reservation Desk</p>
                  <p className="mt-0.5 font-num">
                    <a href="tel:+919159277277" className="text-[#9B7A46] font-bold hover:underline text-base">
                      +91 9159277277
                    </a>
                  </p>
                </div>
              </div>

              <div className="glass-card flex items-start space-x-3.5 p-5 rounded-[20px] border border-[rgba(199,168,109,0.3)] shadow-xs">
                <Mail className="w-5 h-5 text-[#C7A86D] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#2E2A26] text-sm">Official Enquiries</p>
                  <p className="mt-0.5 font-semibold text-[#2E2A26]">
                    <a href="mailto:Kannan.d26@gmail.com" className="hover:underline text-[#9B7A46]">
                      Kannan.d26@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://maps.google.com/?q=KM+PALACE,+9/133,+Sirukalathur+Main+Rd,+Kavanur,+Chembarambakkam,+Tamil+Nadu+600069,+India"
                target="_blank"
                rel="noreferrer"
                className="btn-gold px-6 py-3 rounded-[14px] font-semibold text-xs flex items-center space-x-2 shadow-xs cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-[#2E2A26]" />
                <span>Google Maps Navigation</span>
              </a>

              <a
                href="https://wa.me/919159277277?text=Hello%20KM%20Palace%20Manager%2C%20I%20would%20like%20to%20enquire%20about%20booking."
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-[14px] bg-white text-[#2E2A26] border border-[rgba(199,168,109,0.35)] hover:bg-[#F5EFE6] font-semibold text-xs flex items-center space-x-2 shadow-xs cursor-pointer transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-[#7D9B6A]" />
                <span>WhatsApp Desk</span>
              </a>
            </div>
          </div>

          {/* Interactive Map Visual */}
          <div className="lg:col-span-7">
            <div className="rounded-[24px] border border-[rgba(199,168,109,0.35)] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] relative bg-[rgba(245,239,230,0.8)] h-96 flex flex-col justify-between">
              <iframe
                title="KM PALACE Google Map Location"
                src="https://maps.google.com/maps?q=KM+PALACE,+9/133,+Sirukalathur+Main+Rd,+Kavanur,+Chembarambakkam,+Tamil+Nadu+600069,+India&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '320px' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              ></iframe>
              <div className="bg-white/95 backdrop-blur-md px-5 py-3 border-t border-[rgba(199,168,109,0.3)] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-[#2E2A26] font-semibold">
                  <MapPin className="w-4 h-4 text-[#C7A86D]" />
                  <span>KM PALACE • 9/133, Sirukalathur Main Rd</span>
                </div>
                <a
                  href="https://maps.google.com/?q=KM+PALACE,+9/133,+Sirukalathur+Main+Rd,+Kavanur,+Chembarambakkam,+Tamil+Nadu+600069,+India"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-1.5 rounded-full bg-[#2E2A26] text-[#E8D8B0] text-[11px] font-semibold hover:bg-black transition-colors"
                >
                  Open in Google Maps ↗
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
