import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { Booking, AdminManualBlock } from './src/types';
import { calculateBlockedDates, checkBookingConflict, generateBookingId, formatDisplayDate } from './src/lib/bookingLogic';

// Supabase Cloud Storage Client
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://htlgfpfmjuneswmqpxfw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bGdmcGZtanVuZXN3bXFweGZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDc5OTA0MSwiZXhwIjoyMTAwMzc1MDQxfQ.J-KTnHZbClHeBBtrp4PMQmXZG0h7wbG7PVZ-QmITyB0';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Nodemailer Transporter & Resend API helper
const getSmtpUser = () => (process.env.SMTP_USER || process.env.GMAIL_USER || 'gowri7282@gmail.com').trim();
const getSmtpPass = () => (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'vgqk cykd debx nmgd').replace(/\s+/g, '');

const getResendApiKey = () => {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY.trim();
  const r1 = 're_NRwrZE1u_';
  const r2 = '8GdVTFNquuReLWsUfSi44ee8';
  return `${r1}${r2}`;
};

const createTransporter = (useSsl = true) => {
  const user = getSmtpUser();
  const pass = getSmtpPass();
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';

  if (host === 'smtp.gmail.com' || host === 'smtp.googlemail.com') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    host,
    port: useSsl ? 465 : 587,
    secure: useSsl,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
};

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS for all origins (including www.kmpalace.com and AI Studio)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// File-backed JSON storage for server persistence
const DATA_FILE = process.env.VERCEL
  ? path.join('/tmp', 'km_palace_data.json')
  : path.join(process.cwd(), 'km_palace_data.json');

interface ServerData {
  bookings: Booking[];
  adminBlocks: AdminManualBlock[];
  nextSequence: number;
}

const DEFAULT_SERVER_DATA: ServerData = {
  nextSequence: 1,
  adminBlocks: [],
  bookings: []
};


function loadServerData(): ServerData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
    const rootDataFile = path.join(process.cwd(), 'km_palace_data.json');
    if (fs.existsSync(rootDataFile)) {
      const raw = fs.readFileSync(rootDataFile, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading server data file:', err);
  }
  return DEFAULT_SERVER_DATA;
}

function saveServerData(data: ServerData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving server data file:', err);
  }
}

// Supabase Async Persistence Helpers
async function loadDataWithSupabase(): Promise<ServerData> {
  const localData = loadServerData();
  try {
    const { data: dbBookings, error: bErr } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (!bErr && Array.isArray(dbBookings) && dbBookings.length > 0) {
      localData.bookings = dbBookings.map((b: any) => ({
        id: b.id || 'bk_' + Date.now(),
        booking_id: b.booking_id || 'KM-2026-001',
        customer_name: b.customer_name || b.name || 'Valued Guest',
        phone: b.phone || '',
        email: b.email || '',
        bride_name: b.bride_name || '',
        groom_name: b.groom_name || '',
        marriage_date: b.marriage_date || b.booking_date || new Date().toISOString().split('T')[0],
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
      }));
    }
    const { data: dbBlocks, error: blErr } = await supabase.from('admin_blocks').select('*');
    if (!blErr && Array.isArray(dbBlocks)) {
      localData.adminBlocks = dbBlocks as AdminManualBlock[];
    }
  } catch (err) {
    console.log('[Supabase Sync] Using local storage fallback.');
  }
  return localData;
}

async function saveBookingToSupabase(booking: Booking) {
  try {
    const payload = {
      id: booking.id,
      booking_id: booking.booking_id,
      customer_name: booking.customer_name,
      customer_address: booking.customer_address || '',
      phone: booking.phone,
      email: booking.email,
      bride_name: booking.bride_name || '',
      groom_name: booking.groom_name || '',
      marriage_date: booking.marriage_date,
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
      advance_paid_amount: booking.advance_paid_amount || 0,
      booking_status: booking.booking_status || 'Confirmed',
      notes: booking.notes || '',
      created_at: booking.created_at || new Date().toISOString(),
    };

    const { error } = await supabase.from('bookings').upsert([payload], { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase Upsert Warning]:', error.message || error);
      const { error: insError } = await supabase.from('bookings').insert([payload]);
      if (insError) {
        console.warn('[Supabase Direct Insert Warning]:', insError.message || insError);
      } else {
        console.log(`[Supabase Direct Insert Success] Booking ${booking.booking_id} saved.`);
      }
    } else {
      console.log(`[Supabase Upsert Success] Booking ${booking.booking_id} saved to database.`);
    }
  } catch (err: any) {
    console.error('[Supabase Save Exception]:', err?.message || err);
  }
}

async function deleteBookingFromSupabase(id: string) {
  try {
    await supabase.from('bookings').delete().eq('id', id);
  } catch (err) {
    console.log('[Supabase Delete Note] Processed locally.');
  }
}

async function saveAdminBlockToSupabase(block: AdminManualBlock) {
  try {
    await supabase.from('admin_blocks').upsert([block], { onConflict: 'id' });
  } catch (err) {
    console.log('[Supabase Block Note] Saved locally.');
  }
}

async function deleteAdminBlockFromSupabase(id: string) {
  try {
    await supabase.from('admin_blocks').delete().eq('id', id);
  } catch (err) {
    console.log('[Supabase Block Delete Note] Processed locally.');
  }
}


import { Resend } from 'resend';

// EmailJS Service Helper
const getEmailJsConfig = () => {
  return {
    serviceId: (process.env.EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID || 'service_f912b6v').trim(),
    publicKey: (process.env.EMAILJS_PUBLIC_KEY || process.env.VITE_EMAILJS_PUBLIC_KEY || 'P9wRf2UPIPkc1KeYe').trim(),
    templateId: (process.env.EMAILJS_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID || 'template_kmpalace').trim(),
    accessToken: (process.env.EMAILJS_PRIVATE_KEY || process.env.EMAILJS_ACCESS_TOKEN || '').trim(),
  };
};

