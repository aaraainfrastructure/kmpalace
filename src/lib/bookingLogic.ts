import { Booking, AdminManualBlock } from '../types';

export type SlotType = '24hr' | 'morning' | 'evening' | 'fullday' | 'custom';

export interface SlotConfig {
  id: SlotType;
  title: string;
  badge: string;
  description: string;
  fromTime: string;
  endTime: string;
  defaultMuhurtham: string;
  spansNextDay: boolean;
  blockedDaysCount: number;
}

export const PRESET_SLOTS: SlotConfig[] = [
  {
    id: '24hr',
    title: 'Standard 24-Hr Package',
    badge: '24 Hours (2 Days)',
    description: '12:00 PM (Today) to 12:00 PM (Next Day). Covers Reception & Marriage.',
    fromTime: '12:00',
    endTime: '12:00',
    defaultMuhurtham: '06:00 AM',
    spansNextDay: true,
    blockedDaysCount: 2,
  },
  {
    id: 'morning',
    title: 'Morning Muhurtham Slot',
    badge: 'Half Day Morning',
    description: '04:00 AM to 12:00 PM (Same Day). Ideal for morning wedding function.',
    fromTime: '04:00',
    endTime: '12:00',
    defaultMuhurtham: '06:00 AM',
    spansNextDay: false,
    blockedDaysCount: 1,
  },
  {
    id: 'evening',
    title: 'Evening Reception Slot',
    badge: 'Half Day Evening',
    description: '04:00 PM to 11:00 PM (Same Day). Ideal for evening reception & dinner.',
    fromTime: '16:00',
    endTime: '23:00',
    defaultMuhurtham: '06:00 PM',
    spansNextDay: false,
    blockedDaysCount: 1,
  },
  {
    id: 'fullday',
    title: 'Full Day Single Date',
    badge: 'Full Day (16 Hrs)',
    description: '06:00 AM to 10:00 PM (Same Day). Full single day hall access.',
    fromTime: '06:00',
    endTime: '22:00',
    defaultMuhurtham: '06:00 AM',
    spansNextDay: false,
    blockedDaysCount: 1,
  },
  {
    id: 'custom',
    title: 'Custom Time Slot',
    badge: 'Custom Hours',
    description: 'Pick custom check-in, check-out, and muhurtham timing.',
    fromTime: '06:00',
    endTime: '22:00',
    defaultMuhurtham: '06:00 AM',
    spansNextDay: false,
    blockedDaysCount: 1,
  },
];

/**
 * Parses time string (e.g. "06:00", "06:00 AM", "6:30 AM", "18:00") into minutes from midnight (0..1439)
 */
export function parseMuhurthamToMinutes(timeStr: string): number {
  if (!timeStr) return 360; // Default 6:00 AM
  
  const cleanStr = timeStr.trim().toUpperCase();
  const isPM = cleanStr.includes('PM');
  const isAM = cleanStr.includes('AM');
  
  const timeOnly = cleanStr.replace(/AM|PM/g, '').trim();
  const parts = timeOnly.split(':');
  
  let hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  
  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + minutes;
}

/**
 * Converts 24-hour time string ("16:00") or 12-hour ("04:00 PM") to 12-hour formatted string ("04:00 PM")
 */
