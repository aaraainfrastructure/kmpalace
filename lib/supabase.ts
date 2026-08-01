import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { Booking, AdminManualBlock } from '../src/types';
import { SlotType } from '../src/lib/bookingLogic';

const getSupabaseUrl = () =>
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://htlgfpfmjuneswmqpxfw.supabase.co';

const getSupabaseServiceRoleKey = () =>
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bGdmcGZtanVuZXN3bXFweGZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDc5OTA0MSwiZXhwIjoyMTAwMzc1MDQxfQ.J-KTnHZbClHeBBtrp4PMQmXZG0h7wbG7PVZ-QmITyB0';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const url = getSupabaseUrl();
    const key = getSupabaseServiceRoleKey();
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

// Data persistence structures
export interface ServerData {
  bookings: Booking[];
  adminBlocks: AdminManualBlock[];
  nextSequence: number;
}

const DATA_FILE = process.env.VERCEL
  ? path.join('/tmp', 'km_palace_data.json')
  : path.join(process.cwd(), 'km_palace_data.json');

let globalServerDataCache: ServerData | null = null;

export function loadServerData(): ServerData {
  if (globalServerDataCache && Array.isArray(globalServerDataCache.bookings)) {
    return globalServerDataCache;
  }
  try {
    let parsed: any = null;
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      parsed = JSON.parse(raw);
    } else {
      const rootDataFile = path.join(process.cwd(), 'km_palace_data.json');
      if (fs.existsSync(rootDataFile)) {
        const raw = fs.readFileSync(rootDataFile, 'utf-8');
        parsed = JSON.parse(raw);
      }
    }
    if (parsed && typeof parsed === 'object') {
      globalServerDataCache = {
        bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
        adminBlocks: Array.isArray(parsed.adminBlocks) ? parsed.adminBlocks : [],
        nextSequence: typeof parsed.nextSequence === 'number' ? parsed.nextSequence : 1,
      };
      return globalServerDataCache;
    }
  } catch (err) {
    console.error('Error reading server data file:', err);
  }
  globalServerDataCache = { bookings: [], adminBlocks: [], nextSequence: 1 };
  return globalServerDataCache;
}

export function saveServerData(data: ServerData) {
  globalServerDataCache = data;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving server data file:', err);
  }
}

export async function withTimeout<T>(promiseLike: Promise<T> | any, ms: number, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  try {
    const result = await Promise.race([Promise.resolve(promiseLike), timeoutPromise]);
    clearTimeout(timer!);
    return result;
  } catch (err) {
    clearTimeout(timer!);
    return fallback;
  }
}

