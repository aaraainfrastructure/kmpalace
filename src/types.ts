export type FunctionType = 
  | 'Wedding'
  | 'Brahmin Wedding / Vedic Muhurtham'
  | 'Reception'
  | 'Engagement'
  | 'Birthday'
  | 'Conference'
  | 'Others';

export type SpecialRequirement = 
  | 'Decoration'
  | 'Catering'
  | 'Rooms'
  | 'Parking'
  | 'Generator';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  booking_id: string; // Ref like KM-20260722-001
  customer_name: string;
  phone: string;
  email: string;
  customer_address?: string;
  bride_name: string;
  groom_name: string;
  marriage_date: string; // YYYY-MM-DD
  muhurtham_time: string; // e.g., "06:00 AM" or "06:00"
  from_time?: string; // e.g. "06:00 AM" or "08:00 AM"
  end_time?: string; // e.g. "10:00 PM" or "11:30 PM"
  function_type: FunctionType;
  guest_count: number;
  requirements: SpecialRequirement[];
  blocked_previous_day: boolean; // True if muhurtham < 07:00 AM
  blocked_dates: string[]; // List of YYYY-MM-DD strings blocked by this booking
  booking_status: BookingStatus;
  created_at: string;
  notes?: string;
  estimated_amount?: number;
  payment_method?: 'UPI' | 'Card' | 'NetBanking' | 'Cash';
  payment_gateway?: 'Manual' | string;
  currency?: 'INR' | 'USD';
  customer_region?: 'India' | 'International';
  payment_status?: 'Pending' | 'Advance Paid' | 'Fully Paid';
  pg_transaction_id?: string;
  advance_paid_amount?: number;
  pg_rooms_selected?: {
    triple_rooms: number;
    eight_person_rooms: number;
  };
}

export interface AdminManualBlock {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string; // e.g. "Maintenance", "Hall Owner Event"
  created_at: string;
}

export interface DateAvailability {
  date: string; // YYYY-MM-DD
  status: 'Available' | 'Blocked' | 'Booked' | 'Pending';
  bookingRef?: string;
  customerName?: string;
  functionType?: string;
  reason?: string;
  isMuhurthamEarly?: boolean;
}

export interface EmailNotificationPayload {
  to: string;
  subject: string;
  booking: Booking;
}

export interface AdminStats {
  totalBookings: number;
  todaysBookings: number;
  upcomingBookings: number;
  monthlyRevenue: number;
  blockedDaysCount: number;
}