export function format12HourTime(timeStr: string): string {
  if (!timeStr) return '06:00 AM';
  const mins = parseMuhurthamToMinutes(timeStr);
  const hrs = Math.floor(mins / 60);
  const m = mins % 60;
  const period = hrs >= 12 ? 'PM' : 'AM';
  const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
  return `${String(displayHrs).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Helper to get YYYY-MM-DD minus 1 day
 */
export function getPreviousDay(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return formatDateToYYYYMMDD(date);
}

/**
 * Helper to get YYYY-MM-DD plus 1 day
 */
export function getNextDay(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + 1);
  return formatDateToYYYYMMDD(date);
}

export function formatDateToYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats YYYY-MM-DD nicely e.g. "21 July 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formats date to weekday name
 */
export function getWeekdayName(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return '';
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', { weekday: 'long' });
}

/**
 * Calculates days offset from reference date 2020-01-01
 */
function getDayOffset(dateStr: string): number {
  if (!dateStr) return 0;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const base = new Date(Date.UTC(2020, 0, 1));
  return Math.floor((date.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
}

export interface AbsoluteInterval {
  startMinute: number;
  endMinute: number;
}

/**
 * Gets absolute minute interval for a booking slot
 */
export function getBookingInterval(
  marriageDate: string,
  slotType: SlotType = '24hr',
  fromTimeStr?: string,
  endTimeStr?: string,
  blockedDates?: string[]
): AbsoluteInterval {
  const dayOffset = getDayOffset(marriageDate);
  
  if (slotType === '24hr') {
    // 12:00 PM Day 1 to 12:00 PM Day 2
    const startMinute = dayOffset * 1440 + 12 * 60; // 12:00
    const endMinute = (dayOffset + 1) * 1440 + 12 * 60; // 12:00 next day
    return { startMinute, endMinute };
  }
  
  if (slotType === 'morning') {
    // 04:00 AM to 12:00 PM
    const startMinute = dayOffset * 1440 + 4 * 60;
    const endMinute = dayOffset * 1440 + 12 * 60;
    return { startMinute, endMinute };
  }
  
  if (slotType === 'evening') {
    // 04:00 PM (16:00) to 11:00 PM (23:00)
    const startMinute = dayOffset * 1440 + 16 * 60;
    const endMinute = dayOffset * 1440 + 23 * 60;
    return { startMinute, endMinute };
  }
  
  if (slotType === 'fullday') {
    // 06:00 AM to 10:00 PM
    const startMinute = dayOffset * 1440 + 6 * 60;
    const endMinute = dayOffset * 1440 + 22 * 60;
    return { startMinute, endMinute };
  }
  
  // Custom or legacy fallback
  let fromMins = parseMuhurthamToMinutes(fromTimeStr || '06:00');
  let endMins = parseMuhurthamToMinutes(endTimeStr || '22:00');
  
  let startMinute = dayOffset * 1440 + fromMins;
  let endMinute = dayOffset * 1440 + endMins;
  
  if (endMins <= fromMins || (blockedDates && blockedDates.length > 1)) {
    endMinute = (dayOffset + 1) * 1440 + endMins;
  }
  
  return { startMinute, endMinute };
}

/**
 * Calculates blocked dates array for a proposed booking slot
 */
export function calculateBlockedDates(
  marriageDate: string,
  slotType: SlotType = '24hr',
  fromTimeStr?: string,
  endTimeStr?: string,
  muhurthamTimeStr?: string
): { blockedDates: string[]; blockedPreviousDay: boolean } {
  if (!marriageDate) {
    return { blockedDates: [], blockedPreviousDay: false };
  }

  if (slotType === '24hr') {
    return {
      blockedDates: [marriageDate, getNextDay(marriageDate)],
      blockedPreviousDay: false,
    };
  }

  if (slotType === 'morning' || slotType === 'evening' || slotType === 'fullday') {
    return {
      blockedDates: [marriageDate],
      blockedPreviousDay: false,
    };
  }

  // Custom slot
  const fromMins = parseMuhurthamToMinutes(fromTimeStr || '06:00');
  const endMins = parseMuhurthamToMinutes(endTimeStr || '22:00');
  const muhurthamMins = parseMuhurthamToMinutes(muhurthamTimeStr || '06:00');

  if (endMins <= fromMins) {
    return {
      blockedDates: [marriageDate, getNextDay(marriageDate)],
      blockedPreviousDay: false,
    };
  }

  if (muhurthamMins < 7 * 60) {
    const prev = getPreviousDay(marriageDate);
    return {
      blockedDates: [prev, marriageDate],
      blockedPreviousDay: true,
    };
  }

  return {
    blockedDates: [marriageDate],
    blockedPreviousDay: false,
  };
}

/**
 * Checks if a proposed booking conflicts with existing bookings or admin manual blocks.
 * Takes slot timing into account so Morning & Evening on the same day do NOT conflict!
 */
export function checkBookingConflict(
  newMarriageDate: string,
  muhurthamTimeOrSlot: string = '24hr',
  existingBookings: Booking[] = [],
  existingAdminBlocks: AdminManualBlock[] = [],
  excludeBookingId?: string,
  slotType: SlotType = '24hr',
  fromTimeStr?: string,
  endTimeStr?: string
): { hasConflict: boolean; conflictingDates: string[]; conflictReason?: string } {
  if (!newMarriageDate) {
    return { hasConflict: false, conflictingDates: [] };
  }

  const safeBookings = Array.isArray(existingBookings) ? existingBookings : [];
  const safeAdminBlocks = Array.isArray(existingAdminBlocks) ? existingAdminBlocks : [];

  // Determine actual slotType if passed in muhurthamTimeOrSlot
  let resolvedSlotType: SlotType = slotType;
  if (['24hr', 'morning', 'evening', 'fullday', 'custom'].includes(muhurthamTimeOrSlot)) {
    resolvedSlotType = muhurthamTimeOrSlot as SlotType;
  }

  const { blockedDates: proposedBlockedDates } = calculateBlockedDates(
    newMarriageDate,
    resolvedSlotType,
    fromTimeStr,
    endTimeStr,
    muhurthamTimeOrSlot
  );

  const proposedInterval = getBookingInterval(
    newMarriageDate,
    resolvedSlotType,
    fromTimeStr,
    endTimeStr,
    proposedBlockedDates
  );

  const conflictingDates: string[] = [];
  let conflictReason = '';

  // 1. Check against active existing bookings
  for (const booking of safeBookings) {
    if (booking.booking_status === 'Cancelled') continue;
    if (excludeBookingId && booking.id === excludeBookingId) continue;

    const existingBlocked = booking.blocked_dates || [booking.marriage_date];
    
    // Check if there is any date overlap
    const hasDateOverlap = proposedBlockedDates.some((d) => existingBlocked.includes(d));
    if (!hasDateOverlap) continue;

    // Check interval overlap
    const existingSlotType: SlotType = (booking.slot_type as SlotType) || 
      (booking.blocked_previous_day || existingBlocked.length > 1 ? '24hr' : 'fullday');

    const existingInterval = getBookingInterval(
      booking.marriage_date,
      existingSlotType,
      booking.from_time,
      booking.end_time,
      existingBlocked
    );

    // Overlap condition: proposed.start < existing.end AND proposed.end > existing.start
    if (
      proposedInterval.startMinute < existingInterval.endMinute &&
      proposedInterval.endMinute > existingInterval.startMinute
    ) {
      existingBlocked.forEach((d) => {
        if (proposedBlockedDates.includes(d) && !conflictingDates.includes(d)) {
          conflictingDates.push(d);
        }
      });

      const slotTitle = PRESET_SLOTS.find((s) => s.id === existingSlotType)?.title || 'Existing Function';
      conflictReason = `Hall is already reserved for ${booking.customer_name} (${slotTitle}, ${booking.booking_id}) on ${formatDisplayDate(booking.marriage_date)}.`;
      break;
    }
  }

  // 2. Check against admin manual blocks (Admin manual block blocks whole day)
  if (conflictingDates.length === 0) {
    for (const adminBlock of safeAdminBlocks) {
      if (proposedBlockedDates.includes(adminBlock.date)) {
        conflictingDates.push(adminBlock.date);
        conflictReason = `Date ${formatDisplayDate(adminBlock.date)} is blocked by Admin (${adminBlock.reason}).`;
        break;
      }
    }
  }

  if (conflictingDates.length > 0) {
    return {
      hasConflict: true,
      conflictingDates,
      conflictReason: conflictReason || `Hall unavailable for selected slot on ${conflictingDates.map(formatDisplayDate).join(', ')}.`,
    };
  }

  return { hasConflict: false, conflictingDates: [] };
}

/**
 * Generates reference booking code like KM-20260722-001
 */
export function generateBookingId(sequenceNumber: number = 1): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const seq = String(sequenceNumber).padStart(3, '0');
  return `KM-${yyyy}${mm}${dd}-${seq}`;
}