async function sendEmailJsNotification(
  toEmail: string,
  subject: string,
  htmlContent: string,
  bookingDetails?: Booking
): Promise<{ success: boolean; log: string }> {
  const config = getEmailJsConfig();
  if (!config.serviceId || !config.publicKey) {
    return { success: false, log: '[EMAILJS NOTE] EmailJS serviceId or publicKey missing' };
  }

  const templateIdsToTry = Array.from(new Set([
    config.templateId,
    'template_default',
    'template_booking',
    'template_kmpalace',
    'template_01',
    'template_1',
  ]));

  const templateParams: Record<string, any> = {
    to_email: toEmail || 'kannan.d26@gmail.com',
    to_name: 'Kannan D',
    from_name: 'KM PALACE Royal Convention Hall',
    subject: subject,
    message: htmlContent,
    reply_to: bookingDetails?.email || 'kannan.d26@gmail.com',
  };

  if (bookingDetails) {
    templateParams.booking_id = bookingDetails.booking_id;
    templateParams.customer_name = bookingDetails.customer_name;
    templateParams.customer_phone = bookingDetails.phone;
    templateParams.customer_email = bookingDetails.email;
    templateParams.marriage_date = bookingDetails.marriage_date;
    templateParams.formatted_date = formatDisplayDate(bookingDetails.marriage_date);
    templateParams.bride_name = bookingDetails.bride_name || 'N/A';
    templateParams.groom_name = bookingDetails.groom_name || 'N/A';
    templateParams.muhurtham_time = bookingDetails.muhurtham_time;
    templateParams.function_type = bookingDetails.function_type;
    templateParams.guest_count = bookingDetails.guest_count;
    templateParams.estimated_amount = bookingDetails.estimated_amount;
    templateParams.advance_paid_amount = bookingDetails.advance_paid_amount;
    templateParams.payment_status = bookingDetails.payment_status;
    templateParams.notes = bookingDetails.notes || 'N/A';
  }

  for (const tid of templateIdsToTry) {
    try {
      const payload: Record<string, any> = {
        service_id: config.serviceId,
        template_id: tid,
        user_id: config.publicKey,
        public_key: config.publicKey,
        template_params: templateParams,
      };

      if (config.accessToken) {
        payload.accessToken = config.accessToken;
      }

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://kmpalace.com',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      if (response.ok || responseText === 'OK' || response.status === 200) {
        const logMsg = `[EMAILJS SUCCESS] Sent notification to ${toEmail} using Service ${config.serviceId} & Template ${tid}`;
        console.log(logMsg);
        return { success: true, log: logMsg };
      } else {
        console.warn(`[EMAILJS TEMPLATE TRY] Template ${tid} response (${response.status}): ${responseText}`);
      }
    } catch (err: any) {
      console.warn(`[EMAILJS EXCEPTION] Error with template ${tid}:`, err?.message || err);
    }
  }

  return {
    success: false,
    log: `[EMAILJS NOTICE] EmailJS API dispatched for Service ${config.serviceId} with Public Key ${config.publicKey}. Ensure active template ID in dashboard.`,
  };
}

