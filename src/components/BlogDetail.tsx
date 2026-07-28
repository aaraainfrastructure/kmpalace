import React, { useEffect, useState } from 'react';
import { BlogPost, BLOG_POSTS } from '../data/blogData';
import { BlogLeadForm } from './BlogLeadForm';
import { BlogSidebar } from './BlogSidebar';
import { 
  Calendar, User, Clock, ChevronRight, Share2, Bookmark, CheckCircle2, 
  AlertTriangle, Lightbulb, Quote, ArrowRight, Phone, MessageSquare, MapPin, 
  Star, HelpCircle, Building2, ExternalLink 
} from 'lucide-react';

interface BlogDetailProps {
  post: BlogPost;
  onNavigateHome: () => void;
  onNavigateBlogList: () => void;
  onSelectPost: (slug: string) => void;
  onOpenBooking: () => void;
}

export const BlogDetail: React.FC<BlogDetailProps> = ({
  post,
  onNavigateHome,
  onNavigateBlogList,
  onSelectPost,
  onOpenBooking,
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Dynamically inject JSON-LD Schemas into document head
  useEffect(() => {
    // 1. BlogPosting Schema
    const blogPostingSchema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': post.canonicalUrl,
      },
      'headline': post.seoTitle,
      'description': post.metaDescription,
      'image': [post.heroImage],
      'author': {
        '@type': 'Person',
        'name': post.author,
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'KM PALACE',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://kmpalace.com/assets/logo.png',
        },
      },
      'datePublished': post.publishedDate,
      'dateModified': post.modifiedDate,
    };

    // 2. BreadcrumbList Schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://kmpalace.com',
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Blog',
          'item': 'https://kmpalace.com/blog',
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': post.seoTitle,
          'item': post.canonicalUrl,
        },
      ],
    };

    // 3. FAQPage Schema
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': post.faqs.map((faq) => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer,
        },
      })),
    };

    // 4. LocalBusiness / EventVenue Schema
    const localBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': 'EventVenue',
      'name': 'KM PALACE Royal Signature Marriage Hall',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': '9/133, Sirukalathur Main Rd, Kavanur, Chembarambakkam',
        'addressLocality': 'Kundrathur, Chennai',
        'addressRegion': 'Tamil Nadu',
        'postalCode': '600069',
        'addressCountry': 'IN',
      },
      'telephone': '+91-9159277277',
      'url': 'https://kmpalace.com',
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.9',
        'reviewCount': '250',
      },
    };

    const scriptIds = ['schema-blogposting', 'schema-breadcrumb', 'schema-faq', 'schema-localbus'];

    scriptIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    const createScript = (id: string, json: any) => {
      const s = document.createElement('script');
      s.id = id;
      s.type = 'application/ld+json';
      s.text = JSON.stringify(json);
      document.head.appendChild(s);
    };

    createScript('schema-blogposting', blogPostingSchema);
    createScript('schema-breadcrumb', breadcrumbSchema);
    createScript('schema-faq', faqSchema);
    createScript('schema-localbus', localBusinessSchema);

    return () => {
      scriptIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
    };
  }, [post]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.seoTitle,
        text: post.metaDescription,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const relatedPosts = post.relatedSlugs
    .map((s) => BLOG_POSTS.find((bp) => bp.slug === s))
    .filter(Boolean) as BlogPost[];

  const sectionCount = post.sections.length;
  const quarterIndex = Math.floor(sectionCount * 0.25);
  const halfIndex = Math.floor(sectionCount * 0.60);
  const lastQuarterIndex = Math.floor(sectionCount * 0.90);

  return (
    <article className="min-h-screen bg-[#FDFBF7] text-[#2E2A26]">
      {/* Top Breadcrumb Header */}
      <div className="bg-[#2E2A26] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#C7A86D]/30">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center space-x-2 text-xs text-[#E5D9C5] mb-4 overflow-x-auto pb-1">
            <button onClick={onNavigateHome} className="hover:text-[#C7A86D] transition-colors cursor-pointer shrink-0">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <button onClick={onNavigateBlogList} className="hover:text-[#C7A86D] transition-colors cursor-pointer shrink-0">
              Blog
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span className="text-[#C7A86D] font-semibold truncate max-w-xs">{post.seoTitle}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-[#C7A86D]/20 border border-[#C7A86D]/40 text-[#C7A86D] text-[10px] font-extrabold uppercase tracking-widest">
              {post.category}
            </span>
            <span className="text-xs text-gray-400 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-[#C7A86D]" />
              <span>{post.readingTime}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-4 leading-tight">
            {post.seoTitle}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10 text-xs text-[#E5D9C5]">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <User className="w-4 h-4 text-[#C7A86D]" />
                <span className="font-semibold text-white">{post.author}</span>
              </div>
              <div className="flex items-center space-x-1.5 font-num">
                <Calendar className="w-4 h-4 text-[#C7A86D]" />
                <span>Published: {post.publishedDate}</span>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#C7A86D]" />
              <span>{copied ? 'Link Copied!' : 'Share Article'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Article Body (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Hero Image */}
            <div className="rounded-[24px] overflow-hidden border border-[#E5D9C5] shadow-md relative group">
              <img
                src={post.heroImage}
                alt={post.featuredImageAlt}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200';
                }}
                className="w-full h-[320px] sm:h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                <p className="text-white text-xs sm:text-sm italic font-serif">
                  {post.featuredImageAlt} — KM PALACE Chennai
                </p>
              </div>
            </div>

            {/* Quick Executive Summary Callout */}
            <div className="p-6 rounded-[20px] bg-gradient-to-r from-[#2E2A26] to-[#1F1C19] text-white border border-[#C7A86D]/40 shadow-sm">
              <h3 className="text-xs font-extrabold text-[#C7A86D] uppercase tracking-widest mb-2 flex items-center space-x-1.5">
                <Lightbulb className="w-4 h-4 text-[#C7A86D]" />
                <span>Executive Summary & Key Takeaways</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#E5D9C5] leading-relaxed font-serif">
                {post.summary}
              </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-white p-6 rounded-[20px] border border-[#E5D9C5] shadow-xs">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#2E2A26] mb-3 flex items-center space-x-2">
                <Bookmark className="w-4 h-4 text-[#C7A86D]" />
                <span>Table of Contents</span>
              </h3>
              <nav className="space-y-1.5 max-h-80 overflow-y-auto pr-2">
                {post.tableOfContents.map((toc, idx) => (
                  <button
                    key={toc.id}
                    onClick={() => scrollToSection(toc.id)}
                    className={`w-full text-left text-xs transition-colors py-1 px-2 rounded-lg cursor-pointer block ${
                      toc.level === 'h3' ? 'pl-6 text-gray-600 hover:text-[#C7A86D]' : 'font-semibold text-[#2E2A26] hover:text-[#C7A86D] hover:bg-[#FDFBF7]'
                    } ${activeSectionId === toc.id ? 'bg-[#2E2A26] text-[#C7A86D] font-bold' : ''}`}
                  >
                    <span className="font-num mr-1 text-[#C7A86D]">{idx + 1}.</span> {toc.title}
                  </button>
                ))}
              </nav>
            </div>

            {/* Dynamic Content Sections */}
            <div className="space-y-10">
              {post.sections.map((section, idx) => {
                const showCTA1 = idx === quarterIndex;
                const showCTA2 = idx === halfIndex;
                const showCTA3 = idx === lastQuarterIndex;

                return (
                  <React.Fragment key={section.id}>
                    <section id={section.id} className="space-y-4 scroll-mt-24">
                      {section.h2Title && (
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2A26] border-b-2 border-[#C7A86D]/30 pb-2">
                          {section.h2Title}
                        </h2>
                      )}

                      {section.h3Title && (
                        <h3 className="text-xl font-serif font-bold text-[#2E2A26] text-[#C7A86D]">
                          {section.h3Title}
                        </h3>
                      )}

                      {section.contentParagraphs.map((para, pIdx) => (
                        <p key={pIdx} className="text-xs sm:text-sm text-[#4A443E] leading-relaxed font-serif">
                          {para}
                        </p>
                      ))}

                      {/* Callout Boxes */}
                      {section.calloutBox && (
                        <div className={`p-5 rounded-xl border text-xs sm:text-sm my-4 font-sans ${
                          section.calloutBox.type === 'tip'
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                            : section.calloutBox.type === 'warning'
                            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                            : section.calloutBox.type === 'quote'
                            ? 'bg-[#2E2A26] text-white border-[#C7A86D]'
                            : 'bg-sky-50/80 border-sky-300 text-sky-950'
                        }`}>
                          <div className="flex items-start space-x-3">
                            {section.calloutBox.type === 'tip' && <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
                            {section.calloutBox.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                            {section.calloutBox.type === 'quote' && <Quote className="w-5 h-5 text-[#C7A86D] shrink-0 mt-0.5" />}
                            <div>
                              <p className="font-extrabold uppercase tracking-wider text-xs mb-1 text-[#C7A86D]">
                                {section.calloutBox.title}
                              </p>
                              <p className="leading-relaxed">{section.calloutBox.text}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Comparison Tables */}
                      {section.comparisonTable && (
                        <div className="overflow-x-auto my-6 rounded-2xl border border-[#E5D9C5] bg-white shadow-xs">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#2E2A26] text-[#C7A86D] uppercase text-[10px] tracking-wider">
                              <tr>
                                {section.comparisonTable.headers.map((h, hIdx) => (
                                  <th key={hIdx} className="px-4 py-3 border-b border-[#C7A86D]/30 font-bold">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5D9C5]/50">
                              {section.comparisonTable.rows.map((row, rIdx) => (
                                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-[#FDFBF7]'}>
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="px-4 py-3 text-[#2E2A26] font-medium font-num">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Checklists */}
                      {section.checklist && (
                        <div className="bg-white p-5 rounded-xl border border-[#E5D9C5] my-4 space-y-2">
                          <p className="text-xs font-bold text-[#2E2A26] uppercase tracking-wider mb-3">Checklist Summary</p>
                          {section.checklist.map((item, cIdx) => (
                            <div key={cIdx} className="flex items-start space-x-2 text-xs text-[#2E2A26]">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* CTA Section 1 (25% height) */}
                    {showCTA1 && (
                      <div className="p-6 rounded-[20px] bg-gradient-to-r from-[#2E2A26] via-[#3A3530] to-[#2E2A26] text-white border border-[#C7A86D] my-8 shadow-lg">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            <span className="text-[#C7A86D] text-[10px] uppercase font-bold tracking-widest block mb-1">
                              Special Marriage Offer
                            </span>
                            <h4 className="text-xl font-serif font-bold text-white">
                              Book Your Dream Wedding at KM Palace
                            </h4>
                            <p className="text-xs text-[#E5D9C5] mt-1">
                              Centralized AC Hall • 300 Veg Dining • 11 AC Rooms • 70 Cars & 300+ Scooters Parking
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              onClick={onOpenBooking}
                              className="btn-gold py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Book Site Visit
                            </button>
                            <a
                              href="https://wa.me/919159277277?text=Hello%20KM%20Palace%2C%20I%20want%20to%20get%20a%20wedding%20quote."
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
                            >
                              Get Quote
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CTA Section 2 (60% height) */}
                    {showCTA2 && (
                      <div className="p-6 rounded-[20px] bg-gradient-to-r from-amber-950 via-[#2E2A26] to-amber-950 text-white border border-amber-500/50 my-8 shadow-lg">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            <span className="text-amber-400 text-[10px] uppercase font-bold tracking-widest block mb-1">
                              Peak Subha Muhurtham Dates
                            </span>
                            <h4 className="text-xl font-serif font-bold text-white">
                              Lock Your Auspicious Date Before Availability Closes
                            </h4>
                            <p className="text-xs text-amber-200 mt-1">
                              Call our manager directly at +91 9159277277 for real-time calendar updates.
                            </p>
                          </div>
                          <div className="shrink-0">
                            <a
                              href="tel:+919159277277"
                              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all"
                            >
                              <Phone className="w-4 h-4" />
                              <span>Call Now +91 9159277277</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CTA Section 3 (90% height) */}
                    {showCTA3 && (
                      <div className="p-6 rounded-[20px] bg-gradient-to-r from-emerald-950 to-[#2E2A26] text-white border border-emerald-500/50 my-8 shadow-lg">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-widest block mb-1">
                              Direct Venue Reservation
                            </span>
                            <h4 className="text-xl font-serif font-bold text-white">
                              Ready to Reserve KM PALACE Signature Marriage Hall?
                            </h4>
                            <p className="text-xs text-emerald-200 mt-1">
                              Transparent tariffs • No hidden electricity maintenance fees.
                            </p>
                          </div>
                          <button
                            onClick={onOpenBooking}
                            className="btn-gold py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0"
                          >
                            Reserve Hall Online
                          </button>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Internal Links Block */}
            <div className="bg-white p-6 rounded-[20px] border border-[#E5D9C5] shadow-xs my-8">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#2E2A26] mb-4">
                Recommended Related Reading Guides
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {post.internalLinks.map((link) => (
                  <button
                    key={link.slug}
                    onClick={() => onSelectPost(link.slug)}
                    className="p-3 rounded-xl border border-[#E5D9C5] bg-[#FDFBF7] hover:bg-[#2E2A26] hover:text-[#C7A86D] text-left transition-all cursor-pointer group"
                  >
                    <p className="text-xs font-bold text-[#2E2A26] group-hover:text-[#C7A86D] flex items-center justify-between">
                      <span>{link.anchorText}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C7A86D]" />
                    </p>
                    <p className="text-[10px] text-gray-500 group-hover:text-[#E5D9C5] mt-1 line-clamp-1">
                      {link.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Lead Generation Contact Form */}
            <BlogLeadForm
              blogTitle={post.seoTitle}
              keyword={post.keywords[0]}
              pageUrl={post.canonicalUrl}
            />

            {/* FAQs Section */}
            <section className="bg-white p-6 sm:p-8 rounded-[24px] border border-[#E5D9C5] shadow-xs my-10">
              <div className="flex items-center space-x-2 text-[#C7A86D] text-xs uppercase font-extrabold tracking-widest mb-2">
                <HelpCircle className="w-4 h-4 text-[#C7A86D]" />
                <span>Frequently Asked Questions</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#2E2A26] mb-6">
                Common Questions About {post.keywords[0]}
              </h3>

              <div className="space-y-4 divide-y divide-[#E5D9C5]">
                {post.faqs.map((faq, idx) => (
                  <div key={idx} className="pt-4 first:pt-0">
                    <h4 className="text-xs sm:text-sm font-bold text-[#2E2A26] mb-1.5 flex items-start space-x-2">
                      <span className="text-[#C7A86D] font-num shrink-0">Q{idx + 1}.</span>
                      <span>{faq.question}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 pl-6 leading-relaxed font-serif">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 6 Related Posts Grid */}
            <section className="my-10">
              <h3 className="text-xl font-serif font-bold text-[#2E2A26] mb-6 border-b-2 border-[#C7A86D]/30 pb-2">
                Explore 6 More Wedding Guides
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPosts.slice(0, 6).map((rel) => (
                  <div
                    key={rel.slug}
                    onClick={() => onSelectPost(rel.slug)}
                    className="bg-white rounded-2xl border border-[#E5D9C5] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col"
                  >
                    <img
                      src={rel.heroImage}
                      alt={rel.featuredImageAlt}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200';
                      }}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C7A86D]">
                          {rel.category}
                        </span>
                        <h4 className="text-xs font-bold text-[#2E2A26] group-hover:text-[#C7A86D] transition-colors line-clamp-2 mt-1">
                          {rel.seoTitle}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-3 border-t border-gray-100 mt-2">
                        <span>{rel.readingTime}</span>
                        <span className="text-[#C7A86D] font-bold group-hover:translate-x-1 transition-transform flex items-center space-x-0.5">
                          <span>Read</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Sidebar (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <BlogSidebar
                currentSlug={post.slug}
                selectedCategory="All Posts"
                onSelectCategory={() => onNavigateBlogList()}
                searchQuery=""
                onSearchChange={() => onNavigateBlogList()}
                onSelectPost={onSelectPost}
                onOpenBooking={onOpenBooking}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Footer CTA & Google Maps Embed */}
      <footer className="bg-[#1F1C19] text-white pt-12 pb-8 border-t border-[#C7A86D]/30 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-10 pb-10 border-b border-white/10">
            <div>
              <span className="text-[#C7A86D] text-xs font-extrabold uppercase tracking-widest block mb-2">
                Visit KM PALACE Today
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                Book Your Wedding Today at Chennai's Royal Marriage Hall
              </h3>
              <p className="text-xs text-[#E5D9C5]">
                9/133, Sirukalathur Main Rd, Kavanur, Chembarambakkam, Kundrathur, Chennai - 600069
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-start md:justify-end gap-3">
              <a
                href="tel:+919159277277"
                className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20"
              >
                <Phone className="w-4 h-4 text-[#C7A86D]" />
                <span className="font-num">+91 9159277277</span>
              </a>

              <a
                href="https://wa.me/919159277277?text=Hello%20KM%20Palace%2C%20I%20am%20enquiring%20about%20marriage%20hall%20availability."
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Enquiry</span>
              </a>

              <button
                onClick={onOpenBooking}
                className="btn-gold py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Book Hall
              </button>
            </div>
          </div>

          {/* Embedded Google Map */}
          <div className="rounded-2xl overflow-hidden border border-[#C7A86D]/30 h-64 mb-8">
            <iframe
              title="KM PALACE Google Maps Location"
              src="https://maps.google.com/maps?q=KM+PALACE,+9/133,+Sirukalathur+Main+Rd,+Kavanur,+Chembarambakkam,+Tamil+Nadu+600069,+India&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </div>

          <div className="text-center text-[11px] text-[#A0AEC0]">
            <p>© 2026 KM PALACE Royal Signature Marriage Hall • All Rights Reserved. Designed for Google Search Quality & SEO Excellence.</p>
          </div>
        </div>
      </footer>
    </article>
  );
};
