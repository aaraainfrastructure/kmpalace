import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, Sparkles, Filter, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { Booking, AdminManualBlock } from '../types';
import { calculateBlockedDates, formatDisplayDate, getWeekdayName } from '../lib/bookingLogic';

interface CalendarViewProps {
  bookings: Booking[];
  adminBlocks: AdminManualBlock[];
  onSelectDateToBook: (dateStr: string) => void;
  onDeleteAdminBlock?: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  bookings,
  adminBlocks,
  onSelectDateToBook,
  onDeleteAdminBlock,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 6, 1)); // Default July 2026
  const [selectedDayDetails, setSelectedDayDetails] = useState<{
    dateStr: string;
    status: 'Available' | 'Blocked' | 'Booked' | 'Pending';
    booking?: Booking;
    adminBlock?: AdminManualBlock;
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Map out blocked dates
  const bookedDatesMap: Record<string, { status: 'Booked' | 'Pending'; booking: Booking }> = {};
  bookings.forEach((booking) => {
    if (booking.booking_status === 'Cancelled') return;
    const status = booking.booking_status === 'Confirmed' ? 'Booked' : 'Pending';
    const dates = booking.blocked_dates || [booking.marriage_date];
    dates.forEach((d) => {
      bookedDatesMap[d] = { status, booking };
    });
  });

  const adminBlocksMap: Record<string, AdminManualBlock> = {};
  adminBlocks.forEach((ab) => {
    adminBlocksMap[ab.date] = ab;
  });

  // Calculate calendar grid days
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const daysGrid: ({ dayNum: number; dateStr: string } | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;
    daysGrid.push({ dayNum: d, dateStr });
  }

  return (
    <div className="glass-card rounded-[24px] border border-[rgba(199,168,109,0.35)] shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6 sm:p-8 transition-colors duration-300">
      
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-[rgba(199,168,109,0.25)]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[rgba(245,239,230,0.8)] border border-[rgba(199,168,109,0.35)] text-xs font-semibold text-[#9B7A46] mb-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-[#C7A86D]" />
            <span className="uppercase tracking-widest text-[10px]">Availability Calendar</span>
          </div>
          <h2 className="text-2xl font-serif font-semibold text-[#2E2A26]">
            {monthNames[month]} {year} Booking Calendar
          </h2>
          <p className="text-xs text-[#6F655B]">
            Click any date tile to inspect reservation status or select for instant booking.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={goToToday}
            className="px-3.5 py-1.5 rounded-full bg-[rgba(245,239,230,0.8)] text-[#2E2A26] border border-[rgba(199,168,109,0.3)] font-semibold text-xs hover:bg-white transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            className="p-2 rounded-full border border-[rgba(199,168,109,0.3)] bg-white/70 hover:bg-white text-[#2E2A26] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-serif font-semibold text-[#2E2A26] px-3 text-sm sm:text-base">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full border border-[rgba(199,168,109,0.3)] bg-white/70 hover:bg-white text-[#2E2A26] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="py-4 border-b border-[rgba(199,168,109,0.2)] flex flex-wrap items-center gap-4 text-xs">
        <span className="font-semibold text-[#2E2A26]">Status Legend:</span>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-[#7D9B6A]" />
          <span className="text-[#6F655B]">Available (Green)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-600 shadow-2xs" />
          <span className="text-rose-700 font-bold">Booked / Reserved (Red)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600" />
          <span className="text-[#6F655B]">Pending Approval</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-red-800" />
          <span className="text-rose-900 font-semibold">Admin Blocked (Red)</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="pt-6">
        
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-[#9B7A46] uppercase tracking-wider mb-2 font-serif">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Date Tiles */}
        <div className="grid grid-cols-7 gap-2">
          {daysGrid.map((item, index) => {
            if (!item) {
              return <div key={`empty-${index}`} className="h-24 rounded-[16px] bg-white/20" />;
            }

            const { dayNum, dateStr } = item;
            const isBookedEntry = bookedDatesMap[dateStr];
            const isAdminBlocked = adminBlocksMap[dateStr];

            let status: 'Available' | 'Booked' | 'Pending' | 'Blocked' = 'Available';
            if (isAdminBlocked) {
              status = 'Blocked';
            } else if (isBookedEntry) {
              status = isBookedEntry.status;
            }

            const isSelected = selectedDayDetails?.dateStr === dateStr;

            return (
              <div
                key={dateStr}
                onClick={() => {
                  setSelectedDayDetails({
                    dateStr,
                    status,
                    booking: isBookedEntry?.booking,
                    adminBlock: isAdminBlocked,
                  });
                }}
                className={`h-24 p-2.5 rounded-[16px] transition-all cursor-pointer flex flex-col justify-between relative group ${
                  isSelected
                    ? 'bg-[#E11D48] text-white ring-2 ring-[#F43F5E] shadow-md scale-102 z-10'
                    : status === 'Booked'
                    ? 'bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3] hover:bg-[#FFE4E6] shadow-2xs'
                    : status === 'Pending'
                    ? 'bg-amber-50/80 border-[#E8D8B0] text-[#2E2A26]'
                    : status === 'Blocked'
                    ? 'bg-rose-100/90 border-rose-300 text-rose-900 font-semibold'
                    : 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] hover:bg-[#D1FAE5] shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-serif font-semibold text-sm font-num ${
                    isSelected ? 'text-white font-extrabold' : status === 'Booked' || status === 'Blocked' ? 'text-rose-950 font-bold' : 'text-[#065F46]'
                  }`}>
                    {dayNum}
                  </span>
                  
                  {status === 'Booked' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] ring-2 ring-rose-200 shadow-xs" title="Booked (Red)" />
                  )}
                  {status === 'Blocked' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-800 ring-2 ring-red-200" title="Admin Blocked" />
                  )}
                  {status === 'Available' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" title="Available" />
                  )}
                </div>

                <div className="text-[10px] truncate leading-tight">
                  {status === 'Booked' && isBookedEntry && (
                    <div className="space-y-0.5">
                      <span className="inline-block px-1.5 py-0.2 rounded bg-[#E11D48] text-white font-bold text-[9px] uppercase tracking-wider mb-0.5">
                        Booked
                      </span>
                      <p className="font-bold text-[#9F1239] truncate">{isBookedEntry.booking.bride_name || isBookedEntry.booking.customer_name}</p>
                      <p className="text-[#9F1239] font-num text-[9px] truncate">{isBookedEntry.booking.muhurtham_time}</p>
                    </div>
                  )}

                  {status === 'Pending' && isBookedEntry && (
                    <p className="font-semibold text-amber-800 truncate">{isBookedEntry.booking.function_type}</p>
                  )}

                  {status === 'Blocked' && (
                    <div>
                      <span className="inline-block px-1 py-0.2 rounded bg-rose-800 text-white font-bold text-[8px] uppercase">
                        Blocked
                      </span>
                    </div>
                  )}

                  {status === 'Available' && (
                    <p className="text-[#047857] font-medium group-hover:underline">
                      Available
                    </p>
                  )}
                </div>

                {/* Early Muhurtham Indicator Badge on Tile */}
                {isBookedEntry?.booking.blocked_previous_day && (
                  <span className="absolute bottom-1 right-1 px-1 rounded bg-[#C7A86D] text-white text-[8px] font-bold">
                    2-DAY
                  </span>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Selected Date Detail Modal / Popover */}
      {selectedDayDetails && (
        <div className="mt-8 p-6 rounded-[20px] bg-white/90 border border-[rgba(199,168,109,0.35)] shadow-sm animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(199,168,109,0.2)]">
            <div>
              <p className="text-xs font-semibold text-[#9B7A46] uppercase tracking-wider">
                {getWeekdayName(selectedDayDetails.dateStr)}
              </p>
              <h3 className="text-xl font-serif font-semibold text-[#2E2A26]">
                {formatDisplayDate(selectedDayDetails.dateStr)}
              </h3>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full font-semibold text-xs border ${
                selectedDayDetails.status === 'Booked'
                  ? 'bg-[rgba(245,239,230,0.9)] border-[#C7A86D] text-[#9B7A46]'
                  : selectedDayDetails.status === 'Pending'
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : selectedDayDetails.status === 'Blocked'
                  ? 'bg-stone-100 border-stone-300 text-stone-700'
                  : 'bg-[rgba(125,155,106,0.15)] border-[rgba(125,155,106,0.3)] text-[#7D9B6A]'
              }`}>
                STATUS: {selectedDayDetails.status.toUpperCase()}
              </span>

              <button
                onClick={() => setSelectedDayDetails(null)}
                className="text-xs text-[#6F655B] hover:text-[#2E2A26] underline cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

          <div className="pt-4 text-xs space-y-3">
            {selectedDayDetails.status === 'Available' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-[#6F655B]">
                  🟢 KM PALACE Hall is completely free and available for booking on <strong className="text-[#2E2A26] font-num">{formatDisplayDate(selectedDayDetails.dateStr)}</strong>!
                </p>
              </div>
            )}

            {selectedDayDetails.booking && (
              <div className="p-4 rounded-[16px] bg-[rgba(245,239,230,0.5)] border border-[rgba(199,168,109,0.25)] space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-[#6F655B]">Booking Reference:</p>
                    <p className="font-semibold font-num text-[#9B7A46] text-sm">{selectedDayDetails.booking.booking_id}</p>
                  </div>
                  <div>
                    <p className="text-[#6F655B]">Function Type:</p>
                    <p className="font-semibold text-[#2E2A26]">{selectedDayDetails.booking.function_type}</p>
                  </div>
                  <div>
                    <p className="text-[#6F655B]">Couple / Customer:</p>
                    <p className="font-semibold text-[#2E2A26]">{selectedDayDetails.booking.bride_name ? `${selectedDayDetails.booking.bride_name} & ${selectedDayDetails.booking.groom_name}` : selectedDayDetails.booking.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-[#6F655B]">Slot Timing / Muhurtham:</p>
                    <p className="font-semibold text-[#9B7A46] font-num">
                      {selectedDayDetails.booking.from_time || '12:00'} &rarr; {selectedDayDetails.booking.end_time || '12:00'} (Muhurtham: {selectedDayDetails.booking.muhurtham_time})
                    </p>
                  </div>
                </div>

                {selectedDayDetails.booking.blocked_previous_day && (
                  <div className="mt-2 p-2.5 rounded-[12px] bg-[rgba(245,239,230,0.9)] border border-[rgba(199,168,109,0.4)] text-[#9B7A46] font-medium text-[11px] flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-[#C7A86D] shrink-0" />
                    <span>Early Muhurtham (&lt; 07:00 AM) rule applied for this event.</span>
                  </div>
                )}
              </div>
            )}

            {selectedDayDetails.adminBlock && (
              <div className="p-4 rounded-[16px] bg-rose-50 border border-rose-200 text-rose-950 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-xs uppercase tracking-wider text-rose-900">Admin Maintenance Block</p>
                  {onDeleteAdminBlock && (
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteAdminBlock(selectedDayDetails.adminBlock!.id);
                        setSelectedDayDetails(null);
                      }}
                      className="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Block</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-rose-800">Reason: {selectedDayDetails.adminBlock.reason}</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
