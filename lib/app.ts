import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { Resend } from 'resend';

import { verifyAdmin } from './auth';
import {
  loadDataWithSupabase,
  saveServerData,
  saveBookingToSupabase,
  deleteBookingFromSupabase,
  saveAdminBlockToSupabase,
  deleteAdminBlockFromSupabase,
} from './supabase';
import {
  sendBookingNotificationEmail,
  sendEmailJsNotification,
  createTransporter,
  getSmtpUser,
  getResendApiKey,
} from './email';
import {
  calculateBlockedDates,
  checkBookingConflict,
  generateBookingId,
  formatDisplayDate,
  SlotType,
  Booking,
  AdminManualBlock,
  FunctionType,
} from './bookings';

const app = express();

app.use(express.json());

// Enable CORS for all origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// GET Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'KM PALACE Smart Booking Server', time: new Date() });
});

// ALL / POST Test Email
app.all('/api/test-email', async (req: Request, res: Response) => {
  try {
    const data = await loadDataWithSupabase();
    const latestRealBooking = data.bookings[0];

    const targetEmail =
      (req.query.email as string) ||
      (req.body?.email as string) ||
      (req.body?.target_email as string) ||
      latestRealBooking?.email ||
      'Kannan.d26@gmail.com';

    const activeBooking: Booking = {
      id: latestRealBooking?.id || `bk_${Date.now()}`,
      booking_id: latestRealBooking?.booking_id || `KM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`,
      customer_name: (req.body?.customer_name || (req.query?.customer_name as string)) || latestRealBooking?.customer_name || 'Kannan D',
      customer_address: (req.body?.customer_address || (req.query?.customer_address as string)) || latestRealBooking?.customer_address || 'Kavanur, Chembarambakkam, Tamil Nadu',
      phone: (req.body?.phone || (req.query?.phone as string)) || latestRealBooking?.phone || '9159277277',
      email: targetEmail,
      bride_name: (req.body?.bride_name || (req.query?.bride_name as string)) || latestRealBooking?.bride_name || '',
      groom_name: (req.body?.groom_name || (req.query?.groom_name as string)) || latestRealBooking?.groom_name || '',
      marriage_date: (req.body?.marriage_date || (req.query?.marriage_date as string)) || latestRealBooking?.marriage_date || new Date().toISOString().slice(0, 10),
      muhurtham_time: (req.body?.muhurtham_time || (req.query?.muhurtham_time as string)) || latestRealBooking?.muhurtham_time || '06:00',
      from_time: latestRealBooking?.from_time || '06:00',
      end_time: latestRealBooking?.end_time || '22:00',
      function_type: latestRealBooking?.function_type || 'Wedding',
      guest_count: latestRealBooking?.guest_count || 500,
      requirements: latestRealBooking?.requirements || ['Decoration', 'Catering'],
      blocked_previous_day: latestRealBooking?.blocked_previous_day ?? true,
      blocked_dates: latestRealBooking?.blocked_dates || [new Date().toISOString().slice(0, 10)],
      booking_status: latestRealBooking?.booking_status || 'Confirmed',
      created_at: latestRealBooking?.created_at || new Date().toISOString(),
      notes: (req.body?.notes || (req.query?.notes as string)) || latestRealBooking?.notes || 'Direct customer booking submission',
      estimated_amount: latestRealBooking?.estimated_amount || 364500,
      payment_method: latestRealBooking?.payment_method || 'UPI',
      payment_gateway: latestRealBooking?.payment_gateway || 'Manual',
      currency: latestRealBooking?.currency || 'INR',
      customer_region: latestRealBooking?.customer_region || 'India',
      payment_status: latestRealBooking?.payment_status || 'Pending',
      advance_paid_amount: latestRealBooking?.advance_paid_amount || 0,
    };

    const dispatchResult = await sendBookingNotificationEmail(activeBooking, targetEmail);
    res.json({
      success: true,
      message: `Email dispatched for ${activeBooking.customer_name} to ${targetEmail}.`,
      booking_id: activeBooking.booking_id,
      customer_name: activeBooking.customer_name,
      customer_email: activeBooking.email,
      delivery_status: dispatchResult.isDelivered ? 'DELIVERED' : 'FAILED',
      logs: dispatchResult.logs,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || String(err) });
  }
});