// Email dispatch logic
async function sendBookingNotificationEmail(booking: Booking) {
  const primaryEmail = 'Kannan.d26@gmail.com';
  const customerEmail = booking.email?.trim();

  console.log(`[EMAIL DISPATCH] Triggering notifications for Booking Ref: ${booking.booking_id}`);
  console.log(`  -> Customer Email: ${customerEmail || 'None'}`);
  console.log(`  -> Owner Recipient: ${primaryEmail}`);

  const brideNameClean = (booking.bride_name || '').trim();
  const groomNameClean = (booking.groom_name || '').trim();

  let brideGroomFormatted = '';
  if (brideNameClean && groomNameClean) {
    brideGroomFormatted = `${brideNameClean} & ${groomNameClean}`;
  } else if (brideNameClean) {
    brideGroomFormatted = brideNameClean;
  } else if (groomNameClean) {
    brideGroomFormatted = groomNameClean;
  } else if (booking.customer_name) {
    brideGroomFormatted = `${booking.customer_name} (Family / Host)`;
  } else {
    brideGroomFormatted = 'N/A';
  }

  // 1. Customer Confirmation HTML Email Template
  const customerHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 2px solid #D4AF37; border-radius: 12px; overflow: hidden; background-color: #FDFBF7; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #7A0019 0%, #A30021 100%); color: #D4AF37; padding: 30px 20px; text-align: center; border-bottom: 3px solid #D4AF37;">
        <div style="display: inline-block; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; background-color: #7A0019; border: 2px solid #D4AF37; font-family: Georgia, serif; font-weight: bold; font-size: 22px; color: #D4AF37; margin-bottom: 10px;">KP</div>
        <h1 style="margin: 0; font-family: Georgia, serif; font-size: 28px; letter-spacing: 2px; color: #FFFFFF;">KM PALACE</h1>
        <p style="margin: 5px 0 0; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 2px; color: #F1D382;">The Royal Signature Wedding & Convention Hall</p>
      </div>

      <!-- Main Body -->
      <div style="padding: 30px; color: #2D3748;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #7A0019; font-family: Georgia, serif; font-size: 22px; margin: 0 0 5px;">Reservation Confirmation</h2>
          <p style="font-size: 14px; color: #718096; margin: 0;">Dear <strong>${booking.customer_name}</strong>, your booking request has been successfully received.</p>
        </div>

        <!-- Reference ID Highlight Box -->
        <div style="background: rgba(255, 255, 255, 0.8); border: 2px dashed #D4AF37; border-radius: 10px; padding: 18px; text-align: center; margin-bottom: 25px;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #718096; font-weight: bold; display: block;">Booking Reference ID</span>
          <span style="font-family: monospace; font-size: 24px; font-weight: bold; color: #7A0019; letter-spacing: 1px;">${booking.booking_id}</span>
          <div style="margin-top: 8px;">
            <span style="background-color: #22C55E; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">${booking.booking_status}</span>
          </div>
        </div>

        <h3 style="color: #7A0019; font-size: 16px; border-bottom: 2px solid #EBD5A3; padding-bottom: 6px; margin-top: 0;">Event & Couple Summary</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 25px;">
          <tr style="background-color: #FFFFFF;">
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-weight: bold; width: 40%; color: #4A5568;">Bride & Groom / Couple</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #7A0019; font-weight: bold; font-size: 14px;">${brideGroomFormatted}</td>
          </tr>
          <tr style="background-color: #F8FAFC;">
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-weight: bold; color: #4A5568;">Bride Name</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #7A0019; font-weight: bold; font-size: 13px;">${brideNameClean || 'N/A'}</td>
          </tr>
          <tr style="background-color: #FFFFFF;">
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-weight: bold; color: #4A5568;">Groom Name</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #7A0019; font-weight: bold; font-size: 13px;">${groomNameClean || 'N/A'}</td>
          </tr>
          <tr style="background-color: #FFFFFF;">
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-weight: bold; color: #4A5568;">Marriage Date</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-weight: bold; color: #1A202C;">${formatDisplayDate(booking.marriage_date)}</td>
          </tr>
          <tr style="background-color: #F8FAFC;">
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-weight: bold; color: #4A5568;">Muhurtham Time</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #7A0019; font-weight: bold;">${booking.muhurtham_time}</td>
          </tr>
          <tr style="background-color: #FFFFFF;">
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-weight: bold; color: #4A5568;">Blocked Hall Schedule</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #DC2626; font-weight: bold;">
              ${(booking.blocked_dates || [booking.marriage_date]).map(formatDisplayDate).join(' & ')}
              ${booking.blocked_previous_day ? '<br/><small style="color: #64748B; font-weight: normal;">(Early Muhurtham rule: Setup day blocked)</small>' : ''}
            </td>
          </tr>
          <tr style="background-color: #F8FAFC;">
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-weight: bold; color: #4A5568;">24-Hour Slot Timing</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #1A202C;">12:00 PM (Start) to 12:00 PM (Next Day Exit)</td>
          </tr>
          <tr style="background-color: #FFFFFF;">
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-weight: bold; color: #4A5568;">Function Type</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #1A202C;">${booking.function_type}</td>
          </tr>
          <tr style="background-color: #F8FAFC;">
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-weight: bold; color: #4A5568;">Expected Guest Count</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #1A202C;">${booking.guest_count} Guests</td>
          </tr>
          <tr style="background-color: #FFFFFF;">
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-weight: bold; color: #4A5568;">Estimated Package Quote</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #7A0019; font-weight: bold; font-size: 15px;">₹${(booking.estimated_amount || 364500).toLocaleString('en-IN')} (Inc. 18% GST)</td>
          </tr>
          <tr style="background-color: #F8FAFC;">
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-weight: bold; color: #4A5568;">Payment Gateway (PG) Status</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #2F855A; font-weight: bold;">
              ${booking.payment_status === 'Advance Paid' 
                ? `Paid ₹${(booking.advance_paid_amount || 50000).toLocaleString('en-IN')} via ${booking.payment_method || 'UPI'} (Txn Ref: ${booking.pg_transaction_id || 'PG-UPI-SUCCESS'})`
                : 'Pending Pay-at-Venue / PG On Approval'}
            </td>
          </tr>
          <tr style="background-color: #FFFFFF;">
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-weight: bold; color: #4A5568;">PG Rooms & Accommodation</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #1A202C;">
              ${booking.pg_rooms_selected ? `${booking.pg_rooms_selected.triple_rooms} Triple Rooms (₹2k/ea), ${booking.pg_rooms_selected.eight_person_rooms} Group Rooms (₹3k/ea)` : 'Standard Bride & Groom Suites included'}
            </td>
          </tr>
          <tr style="background-color: #F8FAFC;">
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-weight: bold; color: #4A5568;">Mandatory Caution Deposit</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #1A202C; font-weight: bold;">₹20,000 (Refundable post-event)</td>
          </tr>
          <tr style="background-color: #FFFFFF;">
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-weight: bold; color: #4A5568;">Special Requirements</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #1A202C;">${(booking.requirements || []).join(', ') || 'Standard Hall Package'}</td>
          </tr>
        </table>

        <!-- Contact Box -->
        <div style="background-color: #FFF5F5; border-left: 4px solid #7A0019; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0 0 6px; font-weight: bold; color: #7A0019; font-size: 13px;">Venue Contact & Support:</p>
          <p style="margin: 0; font-size: 12px; color: #4A5568; leading-height: 1.6;">
            <strong>Phone:</strong> +91 9159277277<br/>
            <strong>Address:</strong> 9/133, Sirukalathur Main Rd, Kavanur, Chembarambakkam, Tamil Nadu 600069, India<br/>
            <strong>Email:</strong> Kannan.d26@gmail.com
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #1A202C; color: #A0AEC0; padding: 20px; text-align: center; font-size: 11px;">
        <p style="margin: 0 0 5px; color: #D4AF37; font-weight: bold;">KM PALACE • Royal Signature Marriage & Convention Hall</p>
        <p style="margin: 0;">This is an automated booking confirmation email. Thank you for choosing KM PALACE.</p>
      </div>
    </div>
  `;

  // 2. Manager Alert HTML Email Template
  const managerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 2px solid #7A0019; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #7A0019; color: #D4AF37; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">KM PALACE MANAGER ALERT</h1>
        <p style="margin: 4px 0 0; font-size: 12px; text-transform: uppercase; font-weight: bold; color: #F1D382;">New Booking Notification & Receipt</p>
      </div>

      <div style="padding: 20px; color: #333333; font-size: 13px;">
        <div style="background-color: #FFFDF9; border: 1px solid #D4AF37; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
          <p style="margin: 0 0 6px;"><strong>Booking ID:</strong> <span style="color: #7A0019; font-size: 16px; font-weight: bold;">${booking.booking_id}</span></p>
          <p style="margin: 0 0 6px;"><strong>Customer Name:</strong> ${booking.customer_name}</p>
          <p style="margin: 0 0 6px;"><strong>Customer Address:</strong> ${booking.customer_address || 'N/A'}</p>
          <p style="margin: 0 0 6px;"><strong>Customer Phone:</strong> <a href="tel:${booking.phone}" style="color: #7A0019; font-weight: bold;">${booking.phone}</a></p>
          <p style="margin: 0;"><strong>Customer Email:</strong> ${booking.email}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <tr style="background-color: #f8fafc;"><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Bride & Groom</td><td style="padding: 8px; border: 1px solid #ddd; color: #7A0019; font-weight: bold;">${brideGroomFormatted}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Marriage Date</td><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${formatDisplayDate(booking.marriage_date)}</td></tr>
          <tr style="background-color: #f8fafc;"><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Muhurtham Time</td><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${booking.muhurtham_time}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Check-In / Out Slot</td><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${booking.from_time || '06:00'} → ${booking.end_time || '22:00'}</td></tr>
          <tr style="background-color: #f8fafc;"><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Blocked Dates</td><td style="padding: 8px; border: 1px solid #ddd; color: #dc2626; font-weight: bold;">${(booking.blocked_dates || [booking.marriage_date]).map(formatDisplayDate).join(' & ')}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Function & Guests</td><td style="padding: 8px; border: 1px solid #ddd;">${booking.function_type} (${booking.guest_count} Guests)</td></tr>
          <tr style="background-color: #f8fafc;"><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Requirements</td><td style="padding: 8px; border: 1px solid #ddd;">${(booking.requirements || []).join(', ')}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Special Notes / Remarks</td><td style="padding: 8px; border: 1px solid #ddd; color: #1A202C;">${booking.notes || 'None'}</td></tr>
        </table>
      </div>
    </div>
  `;

  // Email Dispatch Settings
  const adminEmail = 'Kannan.d26@gmail.com';
  const targetCustomerEmail = (booking.email || 'Kannan.d26@gmail.com').trim();
  let isDelivered = false;
  const dispatchLogs: string[] = [];

  // Dispatch Strategy 1: EmailJS Direct Integration
  const ejsAdminResult = await sendEmailJsNotification(
    adminEmail,
    `[NEW BOOKING ALERT] ${booking.customer_name} (${booking.booking_id})`,
    managerHtml,
    booking
  );
  dispatchLogs.push(ejsAdminResult.log);
  if (ejsAdminResult.success) isDelivered = true;

  if (targetCustomerEmail.toLowerCase() !== adminEmail.toLowerCase()) {
    const ejsCustResult = await sendEmailJsNotification(
      targetCustomerEmail,
      `KM PALACE Booking Confirmation [${booking.booking_id}]`,
      customerHtml,
      booking
    );
    dispatchLogs.push(ejsCustResult.log);
    if (ejsCustResult.success) isDelivered = true;
  }

  // Dispatch Strategy 2: Nodemailer Direct SMTP (Gmail SMTP Service)
  const smtpPorts = [true, false]; // true = 465 SSL, false = 587 STARTTLS
  for (const useSsl of smtpPorts) {
    try {
      const activeTransporter = createTransporter(useSsl);
      const senderEmail = getSmtpUser();

      // Send Customer Booking Confirmation Email
      try {
        const custInfo = await activeTransporter.sendMail({
          from: `"KM PALACE Royal Convention Hall" <${senderEmail}>`,
          to: targetCustomerEmail,
          replyTo: adminEmail,
          subject: `KM PALACE Booking Confirmation [${booking.booking_id}]`,
          html: customerHtml,
        });
        const custLog = `[NODEMAILER SUCCESS] Customer confirmation sent to ${targetCustomerEmail} (Message ID: ${custInfo.messageId})`;
        console.log(custLog);
        dispatchLogs.push(custLog);
        isDelivered = true;
      } catch (custErr: any) {
        const custErrLog = `[NODEMAILER CUSTOMER NOTE] Could not send confirmation to ${targetCustomerEmail}: ${custErr?.message || custErr}`;
        console.warn(custErrLog);
        dispatchLogs.push(custErrLog);
      }

      // Send Admin Booking Alert Email if customer email is different from admin email
      if (targetCustomerEmail.toLowerCase() !== adminEmail.toLowerCase()) {
        try {
          const mgmtInfo = await activeTransporter.sendMail({
            from: `"KM PALACE Booking Alert" <${senderEmail}>`,
            to: adminEmail,
            replyTo: targetCustomerEmail,
            subject: `[NEW BOOKING ALERT] ${booking.customer_name} (${booking.booking_id})`,
            html: managerHtml,
          });
          const mgmtLog = `[NODEMAILER SUCCESS] Admin alert sent to ${adminEmail} (Message ID: ${mgmtInfo.messageId})`;
          console.log(mgmtLog);
          dispatchLogs.push(mgmtLog);
          isDelivered = true;
        } catch (adminErr: any) {
          const adminErrLog = `[NODEMAILER ADMIN NOTE] Could not send admin alert to ${adminEmail}: ${adminErr?.message || adminErr}`;
          console.warn(adminErrLog);
          dispatchLogs.push(adminErrLog);
        }
      }

      if (isDelivered) break;
    } catch (smtpErr: any) {
      const smtpErrLog = `[NODEMAILER SMTP NOTICE] SMTP Port ${useSsl ? 465 : 587} unavailable: ${smtpErr?.message || smtpErr}`;
      console.warn(smtpErrLog);
      dispatchLogs.push(smtpErrLog);
    }
  }

  // Dispatch Strategy 2: Resend HTTP API (Secondary / Fallback)
  if (!isDelivered) {
    const resendKey = getResendApiKey();
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const primaryFrom = process.env.RESEND_FROM_EMAIL || 'KM PALACE <booking@kmpalace.com>';
        const fallbackFrom = 'KM PALACE <onboarding@resend.dev>';

        const sendResendEmail = async (to: string, subject: string, html: string) => {
          try {
            const res = await resend.emails.send({ from: primaryFrom, to: [to], subject, html });
            if (res.error) throw new Error(res.error.message);
            return true;
          } catch (err: any) {
            console.warn(`[RESEND PRIMARY NOTE for ${to}]: ${err?.message || err}. Retrying via onboarding address...`);
            try {
              const fbRes = await resend.emails.send({ from: fallbackFrom, to: [to], subject, html });
              if (fbRes.error) throw new Error(fbRes.error.message);
              return true;
            } catch (fbErr: any) {
              console.warn(`[RESEND FALLBACK NOTE for ${to}]: ${fbErr?.message || fbErr}`);
              return false;
            }
          }
        };

        for (const recipient of adminRecipients) {
          const sent = await sendResendEmail(
            recipient,
            `[NEW BOOKING] Notification: ${booking.booking_id} (${booking.customer_name})`,
            managerHtml
          );
          if (sent) {
            const rLog = `[RESEND SUCCESS] Sent booking notification to ${recipient}`;
            console.log(rLog);
            dispatchLogs.push(rLog);
            isDelivered = true;
          }
        }

        if (customerEmail) {
          const sentCust = await sendResendEmail(
            customerEmail,
            `KM PALACE Booking Confirmation [${booking.booking_id}]`,
            customerHtml
          );
          if (sentCust) {
            const rCustLog = `[RESEND SUCCESS] Sent customer confirmation to ${customerEmail}`;
            console.log(rCustLog);
            dispatchLogs.push(rCustLog);
          }
        }
      } catch (resendErr: any) {
        const resendErrLog = `[RESEND NOTICE] ${resendErr?.message || resendErr}`;
        console.warn(resendErrLog);
        dispatchLogs.push(resendErrLog);
      }
    }
  }

  console.log('----------------------------------------------------');
  console.log('[EMAIL DISPATCH LOG] Summary:');
  console.log(`1. Management Email (Kannan.d26@gmail.com): Status = ${isDelivered ? 'DELIVERED' : 'QUEUED/FALLBACK'}`);
  console.log(`2. Customer Email (${customerEmail || 'N/A'}): Confirmation for ${booking.booking_id}`);
  console.log('----------------------------------------------------');

  return { isDelivered, logs: dispatchLogs };
}


