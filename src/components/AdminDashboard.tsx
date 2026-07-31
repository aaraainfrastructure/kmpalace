import React, { useState } from 'react';
import { ShieldCheck, Lock, Search, Filter, Download, Trash2, Edit3, Plus, DollarSign, Calendar as CalendarIcon, Users, CheckCircle2, XCircle, AlertCircle, RefreshCw, FileSpreadsheet, Printer, Sparkles, Mail, Send, Check, Eye, X, Save, Clock, CreditCard, FileText } from 'lucide-react';
import { Booking, AdminManualBlock, BookingStatus, FunctionType, SpecialRequirement } from '../types';
import { formatDisplayDate, calculateBlockedDates } from '../lib/bookingLogic';
import { exportToExcel, printBookingReceipt } from '../lib/exportUtils';
import { BookingForm } from './BookingForm';

interface AdminDashboardProps {
  bookings: Booking[];
  adminBlocks: AdminManualBlock[];
  onRefreshData: () => void;
  onUpdateBookingStatus: (id: string, status: BookingStatus) => void;
  onUpdateBookingDetails?: (id: string, updatedFields: Partial<Booking>) => void;
  onDeleteBooking: (id: string) => void;
  onAddAdminBlock: (dates: any, reason: string) => void;
  onDeleteAdminBlock: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  bookings,
  adminBlocks,
  onRefreshData,
  onUpdateBookingStatus,
  onUpdateBookingDetails,
  onDeleteBooking,
  onAddAdminBlock,
  onDeleteAdminBlock,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Admin Active Tab (Bookings vs Blocked Dates Manager vs Create Booking)
  const [adminActiveTab, setAdminActiveTab] = useState<'bookings' | 'blocked_dates' | 'create_booking'>('bookings');

  // Block Removal & Management state
  const [selectedBlocksForDeletion, setSelectedBlocksForDeletion] = useState<string[]>([]);
  const [quickUnblockDate, setQuickUnblockDate] = useState('');
  const [blockListViewMode, setBlockListViewMode] = useState<'badges' | 'table'>('table');
  const [customBookingDateInput, setCustomBookingDateInput] = useState('');

  // Manual Block Form (Supports Range, Multiple Dates, or Single Date)
  const [blockMode, setBlockMode] = useState<'range' | 'multi' | 'single'>('range');
  const [blockStartDate, setBlockStartDate] = useState('');
  const [blockEndDate, setBlockEndDate] = useState('');
  const [selectedMultiDates, setSelectedMultiDates] = useState<string[]>([]);
  const [multiDateInput, setMultiDateInput] = useState('');
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('Hall Maintenance');

  // Email state
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [emailSuccessId, setEmailSuccessId] = useState<string | null>(null);

  // Modals state
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [blockActionBanner, setBlockActionBanner] = useState<string | null>(null);

  const handleDeleteAllAdminBlocks = async () => {
    if (adminBlocks.length === 0) return;
    const count = adminBlocks.length;
    const idsToDelete = adminBlocks.map((b) => b.id);
    setSelectedBlocksForDeletion([]);
    for (const id of idsToDelete) {
      await onDeleteAdminBlock(id);
    }
    setBlockActionBanner(`Successfully removed all ${count} maintenance block(s).`);
    setTimeout(() => setBlockActionBanner(null), 4000);
  };

  const handleDeleteSelectedAdminBlocks = async () => {
    if (selectedBlocksForDeletion.length === 0) return;
    const count = selectedBlocksForDeletion.length;
    const idsToDelete = [...selectedBlocksForDeletion];
    setSelectedBlocksForDeletion([]);
    for (const id of idsToDelete) {
      await onDeleteAdminBlock(id);
    }
    setBlockActionBanner(`Successfully removed ${count} selected maintenance block(s).`);
    setTimeout(() => setBlockActionBanner(null), 4000);
  };

  const handleQuickUnblockDate = async () => {
    if (!quickUnblockDate) return;
    const matches = adminBlocks.filter((b) => b.date === quickUnblockDate);
    if (matches.length > 0) {
      for (const m of matches) {
        await onDeleteAdminBlock(m.id);
      }
      const unblockedFormatted = formatDisplayDate(quickUnblockDate);
      setQuickUnblockDate('');
      setBlockActionBanner(`Successfully unblocked ${unblockedFormatted}. Date is now free!`);
      setTimeout(() => setBlockActionBanner(null), 4000);
    } else {
      const bookingMatch = bookings.find(
        (b) => (b.blocked_dates || [b.marriage_date]).includes(quickUnblockDate) && b.booking_status !== 'Cancelled'
      );
      if (bookingMatch) {
        setBlockActionBanner(
          `Date ${formatDisplayDate(quickUnblockDate)} is blocked by booking ${bookingMatch.booking_id} (${bookingMatch.customer_name}). Edit or set booking status as Cancelled to release date.`
        );
      } else {
        setBlockActionBanner(`No active maintenance block found for ${formatDisplayDate(quickUnblockDate)}. Date is already free!`);
      }
      setTimeout(() => setBlockActionBanner(null), 5000);
    }
  };

