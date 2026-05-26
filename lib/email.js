import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWorkshopConfirmationEmail({
  to,
  userName,
  workshopTitle,
  workshopDate,
  workshopDuration,
  workshopLink,
  instructor,
}) {
  try {
    console.log(`📧 Preparing confirmation email for: ${to}`);
    
    const formattedDate = new Date(workshopDate).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-left: 1px solid #e5e7eb;
              border-right: 1px solid #e5e7eb;
            }
            .workshop-details {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #78350f;
            }
            .detail-row {
              margin: 10px 0;
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: bold;
              color: #78350f;
            }
            .button {
              display: inline-block;
              background: #78350f;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              background: #1f2937;
              color: #9ca3af;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              border-radius: 0 0 8px 8px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎵 Workshop Registration Confirmed!</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Thank you for registering for our workshop. We're excited to have you join us!</p>
            
            <div class="workshop-details">
              <h3>Workshop Details</h3>
              <div class="detail-row">
                <span class="label">Workshop:</span> ${workshopTitle}
              </div>
              <div class="detail-row">
                <span class="label">Instructor:</span> ${instructor}
              </div>
              <div class="detail-row">
                <span class="label">Date & Time:</span> ${formattedDate}
              </div>
              <div class="detail-row">
                <span class="label">Duration:</span> ${workshopDuration} minutes
              </div>
            </div>

            <p style="margin-top: 30px;">
              <strong>Join the workshop using the link below:</strong>
            </p>
            
            <center>
              <a href="${workshopLink}" class="button">Join Workshop</a>
            </center>

            <p style="margin-top: 20px; font-size: 14px; color: #666;">
              <strong>Important Notes:</strong><br>
              • Please join 5 minutes before the scheduled time<br>
              • Keep your login credentials handy<br>
              • Have your instrument/materials ready<br>
              • Check your internet connection beforehand
            </p>
          </div>

          <div class="footer">
            <p>Soloistanjali | Music Lessons for All Ages</p>
            <p>If you have any questions, reply to this email or contact us at support@soloistanjali.com</p>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: to,
      subject: `Workshop Confirmation: ${workshopTitle}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Email sending error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
}

// NEW FUNCTION: Send workshop update notification
export async function sendWorkshopUpdateEmail({
  to,
  userName,
  workshopTitle,
  workshopDate,
  workshopDuration,
  workshopLink,
  instructor,
  changedFields = [],
}) {
  try {
    const formattedDate = new Date(workshopDate).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Build a list of what changed
    let changesHtml = '';
    if (changedFields.length > 0) {
      changesHtml = `
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <strong style="color: #92400e;">⚠️ What Changed:</strong>
          <ul style="margin: 10px 0; padding-left: 20px;">
            ${changedFields.map(field => `<li>${field}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-left: 1px solid #e5e7eb;
              border-right: 1px solid #e5e7eb;
            }
            .workshop-details {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #78350f;
            }
            .detail-row {
              margin: 10px 0;
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: bold;
              color: #78350f;
            }
            .button {
              display: inline-block;
              background: #78350f;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              background: #1f2937;
              color: #9ca3af;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              border-radius: 0 0 8px 8px;
            }
            .alert {
              background: #fef3c7;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #f59e0b;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔔 Workshop Details Updated</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Important update: The workshop you registered for has been modified. Please review the updated details below.</p>
            
            ${changesHtml}
            
            <div class="workshop-details">
              <h3>Updated Workshop Details</h3>
              <div class="detail-row">
                <span class="label">Workshop:</span> ${workshopTitle}
              </div>
              <div class="detail-row">
                <span class="label">Instructor:</span> ${instructor}
              </div>
              <div class="detail-row">
                <span class="label">Date & Time:</span> ${formattedDate}
              </div>
              <div class="detail-row">
                <span class="label">Duration:</span> ${workshopDuration} minutes
              </div>
            </div>

            <p style="margin-top: 30px;">
              <strong>Join the workshop using the link below:</strong>
            </p>
            
            <center>
              <a href="${workshopLink}" class="button">Join Workshop</a>
            </center>

            <p style="margin-top: 20px; font-size: 14px; color: #666;">
              <strong>Important:</strong><br>
              • Make sure to note the updated schedule<br>
              • If you have any concerns about these changes, please contact us<br>
              • Your registration remains valid for the updated workshop
            </p>
          </div>

          <div class="footer">
            <p>Soloistanjali | Music Lessons for All Ages</p>
            <p>If you have any questions about these changes, reply to this email or contact us at support@soloistanjali.com</p>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: to,
      subject: `Workshop Update: ${workshopTitle}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Email sending error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
}