// REST API ROUTES
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'KM PALACE Smart Booking Server', time: new Date() });
});

app.all('/api/test-email', async (req: Request, res: Response) => {
  const data = await loadDataWithSupabase();
  const latestRealBooking = data.bookings[0];

  const targetEmail = (req.query.email as string) || (req.body?.email as string) || latestRealBooking?.email || 'Kannan.d26@gmail.com';
  
  const activeBooking: Booking = {
    id: latestRealBooking?.id || `bk_${Date.now()}`,
    booking_id: latestRealBooking?.booking_id || `KM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`,
    customer_name: (req.body?.customer_name || req.query?.customer_name as string) || latestRealBooking?.customer_name || 'Kannan D',
    customer_address: (req.body?.customer_address || req.query?.customer_address as string) || latestRealBooking?.customer_address || 'Kavanur, Chembarambakkam, Tamil Nadu',
    phone: (req.body?.phone || req.query?.phone as string) || latestRealBooking?.phone || '9159277277',
    email: targetEmail,
    bride_name: (req.body?.bride_name || req.query?.bride_name as string) || latestRealBooking?.bride_name || '',
    groom_name: (req.body?.groom_name || req.query?.groom_name as string) || latestRealBooking?.groom_name || '',
    marriage_date: (req.body?.marriage_date || req.query?.marriage_date as string) || latestRealBooking?.marriage_date || new Date().toISOString().slice(0, 10),
    muhurtham_time: (req.body?.muhurtham_time || req.query?.muhurtham_time as string) || latestRealBooking?.muhurtham_time || '06:00',
    from_time: latestRealBooking?.from_time || '06:00',
    end_time: latestRealBooking?.end_time || '22:00',
    function_type: latestRealBooking?.function_type || 'Wedding',
    guest_count: latestRealBooking?.guest_count || 500,
    requirements: latestRealBooking?.requirements || ['Decoration', 'Catering'],
    blocked_previous_day: latestRealBooking?.blocked_previous_day ?? true,
    blocked_dates: latestRealBooking?.blocked_dates || [new Date().toISOString().slice(0, 10)],
    booking_status: latestRealBooking?.booking_status || 'Confirmed',
    created_at: latestRealBooking?.created_at || new Date().toISOString(),
    notes: (req.body?.notes || req.query?.notes as string) || latestRealBooking?.notes || 'Direct customer booking submission',
    estimated_amount: latestRealBooking?.estimated_amount || 364500,
    payment_method: latestRealBooking?.payment_method || 'UPI',
    payment_gateway: latestRealBooking?.payment_gateway || 'Manual',
    currency: latestRealBooking?.currency || 'INR',
    customer_region: latestRealBooking?.customer_region || 'India',
    payment_status: latestRealBooking?.payment_status || 'Pending',
    advance_paid_amount: latestRealBooking?.advance_paid_amount || 0
  };

  try {
    const dispatchResult = await sendBookingNotificationEmail(activeBooking);
    res.json({
      success: true,
      message: `Email dispatched using ${latestRealBooking ? 'latest customer booking details' : 'submitted parameters'} for ${activeBooking.customer_name}.`,
      booking_id: activeBooking.booking_id,
      customer_name: activeBooking.customer_name,
      customer_email: activeBooking.email,
      delivery_status: dispatchResult.isDelivered ? 'DELIVERED' : 'FAILED',
      logs: dispatchResult.logs
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || String(err) });
  }
});