  const handleToggleSelectBlockForDeletion = (id: string) => {
    setSelectedBlocksForDeletion((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllBlocksForDeletion = () => {
    if (selectedBlocksForDeletion.length === adminBlocks.length) {
      setSelectedBlocksForDeletion([]);
    } else {
      setSelectedBlocksForDeletion(adminBlocks.map((b) => b.id));
    }
  };

  const handleRemoveBlockedDateFromBooking = (dateToRemove: string) => {
    if (!editingBooking) return;
    const currentDates = editingBooking.blocked_dates || [editingBooking.marriage_date];
    const updatedDates = currentDates.filter((d) => d !== dateToRemove);
    setEditingBooking({
      ...editingBooking,
      blocked_dates: updatedDates,
    });
  };

  const handleAddCustomBlockedDateToBooking = () => {
    if (!editingBooking || !customBookingDateInput) return;
    const currentDates = editingBooking.blocked_dates || [editingBooking.marriage_date];
    if (!currentDates.includes(customBookingDateInput)) {
      setEditingBooking({
        ...editingBooking,
        blocked_dates: [...currentDates, customBookingDateInput].sort(),
      });
    }
    setCustomBookingDateInput('');
  };

  const handleRecalculateBookingDates = () => {
    if (!editingBooking) return;
    const { blockedDates, blockedPreviousDay } = calculateBlockedDates(
      editingBooking.marriage_date,
      editingBooking.slot_type || '24hr',
      editingBooking.from_time,
      editingBooking.end_time,
      editingBooking.muhurtham_time || '09:00 AM'
    );
    setEditingBooking({
      ...editingBooking,
      blocked_dates: blockedDates,
      blocked_previous_day: blockedPreviousDay,
    });
  };

  const handleEmailInvoice = async (booking: Booking) => {
    setSendingEmailId(booking.id);
    setEmailSuccessId(null);
    try {
      await fetch('/api/bookings/forward-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.booking_id,
          target_email: 'Kannan.d26@gmail.com',
        }),
      });
      setEmailSuccessId(booking.id);
      setTimeout(() => setEmailSuccessId(null), 3000);
    } catch (err) {
      console.error('Email send error:', err);
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleSaveEditedBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    // Use current blocked_dates array if modified by admin, or fallback to recalculation if empty
    const currentBlockedDates =
      editingBooking.blocked_dates && editingBooking.blocked_dates.length > 0
        ? editingBooking.blocked_dates
        : calculateBlockedDates(editingBooking.marriage_date, editingBooking.slot_type || '24hr', editingBooking.from_time, editingBooking.end_time, editingBooking.muhurtham_time || '09:00 AM').blockedDates;

    const updatedData: Partial<Booking> = {
      ...editingBooking,
      blocked_dates: currentBlockedDates,
      blocked_previous_day: editingBooking.blocked_previous_day,
    };

    if (onUpdateBookingDetails) {
      onUpdateBookingDetails(editingBooking.id, updatedData);
    } else {
      onUpdateBookingStatus(editingBooking.id, editingBooking.booking_status);
    }

    setEditingBooking(null);
  };

  const handleQuickCancel = (booking: Booking) => {
    if (window.confirm(`Are you sure you want to CANCEL booking ${booking.booking_id} for ${booking.customer_name}?`)) {
      onUpdateBookingStatus(booking.id, 'Cancelled');
      if (viewingBooking?.id === booking.id) {
        setViewingBooking((prev) => (prev ? { ...prev, booking_status: 'Cancelled' } : null));
      }
    }
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Snowboy@2226') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="glass-card max-w-md mx-auto my-12 rounded-[28px] border border-[rgba(199,168,109,0.35)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-[linear-gradient(135deg,#E8D8B0_0%,#C7A86D_100%)] text-[#2E2A26] flex items-center justify-center border border-white shadow-xs">
          <Lock className="w-7 h-7 text-[#2E2A26]" />
        </div>

        <div>
          <h2 className="text-2xl font-serif font-semibold text-[#2E2A26]">
            Manager Portal Access
          </h2>
          <p className="text-xs text-[#6F655B] mt-1 font-normal">
            Enter your management passcode to open the KM PALACE admin suite.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Enter passcode"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-[14px] border border-[rgba(199,168,109,0.3)] bg-white/80 text-[#2E2A26] text-center font-semibold text-sm focus:border-[#C7A86D] focus:outline-none shadow-2xs"
            />
            {authError && (
              <p className="text-xs font-semibold text-[#9B7A46] mt-1.5">
                Incorrect passcode. Please try again.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn-gold w-full py-3.5 rounded-[14px] font-semibold text-xs shadow-xs cursor-pointer"
          >
            Unlock Management Console
          </button>
        </form>
      </div>
    );
  }

  // Statistics Calculations
  const totalBookingsCount = bookings.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysBookingsCount = bookings.filter((b) => (b.blocked_dates || []).includes(todayStr)).length;
  const upcomingBookingsCount = bookings.filter((b) => b.marriage_date >= todayStr && b.booking_status !== 'Cancelled').length;
  const totalRevenue = bookings
    .filter((b) => b.booking_status === 'Confirmed' || b.booking_status === 'Completed')
    .reduce((sum, b) => sum + (b.estimated_amount || 364500), 0);

  // Filtered Bookings list
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.booking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm) ||
      b.bride_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.groom_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'ALL' || b.function_type === filterType;
    const matchesStatus = filterStatus === 'ALL' || b.booking_status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (blockMode === 'range') {
      if (!blockStartDate || !blockEndDate) return;
      if (new Date(blockStartDate) > new Date(blockEndDate)) {
        alert('Start date cannot be after end date.');
        return;
      }
      onAddAdminBlock({ startDate: blockStartDate, endDate: blockEndDate }, newBlockReason);
      setBlockStartDate('');
      setBlockEndDate('');
    } else if (blockMode === 'multi') {
      if (selectedMultiDates.length === 0) return;
      onAddAdminBlock(selectedMultiDates, newBlockReason);
      setSelectedMultiDates([]);
      setMultiDateInput('');
    } else {
      if (!newBlockDate) return;
      onAddAdminBlock(newBlockDate, newBlockReason);
      setNewBlockDate('');
    }
  };

  const handleAddMultiDate = () => {
    if (!multiDateInput) return;
    if (!selectedMultiDates.includes(multiDateInput)) {
      setSelectedMultiDates((prev) => [...prev, multiDateInput].sort());
    }
    setMultiDateInput('');
  };

  const handleRemoveMultiDate = (dToRemove: string) => {
    setSelectedMultiDates((prev) => prev.filter((d) => d !== dToRemove));
  };

