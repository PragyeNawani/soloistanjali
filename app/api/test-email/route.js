// Test Resend connection - create test file: app/api/test-email/route.js
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: 'coderpragye@gmail.com',
      subject: 'Test Email',
      html: '<h1>Test Email from CHORDS Studio</h1>',
    });

    return NextResponse.json({ success: true, data, error });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}