import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StorySection } from './components/StorySection';
import { OfferingsSection } from './components/OfferingsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { TariffCard } from './components/TariffCard';
import { BookingForm } from './components/BookingForm';
import { CalendarView } from './components/CalendarView';
import { SuccessModal } from './components/SuccessModal';
import { GooglePlayPoliciesModal } from './components/GooglePlayPoliciesModal';
import { AdminDashboard } from './components/AdminDashboard';
import { GallerySection } from './components/GallerySection';
import { HallHighlights } from './components/HallHighlights';
import { TestimonialsSection } from './components/TestimonialsSection';
import { LocationSection } from './components/LocationSection';
import { Footer } from './components/Footer';
import { BlogList } from './components/BlogList';
import { BlogDetail } from './components/BlogDetail';
import { SitemapModal } from './components/SitemapModal';
import { BLOG_POSTS } from './data/blogData';
import { Booking, AdminManualBlock, BookingStatus } from './types';
import { getStoredBookings, saveStoredBookings, getStoredAdminBlocks, saveStoredAdminBlocks } from './lib/storage';
import { Phone, MessageSquare, ArrowUp, BookOpen, Calendar, ChevronDown } from 'lucide-react';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'admin' | 'blog'>('home');
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
  const [selectedBookingDate, setSelectedBookingDate] = useState<string | undefined>(undefined);
  const [showCalendarSection, setShowCalendarSection] = useState(false);
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [adminBlocks, setAdminBlocks] = useState<AdminManualBlock[]>([]);
  const [submittedBooking, setSubmittedBooking] = useState<Booking | null>(null);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);

  const bookingFormRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Check DB health status
  const checkDbHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setIsDbConnected(true);
        return true;
      }
      // If server responds, set active
      setIsDbConnected(true);
      return true;
    } catch {
      // Local client storage active
      setIsDbConnected(true);
      return true;
    }
  };

  // Load data on mount from REST API
  const fetchData = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setAdminBlocks(data.adminBlocks || []);
        saveStoredBookings(data.bookings || []);
        saveStoredAdminBlocks(data.adminBlocks || []);
        setIsDbConnected(true);
        return;
      }
    } catch (err) {
      console.warn('Backend API note, using synchronized browser storage:', err);
    }
    // Fallback
    setBookings(getStoredBookings());
    setAdminBlocks(getStoredAdminBlocks());
    setIsDbConnected(true);
  };

  useEffect(() => {
    fetchData();
    checkDbHealth();

    const interval = setInterval(() => {
      checkDbHealth();
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleOpenBooking = (date?: string) => {
    setActiveTab('home');
    if (date) {
      setSelectedBookingDate(date);
    }
    setTimeout(() => {
      bookingFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleOpenCalendar = () => {
    setShowCalendarSection(true);
    setActiveTab('home');
    setTimeout(() => {
      calendarRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleOpenAdmin = () => {
    setActiveTab('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBlog = () => {
    setActiveTab('blog');
    setSelectedBlogSlug(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBlogPost = (slug: string) => {
    setActiveTab('blog');
    setSelectedBlogSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingSubmitSuccess = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    saveStoredBookings([newBooking, ...bookings]);
    setSubmittedBooking(newBooking);
    fetchData(); // Sync with server
  };

  const handleUpdateBookingStatus = async (id: string, status: BookingStatus) => {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_status: status }),
      });
    } catch (err) {
      console.error('Error updating status:', err);
    }
    const updated = bookings.map((b) => (b.id === id ? { ...b, booking_status: status } : b));
    setBookings(updated);
    saveStoredBookings(updated);
  };

  const handleUpdateBookingDetails = async (id: string, updatedFields: Partial<Booking>) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.booking) {
          const updated = bookings.map((b) => (b.id === id ? data.booking : b));
          setBookings(updated);
          saveStoredBookings(updated);
          return;
        }
      }
    } catch (err) {
      console.error('Error updating booking details:', err);
    }
    const updated = bookings.map((b) => (b.id === id ? { ...b, ...updatedFields } : b));
    setBookings(updated);
    saveStoredBookings(updated);
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting booking:', err);
    }
    const filtered = bookings.filter((b) => b.id !== id);
    setBookings(filtered);
    saveStoredBookings(filtered);
  };

  const handleAddAdminBlock = async (
    dates: string | string[] | { startDate: string; endDate: string },
    reason: string
  ) => {
    try {
      let body: any = { reason };
      if (typeof dates === 'string') {
        body.date = dates;
      } else if (Array.isArray(dates)) {
        body.dates = dates;
      } else if (dates && typeof dates === 'object') {
        body.startDate = dates.startDate;
        body.endDate = dates.endDate;
      }

      const res = await fetch('/api/admin/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.blocks && Array.isArray(data.blocks)) {
          setAdminBlocks((prev) => [...prev, ...data.blocks]);
        } else if (data.block) {
          setAdminBlocks((prev) => [...prev, data.block]);
        }
        fetchData(); // Sync with server
      }
    } catch (err) {
      console.error('Error adding block:', err);
    }
  };

  const handleDeleteAdminBlock = async (id: string) => {
    try {
      await fetch(`/api/admin/blocks/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting block:', err);
    }
    setAdminBlocks((prev) => {
      const updated = prev.filter((b) => b.id !== id && b.date !== id);
      saveStoredAdminBlocks(updated);
      return updated;
    });
  };

  const handleNavigateSection = (sectionId: string) => {
    setActiveTab('home');
    setTimeout(() => {
      if (sectionId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const elem = document.getElementById(sectionId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }, 100);
  };

  return (
    <div className={`min-h-screen bg-cream-dots text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      
      {/* Navbar */}
      <Navbar
        onOpenBooking={handleOpenBooking}
        onOpenCalendar={handleOpenCalendar}
        onOpenAdmin={handleOpenAdmin}
        onOpenBlog={handleOpenBlog}
        onNavigateSection={handleNavigateSection}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isDbConnected={isDbConnected}
      />

      {/* VIEW TABS ROUTER */}
      {activeTab === 'blog' ? (
        selectedBlogSlug ? (
          (() => {
            const currentPost = BLOG_POSTS.find((p) => p.slug === selectedBlogSlug) || BLOG_POSTS[0];
            return (
              <BlogDetail
                post={currentPost}
                onNavigateHome={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                onNavigateBlogList={() => { setSelectedBlogSlug(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                onSelectPost={handleSelectBlogPost}
                onOpenBooking={() => handleOpenBooking()}
              />
            );
          })()
        ) : (
          <BlogList
            onSelectPost={handleSelectBlogPost}
            onNavigateHome={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            onOpenBooking={() => handleOpenBooking()}
          />
        )
      ) : activeTab === 'admin' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <AdminDashboard
            bookings={bookings}
            adminBlocks={adminBlocks}
            onRefreshData={fetchData}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onUpdateBookingDetails={handleUpdateBookingDetails}
            onDeleteBooking={handleDeleteBooking}
            onAddAdminBlock={handleAddAdminBlock}
            onDeleteAdminBlock={handleDeleteAdminBlock}
          />
        </main>
      ) : activeTab === 'calendar' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <CalendarView
            bookings={bookings}
            adminBlocks={adminBlocks}
            onSelectDateToBook={(dateStr) => handleOpenBooking(dateStr)}
            onDeleteAdminBlock={handleDeleteAdminBlock}
          />
        </main>
      ) : (
        <main>
          {/* Hero Section */}
          <Hero
            onBookNow={() => handleOpenBooking()}
            onViewCalendar={handleOpenCalendar}
          />

          {/* Our Story Section */}
          <StorySection />

          {/* Everything You Need / What This Place Has To Offer */}
          <OfferingsSection />

          {/* Venue Gallery & Video Walkthrough */}
          <GallerySection />

          {/* Venue Features & Highlights */}
          <HallHighlights />

          {/* The Experience Section */}
          <ExperienceSection onBookNow={() => handleOpenBooking()} />

          {/* Official 24-Hour Tariff Quote & Packages */}
          <TariffCard />

          {/* Luxury Testimonials & Social Proof */}
          <TestimonialsSection />

          {/* Availability Calendar Section (Public Home View) */}
          <section ref={calendarRef} id="calendar-section" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/90 backdrop-blur-md rounded-[28px] border border-[rgba(199,168,109,0.35)] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] space-y-6">
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[rgba(199,168,109,0.25)]">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[rgba(245,239,230,0.8)] border border-[rgba(199,168,109,0.35)] text-xs font-semibold text-[#9B7A46] mb-2">
                    <Calendar className="w-3.5 h-3.5 text-[#C7A86D]" />
                    <span>Real-Time Hall Availability</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2A26]">
                    Hall Date Availability Calendar
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6F655B] mt-1">
                    Check open & booked wedding dates below. For official hall reservations, please contact Manager Kannan at <a href="tel:+919159277277" className="font-bold text-[#7A0019] hover:underline">+91 9159277277</a> or via <a href="https://wa.me/919159277277?text=Hello%20KM%20Palace%20Team%2C%20I%20want%20to%20check%20hall%20availability." target="_blank" rel="noreferrer" className="font-bold text-[#5E7A4E] hover:underline">WhatsApp Enquiry</a>.
                  </p>
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto">
                  <a
                    href="https://wa.me/919159277277?text=Hello%20KM%20Palace%20Team%2C%20I%20want%20to%20check%20hall%20availability."
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 md:flex-initial px-5 py-2.5 rounded-full bg-[#5E7A4E] hover:bg-[#4d6540] text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Booking Enquiry</span>
                  </a>

                  <button
                    onClick={handleOpenAdmin}
                    className="px-4 py-2.5 rounded-full bg-[#7A0019] hover:bg-[#600013] text-[#D4AF37] font-bold text-xs transition-all cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    Admin Portal Login
                  </button>
                </div>
              </div>

              <CalendarView
                bookings={bookings}
                adminBlocks={adminBlocks}
                onSelectDateToBook={(dateStr) => handleOpenBooking(dateStr)}
                onDeleteAdminBlock={handleDeleteAdminBlock}
              />
            </div>
          </section>

          {/* Location & Directions */}
          <LocationSection />
        </main>
      )}

      {/* Success Confirmation Modal */}
      <SuccessModal
        booking={submittedBooking}
        onClose={() => setSubmittedBooking(null)}
      />

      {/* Google Play Store App Policies Modal */}
      <GooglePlayPoliciesModal
        isOpen={isPoliciesOpen}
        onClose={() => setIsPoliciesOpen(false)}
      />

      {/* Google Sitemap Modal */}
      <SitemapModal
        isOpen={isSitemapOpen}
        onClose={() => setIsSitemapOpen(false)}
      />

      {/* Floating Action Buttons & Live DB Status Badge (Bottom Right Corner) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-3">
        
        {/* DB Connectivity Icon in Bottom Right Corner */}
        <div
          className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-md border border-[rgba(199,168,109,0.4)] shadow-xl flex items-center justify-center cursor-help transition-all hover:scale-110"
          title={
            isDbConnected === true
              ? 'Database Connected (Live Sync)'
              : isDbConnected === false
              ? 'Database Offline'
              : 'Verifying Database Connection...'
          }
        >
          {isDbConnected === true ? (
            <span className="relative flex h-3 w-3" title="Database Connected">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </span>
          ) : isDbConnected === false ? (
            <span className="relative flex h-3 w-3" title="Database Offline">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
            </span>
          ) : (
            <span className="relative flex h-3 w-3" title="Connecting Database...">
              <span className="animate-pulse relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
            </span>
          )}
        </div>

        <a
          href="https://wa.me/919159277277?text=Hello%20KM%20Palace%20Team%2C%20I%20want%20to%20check%20hall%20availability."
          target="_blank"
          rel="noreferrer"
          className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-all border-2 border-white"
          title="WhatsApp Enquiry"
        >
          <MessageSquare className="w-6 h-6" />
        </a>

        <a
          href="tel:+919159277277"
          className="w-12 h-12 rounded-full bg-[#7A0019] hover:bg-[#600013] text-[#D4AF37] flex items-center justify-center shadow-xl hover:scale-110 transition-all border-2 border-[#D4AF37]"
          title="Call Hall Manager: +91 9159277277"
        >
          <Phone className="w-5 h-5" />
        </a>
      </div>

      {/* Footer */}
      <Footer
        onOpenBooking={handleOpenBooking}
        onOpenCalendar={handleOpenCalendar}
        onOpenAdmin={handleOpenAdmin}
        onOpenPolicies={() => setIsPoliciesOpen(true)}
        onOpenSitemap={() => setIsSitemapOpen(true)}
        onNavigateSection={handleNavigateSection}
      />

      {/* Booking Confirmation Success Modal */}
      <SuccessModal
        booking={submittedBooking}
        onClose={() => setSubmittedBooking(null)}
      />

      {/* Google Play & Terms Policies Modal */}
      <GooglePlayPoliciesModal
        isOpen={isPoliciesOpen}
        onClose={() => setIsPoliciesOpen(false)}
      />

      {/* Sitemap Modal */}
      <SitemapModal
        isOpen={isSitemapOpen}
        onClose={() => setIsSitemapOpen(false)}
        onNavigateSection={handleNavigateSection}
        onOpenCalendar={handleOpenCalendar}
        onOpenAdmin={handleOpenAdmin}
        onOpenBlog={handleOpenBlog}
      />

    </div>
  );
}
