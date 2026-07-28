import React, { useState, useMemo } from 'react';
import { BLOG_POSTS, CATEGORIES, BlogPost } from '../data/blogData';
import { BlogSidebar } from './BlogSidebar';
import { Search, Calendar, Clock, User, ChevronRight, Sparkles, Phone, MessageSquare, ShieldCheck, MapPin } from 'lucide-react';

interface BlogListProps {
  onSelectPost: (slug: string) => void;
  onNavigateHome: () => void;
  onOpenBooking: () => void;
}

export const BlogList: React.FC<BlogListProps> = ({
  onSelectPost,
  onNavigateHome,
  onOpenBooking,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Posts');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCat = selectedCategory === 'All Posts' || post.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || (
        post.seoTitle.toLowerCase().includes(q) ||
        post.metaDescription.toLowerCase().includes(q) ||
        post.keywords.some((k) => k.toLowerCase().includes(q))
      );
      return matchesCat && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = BLOG_POSTS[0];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2E2A26]">
      {/* Hero Banner Section */}
      <section className="bg-gradient-to-b from-[#2E2A26] via-[#231F1C] to-[#2E2A26] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#C7A86D]/30 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C7A86D]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center space-x-2 text-[#C7A86D] text-xs font-extrabold uppercase tracking-widest mb-3">
            <ShieldCheck className="w-4 h-4 text-[#C7A86D]" />
            <span>KM PALACE Official Wedding Knowledge Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4 leading-tight">
            Marriage Halls in Chennai Guide
          </h1>
          <p className="text-sm sm:text-base text-[#E5D9C5] max-w-3xl leading-relaxed font-serif mb-6">
            Everything you need to plan a seamless South Indian wedding in Chennai. Explore itemized venue costs, auspicious Subha Muhurtham dates, traditional Tamil wedding checklists, pure veg catering menus, and stage decor trends.
          </p>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Venue Capacity</p>
              <p className="font-bold text-[#C7A86D] text-sm">800 / 2500+ Floating</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Pure Veg Dining</p>
              <p className="font-bold text-[#C7A86D] text-sm">300 Seater Hall</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Guest Accommodations</p>
              <p className="font-bold text-[#C7A86D] text-sm">11 AC Guest Rooms</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Parking Yard</p>
              <p className="font-bold text-[#C7A86D] text-sm">70 Cars, 300+ Scooters</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid & Sidebar Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Category Pills Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2E2A26] text-[#C7A86D] shadow-sm border border-[#C7A86D]'
                  : 'bg-white text-[#2E2A26] border border-[#E5D9C5] hover:bg-[#FDFBF7]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Posts Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Featured Hero Article Banner */}
            {selectedCategory === 'All Posts' && !searchQuery && featuredPost && (
              <div
                onClick={() => onSelectPost(featuredPost.slug)}
                className="bg-white rounded-[24px] border border-[#E5D9C5] overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group grid grid-cols-1 md:grid-cols-12"
              >
                <div className="md:col-span-6 relative h-64 md:h-auto overflow-hidden">
                  <img
                    src={featuredPost.heroImage}
                    alt={featuredPost.featuredImageAlt}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-[#2E2A26] text-[#C7A86D] text-[10px] font-extrabold uppercase tracking-widest border border-[#C7A86D]/40">
                      Featured Guide
                    </span>
                  </div>
                </div>

                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                      <span className="text-[#C7A86D] font-bold">{featuredPost.category}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1 font-num">
                        <Clock className="w-3.5 h-3.5 text-[#C7A86D]" />
                        <span>{featuredPost.readingTime}</span>
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2E2A26] group-hover:text-[#C7A86D] transition-colors leading-snug mb-3">
                      {featuredPost.seoTitle}
                    </h2>

                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed font-serif mb-4">
                      {featuredPost.metaDescription}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700">{featuredPost.author}</span>
                    <span className="text-[#C7A86D] font-bold group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                      <span>Read Full Article</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Articles List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredPosts.map((post) => (
                <div
                  key={post.slug}
                  onClick={() => onSelectPost(post.slug)}
                  className="bg-white rounded-[20px] border border-[#E5D9C5] overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.heroImage}
                        alt={post.featuredImageAlt}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#C7A86D] text-[10px] font-bold uppercase tracking-wider border border-[#C7A86D]/30">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center space-x-2 text-[11px] text-gray-500 mb-2">
                        <Calendar className="w-3.5 h-3.5 text-[#C7A86D]" />
                        <span className="font-num">{post.publishedDate}</span>
                        <span>•</span>
                        <span>{post.readingTime}</span>
                      </div>

                      <h3 className="text-base font-serif font-bold text-[#2E2A26] group-hover:text-[#C7A86D] transition-colors leading-snug line-clamp-2 mb-2">
                        {post.seoTitle}
                      </h3>

                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-serif">
                        {post.metaDescription}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-gray-500">{post.author}</span>
                    <span className="text-[#C7A86D] font-bold group-hover:translate-x-1 transition-transform flex items-center space-x-0.5">
                      <span>Read Guide</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="p-12 text-center bg-white rounded-2xl border border-[#E5D9C5]">
                <p className="text-base font-bold text-gray-700">No articles matched your search query.</p>
                <p className="text-xs text-gray-500 mt-1">Try resetting the category filter or searching for key terms like "cost", "checklist", or "dates".</p>
                <button
                  onClick={() => { setSelectedCategory('All Posts'); setSearchQuery(''); }}
                  className="mt-4 btn-gold px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Reset Filters
                </button>
              </div>
            )}

          </div>

          {/* Sidebar Column (4 cols) */}
          <div className="lg:col-span-4">
            <BlogSidebar
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectPost={onSelectPost}
              onOpenBooking={onOpenBooking}
            />
          </div>

        </div>
      </div>

      {/* Bottom Footer CTA */}
      <footer className="bg-[#1F1C19] text-white py-10 border-t border-[#C7A86D]/30 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="text-2xl font-serif font-bold text-white">
            Plan Your Marriage at KM PALACE Chennai
          </h3>
          <p className="text-xs text-[#E5D9C5] max-w-xl mx-auto">
            Sirukalathur Main Road, Kavanur, Chembarambakkam, Kundrathur, Chennai - 600069
          </p>
          <div className="flex justify-center items-center space-x-4 pt-2">
            <a href="tel:+919159277277" className="btn-gold px-5 py-2.5 text-xs font-bold uppercase">
              Call +91 9159277277
            </a>
            <button onClick={onNavigateHome} className="px-5 py-2.5 rounded-xl border border-white/20 text-xs font-bold text-white hover:bg-white/10">
              Return to Venue Home
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