// GET Dynamic Sitemap XML
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
    'reception-decoration-ideas',
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
${blogSlugs
  .map(
    (slug) => `  <url>
    <loc>${baseUrl}/blog/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
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

// GET Robots.txt
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

// GET LLMs.txt
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

// GET LLMs-full.txt
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

// GET all bookings (Admin vs Public)
app.get('/api/bookings', async (req: Request, res: Response) => {
  const data = await loadDataWithSupabase();
  const isAdmin = verifyAdmin(req);

  if (isAdmin) {
    return res.json({ bookings: data.bookings, adminBlocks: data.adminBlocks });
  }

  const sanitizedBookings = (data.bookings || []).map((b) => ({
    id: b.id,
    booking_id: b.booking_id,
    customer_name: b.customer_name ? `${b.customer_name.slice(0, 3)}***` : 'Reserved',
    marriage_date: b.marriage_date,
    blocked_dates: b.blocked_dates,
    blocked_previous_day: b.blocked_previous_day,
    slot_type: b.slot_type,
    muhurtham_time: b.muhurtham_time,
    from_time: b.from_time,
    end_time: b.end_time,
    function_type: b.function_type,
    booking_status: b.booking_status,
    created_at: b.created_at,
    requirements: b.requirements,
  }));

  res.json({ bookings: sanitizedBookings, adminBlocks: data.adminBlocks });
});

// POST check availability
app.post('/api/bookings/check-availability', async (req: Request, res: Response) => {
  const { marriage_date, muhurtham_time, slot_type, from_time, end_time, current_booking_id } = req.body || {};

  if (!marriage_date) {
    return res.status(400).json({ error: 'Marriage date is required.' });
  }

  const slotTypeVal = (slot_type || '24hr') as SlotType;
  const data = await loadDataWithSupabase();
  const { blockedDates, blockedPreviousDay } = calculateBlockedDates(
    marriage_date,
    slotTypeVal,
    from_time,
    end_time,
    muhurtham_time || '09:00 AM'
  );

  const { hasConflict, conflictingDates, conflictReason } = checkBookingConflict(
    marriage_date,
    muhurtham_time || '09:00 AM',
    data.bookings,
    data.adminBlocks,
    current_booking_id,
    slotTypeVal,
    from_time,
    end_time
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
    const body = req.body || {};
    const brideNameVal = String(body.bride_name || body.brideName || '').trim();
    const groomNameVal = String(body.groom_name || body.groomName || '').trim();
    const customerNameVal = String(body.customer_name || body.customerName || '').trim();
    const customerAddressVal = String(body.customer_address || body.customerAddress || '').trim();
    const phoneVal = String(body.phone || body.mobile || '').trim();
    const emailVal = String(body.email || '').trim();
    const marriageDateVal = String(body.marriage_date || body.marriageDate || '').trim();
    const muhurthamTimeVal = String(body.muhurtham_time || body.muhurthamTime || '').trim();
    const slotTypeVal = (body.slot_type || body.slotType || '24hr') as SlotType;
    const fromTimeVal = String(body.from_time || body.fromTime || '').trim();
    const endTimeVal = String(body.end_time || body.endTime || '').trim();

    if (!customerNameVal || !phoneVal || !emailVal || !marriageDateVal) {
      return res.status(400).json({ error: 'Please complete all required fields (Customer Name, Phone, Email, Marriage Date).' });
    }

    const data = await loadDataWithSupabase();

    const { hasConflict, conflictReason, conflictingDates } = checkBookingConflict(
      marriageDateVal,
      muhurthamTimeVal || '06:00 AM',
      data.bookings || [],
      data.adminBlocks || [],
      undefined,
      slotTypeVal,
      fromTimeVal,
      endTimeVal
    );

    if (hasConflict) {
      return res.status(409).json({
        error: conflictReason || 'Hall already booked. Please choose another date or slot.',
        conflictReason,
        conflictingDates,
      });
    }

    const { blockedDates, blockedPreviousDay } = calculateBlockedDates(
      marriageDateVal,
      slotTypeVal,
      fromTimeVal,
      endTimeVal,
      muhurthamTimeVal
    );

    let seq = data.nextSequence || ((data.bookings ? data.bookings.length : 0) + 1);
    let candidateBookingId = generateBookingId(seq);
    while (Array.isArray(data.bookings) && data.bookings.some((b) => b && b.booking_id === candidateBookingId)) {
      seq++;
      candidateBookingId = generateBookingId(seq);
    }
    const booking_id = candidateBookingId;

    const defaultFrom = slotTypeVal === '24hr' ? '12:00' : slotTypeVal === 'morning' ? '04:00' : slotTypeVal === 'evening' ? '16:00' : '06:00';
    const defaultEnd = slotTypeVal === '24hr' ? '12:00' : slotTypeVal === 'morning' ? '12:00' : slotTypeVal === 'evening' ? '23:00' : '22:00';

    const newBooking: Booking = {
      id: 'bk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      booking_id,
      customer_name: customerNameVal,
      phone: phoneVal,
      email: emailVal,
      customer_address: customerAddressVal,
      bride_name: brideNameVal,
      groom_name: groomNameVal,
      marriage_date: marriageDateVal,
      slot_type: slotTypeVal,
      muhurtham_time: muhurthamTimeVal || '06:00 AM',
      from_time: fromTimeVal || defaultFrom,
      end_time: endTimeVal || defaultEnd,
      function_type: (String(body.function_type || body.functionType || 'Wedding').trim()) as FunctionType,
      guest_count: Number(body.guest_count || body.guestCount) || 0,
      requirements: Array.isArray(body.requirements) ? body.requirements : [],
      blocked_previous_day: blockedPreviousDay,
      blocked_dates: blockedDates,
      booking_status: 'Confirmed',
      created_at: new Date().toISOString(),
      notes: String(body.notes || '').trim(),
      estimated_amount: Number(body.estimated_amount || body.estimatedAmount) || 0,
      payment_method: String(body.payment_method || 'Direct Venue') as any,
      payment_gateway: String(body.payment_gateway || 'Manual'),
      currency: String(body.currency || 'INR') as 'INR' | 'USD',
      customer_region: String(body.customer_region || 'India') as 'India' | 'International',
      payment_status: String(body.payment_status || 'Pending') as any,
      pg_transaction_id: body.pg_transaction_id ? String(body.pg_transaction_id) : undefined,
      advance_paid_amount: Number(body.advance_paid_amount) || 0,
      pg_rooms_selected: body.pg_rooms_selected || undefined,
    };

    if (!Array.isArray(data.bookings)) {
      data.bookings = [];
    }
    data.bookings.unshift(newBooking);
    data.nextSequence = seq + 1;
    saveServerData(data);
    saveBookingToSupabase(newBooking).catch((err) => console.warn('[Supabase Async Save Warning]:', err));

    sendBookingNotificationEmail(newBooking)
      .then((emailResult) => {
        console.log(`[BOOKING CREATED] Email dispatch status: ${emailResult.isDelivered ? 'DELIVERED' : 'FAILED'}`);
      })
      .catch((emailErr) => {
        console.error('[BOOKING CREATED EMAIL ERROR]', emailErr);
      });

    res.status(201).json({
      success: true,
      message: 'Booking submitted successfully!',
      booking: newBooking,
    });
  } catch (err: any) {
    console.error('Error creating booking:', err);
    res.status(500).json({
      error: 'Internal server error processing booking.',
      message: err?.message || String(err),
    });
  }
});

// PATCH update booking
app.patch('/api/bookings/:id', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
  }

  const { id } = req.params;
  const updates = req.body || {};

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

  if (updates.marriage_date || updates.muhurtham_time) {
    const { blockedDates, blockedPreviousDay } = calculateBlockedDates(
      updatedBooking.marriage_date,
      updatedBooking.slot_type || '24hr',
      updatedBooking.from_time,
      updatedBooking.end_time,
      updatedBooking.muhurtham_time
    );
    updatedBooking.blocked_dates = blockedDates;
    updatedBooking.blocked_previous_day = blockedPreviousDay;
  }

  data.bookings[index] = updatedBooking;
  saveServerData(data);
  saveBookingToSupabase(updatedBooking).catch((err) => console.warn('[Supabase Async Patch Warning]:', err));

  res.json({ success: true, booking: updatedBooking });
});

// DELETE booking
app.delete('/api/bookings/:id', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
  }

  const { id } = req.params;
  const data = await loadDataWithSupabase();

  const targetBooking = data.bookings.find((b) => b.id === id || b.booking_id === id);
  if (!targetBooking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  data.bookings = data.bookings.filter((b) => b.id !== id && b.booking_id !== id);

  saveServerData(data);
  deleteBookingFromSupabase(targetBooking.id).catch((err) => console.warn('[Supabase Async Delete Warning]:', err));

  res.json({ success: true, message: 'Booking deleted successfully.' });
});

// POST forward email invoice
app.post('/api/bookings/forward-email', async (req: Request, res: Response) => {
  const { booking_id, target_email } = req.body || {};
  const recipient = (target_email || 'Kannan.d26@gmail.com').trim();

  const data = await loadDataWithSupabase();
  let booking: Booking | undefined;

  if (booking_id) {
    booking = data.bookings.find((b) => b.id === booking_id || b.booking_id === booking_id);
  } else {
    booking = data.bookings[0];
  }

  if (!booking) {
    return res.status(404).json({ error: 'No booking found to send invoice for.' });
  }

  try {
    const dispatchResult = await sendBookingNotificationEmail(booking, recipient);
    res.json({
      success: dispatchResult.isDelivered,
      message: dispatchResult.isDelivered
        ? `Invoice for booking ${booking.booking_id} successfully forwarded to ${recipient}`
        : `Notification process logged for ${recipient}`,
      booking_id: booking.booking_id,
      recipient,
      logs: dispatchResult.logs,
    });
  } catch (err: any) {
    console.error('Error forwarding invoice email:', err);
    res.status(500).json({ error: 'Failed to dispatch invoice email.', message: err?.message || String(err) });
  }
});

// POST Admin Manual Date Block
app.post('/api/admin/blocks', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
  }

  const { date, dates, startDate, endDate, reason } = req.body || {};
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
    if (!data.adminBlocks.some((b) => b.date === d)) {
      const newBlock: AdminManualBlock = {
        id: 'block_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        date: d,
        reason: blockReason,
        created_at: new Date().toISOString(),
      };
      data.adminBlocks.push(newBlock);
      createdBlocks.push(newBlock);
      saveAdminBlockToSupabase(newBlock).catch((err) => console.warn('[Supabase Async Block Warning]:', err));
    }
  }

  saveServerData(data);
  res.status(201).json({ success: true, blocks: createdBlocks, block: createdBlocks[0], count: createdBlocks.length });
});

// DELETE Admin Manual Date Block
app.delete('/api/admin/blocks/:id', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
  }

  const { id } = req.params;
  const data = await loadDataWithSupabase();
  data.adminBlocks = data.adminBlocks.filter((b) => b.id !== id && b.date !== id);
  saveServerData(data);
  deleteAdminBlockFromSupabase(id).catch((err) => console.warn('[Supabase Async Delete Block Warning]:', err));

  res.json({ success: true });
});

// POST Blog Lead Submission Endpoint
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
      blogTitle,
      keyword,
      referrer,
      agreeTerms,
    } = req.body || {};

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

          ${
            message
              ? `
            <div style="margin-bottom: 20px;">
              <p style="margin: 0 0 4px; font-weight: bold;">User Message / Enquiries:</p>
              <div style="background-color: #f8fafc; border-left: 4px solid #C7A86D; padding: 12px; border-radius: 4px;">
                ${message}
              </div>
            </div>
          `
              : ''
          }

          <div style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 11px; color: #64748b;">
            <p style="margin: 0 0 4px; font-weight: bold; color: #334155;">SEO Tracking Metadata:</p>
            <p style="margin: 0 0 2px;">• Page URL: ${req.body?.pageUrl || 'N/A'}</p>
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

    for (const recipient of leadRecipients) {
      await sendEmailJsNotification(
        recipient,
        `[BLOG LEAD] ${name} (${phone}) - ${blogTitle || 'Marriage Halls in Chennai'}`,
        leadHtml
      );
    }

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

export default app;
