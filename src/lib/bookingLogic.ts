import { Booking, AdminManualBlock } from '../types';

/**
 * Parses time string (e.g. "06:00", "06:00 AM", "6:30 AM", "18:00") into minutes from midnight
 */
export function parseMuhurthamToMinutes(timeStr: string): number {
  if (!timeStr) return 540; // Default 9:00 AM
  
  const cleanStr = timeStr.trim().toUpperCase();
  const isPM = cleanStr.includes('PM');
  const isAM = cleanStr.includes('AM');
  
  // Strip AM/PM
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
 * Helper to get YYYY-MM-DD minus 1 day in local time
 */
export function getPreviousDay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return formatDateToYYYYMMDD(date);
}

/**
 * Helper to get YYYY-MM-DD plus 1 day
 */
export function getNextDay(dateStr: string): string {
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
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', { weekday: 'long' });
}

/**
 * Core Rule Check:
 * If Muhurtham Time < 07:00 AM (420 minutes):
 *   Block BOTH Previous Date AND Marriage Date.
 * Else:
 *   Block Marriage Date.
 */
export function calculateBlockedDates(
  marriageDate: string,
  muhurthamTime: string
): { blockedDates: string[]; blockedPreviousDay: boolean } {
  if (!marriageDate) {
    return { blockedDates: [], blockedPreviousDay: false };
  }

  const minutes = parseMuhurthamToMinutes(muhurthamTime);
  const CUTOFF_MINUTES = 7 * 60; // 07:00 AM = 420 minutes

  if (minutes < CUTOFF_MINUTES) {
    const prevDay = getPreviousDay(marriageDate);
    return {
      blockedDates: [prevDay, marriageDate],
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
 */
export function checkBookingConflict(
  newMarriageDate: string,
  newMuhurthamTime: string,
  existingBookings: Booking[],
  existingAdminBlocks: AdminManualBlock[],
  excludeBookingId?: string
): { hasConflict: boolean; conflictingDates: string[]; conflictReason?: string } {
  if (!newMarriageDate) {
    return { hasConflict: false, conflictingDates: [] };
  }

  const { blockedDates: proposedBlockedDates, blockedPreviousDay } = calculateBlockedDates(
    newMarriageDate,
    newMuhurthamTime
  );

  const conflictingDates: string[] = [];
  let conflictReason = '';

  // 1. Check against active existing bookings
  for (const booking of existingBookings) {
    if (booking.booking_status === 'Cancelled') continue;
    if (excludeBookingId && booking.id === excludeBookingId) continue;

    // Active booking blocked dates
    const existingBlocked = booking.blocked_dates || [booking.marriage_date];

    for (const proposedDate of proposedBlockedDates) {
      if (existingBlocked.includes(proposedDate)) {
        if (!conflictingDates.includes(proposedDate)) {
          conflictingDates.push(proposedDate);
        }
        conflictReason = `Hall is already booked for ${booking.customer_name} (${booking.booking_id}) on ${formatDisplayDate(proposedDate)}.`;
      }
    }
  }

  // 2. Check against admin manual blocks
  for (const adminBlock of existingAdminBlocks) {
    for (const proposedDate of proposedBlockedDates) {
      if (adminBlock.date === proposedDate) {
        if (!conflictingDates.includes(proposedDate)) {
          conflictingDates.push(proposedDate);
        }
        conflictReason = `Date ${formatDisplayDate(proposedDate)} is blocked by Admin (${adminBlock.reason}).`;
      }
    }
  }

  if (conflictingDates.length > 0) {
    let explanation = `Hall already booked for selected dates (${conflictingDates.map(formatDisplayDate).join(', ')}).`;
    if (blockedPreviousDay && conflictingDates.includes(getPreviousDay(newMarriageDate))) {
      explanation += ` Note: Muhurtham is before 07:00 AM (${newMuhurthamTime}), which requires blocking the setup day (${formatDisplayDate(getPreviousDay(newMarriageDate))}).`;
    }
    return {
      hasConflict: true,
      conflictingDates,
      conflictReason: conflictReason || explanation,
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
