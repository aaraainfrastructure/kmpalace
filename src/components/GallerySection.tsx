import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Maximize2, X, Image as ImageIcon, Video as VideoIcon, Sparkles } from 'lucide-react';
import kmPalaceHero1 from '../assets/images/km_palace_hero_1784800774868.jpg';
import kmPalaceHero2 from '../assets/images/km_palace_hero_1784726233305.jpg';

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  category: 'hall' | 'stage' | 'dining' | 'lighting' | 'video';
  thumbnailUrl: string;
  mediaUrl: string;
  aspectRatio?: string;
  subtitle?: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    type: 'image',
    title: 'KM Palace Grand Marriage Hall',
    subtitle: 'Capacity 1,000+ Guests with Crystal Chandeliers & Central AC',
    category: 'hall',
    thumbnailUrl: kmPalaceHero1,
    mediaUrl: kmPalaceHero1,
  },
  {
    id: 'g2',
    type: 'video',
    title: 'KM Palace - Full 4K Drone & Hall Walkthrough',
    subtitle: 'Aerial View & Grand Entrance Walkthrough',
    category: 'video',
    thumbnailUrl: 'https://img.youtube.com/vi/2kfWwPAjxPE/maxresdefault.jpg',
    mediaUrl: 'https://youtu.be/2kfWwPAjxPE',
  },
  {
    id: 'g3',
    type: 'image',
    title: 'Majestic Marriage Mandapam Stage Decor',
    subtitle: 'Traditional Floral & Royal Gold Stage Setup',
    category: 'stage',
    thumbnailUrl: kmPalaceHero2,
    mediaUrl: kmPalaceHero2,
  },
  {
    id: 'g4',
    type: 'video',
    title: 'Lighting & Stage Special Effects Video Tour',
    subtitle: 'Dynamic Stage Illumination & Mandapam Setup',
    category: 'video',
    thumbnailUrl: 'https://img.youtube.com/vi/p350wNEPqI0/hqdefault.jpg',
    mediaUrl: 'https://youtu.be/p350wNEPqI0',
  },
  {
    id: 'g5',
    type: 'image',
    title: 'Air-Conditioned Dining Hall',
    subtitle: 'Seating 300+ Guests Simultaneously with Modern Kitchen',
    category: 'dining',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1800&q=90',
  },
  {
    id: 'g6',
    type: 'image',
    title: 'Bride & Groom AC Room',
    subtitle: 'AC Deluxe Rooms with Attached Restrooms',
    category: 'hall',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1800&q=90',
  },
  {
    id: 'g7',
    type: 'video',
    title: 'Grand Wedding Celebration & Service Highlights',
    subtitle: 'Live Event Preview & Venue Highlights',
    category: 'video',
    thumbnailUrl: 'https://img.youtube.com/vi/W1Otdv8c-zo/hqdefault.jpg',
    mediaUrl: 'https://youtu.be/W1Otdv8c-zo',
  },
  {
    id: 'g8',
    type: 'image',
    title: 'Illuminated Evening Exterior Facade',
    subtitle: 'Spacious Parking for 100+ Cars & 300+ Bikes',
    category: 'lighting',
    thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=90',
  },
];

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` : null;
}

export const GallerySection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredItems = activeCategory === 'all' 
    ? GALLERY_ITEMS 
    : GALLERY_ITEMS.filter(item => item.category === activeCategory || (activeCategory === 'video' && item.type === 'video'));

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 380;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handlePrevLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedItemIndex !== null) {
      setSelectedItemIndex(selectedItemIndex === 0 ? filteredItems.length - 1 : selectedItemIndex - 1);
    }
  };

  const handleNextLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedItemIndex !== null) {
      setSelectedItemIndex(selectedItemIndex === filteredItems.length - 1 ? 0 : selectedItemIndex + 1);
    }
  };

  const currentItem = selectedItemIndex !== null ? filteredItems[selectedItemIndex] : null;

  return (
    <section className="py-16 bg-[#FAF7F2] dark:bg-stone-900 border-y border-[rgba(199,168,109,0.25)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[rgba(199,168,109,0.15)] text-[#7A0019] dark:text-[#C7A86D] text-xs font-bold uppercase tracking-widest mb-2 border border-[rgba(199,168,109,0.3)]">
              <Sparkles className="w-3.5 h-3.5 text-[#C7A86D]" />
              <span>Virtual Experience & Photo Gallery</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2E2A26] dark:text-stone-100">
              Explore KM Palace
            </h2>
            <p className="text-sm text-[#6F655B] dark:text-stone-400 mt-1 max-w-xl">
              Take a visual tour of our royal marriage hall, stage decorations, air-conditioned dining areas, and live video previews.
            </p>
          </div>

          {/* Navigation Controls for Horizontal Scroll */}
          <div className="flex items-center space-x-3 self-end">
            <button
              onClick={() => handleScroll('left')}
              className="w-10 h-10 rounded-full bg-white dark:bg-stone-800 border border-[rgba(199,168,109,0.3)] text-[#2E2A26] dark:text-stone-200 hover:bg-[#2E2A26] hover:text-[#C7A86D] transition-all flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-10 h-10 rounded-full bg-white dark:bg-stone-800 border border-[rgba(199,168,109,0.3)] text-[#2E2A26] dark:text-stone-200 hover:bg-[#2E2A26] hover:text-[#C7A86D] transition-all flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 scrollbar-none text-xs font-semibold">
          {[
            { id: 'all', label: 'All Media' },
            { id: 'hall', label: 'Main AC Hall' },
            { id: 'stage', label: 'Stage & Mandapam' },
            { id: 'dining', label: 'Dining Area' },
            { id: 'lighting', label: 'Exterior & Decor' },
            { id: 'video', label: '🎥 Video Tours' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer border ${
                activeCategory === cat.id
                  ? 'bg-[#2E2A26] text-[#C7A86D] border-[#2E2A26] shadow-md font-bold'
                  : 'bg-white/80 dark:bg-stone-800 text-[#6F655B] dark:text-stone-300 border-[rgba(199,168,109,0.25)] hover:border-[#C7A86D]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Smooth Horizontal Scroll Gallery Container with Floating Overlay Nav Arrows */}
        <div className="relative group/gallery">
          {/* Floating Left Arrow Overlay Button */}
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-[#2E2A26] text-white hover:text-[#C7A86D] backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 cursor-pointer"
            aria-label="Scroll Left"
            title="Scroll Left"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Floating Right Arrow Overlay Button */}
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-[#2E2A26] text-white hover:text-[#C7A86D] backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 cursor-pointer"
            aria-label="Scroll Right"
            title="Scroll Right"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex space-x-5 overflow-x-auto py-4 px-2 scroll-smooth scrollbar-none snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => setSelectedItemIndex(index)}
                className="group relative flex-none w-[300px] sm:w-[350px] h-[240px] sm:h-[280px] rounded-[20px] overflow-hidden bg-stone-900 border border-[rgba(199,168,109,0.3)] shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer snap-start"
              >
                {/* Background Thumbnail Image */}
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />

                {/* Gradient Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Media Type Badge */}
                <div className="absolute top-3.5 left-3.5 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold">
                  {item.type === 'video' ? (
                    <>
                      <VideoIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Video Preview</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3.5 h-3.5 text-amber-200" />
                      <span>Photo</span>
                    </>
                  )}
                </div>

                {/* Hover Lightbox Icon */}
                <div className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                  <Maximize2 className="w-4 h-4" />
                </div>

                {/* Center Play Button for Videos */}
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#C7A86D]/90 text-[#2E2A26] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 fill-current ml-1" />
                    </div>
                  </div>
                )}

                {/* Content Caption */}
                <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                  <h3 className="font-serif font-bold text-base text-stone-100 group-hover:text-[#C7A86D] transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-xs text-stone-300 line-clamp-1 mt-0.5">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Hint indicator */}
        <div className="mt-3 text-center text-xs text-[#A09384] dark:text-stone-500 flex items-center justify-center space-x-1">
          <span>← Swipe horizontally or click arrows to view more →</span>
        </div>

      </div>

      {/* LIGHTBOX POPUP MODAL */}
      {currentItem && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setSelectedItemIndex(null)}
        >
          {/* Top Bar Controls */}
          <div className="absolute top-4 inset-x-4 sm:inset-x-8 flex items-center justify-between text-white z-20">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-white/10 text-stone-200 text-xs font-semibold font-num">
                {selectedItemIndex! + 1} / {filteredItems.length}
              </span>
              <span className="text-xs text-stone-300 hidden sm:inline font-serif">
                {currentItem.title}
              </span>
            </div>

            <button
              onClick={() => setSelectedItemIndex(null)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Left Arrow Button */}
          <button
            onClick={handlePrevLightbox}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer z-20"
            aria-label="Previous Media"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          {/* Media Content Wrapper */}
          <div 
            className="max-w-5xl max-h-[80vh] w-full flex flex-col items-center justify-center relative my-auto z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {currentItem.type === 'video' ? (
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
                {getYouTubeEmbedUrl(currentItem.mediaUrl) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(currentItem.mediaUrl)!}
                    title={currentItem.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={currentItem.mediaUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            ) : (
              <img
                src={currentItem.mediaUrl}
                alt={currentItem.title}
                className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
              />
            )}

            {/* Lightbox Caption */}
            <div className="mt-4 text-center text-white space-y-1 px-4 max-w-2xl">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-[#C7A86D]">
                {currentItem.title}
              </h3>
              {currentItem.subtitle && (
                <p className="text-xs sm:text-sm text-stone-300">
                  {currentItem.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={handleNextLightbox}
            className="absolute right-3 sm:left-auto sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer z-20"
            aria-label="Next Media"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      )}
    </section>
  );
};