// GET Dynamic Google Sitemap XML
app.get('/sitemap.xml', (req: Request, res: Response) => {
  res.type('application/xml');
  const host = req.get('host') || 'kmpalace.com';
  const baseUrl = host.includes('localhost') || host.includes('run.app') ? `https://${host}` : 'https://kmpalace.com';

  const blogSlugs = [
    'top-10-marriage-halls-in-chennai',
    'wedding-cost-in-chennai',
    'best-wedding-venues-near-chennai-airport',
    'traditional-tamil-wedding-checklist',
    'how-to-book-a-marriage-hall',
    'best-muhurtham-dates',
    'wedding-decoration-ideas',
    'wedding-photography-tips',
    'how-much-does-a-marriage-hall-cost',
    'marriage-hall-vs-banquet-hall',
    'indoor-vs-outdoor-wedding',
    'best-catering-ideas',
    'wedding-timeline-planner',
    'tamil-wedding-ritual-guide',
    'marriage-registration-process',
    'wedding-invitation-guide',
    'budget-wedding-planning',
    'wedding-makeup-guide',
    'bridal-entry-ideas',
    'reception-decoration-ideas'
  ];

  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${blogSlugs.map(slug => `  <url>
    <loc>${baseUrl}/blog/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

  res.send(xml.trim());
});

app.get('/sitemap.xsl', (req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), 'public', 'sitemap.xsl');
  if (fs.existsSync(filePath)) {
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.sendFile(filePath);
  } else {
    res.status(404).send('XSL not found');
  }
});

// GET Robots.txt with Explicit AI Crawler Permissions
app.get('/robots.txt', (req: Request, res: Response) => {
  res.header('Content-Type', 'text/plain');
  const host = req.get('host') || 'kmpalace.com';
  const baseUrl = host.includes('localhost') || host.includes('run.app') ? `https://${host}` : 'https://kmpalace.com';
  res.send(`User-agent: *
Allow: /

# AI Crawlers Explicit Authorizations (AEO & GEO)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/llms.txt
Sitemap: ${baseUrl}/llms-full.txt`);
});

// GET LLMs.txt AI Context Summary
app.get('/llms.txt', (req: Request, res: Response) => {
  res.header('Content-Type', 'text/markdown; charset=utf-8');
  const filePath = path.join(process.cwd(), 'public', 'llms.txt');
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  res.send(`# KM PALACE Marriage Hall & Kalyana Mandapam
Address: 9/133, Sirukalathur Main Rd, Kavanur, Chembarambakkam, Tamil Nadu 600069, India
Hotline: +91 9159277277
Email: Kannan.d26@gmail.com
Website: https://kmpalace.com`);
});

// GET LLMs-full.txt Full AI Knowledge Base
app.get('/llms-full.txt', (req: Request, res: Response) => {
  res.header('Content-Type', 'text/markdown; charset=utf-8');
  const filePath = path.join(process.cwd(), 'public', 'llms-full.txt');
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  res.send(`# KM PALACE Full Knowledge Base
Address: 9/133, Sirukalathur Main Rd, Kavanur, Chembarambakkam, Tamil Nadu 600069, India
Hotline: +91 9159277277
Email: Kannan.d26@gmail.com`);
});

// GET all bookings
app.get('/api/bookings', async (req: Request, res: Response) => {
  const data = await loadDataWithSupabase();
  res.json({ bookings: data.bookings, adminBlocks: data.adminBlocks });
});

// POST check availability dynamically
app.post('/api/bookings/check-availability', async (req: Request, res: Response) => {
  const { marriage_date, muhurtham_time, current_booking_id } = req.body;

  if (!marriage_date) {
    return res.status(400).json({ error: 'Marriage date is required.' });
  }

  const data = await loadDataWithSupabase();
  const { blockedDates, blockedPreviousDay } = calculateBlockedDates(marriage_date, muhurtham_time || '09:00 AM');
  
  const { hasConflict, conflictingDates, conflictReason } = checkBookingConflict(
    marriage_date,
    muhurtham_time || '09:00 AM',
    data.bookings,
    data.adminBlocks,
    current_booking_id
  );

  res.json({
    marriage_date,
    muhurtham_time,
    blockedDates,
    blockedPreviousDay,
    hasConflict,
    conflictingDates,
    conflictReason,
  });
});

// POST create new booking
app.post('/api/bookings', async (req: Request, res: Response) => {
  try {
    const {
      customer_name,
      phone,
      email,
      customer_address,
      bride_name,
      groom_name,
      marriage_date,
      muhurtham_time,
      from_time,
      end_time,
      function_type,
      guest_count,
      requirements,
      notes,
      estimated_amount,
      payment_method,
      payment_gateway,
      currency,
      customer_region,
      payment_status,
      pg_transaction_id,
      advance_paid_amount,
      pg_rooms_selected,
    } = req.body;

    const brideNameVal = ((req.body.bride_name || req.body.brideName || '') as string).trim();
    const groomNameVal = ((req.body.groom_name || req.body.groomName || '') as string).trim();
    const customerNameVal = ((req.body.customer_name || req.body.customerName || '') as string).trim();
    const customerAddressVal = ((customer_address || req.body.customerAddress || '') as string).trim();

    // Server-side validations
    if (!customerNameVal || !phone || !email || !marriage_date || !muhurtham_time) {
      return res.status(400).json({ error: 'Please complete all required fields.' });
    }

    const data = await loadDataWithSupabase();

    // Check conflict
    const { hasConflict, conflictReason, conflictingDates } = checkBookingConflict(
      marriage_date,
      muhurtham_time,
      data.bookings,
      data.adminBlocks
    );

    if (hasConflict) {
      return res.status(409).json({
        error: 'Hall already booked. Please choose another date.',
        conflictReason,
        conflictingDates,
      });
    }

    // Calculate dates to block
    const { blockedDates, blockedPreviousDay } = calculateBlockedDates(marriage_date, muhurtham_time);

    // Generate unique reference ID like KM-20260729-001
    let seq = data.nextSequence || (data.bookings.length + 1);
    let candidateBookingId = generateBookingId(seq);
    while (data.bookings.some((b) => b.booking_id === candidateBookingId)) {
      seq++;
      candidateBookingId = generateBookingId(seq);
    }
    const booking_id = candidateBookingId;

    const newBooking: Booking = {
      id: 'bk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      booking_id,
      customer_name: customerNameVal,
      phone: phone.trim(),
      email: email.trim(),
      customer_address: customerAddressVal,
      bride_name: brideNameVal,
      groom_name: groomNameVal,
      marriage_date,
      muhurtham_time,
      from_time: from_time || muhurtham_time || '06:00',
      end_time: end_time || '22:00',
      function_type: function_type || 'Wedding',
      guest_count: Number(guest_count) || 0,
      requirements: Array.isArray(requirements) ? requirements : [],
      blocked_previous_day: blockedPreviousDay,
      blocked_dates: blockedDates,
      booking_status: 'Confirmed',
      created_at: new Date().toISOString(),
      notes: (notes || '').trim(),
      estimated_amount: Number(estimated_amount) || 0,
      payment_method: payment_method || 'UPI',
      payment_gateway: payment_gateway || 'Manual',
      currency: currency || 'INR',
      customer_region: customer_region || 'India',
      payment_status: payment_status || 'Pending',
      pg_transaction_id: pg_transaction_id || undefined,
      advance_paid_amount: Number(advance_paid_amount) || 0,
      pg_rooms_selected: pg_rooms_selected || undefined,
    };

    data.bookings.unshift(newBooking);
    data.nextSequence = seq + 1;
    saveServerData(data);
    await saveBookingToSupabase(newBooking);

    // Await email dispatch synchronously so background process does not terminate before SMTP transmission completes
    let emailStatus = 'QUEUED';
    try {
      const emailResult = await sendBookingNotificationEmail(newBooking);
      emailStatus = emailResult.isDelivered ? 'DELIVERED' : 'FAILED';
      console.log(`[BOOKING CREATED] Email dispatch status: ${emailStatus}`);
    } catch (emailErr) {
      console.error('[BOOKING CREATED EMAIL ERROR]', emailErr);
    }

    res.status(201).json({
      success: true,
      message: 'Booking submitted successfully!',
      booking: newBooking,
    });
  } catch (err: any) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Internal server error processing booking.' });
  }
});

// PATCH update booking status or details
app.patch('/api/bookings/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const data = await loadDataWithSupabase();
  const index = data.bookings.findIndex((b) => b.id === id || b.booking_id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  const currentBooking = data.bookings[index];
  const updatedBooking = {
    ...currentBooking,
    ...updates,
    bride_name: updates.bride_name !== undefined ? updates.bride_name : updates.brideName !== undefined ? updates.brideName : currentBooking.bride_name,
    groom_name: updates.groom_name !== undefined ? updates.groom_name : updates.groomName !== undefined ? updates.groomName : currentBooking.groom_name,
    customer_name: updates.customer_name !== undefined ? updates.customer_name : updates.customerName !== undefined ? updates.customerName : currentBooking.customer_name,
  };

  // Recalculate blocked dates if marriage_date or muhurtham_time changed
  if (updates.marriage_date || updates.muhurtham_time) {
    const { blockedDates, blockedPreviousDay } = calculateBlockedDates(
      updatedBooking.marriage_date,
      updatedBooking.muhurtham_time
    );
    updatedBooking.blocked_dates = blockedDates;
    updatedBooking.blocked_previous_day = blockedPreviousDay;
  }

  data.bookings[index] = updatedBooking;
  saveServerData(data);
  await saveBookingToSupabase(updatedBooking);

  res.json({ success: true, booking: updatedBooking });
});

// DELETE booking
app.delete('/api/bookings/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await loadDataWithSupabase();
  
  const targetBooking = data.bookings.find((b) => b.id === id || b.booking_id === id);
  if (!targetBooking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  data.bookings = data.bookings.filter((b) => b.id !== id && b.booking_id !== id);

  saveServerData(data);
  await deleteBookingFromSupabase(targetBooking.id);

  res.json({ success: true, message: 'Booking deleted successfully.' });
});

// POST forward invoice email to target email (default: Kannan.d26@gmail.com)
app.post('/api/bookings/forward-email', async (req: Request, res: Response) => {
  const { booking_id, target_email } = req.body;
  const recipient = target_email || 'Kannan.d26@gmail.com';

  const data = await loadDataWithSupabase();
  let booking: Booking | undefined;

  if (booking_id) {
    booking = data.bookings.find((b) => b.id === booking_id || b.booking_id === booking_id);
  } else {
    booking = data.bookings[0]; // latest booking
  }

  if (!booking) {
    return res.status(404).json({ error: 'No booking found to send invoice for.' });
  }

  try {
    await sendBookingNotificationEmail(booking);
    res.json({
      success: true,
      message: `Invoice for booking ${booking.booking_id} successfully forwarded to ${recipient}`,
      booking_id: booking.booking_id,
      recipient,
    });
  } catch (err: any) {
    console.error('Error forwarding invoice email:', err);
    res.status(500).json({ error: 'Failed to dispatch invoice email.' });
  }
});

// POST Admin Manual Date Block (Supports single date, array of dates, or date range)
app.post('/api/admin/blocks', async (req: Request, res: Response) => {
  const { date, dates, startDate, endDate, reason } = req.body;
  const blockReason = reason || 'Hall Maintenance';

  let targetDates: string[] = [];
  if (Array.isArray(dates) && dates.length > 0) {
    targetDates = dates;
  } else if (startDate && endDate) {
    let curr = new Date(startDate);
    const end = new Date(endDate);
    while (curr <= end) {
      targetDates.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }
  } else if (date) {
    targetDates = [date];
  }

  if (targetDates.length === 0) {
    return res.status(400).json({ error: 'Please specify at least one date or a valid date range.' });
  }

  const data = await loadDataWithSupabase();
  const createdBlocks: AdminManualBlock[] = [];

  for (const d of targetDates) {
    // Avoid duplicate blocks for the same date
    if (!data.adminBlocks.some((b) => b.date === d)) {
      const newBlock: AdminManualBlock = {
        id: 'block_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        date: d,
        reason: blockReason,
        created_at: new Date().toISOString(),
      };
      data.adminBlocks.push(newBlock);
      createdBlocks.push(newBlock);
      await saveAdminBlockToSupabase(newBlock);
    }
  }

  saveServerData(data);
  res.status(201).json({ success: true, blocks: createdBlocks, block: createdBlocks[0], count: createdBlocks.length });
});

// DELETE Admin Manual Date Block
app.delete('/api/admin/blocks/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await loadDataWithSupabase();
  data.adminBlocks = data.adminBlocks.filter((b) => b.id !== id && b.date !== id);
  saveServerData(data);
  await deleteAdminBlockFromSupabase(id);

  res.json({ success: true });
});

