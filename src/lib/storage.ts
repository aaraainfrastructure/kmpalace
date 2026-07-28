import { Booking, AdminManualBlock } from '../types';
import { calculateBlockedDates } from './bookingLogic';

const STORAGE_KEY_BOOKINGS = 'km_palace_bookings_v2';
const STORAGE_KEY_BLOCKS = 'km_palace_admin_blocks_v2';

export const INITIAL_SEED_BOOKINGS: Booking[] = [
  {
    id: 'seed-booking-1',
    booking_id: 'KM-20260721-001',
    customer_name: 'Mr. R. Subramanian',
    phone: '+91 9159277277',
    email: 'subramanian.r@example.com',
    bride_name: 'Priya Subramanian',
    groom_name: 'Anand Kumar',
    marriage_date: '2026-07-21',
    muhurtham_time: '05:30 AM',
    function_type: 'Wedding',
    guest_count: 850,
    requirements: ['Decoration', 'Catering', 'Rooms', 'Parking', 'Generator'],
    blocked_previous_day: true,
    blocked_dates: ['2026-07-20', '2026-07-21'],
    booking_status: 'Confirmed',
    created_at: new Date('2026-07-10T10:00:00').toISOString(),
    notes: 'Early Muhurtham marriage. Decoration and setup begins on 20 July evening.',
    estimated_amount: 250000,
  },
  {
    id: 'seed-booking-2',
    booking_id: 'KM-20260728-002',
    customer_name: 'Dr. V. Natarajan',
    phone: '+91 9159277277',
    email: 'dr.natarajan@example.com',
    bride_name: 'Deepa Natarajan',
    groom_name: 'Karthik Sundaram',
    marriage_date: '2026-07-28',
    muhurtham_time: '09:30 AM',
    function_type: 'Wedding',
    guest_count: 1200,
    requirements: ['Decoration', 'Catering', 'Rooms', 'Parking', 'Generator'],
    blocked_previous_day: false,
    blocked_dates: ['2026-07-28'],
    booking_status: 'Confirmed',
    created_at: new Date('2026-07-12T14:30:00').toISOString(),
    notes: 'Grand wedding reception following morning muhurtham.',
    estimated_amount: 320000,
  },
  {
    id: 'seed-booking-3',
    booking_id: 'KM-20260805-003',
    customer_name: 'Mrs. S. Meenakshi',
    phone: '+91 9159277277',
    email: 'meenakshi.s@example.com',
    bride_name: 'Kavitha S.',
    groom_name: 'Vijay Raghavan',
    marriage_date: '2026-08-05',
    muhurtham_time: '06:00 AM',
    function_type: 'Engagement',
    guest_count: 400,
    requirements: ['Decoration', 'Catering', 'Rooms'],
    blocked_previous_day: true,
    blocked_dates: ['2026-08-04', '2026-08-05'],
    booking_status: 'Pending',
    created_at: new Date('2026-07-18T09:15:00').toISOString(),
    notes: 'Engagement ceremony & breakfast catering.',
    estimated_amount: 150000,
  }
];

export const INITIAL_SEED_BLOCKS: AdminManualBlock[] = [
  {
    id: 'block-1',
    date: '2026-08-15',
    reason: 'Annual Maintenance & Stage Polishing',
    created_at: new Date('2026-07-01').toISOString(),
  }
];

export function getStoredBookings(): Booking[] {
  if (typeof window === 'undefined') return INITIAL_SEED_BOOKINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(INITIAL_SEED_BOOKINGS));
      return INITIAL_SEED_BOOKINGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse stored bookings:', err);
    return INITIAL_SEED_BOOKINGS;
  }
}

export function saveStoredBookings(bookings: Booking[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
  } catch (err) {
    console.error('Failed to save bookings to storage:', err);
  }
}

export function getStoredAdminBlocks(): AdminManualBlock[] {
  if (typeof window === 'undefined') return INITIAL_SEED_BLOCKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BLOCKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_BLOCKS, JSON.stringify(INITIAL_SEED_BLOCKS));
      return INITIAL_SEED_BLOCKS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse admin blocks:', err);
    return INITIAL_SEED_BLOCKS;
  }
}

export function saveStoredAdminBlocks(blocks: AdminManualBlock[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_BLOCKS, JSON.stringify(blocks));
  } catch (err) {
    console.error('Failed to save admin blocks:', err);
  }
}
