import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { sendWorkshopConfirmationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await request.json();

    console.log('=== Payment Verification Started ===');
    console.log('Order ID:', razorpay_order_id);
    console.log('Payment ID:', razorpay_payment_id);

    // Step 1: Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('✅ Signature verified');

    // Step 2: Get authenticated user
    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.error('❌ No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated:', session.user.id);

    // Step 3: First, check if registration exists
    console.log('Searching for registration with order ID:', razorpay_order_id);
    
    const { data: existingRegistrations, error: searchError } =
      await supabaseAdmin
        .from('workshop_registrations')
        .select('*')
        .eq('razorpay_order_id', razorpay_order_id);

    console.log('Search results:', existingRegistrations);
    console.log('Search error:', searchError);

    if (searchError) {
      console.error('❌ Search error:', searchError);
      return NextResponse.json(
        { error: 'Database error: ' + searchError.message },
        { status: 500 }
      );
    }

    if (!existingRegistrations || existingRegistrations.length === 0) {
      console.error('❌ No registration found for order:', razorpay_order_id);
      
      // Additional debug: Check if there are ANY registrations for this user
      const { data: userRegs } = await supabaseAdmin
        .from('workshop_registrations')
        .select('*')
        .eq('user_id', session.user.id)
        .order('registered_at', { ascending: false })
        .limit(5);
      
      console.log('Recent registrations for user:', userRegs);
      
      return NextResponse.json(
        { error: 'Registration not found. Order ID: ' + razorpay_order_id },
        { status: 404 }
      );
    }

    const registration = existingRegistrations[0];
    console.log('✅ Registration found:', registration.id);

    // Verify the registration belongs to the current user
    if (registration.user_id !== session.user.id) {
      console.error('❌ Registration user mismatch');
      return NextResponse.json(
        { error: 'Unauthorized - registration belongs to different user' },
        { status: 403 }
      );
    }

    console.log('✅ User ownership verified');

    // Step 4: Update registration status
    const { error: updateError, data: updatedRegistration } =
      await supabaseAdmin
        .from('workshop_registrations')
        .update({
          razorpay_payment_id: razorpay_payment_id,
          status: 'completed',
        })
        .eq('id', registration.id)
        .select()
        .single();

    if (updateError) {
      console.error('❌ Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update registration: ' + updateError.message },
        { status: 400 }
      );
    }

    console.log('✅ Registration updated to completed');

    // Step 5: Fetch workshop details
    const { data: workshop, error: workshopError } = await supabaseAdmin
      .from('workshops')
      .select('*')
      .eq('id', registration.workshop_id)
      .single();

    if (workshopError || !workshop) {
      console.error('❌ Workshop fetch error:', workshopError);
      return NextResponse.json(
        { error: 'Workshop not found' },
        { status: 404 }
      );
    }

    console.log('✅ Workshop fetched:', workshop.title);

    // Step 6: Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name')
      .eq('id', session.user.id)
      .maybeSingle();

    console.log('✅ Profile fetched:', profile?.name);

    // Step 7: Send confirmation email
    console.log('📧 Sending confirmation email to:', session.user.email);

    const emailResult = await sendWorkshopConfirmationEmail({
      to: session.user.email,
      userName: profile?.name || session.user.email,
      workshopTitle: workshop.title,
      workshopDate: workshop.date,
      workshopDuration: workshop.duration,
      workshopLink: workshop.workshop_link,
      instructor: workshop.instructor,
    });

    if (!emailResult.success) {
      console.error('⚠️ Email sending failed:', emailResult.error);
    } else {
      console.log('✅ Email sent successfully');
    }

    console.log('=== Payment Verification Completed Successfully ===');

    return NextResponse.json({
      success: true,
      message: 'Registration completed successfully',
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error('❌ Verify payment error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment: ' + error.message },
      { status: 500 }
    );
  }
}