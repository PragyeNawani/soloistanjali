import { NextResponse } from 'next/server';
import { razorpayInstance } from '@/lib/razorpay';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request) {
  try {
    const { workshopId, phone, additionalInfo } = await request.json();

    console.log('Registration request received:', { workshopId, phone });

    // Get authenticated user
    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.error('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated:', session.user.id);

    // Get workshop details
    const { data: workshop, error: workshopError } = await supabaseAdmin
      .from('workshops')
      .select('*')
      .eq('id', workshopId)
      .single();

    if (workshopError || !workshop) {
      console.error('Workshop not found:', workshopError);
      return NextResponse.json(
        { error: 'Workshop not found' },
        { status: 404 }
      );
    }

    console.log('Workshop found:', workshop.title, 'Price:', workshop.price);

    // Check if workshop is full
    if (workshop.current_participants >= workshop.max_participants) {
      console.error('Workshop is full');
      return NextResponse.json(
        { error: 'Workshop is fully booked' },
        { status: 400 }
      );
    }

    // Check if already registered
    const { data: existingRegistration } = await supabaseAdmin
      .from('workshop_registrations')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('workshop_id', workshopId)
      .eq('status', 'completed')
      .maybeSingle(); // Use maybeSingle instead of single

    if (existingRegistration) {
      console.error('Already registered');
      return NextResponse.json(
        { error: 'Already registered for this workshop' },
        { status: 400 }
      );
    }

    console.log('Creating Razorpay order...');

    // Create Razorpay order
    const options = {
      amount: workshop.price * 100,
      currency: 'INR',
      receipt: `workshop_${workshopId}_${Date.now()}`,
      notes: {
        workshopId: workshopId.toString(),
        userId: session.user.id,
        workshopTitle: workshop.title,
      },
    };

    const order = await razorpayInstance.orders.create(options);
    console.log('Razorpay order created:', order.id);

    // Save registration to database
    const registrationData = {
      user_id: session.user.id,
      workshop_id: workshopId,
      razorpay_order_id: order.id,
      amount: workshop.price,
      status: 'pending',
      phone: phone,
      additional_info: additionalInfo || null,
    };

    console.log('Inserting registration:', registrationData);

    const { data: insertedRegistration, error: registrationError } =
      await supabaseAdmin
        .from('workshop_registrations')
        .insert([registrationData])
        .select()
        .single();

    if (registrationError) {
      console.error('Registration insert error:', registrationError);
      return NextResponse.json(
        { error: registrationError.message },
        { status: 400 }
      );
    }

    console.log('Registration created successfully:', insertedRegistration.id);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Workshop registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create registration: ' + error.message },
      { status: 500 }
    );
  }
}