export async function loadDataWithSupabase(): Promise<ServerData> {
  const localData = loadServerData();
  try {
    const supabase = getSupabaseClient();
    const dbPromise = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    const { data: dbBookings, error: bErr } = await withTimeout(
      dbPromise,
      2000,
      { data: null, error: { message: 'DB Timeout or Offline' } }
    );

    if (!bErr && Array.isArray(dbBookings) && dbBookings.length > 0) {
      const fetchedMap = new Map<string, Booking>();
      dbBookings.forEach((b: any) => {
        const mapped: Booking = {
          id: b.id || 'bk_' + Date.now(),
          booking_id: b.booking_id || 'KM-2026-001',
          customer_name: b.customer_name || b.name || 'Valued Guest',
          phone: b.phone || '',
          email: b.email || '',
          bride_name: b.bride_name || '',
          groom_name: b.groom_name || '',
          marriage_date: b.marriage_date || b.booking_date || new Date().toISOString().split('T')[0],
          slot_type: (b.slot_type || (b.from_time === '04:00' ? 'morning' : b.from_time === '16:00' ? 'evening' : b.from_time === '06:00' ? 'fullday' : '24hr')) as SlotType,
          muhurtham_time: b.muhurtham_time || '06:00 AM',
          from_time: b.from_time || b.muhurtham_time || '06:00 AM',
          end_time: b.end_time || '10:00 PM',
          function_type: b.function_type || 'Wedding',
          guest_count: b.guest_count || 500,
          requirements: Array.isArray(b.requirements) ? b.requirements : [],
          blocked_previous_day: b.blocked_previous_day ?? false,
          blocked_dates: Array.isArray(b.blocked_dates) ? b.blocked_dates : [b.marriage_date || b.booking_date],
          booking_status: b.booking_status || 'Confirmed',
          created_at: b.created_at || new Date().toISOString(),
          notes: b.notes || '',
          estimated_amount: b.estimated_amount || b.total_amount || 364500,
          payment_method: b.payment_method || 'UPI',
          payment_gateway: b.payment_gateway || 'Manual',
          currency: b.currency || 'INR',
          customer_region: b.customer_region || 'India',
          payment_status: b.payment_status || 'Pending',
          advance_paid_amount: b.advance_paid_amount || 0,
          pg_rooms_selected: b.pg_rooms_selected || undefined,
        };
        fetchedMap.set(mapped.id, mapped);
      });

      localData.bookings.forEach((localB) => {
        if (!fetchedMap.has(localB.id)) {
          fetchedMap.set(localB.id, localB);
        }
      });

      localData.bookings = Array.from(fetchedMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    const blockPromise = supabase.from('admin_blocks').select('*');
    const { data: dbBlocks, error: blErr } = await withTimeout(
      blockPromise,
      2000,
      { data: null, error: { message: 'DB Timeout or Offline' } }
    );

    if (!blErr && Array.isArray(dbBlocks) && dbBlocks.length > 0) {
      localData.adminBlocks = dbBlocks as AdminManualBlock[];
    }

    saveServerData(localData);
  } catch (err) {
    console.log('[Supabase Sync Notice] DB Offline or unreachable; gracefully using local memory cache.');
  }
  return localData;
}

export async function saveBookingToSupabase(booking: Booking) {
  try {
    const supabase = getSupabaseClient();
    const payload: any = {
      id: booking.id,
      booking_id: booking.booking_id,
      customer_name: booking.customer_name,
      customer_address: booking.customer_address || '',
      phone: booking.phone,
      email: booking.email,
      bride_name: booking.bride_name || '',
      groom_name: booking.groom_name || '',
      marriage_date: booking.marriage_date,
      slot_type: booking.slot_type || '24hr',
      muhurtham_time: booking.muhurtham_time,
      from_time: booking.from_time,
      end_time: booking.end_time,
      function_type: booking.function_type,
      guest_count: booking.guest_count,
      requirements: booking.requirements || [],
      blocked_previous_day: booking.blocked_previous_day ?? false,
      blocked_dates: booking.blocked_dates || [booking.marriage_date],
      estimated_amount: booking.estimated_amount,
      payment_status: booking.payment_status || 'Pending',
      payment_method: booking.payment_method || 'UPI',
      payment_gateway: booking.payment_gateway || 'Manual',
      currency: booking.currency || 'INR',
      customer_region: booking.customer_region || 'India',
      pg_transaction_id: booking.pg_transaction_id || null,
      pg_rooms_selected: booking.pg_rooms_selected || null,
      advance_paid_amount: booking.advance_paid_amount || 0,
      booking_status: booking.booking_status || 'Confirmed',
      notes: booking.notes || '',
      created_at: booking.created_at || new Date().toISOString(),
    };

    const upsertPromise = supabase.from('bookings').upsert([payload], { onConflict: 'id' });
    const { error } = await withTimeout(upsertPromise, 2500, { error: { message: 'Supabase upsert timeout' } });
    if (error) {
      delete payload.slot_type;
      const retryPromise = supabase.from('bookings').upsert([payload], { onConflict: 'id' });
      await withTimeout(retryPromise, 2500, { error: { message: 'Supabase fallback upsert timeout' } });
    }
  } catch (err: any) {
    console.warn('[Supabase Save Exception]: DB Offline/Unreachable, preserved locally.', err?.message || err);
  }
}

export async function deleteBookingFromSupabase(id: string) {
  try {
    const supabase = getSupabaseClient();
    const delPromise = supabase.from('bookings').delete().eq('id', id);
    await withTimeout(delPromise, 2500, null);
  } catch (err) {
    console.log('[Supabase Delete Note] Processed locally.');
  }
}

export async function saveAdminBlockToSupabase(block: AdminManualBlock) {
  try {
    const supabase = getSupabaseClient();
    const upsertPromise = supabase.from('admin_blocks').upsert([block], { onConflict: 'id' });
    await withTimeout(upsertPromise, 2500, null);
  } catch (err) {
    console.log('[Supabase Block Note] Saved locally.');
  }
}

export async function deleteAdminBlockFromSupabase(id: string) {
  try {
    const supabase = getSupabaseClient();
    const delPromise = supabase.from('admin_blocks').delete().eq('id', id);
    await withTimeout(delPromise, 2500, null);
  } catch (err) {
    console.log('[Supabase Block Delete Note] Processed locally.');
  }
}