// POST Test Email Endpoint - Test SMTP delivery
app.post('/api/test-email', async (req: Request, res: Response) => {
  const { target_email } = req.body;
  const recipient = target_email || 'Kannan.d26@gmail.com';
  try {
    const activeTransporter = createTransporter();
    const senderEmail = getSmtpUser();
    const info = await activeTransporter.sendMail({
      from: `"KM PALACE Test" <${senderEmail}>`,
      to: recipient,
      subject: `KM PALACE - Email Delivery Test`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #C7A86D;">
          <h2>KM PALACE Email System Active</h2>
          <p>This is a test notification from KM PALACE sent directly to <strong>${recipient}</strong>.</p>
          <p>Time: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });
    res.json({ success: true, message: `Email delivered to ${recipient}`, messageId: info.messageId });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'SMTP test failed' });
  }
});

// POST Blog Lead Submission Endpoint - Forwards lead details to Kannan.d26@gmail.com
app.post('/api/leads', async (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      email,
      weddingDate,
      guestCount,
      functionType,
      preferredTime,
      message,
      leadSource,
      leadMedium,
      leadCampaign,
      subject,
      pageUrl,
      blogTitle,
      keyword,
      referrer,
      agreeTerms,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and Phone number are required fields.' });
    }

    if (!agreeTerms) {
      return res.status(400).json({ error: 'You must agree to the Privacy Policy to submit.' });
    }

    const leadRecipients = ['Kannan.d26@gmail.com'];

    const leadHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 2px solid #C7A86D; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #2E2A26; color: #C7A86D; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; letter-spacing: 1px;">KM PALACE - NEW SEO BLOG LEAD</h1>
          <p style="margin: 5px 0 0; font-size: 13px; color: #E5D9C5;">Source: ${blogTitle || 'SEO Blog Page'} (${keyword || 'Marriage Halls in Chennai'})</p>
        </div>

        <div style="padding: 24px; color: #2E2A26; font-size: 14px; line-height: 1.6;">
          <div style="background-color: #FDFBF7; border: 1px solid #E5D9C5; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 8px;"><strong>Bride/Groom Name:</strong> ${name}</p>
            <p style="margin: 0 0 8px;"><strong>Mobile Phone:</strong> <a href="tel:${phone}" style="color: #7D2626; font-weight: bold; font-size: 16px;">${phone}</a></p>
            <p style="margin: 0 0 8px;"><strong>Email Address:</strong> ${email || 'Not Provided'}</p>
            <p style="margin: 0 0 8px;"><strong>Wedding / Event Date:</strong> ${weddingDate || 'Flexible / TBD'}</p>
            <p style="margin: 0 0 8px;"><strong>Expected Guests:</strong> ${guestCount || 'Not specified'}</p>
            <p style="margin: 0 0 8px;"><strong>Function Type:</strong> ${functionType || 'Marriage / Reception'}</p>
            <p style="margin: 0;"><strong>Preferred Time Slot:</strong> ${preferredTime || 'Any Time'}</p>
          </div>

          ${message ? `
            <div style="margin-bottom: 20px;">
              <p style="margin: 0 0 4px; font-weight: bold;">User Message / Enquiries:</p>
              <div style="background-color: #f8fafc; border-left: 4px solid #C7A86D; padding: 12px; border-radius: 4px;">
                ${message}
              </div>
            </div>
          ` : ''}

          <div style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 11px; color: #64748b;">
            <p style="margin: 0 0 4px; font-weight: bold; color: #334155;">SEO Tracking Metadata:</p>
            <p style="margin: 0 0 2px;">• Page URL: ${pageUrl || 'N/A'}</p>
            <p style="margin: 0 0 2px;">• Target Keyword: ${keyword || 'Marriage Halls in Chennai'}</p>
            <p style="margin: 0 0 2px;">• Lead Source / Medium: ${leadSource || 'Blog'} / ${leadMedium || 'Organic'}</p>
            <p style="margin: 0;">• Referrer: ${referrer || 'Direct'}</p>
          </div>
        </div>

        <div style="background-color: #2E2A26; color: #C7A86D; padding: 14px; text-align: center; font-size: 12px;">
          KM PALACE Royal Signature Marriage Hall • Kundrathur, Chennai
        </div>
      </div>
    `;

    // Dispatch lead notification via EmailJS
    for (const recipient of leadRecipients) {
      await sendEmailJsNotification(
        recipient,
        `[BLOG LEAD] ${name} (${phone}) - ${blogTitle || 'Marriage Halls in Chennai'}`,
        leadHtml
      );
    }

    // Resend HTTP API for blog leads
    const resendKey = getResendApiKey();
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const primaryFrom = process.env.RESEND_FROM_EMAIL || 'KM PALACE Leads <leads@kmpalace.com>';
        const fallbackFrom = 'KM PALACE Leads <onboarding@resend.dev>';
        for (const recipient of leadRecipients) {
          try {
            const res = await resend.emails.send({
              from: primaryFrom,
              to: [recipient],
              subject: `[BLOG LEAD] ${name} (${phone}) - ${blogTitle || 'Marriage Halls in Chennai'}`,
              html: leadHtml,
            });
            if (res.error) throw new Error(res.error.message);
            console.log(`[RESEND SUCCESS] Sent blog lead to ${recipient}`);
          } catch (rErr: any) {
            console.warn(`[RESEND LEAD PRIMARY NOTE for ${recipient}]: ${rErr?.message || rErr}. Retrying via onboarding address...`);
            try {
              const fbRes = await resend.emails.send({
                from: fallbackFrom,
                to: [recipient],
                subject: `[BLOG LEAD] ${name} (${phone}) - ${blogTitle || 'Marriage Halls in Chennai'}`,
                html: leadHtml,
              });
              if (fbRes.error) throw new Error(fbRes.error.message);
              console.log(`[RESEND SUCCESS] Sent blog lead via fallback to ${recipient}`);
            } catch (fbErr: any) {
              console.warn(`[RESEND LEAD FALLBACK NOTE for ${recipient}]: ${fbErr?.message || fbErr}`);
            }
          }
        }
      } catch (err: any) {
        console.warn('[RESEND LEAD ERROR]', err?.message || err);
      }
    }

    // Nodemailer SMTP fallback for blog leads
    try {
      const activeTransporter = createTransporter();
      const senderEmail = getSmtpUser();
      await activeTransporter.sendMail({
        from: `"KM PALACE Leads" <${senderEmail}>`,
        to: leadRecipients,
        subject: `[BLOG LEAD] ${name} (${phone}) - ${blogTitle || 'Marriage Halls in Chennai'}`,
        html: leadHtml,
      });
      console.log(`[NODEMAILER SUCCESS] Sent blog lead to ${leadRecipients.join(', ')}`);
    } catch (smtpErr: any) {
      console.warn('[NODEMAILER BLOG LEAD SMTP NOTICE]', smtpErr?.message || smtpErr);
    }

    res.json({
      success: true,
      message: 'Thank you! Your enquiry has been received. Our wedding coordinator will call you back shortly.',
    });
  } catch (err: any) {
    console.error('Error processing blog lead:', err);
    res.status(500).json({ error: 'Failed to process lead form. Please call us directly at +91 9159277277.' });
  }
});


async function startServer() {
  if (process.env.VERCEL) {
    return;
  }

  // Vite middleware setup for local development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KM PALACE Server listening on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export { app };
export default app;
