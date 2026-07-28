import * as XLSX from 'xlsx';
import { Booking } from '../types';
import { formatDisplayDate } from './bookingLogic';

export function exportToExcel(bookings: Booking[], fileName = 'KM_PALACE_Bookings.xlsx') {
  const data = bookings.map((b) => ({
    'Booking ID': b.booking_id,
    'Customer Name': b.customer_name,
    'Phone': b.phone,
    'Email': b.email,
    'Bride Name': b.bride_name,
    'Groom Name': b.groom_name,
    'Marriage Date': formatDisplayDate(b.marriage_date),
    'Muhurtham Time': b.muhurtham_time,
    'From Time': b.from_time || '06:00 AM',
    'End Time': b.end_time || '10:00 PM',
    'Function Type': b.function_type,
    'Guest Count': b.guest_count,
    'Blocked Previous Day': b.blocked_previous_day ? 'YES (< 7 AM)' : 'NO',
    'Blocked Dates': b.blocked_dates ? b.blocked_dates.join(', ') : b.marriage_date,
    'Special Requirements': (b.requirements || []).join(', '),
    'Status': b.booking_status,
    'Created At': new Date(b.created_at).toLocaleString('en-IN'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

  // Auto-fit column widths
  const max_widths = [15, 20, 15, 25, 20, 20, 18, 15, 15, 12, 20, 25, 30, 12, 20];
  worksheet['!cols'] = max_widths.map((w) => ({ wch: w }));

  XLSX.writeFile(workbook, fileName);
}

export function printBookingReceipt(booking: Booking) {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Booking Confirmation - ${booking.booking_id} | KM PALACE</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 30px;
            color: #1a1a1a;
            background-color: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #7A0019;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #7A0019;
            letter-spacing: 2px;
          }
          .tagline {
            color: #D4AF37;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            margin-top: 4px;
          }
          .badge {
            display: inline-block;
            background-color: #7A0019;
            color: #D4AF37;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin-top: 10px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 25px;
          }
          .card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            background: #fdfbf7;
          }
          .card-title {
            font-weight: bold;
            color: #7A0019;
            margin-bottom: 10px;
            font-size: 15px;
            border-bottom: 1px solid #ebd5a3;
            padding-bottom: 5px;
          }
          .item {
            margin-bottom: 8px;
            font-size: 14px;
          }
          .label {
            color: #64748b;
            font-weight: 500;
          }
          .value {
            font-weight: 600;
            color: #0f172a;
          }
          .highlight-box {
            background-color: #fef2f2;
            border-left: 4px solid #7A0019;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">KM PALACE</div>
          <div class="tagline">SMART WEDDING HALL BOOKING</div>
          <div class="badge">REFERENCE: ${booking.booking_id}</div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">Customer Information</div>
            <div class="item"><span class="label">Primary Contact:</span> <span class="value">${booking.customer_name}</span></div>
            <div class="item"><span class="label">Phone:</span> <span class="value">${booking.phone}</span></div>
            <div class="item"><span class="label">Bride Name:</span> <span class="value">${booking.bride_name}</span></div>
            <div class="item"><span class="label">Groom Name:</span> <span class="value">${booking.groom_name}</span></div>
          </div>

          <div class="card">
            <div class="card-title">Event Details</div>
            <div class="item"><span class="label">Function Type:</span> <span class="value">${booking.function_type}</span></div>
            <div class="item"><span class="label">Marriage Date:</span> <span class="value">${formatDisplayDate(booking.marriage_date)}</span></div>
            <div class="item"><span class="label">Muhurtham Time:</span> <span class="value" style="color:#7A0019;">${booking.muhurtham_time}</span></div>
            <div class="item"><span class="label">Event Duration:</span> <span class="value" style="color:#0f172a;">${booking.from_time || '06:00 AM'} to ${booking.end_time || '10:00 PM'}</span></div>
            <div class="item"><span class="label">Expected Guests:</span> <span class="value">${booking.guest_count} Guests</span></div>
            <div class="item"><span class="label">Booking Status:</span> <span class="value" style="color:#16a34a;">${booking.booking_status}</span></div>
          </div>
        </div>

        <div class="highlight-box">
          <strong>📅 Hall Blocked Schedule & Timing:</strong><br/>
          Slot Timing: <strong>12:00 PM (Start) to 12:00 PM (Next Day Exit)</strong><br/>
          Dates Reserved: <strong>${(booking.blocked_dates || [booking.marriage_date]).map(formatDisplayDate).join(' & ')}</strong><br/>
          ${booking.blocked_previous_day ? '<em>⚠️ Note: Muhurtham is before 07:00 AM, so previous day setup & guest arrival period is reserved exclusively for this event.</em>' : '<em>Standard 12 PM to Next Day 12 PM slot reserved.</em>'}
        </div>

        ${booking.estimated_amount ? `
        <div class="card" style="margin-bottom: 20px; border: 2px solid #D4AF37;">
          <div class="card-title">Official Tariff & Quote Estimate Summary</div>
          <div class="item" style="display:flex; justify-[#0f172a]; justify-content:space-between; font-size:16px;">
            <span class="label">Total Estimated Quote (Inc. 18% GST):</span>
            <span class="value" style="color:#7A0019; font-size:18px;">₹${booking.estimated_amount.toLocaleString('en-IN')}</span>
          </div>
          <div style="font-size:11px; color:#64748b; margin-top:6px;">
            Includes Base Marriage Hall Rent (₹2.25L + 18% GST), Cleaning & Corporation charge (₹20k), Elevation Lights (₹8k), Security 5 nos (₹5k), Electricity deposit (₹10k), Standby Generator (₹4k), 8 Hrs A/C (₹52k) plus selected add-ons.
          </div>
          <div style="margin-top:10px; background:#7A0019; color:#D4AF37; padding:8px 12px; border-radius:6px; font-size:12px; font-weight:bold;">
            🔒 Mandatory Caution Deposit: ₹20,000 due prior to key & cooking utensil handover. Non-Veg food strictly prohibited.
          </div>
        </div>
        ` : ''}

        <div class="card" style="margin-bottom: 20px;">
          <div class="card-title">Special Amenities & Services Selected</div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            ${(booking.requirements || []).map(req => `<span style="background:#f1f5f9; padding:4px 10px; border-radius:12px; font-size:12px; font-weight:600;">✓ ${req}</span>`).join('')}
          </div>
        </div>

        <div class="footer">
          <p>KM PALACE Royal Wedding & Convention Hall | 9/133, Sirukalathur Main Rd, Kavanur, Chembarambakkam, Tamil Nadu 600069 | Phone: +91 9159277277 | Email: Kannan.d26@gmail.com</p>
          <p>This is an officially generated booking document. Timestamp: ${new Date(booking.created_at).toLocaleString('en-IN')}</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
