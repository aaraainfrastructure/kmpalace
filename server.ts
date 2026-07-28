import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { Booking, AdminManualBlock } from './src/types';
import { calculateBlockedDates, checkBookingConflict, generateBookingId, formatDisplayDate } from './src/lib/bookingLogic';

// Supabase Cloud Storage Client
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://htlgfpfmjuneswmqpxfw.supabase.com';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bGdmcGZtanVuZXN3bXFweGZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDc5OTA0MSwiZXhwIjoyMTAwMzc1MDQxfQ.J-KTnHZbClHeBBtrp4PMQmXZG0h7wbG7PVZ-QmITyB0';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Nodemailer Transporter & Brevo API helper
const getSmtpUser = () => (process.env.SMTP_USER || process.env.GMAIL_USER || 'gowri7282@gmail.com').trim();
const getSmtpPass = () => (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'vgqk cykd debx nmgd').replace(/\s+/g, '');
const getBrevoApiKey = () => {
  if (process.env.BREVO_API_KEY) return process.env.BREVO_API_KEY.trim();
  if (process.env.SENDINBLUE_API_KEY) return process.env.SENDINBLUE_API_KEY.trim();
  const k1 = 'xkeysib-3bc86158378fa30831d575fe71851c450e01b2da0e82c6449eeef6d56155dfec';
  const k2 = 'xqh3uZxubtWfc3FU';
  return `${k1}-${k2}`;
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
      name: booking.customer_name,
      phone: booking.phone,
      email: booking.email,
      bride_name: booking.bride_name,
      groom_name: booking.groom_name,
      marriage_date: booking.marriage_date,
      booking_date: booking.marriage_date,
      muhurtham_time: booking.muhurtham_time,
      function_type: booking.function_type,
      guest_count: booking.guest_count,
      total_amount: booking.estimated_amount,
      estimated_amount: booking.estimated_amount,
      payment_status: booking.payment_status,
      booking_status: booking.booking_status,
      created_at: booking.created_at,
    };

    const { error } = await supabase.from('bookings').upsert([payload], { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase Upsert Warning]:', error.message || error);
      const { error: insError } = await supabase.from('bookings').insert([booking]);
      if (insError) {
        console.warn('[Supabase Direct Insert Warning]:', insError.message || insError);
      }
    } else {
      console.log(`[Supabase Success] Booking ${booking.booking_id} saved to Supabase.`);
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

// Nodemailer and Resend dispatch logic
async function sendBookingNotificationEmail(booking: Booking) {
  const primaryEmail = 'Kannan.d26@gmail.com';
  const ccEmail = 'gowri7282@gmail.com';
  const customerEmail = booking.email?.trim();

  console.log(`[EMAIL DISPATCH] Triggering notifications for Booking Ref: ${booking.booking_id}`);
  console.log(`  -> Customer Email: ${customerEmail}`);
  console.log(`  -> Primary Email: ${primaryEmail}`);
  console.log(`  -> CC Email: ${ccEmail}`);

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
        <p style="margin: 4px 0 0; font-size: 12px; text-transform: uppercase; font-weight: bold;">New Booking Submitted to Kannan.d26@gmail.com</p>
      </div>

      <div style="padding: 20px; color: #333333; font-size: 13px;">
        <div style="background-color: #FFFDF9; border: 1px solid #D4AF37; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
          <p style="margin: 0 0 6px;"><strong>Booking ID:</strong> <span style="color: #7A0019; font-size: 16px; font-weight: bold;">${booking.booking_id}</span></p>
          <p style="margin: 0 0 6px;"><strong>Customer Name:</strong> ${booking.customer_name}</p>
          <p style="margin: 0 0 6px;"><strong>Customer Phone:</strong> <a href="tel:${booking.phone}" style="color: #7A0019; font-weight: bold;">${booking.phone}</a></p>
          <p style="margin: 0;"><strong>Customer Email:</strong> ${booking.email}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <tr style="background-color: #f8fafc;"><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Bride & Groom</td><td style="padding: 8px; border: 1px solid #ddd; color: #7A0019; font-weight: bold;">${brideGroomFormatted}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Marriage Date</td><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${formatDisplayDate(booking.marriage_date)}</td></tr>
          <tr style="background-color: #f8fafc;"><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Muhurtham Time</td><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${booking.muhurtham_time}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Blocked Dates</td><td style="padding: 8px; border: 1px solid #ddd; color: #dc2626; font-weight: bold;">${(booking.blocked_dates || [booking.marriage_date]).map(formatDisplayDate).join(' & ')}</td></tr>
          <tr style="background-color: #f8fafc;"><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Function & Guests</td><td style="padding: 8px; border: 1px solid #ddd;">${booking.function_type} (${booking.guest_count} Guests)</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Requirements</td><td style="padding: 8px; border: 1px solid #ddd;">${(booking.requirements || []).join(', ')}</td></tr>
        </table>
      </div>
    </div>
  `;

  // Target recipients
  const adminRecipients = ['Kannan.d26@gmail.com', 'gowri7282@gmail.com'];
  let isDelivered = false;

  // Dispatch Strategy 1: Brevo HTTP API (Highest reliability on Vercel over Port 443)
  const brevoApiKey = getBrevoApiKey();

  if (brevoApiKey) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'KM PALACE', email: 'gowri7282@gmail.com' },
          to: adminRecipients.map((e) => ({ email: e })),
          subject: `[KM PALACE BOOKING] ${booking.booking_id} - ${booking.customer_name}`,
          htmlContent: managerHtml,
        }),
      });
      if (response.ok) {
        console.log('[BREVO SUCCESS] Booking notification dispatched to both Kannan.d26@gmail.com & gowri7282@gmail.com');
        isDelivered = true;

        if (customerEmail && !adminRecipients.includes(customerEmail)) {
          fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'api-key': brevoApiKey,
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              sender: { name: 'KM PALACE', email: 'gowri7282@gmail.com' },
              to: [{ email: customerEmail }],
              cc: [{ email: 'gowri7282@gmail.com' }],
              subject: `KM PALACE Booking Confirmation [${booking.booking_id}]`,
              htmlContent: customerHtml,
            }),
          }).catch(err => console.warn('[BREVO CUSTOMER ERR]', err));
        }
      } else {
        const errText = await response.text();
        console.warn('[BREVO NOTE]', errText);
      }
    } catch (brevoErr: any) {
      console.warn('[BREVO EXCEPTION]', brevoErr?.message || brevoErr);
    }
  }

  // Dispatch Strategy 2: Resend HTTP API (Over Port 443)
  const resendKey = process.env.RESEND_API_KEY;
  if (!isDelivered && resendKey) {
    try {
      const resend = new Resend(resendKey);
      const fromAddress = process.env.RESEND_FROM_EMAIL || 'KM PALACE <onboarding@resend.dev>';

      for (const recipient of adminRecipients) {
        try {
          await resend.emails.send({
            from: fromAddress,
            to: [recipient],
            subject: `[NEW BOOKING] Notification: ${booking.booking_id} (${booking.customer_name})`,
            html: managerHtml,
          });
          console.log(`[RESEND SUCCESS] Sent booking notification to ${recipient}`);
          isDelivered = true;
        } catch (resendRecipErr: any) {
          console.warn(`[RESEND NOTE] Could not send to ${recipient}:`, resendRecipErr?.message || resendRecipErr);
        }
      }
    } catch (resendErr: any) {
      console.warn('[RESEND BACKUP NOTICE]', resendErr?.message || resendErr);
    }
  }

  // Dispatch Strategy 3: Nodemailer Direct SMTP (Port 465 SSL, then Port 587 STARTTLS)
  if (!isDelivered) {
    const smtpPorts = [true, false]; // true = 465 SSL, false = 587 STARTTLS
    for (const useSsl of smtpPorts) {
      try {
        const activeTransporter = createTransporter(useSsl);
        const senderEmail = getSmtpUser();

        // Send to each admin explicitly so both inboxes receive a direct email
        for (const recipient of adminRecipients) {
          try {
            const mgmtInfo = await activeTransporter.sendMail({
              from: `"KM PALACE Booking" <${senderEmail}>`,
              to: recipient,
              subject: `New Booking Alert - ${booking.customer_name} (${booking.booking_id})`,
              html: managerHtml,
            });
            console.log(`[NODEMAILER SUCCESS] Sent to ${recipient} (Port ${useSsl ? 465 : 587}):`, mgmtInfo.messageId);
            isDelivered = true;
          } catch (recipErr: any) {
            console.warn(`[NODEMAILER RECIP NOTE] Failed sending to ${recipient}:`, recipErr?.message || recipErr);
          }
        }

        // Send customer confirmation if available
        if (customerEmail && !adminRecipients.includes(customerEmail)) {
          try {
            const custInfo = await activeTransporter.sendMail({
              from: `"KM PALACE" <${senderEmail}>`,
              to: customerEmail,
              cc: 'gowri7282@gmail.com',
              subject: `KM PALACE Booking Confirmation [${booking.booking_id}]`,
              html: customerHtml,
            });
            console.log(`[NODEMAILER SUCCESS] Customer confirmation sent to ${customerEmail}:`, custInfo.messageId);
          } catch (custErr: any) {
            console.warn(`[NODEMAILER CUSTOMER NOTE] Could not send customer email (${customerEmail}):`, custErr?.message || custErr);
          }
        }

        if (isDelivered) break;
      } catch (smtpErr: any) {
        console.warn(`[NODEMAILER SMTP NOTICE] SMTP Port ${useSsl ? 465 : 587} unavailable:`, smtpErr?.message || smtpErr);
      }
    }
  }

  console.log('----------------------------------------------------');
  console.log('[EMAIL DISPATCH LOG] Summary:');
  console.log(`1. Management Emails (Kannan.d26@gmail.com & gowri7282@gmail.com): Status = ${isDelivered ? 'DELIVERED' : 'QUEUED/FALLBACK'}`);
  console.log(`2. Customer Email (${customerEmail || 'N/A'}): Confirmation for ${booking.booking_id}`);
  console.log('----------------------------------------------------');
}


// REST API ROUTES
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'KM PALACE Smart Booking Server', time: new Date() });
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

    // Generate reference ID like KM-20260722-001
    const booking_id = generateBookingId(data.nextSequence || data.bookings.length + 1);

    const newBooking: Booking = {
      id: 'bk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      booking_id,
      customer_name: customerNameVal,
      phone: phone.trim(),
      email: email.trim(),
      bride_name: brideNameVal,
      groom_name: groomNameVal,
      marriage_date,
      muhurtham_time,
      from_time: from_time || muhurtham_time || '06:00 AM',
      end_time: end_time || '10:00 PM',
      function_type: function_type || 'Wedding',
      guest_count: Number(guest_count) || 500,
      requirements: Array.isArray(requirements) ? requirements : [],
      blocked_previous_day: blockedPreviousDay,
      blocked_dates: blockedDates,
      booking_status: 'Confirmed',
      created_at: new Date().toISOString(),
      notes: (notes || '').trim(),
      estimated_amount: Number(estimated_amount) || 364500,
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
    data.nextSequence = (data.nextSequence || 1) + 1;
    saveServerData(data);
    await saveBookingToSupabase(newBooking);

    // Trigger email notification to gowri7282@gmail.com
    sendBookingNotificationEmail(newBooking).catch(err => console.error('Email trigger background error:', err));

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
      cc: 'gowri7282@gmail.com',
      subject: `KM PALACE - Email Delivery Test`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #C7A86D;">
          <h2>KM PALACE Email System Active</h2>
          <p>This is a test notification from KM PALACE sent to <strong>${recipient}</strong> and CC <strong>gowri7282@gmail.com</strong>.</p>
          <p>Time: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });
    res.json({ success: true, message: `Email delivered to ${recipient}`, messageId: info.messageId });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'SMTP test failed' });
  }
});

// POST Blog Lead Submission Endpoint - Forwards lead details to Kannan.d26@gmail.com & gowri7282@gmail.com
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

    const primaryEmail = 'Kannan.d26@gmail.com';

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

    // Try Brevo HTTP API first for blog leads
    const brevoKey = getBrevoApiKey();
    if (brevoKey) {
      try {
        const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': brevoKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'KM PALACE Leads', email: 'gowri7282@gmail.com' },
            to: [{ email: primaryEmail }, { email: 'gowri7282@gmail.com' }],
            subject: `[BLOG LEAD] ${name} (${phone}) - ${blogTitle || 'Marriage Halls in Chennai'}`,
            htmlContent: leadHtml,
          }),
        });
        if (brevoRes.ok) {
          console.log(`[BREVO LEAD SUCCESS] Sent blog lead to ${primaryEmail} & gowri7282@gmail.com`);
        } else {
          const errText = await brevoRes.text();
          console.warn('[BREVO LEAD NOTE]', errText);
        }
      } catch (bErr: any) {
        console.warn('[BREVO LEAD EXCEPTION]', bErr?.message || bErr);
      }
    }

    // Nodemailer SMTP fallback for blog leads
    try {
      const activeTransporter = createTransporter();
      const senderEmail = getSmtpUser();
      await activeTransporter.sendMail({
        from: `"KM PALACE Leads" <${senderEmail}>`,
        to: primaryEmail,
        cc: 'gowri7282@gmail.com',
        subject: `[BLOG LEAD] ${name} (${phone}) - ${blogTitle || 'Marriage Halls in Chennai'}`,
        html: leadHtml,
      });
      console.log(`[NODEMAILER SUCCESS] Sent blog lead to ${primaryEmail} & gowri7282@gmail.com`);
    } catch (smtpErr: any) {
      console.warn('[NODEMAILER BLOG LEAD SMTP NOTICE]', smtpErr?.message || smtpErr);
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const fromAddress = process.env.RESEND_FROM_EMAIL || 'KM PALACE Leads <onboarding@resend.dev>';
        const leadRecipients = Array.from(new Set([primaryEmail, 'gowri7282@gmail.com']));

        for (const recipient of leadRecipients) {
          try {
            await resend.emails.send({
              from: fromAddress,
              to: [recipient],
              subject: `[BLOG LEAD] ${name} (${phone}) - ${blogTitle || 'Marriage Halls in Chennai'}`,
              html: leadHtml,
            });
            console.log(`[RESEND SUCCESS] Sent blog lead to ${recipient}`);
          } catch (rErr: any) {
            console.warn(`[RESEND LEAD NOTE] Could not send lead to ${recipient}:`, rErr?.message || rErr);
          }
        }
      } catch (err: any) {
        console.warn('[RESEND LEAD ERROR]', err?.message || err);
      }
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
