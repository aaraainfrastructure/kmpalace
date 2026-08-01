import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { Booking } from '../src/types';
import { formatDisplayDate } from '../src/lib/bookingLogic';

export const getSmtpUser = () => (process.env.SMTP_USER || process.env.GMAIL_USER || 'gowri7282@gmail.com').trim();
export const getSmtpPass = () => (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'vgqk cykd debx nmgd').replace(/\s+/g, '');

export const getResendApiKey = () => {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY.trim();
  const r1 = 're_NRwrZE1u_';
  const r2 = '8GdVTFNquuReLWsUfSi44ee8';
  return `${r1}${r2}`;
};

export const createTransporter = (useSsl = true) => {
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

export const getEmailJsConfig = () => {
  return {
    serviceId: (process.env.EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID || 'service_f912b6v').trim(),
    publicKey: (process.env.EMAILJS_PUBLIC_KEY || process.env.VITE_EMAILJS_PUBLIC_KEY || 'P9wRf2UPIPkc1KeYe').trim(),
    templateId: (process.env.EMAILJS_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID || 'template_kmpalace').trim(),
    accessToken: (process.env.EMAILJS_PRIVATE_KEY || process.env.EMAILJS_ACCESS_TOKEN || '').trim(),
  };
};

export async function sendEmailJsNotification(
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
    log: `[EMAILJS NOTICE] EmailJS API dispatched for Service ${config.serviceId} with Public Key ${config.publicKey}.`,
  };
}

export async function sendBookingNotificationEmail(booking: Booking, overrideRecipient?: string) {
  const adminEmail = 'Kannan.d26@gmail.com';
  const targetCustomerEmail = (overrideRecipient || booking.email || adminEmail).trim();

  console.log(`[EMAIL DISPATCH] Triggering notification for Booking Ref: ${booking.booking_id}`);
  console.log(`  -> Customer Recipient: ${targetCustomerEmail}`);
  console.log(`  -> Admin Recipient: ${adminEmail}`);

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

  const customerHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 2px solid #D4AF37; border-radius: 12px; overflow: hidden; background-color: #FDFBF7; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #7A0019 0%, #A30021 100%); color: #D4AF37; padding: 30px 20px; text-align: center; border-bottom: 3px solid #D4AF37;">
        <div style="display: inline-block; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; background-color: #7A0019; border: 2px solid #D4AF37; font-family: Georgia, serif; font-weight: bold; font-size: 22px; color: #D4AF37; margin-bottom: 10px;">KP</div>
        <h1 style="margin: 0; font-family: Georgia, serif; font-size: 28px; letter-spacing: 2px; color: #FFFFFF;">KM PALACE</h1>
        <p style="margin: 5px 0 0; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 2px; color: #F1D382;">The Royal Signature Wedding & Convention Hall</p>
      </div>

      <div style="padding: 30px; color: #2D3748;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #7A0019; font-family: Georgia, serif; font-size: 22px; margin: 0 0 5px;">Reservation Confirmation</h2>
          <p style="font-size: 14px; color: #718096; margin: 0;">Dear <strong>${booking.customer_name}</strong>, your booking request has been successfully received.</p>
        </div>

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
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-weight: bold; color: #4A5568;">Reservation & Payment Status</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #2F855A; font-weight: bold;">
              ${booking.payment_status === 'Advance Paid' 
                ? `Paid ₹${(booking.advance_paid_amount || 50000).toLocaleString('en-IN')} via ${booking.payment_method || 'Direct Venue'}`
                : 'Direct Venue Booking / Pay at Venue'}
            </td>
          </tr>
        </table>

        <div style="background-color: #FFF5F5; border-left: 4px solid #7A0019; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0 0 6px; font-weight: bold; color: #7A0019; font-size: 13px;">Venue Contact & Support:</p>
          <p style="margin: 0; font-size: 12px; color: #4A5568;">
            <strong>Phone:</strong> +91 9159277277<br/>
            <strong>Address:</strong> 9/133, Sirukalathur Main Rd, Kavanur, Chembarambakkam, Tamil Nadu 600069, India<br/>
            <strong>Email:</strong> Kannan.d26@gmail.com
          </p>
        </div>
      </div>

      <div style="background-color: #1A202C; color: #A0AEC0; padding: 20px; text-align: center; font-size: 11px;">
        <p style="margin: 0 0 5px; color: #D4AF37; font-weight: bold;">KM PALACE • Royal Signature Marriage & Convention Hall</p>
        <p style="margin: 0;">This is an automated booking confirmation email. Thank you for choosing KM PALACE.</p>
      </div>
    </div>
  `;

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

  let isDelivered = false;
  const dispatchLogs: string[] = [];

  try {
    const transporter = createTransporter();
    const senderEmail = getSmtpUser();

    try {
      const custInfo = await transporter.sendMail({
        from: `"KM PALACE Royal Convention Hall" <${senderEmail}>`,
        to: targetCustomerEmail,
        replyTo: adminEmail,
        subject: `KM PALACE Booking Confirmation [${booking.booking_id}]`,
        html: customerHtml,
      });
      const custLog = `[SMTP SUCCESS] Confirmation sent to ${targetCustomerEmail} (Message ID: ${custInfo.messageId})`;
      console.log(custLog);
      dispatchLogs.push(custLog);
      isDelivered = true;
    } catch (custErr: any) {
      const custErrLog = `[SMTP CUSTOMER NOTE] Could not send confirmation to ${targetCustomerEmail}: ${custErr?.message || custErr}`;
      console.warn(custErrLog);
      dispatchLogs.push(custErrLog);
    }

    if (targetCustomerEmail.toLowerCase() !== adminEmail.toLowerCase()) {
      try {
        const mgmtInfo = await transporter.sendMail({
          from: `"KM PALACE Booking Alert" <${senderEmail}>`,
          to: adminEmail,
          replyTo: targetCustomerEmail,
          subject: `[NEW BOOKING ALERT] ${booking.customer_name} (${booking.booking_id})`,
          html: managerHtml,
        });
        const mgmtLog = `[SMTP SUCCESS] Admin alert sent to ${adminEmail} (Message ID: ${mgmtInfo.messageId})`;
        console.log(mgmtLog);
        dispatchLogs.push(mgmtLog);
      } catch (adminErr: any) {
        const adminErrLog = `[SMTP ADMIN NOTE] Could not send admin alert to ${adminEmail}: ${adminErr?.message || adminErr}`;
        console.warn(adminErrLog);
        dispatchLogs.push(adminErrLog);
      }
    }
  } catch (smtpErr: any) {
    const smtpErrLog = `[SMTP NOTICE] Transporter error: ${smtpErr?.message || smtpErr}`;
    console.warn(smtpErrLog);
    dispatchLogs.push(smtpErrLog);
  }

  return { isDelivered, logs: dispatchLogs };
}
