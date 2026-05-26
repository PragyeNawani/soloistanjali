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

    // Inline cleanup: Delete old pending registrations for this user (older than 1 hour)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const { error: cleanupError } = await supabaseAdmin
      .from('workshop_registrations')
      .delete()
      .eq('user_id', session.user.id)
      .eq('status', 'pending')
      .lt('registered_at', oneHourAgo.toISOString());

    if (cleanupError) {
      console.warn('Cleanup warning (non-critical):', cleanupError);
    } else {
      console.log('✅ Cleaned up old pending registrations for user');
    }

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

    // Check for any existing registration (completed or pending)
    const { data: existingRegistration } = await supabaseAdmin
      .from('workshop_registrations')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('workshop_id', workshopId)
      .maybeSingle();

    // If already completed, don't allow re-registration
    if (existingRegistration && existingRegistration.status === 'completed') {
      console.error('Already registered with completed status');
      return NextResponse.json(
        { error: 'Already registered for this workshop' },
        { status: 400 }
      );
    }

    let order;
    let registrationToUse = existingRegistration;

    // If there's a pending registration, create a new order but update the existing record
    if (existingRegistration && existingRegistration.status === 'pending') {
      console.log('Found existing pending registration, creating new order...');
      
      // Create new Razorpay order
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

      order = await razorpayInstance.orders.create(options);
      console.log('New Razorpay order created:', order.id);

      // Update the existing registration with new order ID
      const { data: updatedRegistration, error: updateError } =
        await supabaseAdmin
          .from('workshop_registrations')
          .update({
            razorpay_order_id: order.id,
            razorpay_payment_id: null, // Clear any failed payment ID
            phone: phone,
            additional_info: additionalInfo || null,
            registered_at: new Date().toISOString(), // Update timestamp
          })
          .eq('id', existingRegistration.id)
          .select()
          .single();

      if (updateError) {
        console.error('Registration update error:', updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 400 }
        );
      }

      registrationToUse = updatedRegistration;
      console.log('Registration updated successfully:', registrationToUse.id);
    } else {
      // No existing registration, create new one
      console.log('Creating new Razorpay order...');

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

      order = await razorpayInstance.orders.create(options);
      console.log('Razorpay order created:', order.id);

      // Save new registration to database
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

      registrationToUse = insertedRegistration;
      console.log('Registration created successfully:', registrationToUse.id);
    }

    return NextResponse.json({
      orderId: registrationToUse.razorpay_order_id,
      amount: workshop.price * 100,
      currency: 'INR',
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