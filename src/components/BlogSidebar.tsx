import React, { useState } from 'react';
import { Search, ListChecks, Calculator, CalendarCheck, Star, Phone, MessageSquare, MapPin, ChevronRight, Sparkles, Building2 } from 'lucide-react';
import { BLOG_POSTS, CATEGORIES, BlogPost } from '../data/blogData';
import { BlogChecklistModal } from './BlogChecklistModal';
import { BlogBudgetCalculatorModal } from './BlogBudgetCalculatorModal';

interface BlogSidebarProps {
  currentSlug?: string;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectPost: (slug: string) => void;
  onOpenBooking: () => void;
}

export const BlogSidebar: React.FC<BlogSidebarProps> = ({
  currentSlug,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onSelectPost,
  onOpenBooking,
}) => {
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const popularPosts = BLOG_POSTS.slice(0, 5);
  const latestPosts = [...BLOG_POSTS].reverse().slice(0, 5);

  return (
    <aside className="space-y-6">
      {/* Search Input Box */}
      <div className="bg-white p-5 rounded-[20px] border border-[#E5D9C5] shadow-xs">
        <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#2E2A26] mb-3 flex items-center space-x-1.5">
          <Search className="w-4 h-4 text-[#C7A86D]" />
          <span>Search Wedding Guides</span>
        </h4>
        <div className="relative">
          <input
            type="text"
            placeholder="Search venue cost, checklist, dates..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5D9C5] bg-[#FDFBF7] text-xs text-[#2E2A26] placeholder-gray-400 focus:outline-none focus:border-[#C7A86D] focus:ring-1 focus:ring-[#C7A86D] transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Interactive Tool Buttons */}
      <div className="bg-gradient-to-br from-[#2E2A26] to-[#1F1C19] p-5 rounded-[20px] border border-[#C7A86D]/30 text-white shadow-md space-y-3">
        <div className="flex items-center space-x-2 text-[#C7A86D] text-[10px] uppercase font-black tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Wedding Planning Tools</span>
        </div>

        <button
          onClick={() => setIsChecklistOpen(true)}
          className="w-full bg-white/10 hover:bg-white/20 border border-[#C7A86D]/40 text-white p-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-2.5">
            <ListChecks className="w-4 h-4 text-[#C7A86D]" />
            <span className="text-left">Tamil Wedding Checklist</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#C7A86D] group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => setIsCalculatorOpen(true)}
          className="w-full bg-white/10 hover:bg-white/20 border border-[#C7A86D]/40 text-white p-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-2.5">
            <Calculator className="w-4 h-4 text-[#C7A86D]" />
            <span className="text-left">Wedding Budget Calculator</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#C7A86D] group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={onOpenBooking}
          className="w-full btn-gold py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Book Site Visit & Lock Date</span>
        </button>
      </div>

      {/* Official Instagram Page Link */}
      <div className="bg-gradient-to-r from-[#FDFCFA] to-pink-50/50 p-5 rounded-[20px] border border-pink-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#2E2A26] flex items-center space-x-1.5">
            <svg className="w-4 h-4 fill-[#E1306C]" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>KM PALACE Instagram</span>
          </span>
          <span className="text-[10px] font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full">@the_km_palace</span>
        </div>
        <p className="text-xs text-[#6F655B] leading-relaxed">
          See live decor setups, real bride photos, and stage inspiration on our official Instagram handle.
        </p>
        <a
          href="https://www.instagram.com/the_km_palace"
          target="_blank"
          rel="noreferrer"
          className="w-full bg-[#E1306C] hover:bg-[#C1205C] text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xs"
        >
          <span>Follow @the_km_palace on Instagram</span>
        </a>
      </div>

      {/* Categories Filter */}
      <div className="bg-white p-5 rounded-[20px] border border-[#E5D9C5] shadow-xs">
        <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#2E2A26] mb-3">
          Explore Categories
        </h4>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const count = cat === 'All Posts'
              ? BLOG_POSTS.length
              : BLOG_POSTS.filter((p) => p.category === cat).length;
            const isActive = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2E2A26] text-[#C7A86D] font-bold'
                    : 'text-[#2E2A26] hover:bg-[#FDFBF7] hover:text-[#C7A86D]'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-[#C7A86D] text-[#2E2A26] font-bold' : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular Posts */}
      <div className="bg-white p-5 rounded-[20px] border border-[#E5D9C5] shadow-xs">
        <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#2E2A26] mb-4">
          Most Popular Guides
        </h4>
        <div className="space-y-3">
          {popularPosts.map((post) => (
            <div
              key={post.slug}
              onClick={() => onSelectPost(post.slug)}
              className={`flex space-x-3 cursor-pointer group p-2 rounded-xl transition-all ${
                currentSlug === post.slug ? 'bg-[#FDFBF7] border border-[#C7A86D]/40' : 'hover:bg-[#FDFBF7]'
              }`}
            >
              <img
                src={post.heroImage}
                alt={post.featuredImageAlt}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200';
                }}
                className="w-14 h-14 object-cover rounded-lg shrink-0 border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-[#2E2A26] group-hover:text-[#C7A86D] transition-colors line-clamp-2 leading-snug">
                  {post.seoTitle}
                </h5>
                <p className="text-[10px] text-gray-500 mt-1">{post.readingTime}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Google Reviews Badge */}
      <div className="bg-[#FDFBF7] p-5 rounded-[20px] border border-[#E5D9C5] text-center space-y-2">
        <div className="flex items-center justify-center space-x-1 text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-sm font-extrabold text-[#2E2A26]">4.9 / 5.0 Rating</p>
        <p className="text-xs text-gray-600">Based on 250+ Verified Family Reviews on Google</p>
        <div className="pt-2">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
            Verified Marriage Hall Venue
          </span>
        </div>
      </div>

      {/* Contact Card */}
      <div className="bg-[#2E2A26] text-white p-5 rounded-[20px] border border-[#C7A86D]/30 space-y-3">
        <div className="flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-[#C7A86D]" />
          <div>
            <h5 className="text-xs font-extrabold text-white">KM PALACE Venue Helpdesk</h5>
            <p className="text-[10px] text-[#E5D9C5]">Direct Manager Line</p>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <a
            href="tel:+919159277277"
            className="flex items-center space-x-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-[#C7A86D]" />
            <span className="font-num">+91 9159277277</span>
          </a>

          <a
            href="https://wa.me/919159277277?text=Hello%20KM%20Palace%20Team%2C%20I%20am%20enquiring%20about%20marriage%20hall%20booking."
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-2 p-2.5 rounded-xl bg-emerald-900/50 hover:bg-emerald-900/80 text-xs font-bold text-emerald-200 transition-all border border-emerald-500/30"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        <div className="text-[10px] text-[#E5D9C5] pt-1 flex items-start space-x-1.5 border-t border-white/10">
          <MapPin className="w-3.5 h-3.5 text-[#C7A86D] shrink-0 mt-0.5" />
          <span>Sirukalathur Main Rd, Chembarambakkam, Kundrathur, Chennai - 600069</span>
        </div>
      </div>

      {/* Interactive Modals */}
      <BlogChecklistModal isOpen={isChecklistOpen} onClose={() => setIsChecklistOpen(false)} />
      <BlogBudgetCalculatorModal isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
    </aside>
  );
};
