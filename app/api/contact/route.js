import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { name, contact, goal, message } = await request.json();

    // Validate required fields
    if (!name || !contact || !goal) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract email if contact contains email, otherwise use contact as is
    const emailRegex = /\S+@\S+\.\S+/;
    const userEmail = emailRegex.test(contact) ? contact : null;

    // Send email to admin
    const adminEmailPromise = resend.emails.send({
      from: 'Chords Studio <onboarding@resend.dev>', // Replace with your verified domain
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .field { margin-bottom: 20px; }
              .label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
              .value { background: white; padding: 10px; border-radius: 5px; border-left: 3px solid #667eea; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎵 New Contact Form Submission</h1>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">Name:</div>
                  <div class="value">${name}</div>
                </div>
                <div class="field">
                  <div class="label">Contact:</div>
                  <div class="value">${contact}</div>
                </div>
                <div class="field">
                  <div class="label">Goal:</div>
                  <div class="value">${goal}</div>
                </div>
                ${message ? `
                <div class="field">
                  <div class="label">Message:</div>
                  <div class="value">${message}</div>
                </div>
                ` : ''}
                <div class="footer">
                  <p>This email was sent from Chords Studio contact form</p>
                  <p>Timestamp: ${new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    // Send thank you email to user (only if email is provided)
    const emailPromises = [adminEmailPromise];
    
    if (userEmail) {
      const userEmailPromise = resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL, // Replace with your verified domain
        to: userEmail,
        subject: 'Thank you for contacting Chords Studio! 🎵',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { background: #f9fafb; padding: 40px; border-radius: 0 0 10px 10px; }
                .greeting { font-size: 18px; margin-bottom: 20px; }
                .message { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                .cta { text-align: center; margin: 30px 0; }
                .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
                .social-links { margin: 20px 0; }
                .social-links a { margin: 0 10px; color: #667eea; text-decoration: none; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎵 Thank You for Reaching Out!</h1>
                </div>
                <div class="content">
                  <div class="greeting">
                    Hi <strong>${name}</strong>,
                  </div>
                  <div class="message">
                    <p>Thank you for contacting <strong>Chords Studio</strong>! We've received your message and are excited to help you on your musical journey.</p>
                    <p>Our team will review your inquiry and get back to you within 24-48 hours. We're looking forward to discussing how we can help you achieve your goal: <strong>${goal}</strong></p>
                  </div>
                  <div class="cta">
                    <p>In the meantime, feel free to explore:</p>
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/courses" class="button">Browse Our Courses</a>
                  </div>
                  <div class="social-links">
                    <p>Follow us on social media for updates and tips:</p>
                    <a href="#">Instagram</a> | 
                    <a href="#">Facebook</a> | 
                    <a href="#">YouTube</a>
                  </div>
                  <div class="footer">
                    <p><strong>Chords Studio</strong></p>
                    <p>Learn Instruments Anytime, Anywhere</p>
                    <p style="font-size: 12px; color: #9ca3af; margin-top: 10px;">
                      If you didn't submit this form, please ignore this email.
                    </p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      });
      emailPromises.push(userEmailPromise);
    }

    // Wait for all emails to be sent
    const results = await Promise.all(emailPromises);
    
    console.log('Email sent successfully:', results);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Your message has been sent successfully!',
        emailSent: userEmail ? true : false
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again.' },
      { status: 500 }
    );
  }
}