  return (
    <div className="glass-card rounded-[24px] border border-[rgba(199,168,109,0.35)] shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6 sm:p-8 space-y-8 transition-colors duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[rgba(199,168,109,0.25)]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[rgba(245,239,230,0.8)] border border-[rgba(199,168,109,0.35)] text-xs font-semibold text-[#9B7A46] mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C7A86D]" />
            <span className="uppercase tracking-widest text-[10px]">KM PALACE Executive Suite</span>
          </div>
          <h2 className="text-2xl font-serif font-semibold text-[#2E2A26]">
            Admin Control Dashboard
          </h2>
          <p className="text-xs text-[#6F655B] font-normal">
            Real-time management for reservations, custom block overrides, and financial exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAdminActiveTab('create_booking')}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-[12px] bg-[linear-gradient(135deg,#7A0019_0%,#A80022_100%)] text-[#D4AF37] hover:brightness-110 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(122,0,25,0.4)] border-2 border-[#D4AF37] animate-pulse cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>➕ CREATE NEW BOOKING</span>
          </button>

          <button
            onClick={() => exportToExcel(filteredBookings)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-[12px] bg-[#7D9B6A] hover:bg-[#6c875b] text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={onRefreshData}
            className="p-2.5 rounded-[12px] border border-[rgba(199,168,109,0.3)] bg-white/80 hover:bg-white text-[#2E2A26] transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4 text-[#9B7A46]" />
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-[20px] bg-white/80 border border-[rgba(199,168,109,0.25)] shadow-2xs space-y-1">
          <p className="text-[#A09384] text-[10px] font-semibold uppercase tracking-wider">Total Bookings</p>
          <p className="text-2xl font-serif font-semibold font-num text-[#2E2A26]">{totalBookingsCount}</p>
          <p className="text-[10px] text-[#6F655B]">All-time records</p>
        </div>

        <div className="p-5 rounded-[20px] bg-white/80 border border-[rgba(199,168,109,0.25)] shadow-2xs space-y-1">
          <p className="text-[#A09384] text-[10px] font-semibold uppercase tracking-wider">Upcoming Events</p>
          <p className="text-2xl font-serif font-semibold font-num text-[#7D9B6A]">{upcomingBookingsCount}</p>
          <p className="text-[10px] text-[#6F655B]">Future scheduled</p>
        </div>

        <div className="p-5 rounded-[20px] bg-white/80 border border-[rgba(199,168,109,0.25)] shadow-2xs space-y-1">
          <p className="text-[#A09384] text-[10px] font-semibold uppercase tracking-wider">Today's Hall Status</p>
          <p className="text-2xl font-serif font-semibold text-[#9B7A46]">
            {todaysBookingsCount > 0 ? 'Occupied' : 'Free Today'}
          </p>
          <p className="text-[10px] text-[#6F655B]">{todaysBookingsCount} active event today</p>
        </div>

        <div className="p-5 rounded-[20px] bg-white/80 border border-[rgba(199,168,109,0.25)] shadow-2xs space-y-1">
          <p className="text-[#A09384] text-[10px] font-semibold uppercase tracking-wider">Est. Revenue (INR)</p>
          <p className="text-2xl font-serif font-semibold font-num text-[#9B7A46]">
            ₹{(totalRevenue / 100000).toFixed(2)} Lakhs
          </p>
          <p className="text-[10px] text-[#6F655B]">Confirmed & Completed</p>
        </div>
      </div>

      {/* SUB NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(199,168,109,0.25)] pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAdminActiveTab('create_booking')}
            className={`px-5 py-2.5 rounded-[14px] text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              adminActiveTab === 'create_booking'
                ? 'bg-[#7A0019] text-[#D4AF37] shadow-md ring-2 ring-[#C7A86D]'
                : 'bg-[#7A0019]/10 text-[#7A0019] hover:bg-[#7A0019]/20 border border-[rgba(122,0,25,0.3)] font-bold'
            }`}
          >
            <Plus className="w-4 h-4 text-[#C7A86D]" />
            <span>➕ Create New Booking</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminActiveTab('bookings')}
            className={`px-5 py-2.5 rounded-[14px] text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              adminActiveTab === 'bookings'
                ? 'bg-[#2E2A26] text-[#C7A86D] shadow-sm'
                : 'bg-white/80 text-[#6F655B] hover:bg-white hover:text-[#2E2A26] border border-[rgba(199,168,109,0.3)]'
            }`}
          >
            <Users className="w-4 h-4 text-[#C7A86D]" />
            <span>All Bookings & Reservations ({bookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminActiveTab('blocked_dates')}
            className={`px-5 py-2.5 rounded-[14px] text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              adminActiveTab === 'blocked_dates'
                ? 'bg-[#2E2A26] text-[#C7A86D] shadow-sm'
                : 'bg-white/80 text-[#6F655B] hover:bg-white hover:text-[#2E2A26] border border-[rgba(199,168,109,0.3)]'
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-[#C7A86D]" />
            <span>🔓 Remove & Manage Blocked Dates ({adminBlocks.length} Active)</span>
          </button>
        </div>

        {adminBlocks.length > 0 && (
          <button
            type="button"
            onClick={handleDeleteAllAdminBlocks}
            className="px-4 py-2 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All {adminBlocks.length} Maintenance Blocks</span>
          </button>
        )}
      </div>

      {/* CREATE NEW BOOKING TAB */}
      {adminActiveTab === 'create_booking' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-gradient-to-r from-[rgba(245,239,230,0.9)] to-white p-6 rounded-[20px] border border-[rgba(199,168,109,0.35)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#7A0019]/10 border border-[#7A0019]/30 text-[#7A0019] text-[11px] font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7A0019]" />
                <span>Admin Booking Entry System</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#2E2A26]">Create & Confirm Official Booking</h3>
              <p className="text-xs text-[#6F655B] mt-1">
                Enter reservation details below. Submitting will register the booking and automatically dispatch the confirmation receipt to <strong className="text-[#2E2A26]">Kannan.d26@gmail.com</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAdminActiveTab('bookings')}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs transition-all cursor-pointer shadow-2xs"
            >
              ← View All Bookings
            </button>
          </div>

          <BookingForm
            existingBookings={bookings}
            adminBlocks={adminBlocks}
            onSubmitSuccess={(newBooking) => {
              onRefreshData();
              setViewingBooking(newBooking);
              setAdminActiveTab('bookings');
            }}
          />
        </div>
      )}

      {/* SEARCH AND FILTERS (BOOKINGS TAB) */}
      {adminActiveTab === 'bookings' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[rgba(245,239,230,0.6)] p-4 rounded-[18px] border border-[rgba(199,168,109,0.25)]">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search name, phone, ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-[12px] border border-[rgba(199,168,109,0.3)] bg-white text-xs text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
            />
            <Search className="w-4 h-4 text-[#A09384] absolute left-3 top-2.5" />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-[12px] border border-[rgba(199,168,109,0.3)] bg-white text-xs font-semibold text-[#2E2A26]"
            >
              <option value="ALL">All Event Types</option>
              <option value="Wedding">Wedding</option>
              <option value="Reception">Reception</option>
              <option value="Engagement">Engagement</option>
              <option value="Birthday">Birthday</option>
              <option value="Conference">Conference</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-[12px] border border-[rgba(199,168,109,0.3)] bg-white text-xs font-semibold text-[#2E2A26]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      )}

      {/* BOOKINGS TABLE (BOOKINGS TAB) */}
      {adminActiveTab === 'bookings' && (
        <div className="overflow-x-auto rounded-[20px] border border-[rgba(199,168,109,0.25)] bg-white/70">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[rgba(245,239,230,0.9)] text-[#9B7A46] font-serif font-semibold uppercase text-[11px] tracking-wider border-b border-[rgba(199,168,109,0.25)]">
                <th className="p-3.5">Ref ID</th>
                <th className="p-3.5">Customer / Couple</th>
                <th className="p-3.5">Phone & Email</th>
                <th className="p-3.5">Booked On</th>
                <th className="p-3.5">Marriage Date</th>
                <th className="p-3.5">Muhurtham</th>
                <th className="p-3.5">Tariff & Services</th>
                <th className="p-3.5">Blocked Schedule</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(199,168,109,0.2)]">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-[#6F655B]">
                    No bookings found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/90 transition-colors">
                    <td className="p-3.5 font-num font-semibold text-[#9B7A46]">
                      {b.booking_id}
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-[#2E2A26]">
                        {b.bride_name && b.groom_name ? `${b.bride_name} & ${b.groom_name}` : b.customer_name}
                      </p>
                      <p className="text-[10px] text-[#A09384] font-num">{b.function_type} • {b.guest_count} Guests</p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold font-num text-[#2E2A26]">{b.phone}</p>
                      <p className="text-[10px] text-[#A09384] truncate max-w-[120px]">{b.email}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold font-num text-[#2E2A26]">
                        {b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </p>
                      <p className="text-[10px] text-[#A09384] font-num">
                        {b.created_at ? new Date(b.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                      </p>
                    </td>
                    <td className="p-3.5 font-semibold font-num text-[#2E2A26]">
                      {formatDisplayDate(b.marriage_date)}
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold font-num text-[#9B7A46]">{b.muhurtham_time}</p>
                      <p className="text-[10px] text-[#6F655B] font-num">{b.from_time || '06:00 AM'} - {b.end_time || '10:00 PM'}</p>
                    </td>
                    <td className="p-3.5 text-[11px]">
                      <div className="font-semibold font-num text-[#2E2A26]">
                        ₹{(b.estimated_amount || 364500).toLocaleString('en-IN')}
                      </div>
                      {b.payment_status === 'Advance Paid' ? (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-[rgba(125,155,106,0.15)] text-[#7D9B6A] font-semibold text-[9px] border border-[rgba(125,155,106,0.3)]">
                          Paid: ₹{(b.advance_paid_amount || 50000).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold text-[9px] border border-amber-200">
                          Direct Venue Booking
                        </span>
                      )}
                      {b.pg_rooms_selected && (
                        <p className="text-[10px] text-[#A09384] mt-0.5 font-num">
                          Rooms: {b.pg_rooms_selected.triple_rooms} Triple, {b.pg_rooms_selected.eight_person_rooms} Group
                        </p>
                      )}
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold font-num text-[#9B7A46]">
                        {(b.blocked_dates || [b.marriage_date]).map(formatDisplayDate).join(', ')}
                      </p>
                      {b.blocked_previous_day && (
                        <span className="text-[9px] font-semibold text-[#C7A86D]">
                          ⚡ Setup Day Blocked
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <select
                        value={b.booking_status}
                        onChange={(e) => onUpdateBookingStatus(b.id, e.target.value as BookingStatus)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                          b.booking_status === 'Confirmed'
                            ? 'bg-[rgba(125,155,106,0.15)] border-[rgba(125,155,106,0.3)] text-[#7D9B6A]'
                            : b.booking_status === 'Pending'
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : b.booking_status === 'Completed'
                            ? 'bg-blue-50 border-blue-200 text-blue-800'
                            : 'bg-stone-100 border-stone-300 text-stone-700'
                        }`}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => setViewingBooking(b)}
                          className="p-1.5 rounded-[8px] bg-amber-50 border border-amber-200 text-[#9B7A46] hover:bg-amber-100 transition-colors cursor-pointer"
                          title="View Full Booking Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setEditingBooking(b)}
                          className="p-1.5 rounded-[8px] bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                          title="Edit Booking Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleEmailInvoice(b)}
                          disabled={sendingEmailId === b.id}
                          className="p-1.5 rounded-[8px] bg-[rgba(125,155,106,0.15)] border border-[rgba(125,155,106,0.3)] text-[#3E562E] hover:bg-[rgba(125,155,106,0.25)] transition-colors cursor-pointer"
                          title="Email Invoice to Kannan.d26@gmail.com"
                        >
                          {sendingEmailId === b.id ? (
                            <Send className="w-3.5 h-3.5 text-[#7D9B6A] animate-pulse" />
                          ) : emailSuccessId === b.id ? (
                            <Check className="w-3.5 h-3.5 text-[#7D9B6A]" />
                          ) : (
                            <Mail className="w-3.5 h-3.5 text-[#7D9B6A]" />
                          )}
                        </button>

                        <button
                          onClick={() => printBookingReceipt(b)}
                          className="p-1.5 rounded-[8px] bg-white border border-[rgba(199,168,109,0.3)] text-[#2E2A26] hover:bg-[#F5EFE6] transition-colors cursor-pointer"
                          title="Print PDF Receipt"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#9B7A46]" />
                        </button>

                        {b.booking_status !== 'Cancelled' && (
                          <button
                            onClick={() => handleQuickCancel(b)}
                            className="p-1.5 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Cancel Booking"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteBooking(b.id)}
                          className="p-1.5 rounded-[8px] bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors cursor-pointer"
                          title="Delete Record Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ADMIN MANUAL DATE BLOCKER & UNBLOCKER SUITE */}
      <div className="p-6 sm:p-8 rounded-[24px] bg-white/95 border border-[rgba(199,168,109,0.35)] space-y-6 shadow-md">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[rgba(199,168,109,0.25)]">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[10px] font-bold text-rose-800 uppercase tracking-wider mb-1">
              <Lock className="w-3.5 h-3.5 text-rose-700" />
              <span>Blocked Dates & Maintenance Override Suite</span>
            </div>
            <h3 className="font-serif font-semibold text-[#2E2A26] text-xl flex items-center space-x-2">
              <span>Hall Maintenance Calendar & Unblock Controls</span>
            </h3>
            <p className="text-xs text-[#6F655B] mt-0.5">
              Easily remove blocked dates, clear maintenance overrides, or block new dates for hall polishing or repairs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {adminBlocks.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteAllAdminBlocks}
                className="px-4 py-2 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove All {adminBlocks.length} Maintenance Blocks</span>
              </button>
            )}

            <div className="flex items-center p-1 rounded-full bg-[#F5EFE6] border border-[rgba(199,168,109,0.3)] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setBlockListViewMode('table')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  blockListViewMode === 'table' ? 'bg-[#2E2A26] text-[#C7A86D] shadow-2xs' : 'text-[#6F655B]'
                }`}
              >
                Detailed List View
              </button>
              <button
                type="button"
                onClick={() => setBlockListViewMode('badges')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  blockListViewMode === 'badges' ? 'bg-[#2E2A26] text-[#C7A86D] shadow-2xs' : 'text-[#6F655B]'
                }`}
              >
                Badge View
              </button>
            </div>
          </div>
        </div>

        {/* Action Status Banner */}
        {blockActionBanner && (
          <div className="p-3.5 rounded-[14px] bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-2xs animate-fadeIn">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{blockActionBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setBlockActionBanner(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold text-sm cursor-pointer px-1"
            >
              ×
            </button>
          </div>
        )}

        {/* QUICK DIRECT DATE UNBLOCK TOOL */}
        <div className="p-4 rounded-[18px] bg-[rgba(245,239,230,0.7)] border border-[rgba(199,168,109,0.3)] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#9B7A46] uppercase tracking-wider flex items-center space-x-1.5">
              <Search className="w-4 h-4 text-[#C7A86D]" />
              <span>Quick Search & Direct Unblock Date</span>
            </h4>
            <span className="text-[11px] text-[#A09384]">Pick any date to inspect or remove its block status</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="date"
              value={quickUnblockDate}
              onChange={(e) => setQuickUnblockDate(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-[12px] border border-[rgba(199,168,109,0.35)] bg-white text-xs font-semibold text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none shadow-2xs"
            />
            
            <button
              type="button"
              onClick={handleQuickUnblockDate}
              disabled={!quickUnblockDate}
              className={`px-5 py-2.5 rounded-[12px] font-semibold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                quickUnblockDate
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove Block for Selected Date</span>
            </button>

            {quickUnblockDate && (
              <span className="text-xs font-semibold text-[#2E2A26] font-num">
                {formatDisplayDate(quickUnblockDate)}
              </span>
            )}
          </div>
        </div>

        {/* ACTIVE BLOCKED DATES LIST & BULK UNBLOCK CONTROLS */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-[rgba(199,168,109,0.2)]">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#9B7A46] uppercase tracking-wider">
                Currently Blocked Maintenance Dates ({adminBlocks.length})
              </span>
            </div>

            {selectedBlocksForDeletion.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteSelectedAdminBlocks}
                className="px-4 py-1.5 rounded-[10px] bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs animate-pulse"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Selected ({selectedBlocksForDeletion.length}) Blocked Dates</span>
              </button>
            )}
          </div>

          {adminBlocks.length === 0 ? (
            <div className="p-8 text-center rounded-[16px] bg-stone-50 border border-stone-200 text-stone-600 text-xs space-y-1">
              <p className="font-semibold text-stone-800 text-sm">No Active Maintenance Blocks</p>
              <p>All dates are available for booking unless reserved by customer bookings.</p>
            </div>
          ) : blockListViewMode === 'table' ? (
            /* TABLE VIEW FOR REMOVING BLOCKS */
            <div className="overflow-x-auto rounded-[16px] border border-[rgba(199,168,109,0.25)] bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[rgba(245,239,230,0.8)] text-[#9B7A46] font-serif font-semibold uppercase text-[10px] tracking-wider border-b border-[rgba(199,168,109,0.25)]">
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedBlocksForDeletion.length === adminBlocks.length && adminBlocks.length > 0}
                        onChange={handleSelectAllBlocksForDeletion}
                        className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                        title="Select All"
                      />
                    </th>
                    <th className="p-3">Blocked Date</th>
                    <th className="p-3">Reason / Maintenance Description</th>
                    <th className="p-3">Blocked On</th>
                    <th className="p-3 text-right">Remove Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(199,168,109,0.15)]">
                  {adminBlocks.map((block) => (
                    <tr key={block.id} className="hover:bg-rose-50/50 transition-colors">
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedBlocksForDeletion.includes(block.id)}
                          onChange={() => handleToggleSelectBlockForDeletion(block.id)}
                          className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-semibold font-num text-[#2E2A26]">
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-200 font-bold">
                          {formatDisplayDate(block.date)}
                        </span>
                      </td>
                      <td className="p-3 text-[#6F655B] font-medium">
                        {block.reason}
                      </td>
                      <td className="p-3 text-[11px] text-[#A09384] font-num">
                        {block.created_at ? new Date(block.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={async () => {
                            await onDeleteAdminBlock(block.id);
                            setSelectedBlocksForDeletion((prev) => prev.filter((id) => id !== block.id));
                            setBlockActionBanner(`Removed maintenance block for ${formatDisplayDate(block.date)}.`);
                            setTimeout(() => setBlockActionBanner(null), 3000);
                          }}
                          className="px-3 py-1.5 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white font-semibold text-xs flex items-center space-x-1.5 ml-auto transition-colors cursor-pointer shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Block</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* BADGE VIEW */
            <div className="flex flex-wrap gap-2.5 p-3 bg-stone-50 rounded-[16px] border border-stone-200">
              {adminBlocks.map((block) => (
                <div
                  key={block.id}
                  className="px-3.5 py-2 rounded-full bg-white border border-rose-300 text-rose-950 text-xs flex items-center space-x-2 shadow-2xs hover:border-rose-500 transition-all"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                  <span>
                    <strong className="font-num font-bold text-[#2E2A26]">{formatDisplayDate(block.date)}</strong>
                    <span className="text-stone-600 text-[11px] ml-1">({block.reason})</span>
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await onDeleteAdminBlock(block.id);
                      setSelectedBlocksForDeletion((prev) => prev.filter((id) => id !== block.id));
                      setBlockActionBanner(`Removed maintenance block for ${formatDisplayDate(block.date)}.`);
                      setTimeout(() => setBlockActionBanner(null), 3000);
                    }}
                    className="px-2 py-0.5 rounded-full bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-800 font-bold text-xs cursor-pointer transition-colors ml-1"
                    title="Remove Maintenance Block"
                  >
                    × Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ADD NEW MAINTENANCE BLOCK FORM */}
        <div className="pt-6 border-t border-[rgba(199,168,109,0.25)] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h4 className="text-xs font-bold text-[#9B7A46] uppercase tracking-wider flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-[#C7A86D]" />
              <span>Block New Hall Maintenance Dates</span>
            </h4>

            {/* Mode Selector */}
            <div className="flex items-center p-1 rounded-full bg-[#F5EFE6] border border-[rgba(199,168,109,0.3)] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setBlockMode('range')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  blockMode === 'range' ? 'bg-[#2E2A26] text-[#C7A86D] shadow-2xs' : 'text-[#6F655B]'
                }`}
              >
                Date Range (Multi-Day)
              </button>
              <button
                type="button"
                onClick={() => setBlockMode('multi')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  blockMode === 'multi' ? 'bg-[#2E2A26] text-[#C7A86D] shadow-2xs' : 'text-[#6F655B]'
                }`}
              >
                Multiple Custom Dates
              </button>
              <button
                type="button"
                onClick={() => setBlockMode('single')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  blockMode === 'single' ? 'bg-[#2E2A26] text-[#C7A86D] shadow-2xs' : 'text-[#6F655B]'
                }`}
              >
                Single Day
              </button>
            </div>
          </div>

          <form onSubmit={handleAddBlockSubmit} className="space-y-4 bg-[rgba(245,239,230,0.4)] p-4 rounded-[18px] border border-[rgba(199,168,109,0.25)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              {blockMode === 'range' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#2E2A26] mb-1">
                      Maintenance Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={blockStartDate}
                      onChange={(e) => setBlockStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-[12px] border border-[rgba(199,168,109,0.3)] bg-white text-xs font-semibold text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2E2A26] mb-1">
                      Maintenance End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={blockEndDate}
                      onChange={(e) => setBlockEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-[12px] border border-[rgba(199,168,109,0.3)] bg-white text-xs font-semibold text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
                    />
                  </div>
                </>
              )}

              {blockMode === 'multi' && (
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-semibold text-[#2E2A26]">
                    Pick Dates & Add to List *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={multiDateInput}
                      onChange={(e) => setMultiDateInput(e.target.value)}
                      className="px-3.5 py-2 rounded-[12px] border border-[rgba(199,168,109,0.3)] bg-white text-xs font-semibold text-[#2E2A26]"
                    />
                    <button
                      type="button"
                      onClick={handleAddMultiDate}
                      className="px-4 py-2 rounded-[12px] bg-[#9B7A46] text-white font-semibold text-xs hover:bg-[#826122] transition-colors cursor-pointer"
                    >
                      + Add Date
                    </button>
                  </div>

                  {selectedMultiDates.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedMultiDates.map((d) => (
                        <span
                          key={d}
                          className="px-2.5 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold font-num flex items-center space-x-1"
                        >
                          <span>{formatDisplayDate(d)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMultiDate(d)}
                            className="hover:text-rose-600 font-extrabold cursor-pointer ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {blockMode === 'single' && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#2E2A26] mb-1">
                    Select Maintenance Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newBlockDate}
                    onChange={(e) => setNewBlockDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[rgba(199,168,109,0.3)] bg-white text-xs font-semibold text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#2E2A26] mb-1">
                  Reason / Note *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Renovation / Deep Cleaning"
                  value={newBlockReason}
                  onChange={(e) => setNewBlockReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[12px] border border-[rgba(199,168,109,0.3)] bg-white text-xs text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="btn-gold px-6 py-2.5 rounded-[12px] font-semibold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#2E2A26]" />
                <span>
                  {blockMode === 'range'
                    ? 'Block Selected Date Range for Maintenance'
                    : blockMode === 'multi'
                    ? `Block ${selectedMultiDates.length} Selected Dates`
                    : 'Block Maintenance Date'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Active Blocks List */}
        {adminBlocks.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-[rgba(199,168,109,0.2)]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-[#9B7A46] uppercase tracking-wider">
                Active Maintenance & Override Blocks ({adminBlocks.length} Dates Blocked)
              </p>
            </div>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
              {adminBlocks.map((block) => (
                <div
                  key={block.id}
                  className="px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-950 text-xs flex items-center space-x-2 shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-red-700 shrink-0" />
                  <span>
                    <strong className="font-num font-bold">{formatDisplayDate(block.date)}</strong>
                    <span className="text-rose-800 text-[11px] ml-1">({block.reason})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteAdminBlock(block.id)}
                    className="p-0.5 text-rose-400 hover:text-rose-900 font-bold cursor-pointer transition-colors"
                    title="Remove Maintenance Block"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* VIEW BOOKING DETAILS MODAL */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="glass-card relative w-full max-w-2xl rounded-[24px] border border-[rgba(199,168,109,0.4)] shadow-[0_30px_90px_rgba(0,0,0,0.2)] bg-white/95 overflow-hidden my-8">
            {/* Header */}
            <div className="p-6 bg-[linear-gradient(135deg,#2E2A26_0%,#1A1816_100%)] text-white flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C7A86D]">
                    Booking Details Inspection
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                    viewingBooking.booking_status === 'Confirmed'
                      ? 'bg-[rgba(125,155,106,0.2)] text-[#91B87C] border-[#7D9B6A]'
                      : viewingBooking.booking_status === 'Pending'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                      : viewingBooking.booking_status === 'Completed'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-400'
                      : 'bg-rose-500/20 text-rose-300 border-rose-400'
                  }`}>
                    {viewingBooking.booking_status}
                  </span>
                </div>
                <h3 className="text-xl font-serif font-semibold">
                  Ref: {viewingBooking.booking_id}
                </h3>
              </div>
              <button
                onClick={() => setViewingBooking(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Customer Booked Timestamp */}
              <div className="p-3.5 rounded-[16px] bg-[rgba(199,168,109,0.12)] border border-[rgba(199,168,109,0.35)] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#A09384] block text-[10px] uppercase font-bold tracking-wider">Customer Booked Time & Date</span>
                  <strong className="text-sm font-semibold font-num text-[#2E2A26]">
                    {viewingBooking.created_at ? new Date(viewingBooking.created_at).toLocaleString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    }) : 'N/A'}
                  </strong>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-white text-[#9B7A46] font-semibold border border-[rgba(199,168,109,0.3)] shadow-xs">
                  ID: {viewingBooking.booking_id}
                </span>
              </div>

              {/* Customer & Couple */}
              <div className="p-4 rounded-[16px] bg-[rgba(245,239,230,0.6)] border border-[rgba(199,168,109,0.25)] space-y-3">
                <h4 className="text-xs font-bold text-[#9B7A46] uppercase tracking-wider">
                  Customer & Couple Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#2E2A26]">
                  <div>
                    <span className="text-[#A09384] block text-[10px] uppercase font-semibold">Customer / Organizer</span>
                    <strong className="text-sm font-semibold">{viewingBooking.customer_name}</strong>
                  </div>
                  <div>
                    <span className="text-[#A09384] block text-[10px] uppercase font-semibold">Contact Info</span>
                    <span className="font-num font-semibold">{viewingBooking.phone}</span> • <span>{viewingBooking.email}</span>
                  </div>
                  {(viewingBooking.bride_name || viewingBooking.groom_name) && (
                    <div className="sm:col-span-2">
                      <span className="text-[#A09384] block text-[10px] uppercase font-semibold">Bride & Groom</span>
                      <strong className="text-sm text-[#C7A86D]">{viewingBooking.bride_name || 'N/A'} & {viewingBooking.groom_name || 'N/A'}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Schedule */}
              <div className="p-4 rounded-[16px] bg-white border border-[rgba(199,168,109,0.25)] space-y-3">
                <h4 className="text-xs font-bold text-[#9B7A46] uppercase tracking-wider">
                  Event Schedule & Hall Block
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#2E2A26]">
                  <div>
                    <span className="text-[#A09384] block text-[10px] uppercase font-semibold">Function Type</span>
                    <span className="font-semibold">{viewingBooking.function_type}</span>
                  </div>
                  <div>
                    <span className="text-[#A09384] block text-[10px] uppercase font-semibold">Event Date</span>
                    <strong className="font-num">{formatDisplayDate(viewingBooking.marriage_date)}</strong>
                  </div>
                  <div>
                    <span className="text-[#A09384] block text-[10px] uppercase font-semibold">Muhurtham Time</span>
                    <span className="font-num text-[#9B7A46] font-semibold">{viewingBooking.muhurtham_time}</span>
                  </div>
                  <div>
                    <span className="text-[#A09384] block text-[10px] uppercase font-semibold">Expected Guests</span>
                    <span className="font-num font-semibold">{viewingBooking.guest_count} Guests</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#A09384] block text-[10px] uppercase font-semibold">Blocked Hall Dates</span>
                    <span className="font-num font-semibold text-[#9B7A46]">
                      {(viewingBooking.blocked_dates || [viewingBooking.marriage_date]).map(formatDisplayDate).join(', ')}
                      {viewingBooking.blocked_previous_day && ' (Setup Day Blocked)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financials & Payment */}
              <div className="p-4 rounded-[16px] bg-[#FFFDF9] border border-[rgba(199,168,109,0.3)] space-y-3">
                <h4 className="text-xs font-bold text-[#9B7A46] uppercase tracking-wider">
                  Tariff & Reservation Payment Status
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#2E2A26]">
                  <div>
                    <span className="text-[#A09384] block text-[10px] uppercase font-semibold">Total Estimated Tariff</span>
                    <strong className="text-base text-[#2E2A26] font-num">
                      ₹{(viewingBooking.estimated_amount || 364500).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#A09384] block text-[10px] uppercase font-semibold">Payment Status</span>
                    <span className="font-bold text-[#7D9B6A]">{viewingBooking.payment_status || 'Advance Paid'}</span>
                  </div>
                  <div>
                    <span className="text-[#A09384] block text-[10px] uppercase font-semibold">Advance Amount</span>
                    <span className="font-num font-bold text-[#2E2A26]">
                      ₹{(viewingBooking.advance_paid_amount || 50000).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Special Requirements */}
              {viewingBooking.requirements && viewingBooking.requirements.length > 0 && (
                <div className="p-4 rounded-[16px] bg-white border border-[rgba(199,168,109,0.25)] space-y-2">
                  <h4 className="text-xs font-bold text-[#9B7A46] uppercase tracking-wider">
                    Requested Add-on Requirements
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingBooking.requirements.map((req, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-full bg-[rgba(199,168,109,0.15)] text-[#826122] text-[11px] font-semibold border border-[rgba(199,168,109,0.3)]">
                        ✓ {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {viewingBooking.notes && (
                <div className="p-4 rounded-[16px] bg-amber-50/60 border border-amber-200 space-y-1">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Admin / Customer Notes
                  </h4>
                  <p className="text-xs text-[#2E2A26] leading-relaxed">{viewingBooking.notes}</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-[rgba(245,239,230,0.8)] border-t border-[rgba(199,168,109,0.25)] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const toEdit = viewingBooking;
                    setViewingBooking(null);
                    setEditingBooking(toEdit);
                  }}
                  className="px-4 py-2 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Filled Details</span>
                </button>

                {viewingBooking.booking_status !== 'Cancelled' && (
                  <button
                    onClick={() => handleQuickCancel(viewingBooking)}
                    className="px-4 py-2 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Booking</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => printBookingReceipt(viewingBooking)}
                  className="px-3.5 py-2 rounded-[10px] bg-white border border-[rgba(199,168,109,0.3)] text-[#2E2A26] hover:bg-[#F5EFE6] font-semibold text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#9B7A46]" />
                  <span>Print Receipt</span>
                </button>

                <button
                  onClick={() => setViewingBooking(null)}
                  className="px-4 py-2 rounded-[10px] bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT BOOKING DETAILS MODAL */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="glass-card relative w-full max-w-2xl rounded-[28px] border border-[rgba(199,168,109,0.4)] shadow-[0_30px_90px_rgba(0,0,0,0.25)] bg-white overflow-hidden my-8">
            
            {/* Header */}
            <div className="p-6 bg-[linear-gradient(135deg,#2E2A26_0%,#1A1816_100%)] text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[rgba(199,168,109,0.2)] border border-[#C7A86D] text-[#C7A86D] flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-semibold">
                    Edit Booking Details
                  </h3>
                  <p className="text-xs text-[rgba(255,255,255,0.7)]">
                    Ref ID: <strong className="text-[#C7A86D] font-num">{editingBooking.booking_id}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingBooking(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Form Body */}
            <form onSubmit={handleSaveEditedBooking}>
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                
                {/* Section 1: Customer Contact Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#9B7A46] uppercase tracking-wider border-b border-[rgba(199,168,109,0.25)] pb-1 flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-[#C7A86D]" />
                    <span>1. Customer & Couple Contact Details</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2E2A26] mb-1">Customer / Organizer Name *</label>
                      <input
                        type="text"
                        required
                        value={editingBooking.customer_name}
                        onChange={(e) => setEditingBooking({ ...editingBooking, customer_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-[10px] border border-[rgba(199,168,109,0.35)] bg-white text-xs font-semibold text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2E2A26] mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={editingBooking.phone}
                        onChange={(e) => setEditingBooking({ ...editingBooking, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-[10px] border border-[rgba(199,168,109,0.35)] bg-white text-xs font-semibold text-[#2E2A26] font-num focus:border-[#C7A86D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2E2A26] mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={editingBooking.email}
                        onChange={(e) => setEditingBooking({ ...editingBooking, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-[10px] border border-[rgba(199,168,109,0.35)] bg-white text-xs text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2E2A26] mb-1">Bride Name (Optional)</label>
                      <input
                        type="text"
                        value={editingBooking.bride_name || ''}
                        onChange={(e) => setEditingBooking({ ...editingBooking, bride_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-[10px] border border-[rgba(199,168,109,0.35)] bg-white text-xs text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2E2A26] mb-1">Groom Name (Optional)</label>
                      <input
                        type="text"
                        value={editingBooking.groom_name || ''}
                        onChange={(e) => setEditingBooking({ ...editingBooking, groom_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-[10px] border border-[rgba(199,168,109,0.35)] bg-white text-xs text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Event Schedule */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#9B7A46] uppercase tracking-wider border-b border-[rgba(199,168,109,0.25)] pb-1 flex items-center space-x-1.5">
                    <CalendarIcon className="w-4 h-4 text-[#C7A86D]" />
                    <span>2. Function Schedule & Timing</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2E2A26] mb-1">Function Type</label>
                      <select
                        value={editingBooking.function_type}
                        onChange={(e) => setEditingBooking({ ...editingBooking, function_type: e.target.value as FunctionType })}
                        className="w-full px-3 py-2 rounded-[10px] border border-[rgba(199,168,109,0.35)] bg-white text-xs font-semibold text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
                      >
                        <option value="Wedding">Wedding</option>
                        <option value="Reception">Reception</option>
                        <option value="Engagement">Engagement</option>
                        <option value="Birthday">Birthday</option>
                        <option value="Conference">Conference</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2E2A26] mb-1">Marriage / Event Date *</label>
                      <input
                        type="date"
                        required
                        value={editingBooking.marriage_date}
                        onChange={(e) => setEditingBooking({ ...editingBooking, marriage_date: e.target.value })}
                        className="w-full px-3 py-2 rounded-[10px] border border-[rgba(199,168,109,0.35)] bg-white text-xs font-semibold text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2E2A26] mb-1">Muhurtham Time *</label>
                      <input
                        type="text"
                        required
                        value={editingBooking.muhurtham_time}
                        onChange={(e) => setEditingBooking({ ...editingBooking, muhurtham_time: e.target.value })}
                        placeholder="e.g. 05:30 AM"
                        className="w-full px-3 py-2 rounded-[10px] border border-[rgba(199,168,109,0.35)] bg-white text-xs font-semibold text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2E2A26] mb-1">Expected Guests</label>
                      <input
                        type="number"
                        min={50}
                        max={3000}
                        value={editingBooking.guest_count}
                        onChange={(e) => setEditingBooking({ ...editingBooking, guest_count: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-[10px] border border-[rgba(199,168,109,0.35)] bg-white text-xs font-semibold font-num text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2E2A26] mb-1">Start Time</label>
                      <input
                        type="text"
                        value={editingBooking.from_time || '06:00 AM'}
                        onChange={(e) => setEditingBooking({ ...editingBooking, from_time: e.target.value })}
                        className="w-full px-3 py-2 rounded-[10px] border border-[rgba(199,168,109,0.35)] bg-white text-xs font-num text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2E2A26] mb-1">End Time</label>
                      <input
                        type="text"
                        value={editingBooking.end_time || '10:00 PM'}
                        onChange={(e) => setEditingBooking({ ...editingBooking, end_time: e.target.value })}
                        className="w-full px-3 py-2 rounded-[10px] border border-[rgba(199,168,109,0.35)] bg-white text-xs font-num text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2B: Custom Blocked Dates for this Booking */}
                <div className="space-y-3 bg-[rgba(245,239,230,0.5)] p-4 rounded-[16px] border border-[rgba(199,168,109,0.3)]">
                  <div className="flex items-center justify-between border-b border-[rgba(199,168,109,0.25)] pb-1.5">
                    <h4 className="text-xs font-bold text-[#9B7A46] uppercase tracking-wider flex items-center space-x-1.5">
                      <Lock className="w-4 h-4 text-[#C7A86D]" />
                      <span>2B. Reserved & Blocked Dates for this Booking</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleRecalculateBookingDates}
                      className="text-[11px] font-semibold text-[#9B7A46] hover:text-[#826122] flex items-center space-x-1 cursor-pointer"
                      title="Reset to default calculated dates based on event date & muhurtham time"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Recalculate Default Dates</span>
                    </button>
                  </div>

                  {/* Active Blocked Dates Badges with Remove buttons */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-[#2E2A26]">
                      Active Blocked Dates for Hall Calendar:
                    </label>
                    
                    <div className="flex flex-wrap gap-2">
                      {(editingBooking.blocked_dates || [editingBooking.marriage_date]).map((dStr) => (
                        <div
                          key={dStr}
                          className="px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-bold font-num flex items-center space-x-2 shadow-2xs"
                        >
                          <span>{formatDisplayDate(dStr)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBlockedDateFromBooking(dStr)}
                            className="px-1.5 py-0.5 rounded-full bg-amber-200 hover:bg-rose-600 hover:text-white text-rose-800 font-extrabold text-[11px] cursor-pointer transition-colors"
                            title="Remove this date from hall block"
                          >
                            × Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Setup Day Toggle & Custom Date Add */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="checkbox"
                        id="blocked_previous_day_checkbox"
                        checked={editingBooking.blocked_previous_day}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const prevDayStr = new Date(new Date(editingBooking.marriage_date).getTime() - 86400000).toISOString().split('T')[0];
                          const curr = editingBooking.blocked_dates || [editingBooking.marriage_date];
                          if (checked) {
                            setEditingBooking({
                              ...editingBooking,
                              blocked_previous_day: true,
                              blocked_dates: Array.from(new Set([prevDayStr, ...curr])).sort(),
                            });
                          } else {
                            setEditingBooking({
                              ...editingBooking,
                              blocked_previous_day: false,
                              blocked_dates: curr.filter((d) => d !== prevDayStr),
                            });
                          }
                        }}
                        className="rounded text-[#C7A86D] focus:ring-[#C7A86D] cursor-pointer"
                      />
                      <label htmlFor="blocked_previous_day_checkbox" className="text-xs font-semibold text-[#2E2A26] cursor-pointer">
                        Block Previous Day Setup (Early Muhurtham rule)
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={customBookingDateInput}
                        onChange={(e) => setCustomBookingDateInput(e.target.value)}
                        className="px-3 py-1.5 rounded-[10px] border border-[rgba(199,168,109,0.35)] bg-white text-xs font-semibold text-[#2E2A26]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomBlockedDateToBooking}
                        disabled={!customBookingDateInput}
                        className="px-3 py-1.5 rounded-[10px] bg-[#9B7A46] text-white font-semibold text-xs hover:bg-[#826122] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        + Add Extra Date
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section 3: Tariff & Booking Status */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#9B7A46] uppercase tracking-wider border-b border-[rgba(199,168,109,0.25)] pb-1 flex items-center space-x-1.5">
                    <DollarSign className="w-4 h-4 text-[#C7A86D]" />
                    <span>3. Tariff, Payment & Booking Status</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2E2A26] mb-1">Total Tariff (₹)</label>
                      <input
                        type="number"
                        value={editingBooking.estimated_amount || 364500}
                        onChange={(e) => setEditingBooking({ ...editingBooking, estimated_amount: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-[10px] border border-[rgba(199,168,109,0.35)] bg-white text-xs font-bold font-num text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2E2A26] mb-1">Advance Paid (₹)</label>
                      <input
                        type="number"
                        value={editingBooking.advance_paid_amount || 50000}
                        onChange={(e) => setEditingBooking({ ...editingBooking, advance_paid_amount: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-[10px] border border-[rgba(199,168,109,0.35)] bg-white text-xs font-bold font-num text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2E2A26] mb-1">Booking Status</label>
                      <select
                        value={editingBooking.booking_status}
                        onChange={(e) => setEditingBooking({ ...editingBooking, booking_status: e.target.value as BookingStatus })}
                        className="w-full px-3 py-2 rounded-[10px] border border-[rgba(199,168,109,0.35)] bg-white text-xs font-bold text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2E2A26] mb-1">Payment Status</label>
                      <select
                        value={editingBooking.payment_status || 'Advance Paid'}
                        onChange={(e) => setEditingBooking({ ...editingBooking, payment_status: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-[10px] border border-[rgba(199,168,109,0.35)] bg-white text-xs font-semibold text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
                      >
                        <option value="Advance Paid">Advance Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Fully Paid">Fully Paid</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#2E2A26] mb-1">Admin Notes / Special Instructions</label>
                      <input
                        type="text"
                        value={editingBooking.notes || ''}
                        onChange={(e) => setEditingBooking({ ...editingBooking, notes: e.target.value })}
                        placeholder="e.g. VIP guest arrival, extra generator backup requested"
                        className="w-full px-3 py-2 rounded-[10px] border border-[rgba(199,168,109,0.35)] bg-white text-xs text-[#2E2A26] focus:border-[#C7A86D] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 bg-[rgba(245,239,230,0.8)] border-t border-[rgba(199,168,109,0.25)] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickCancel(editingBooking)}
                  className="px-4 py-2 rounded-[12px] bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Set Status as Cancelled</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingBooking(null)}
                    className="px-4 py-2 rounded-[12px] bg-white border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn-gold px-6 py-2.5 rounded-[12px] font-semibold text-xs shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#2E2A26]" />
                    <span>Save All Changes</span>
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
