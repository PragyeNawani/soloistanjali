import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request) {
  try {
    // Validate environment variables
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keyId || !keySecret) {
      console.error('Missing Razorpay credentials');
      return NextResponse.json(
        { error: 'Payment service not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Creating order for user:', session.user.id, 'course:', courseId);

    // Inline cleanup: Delete old pending/failed purchases for this user (older than 1 hour)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const { error: cleanupError } = await supabaseAdmin
      .from('purchases')
      .delete()
      .eq('user_id', session.user.id)
      .in('status', ['pending', 'failed'])
      .lt('created_at', oneHourAgo.toISOString());

    if (cleanupError) {
      console.warn('Cleanup warning (non-critical):', cleanupError);
    } else {
      console.log('✅ Cleaned up old pending/failed purchases for user');
    }

    // Get course details
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError) {
      console.error('Course fetch error:', courseError);
      return NextResponse.json(
        { error: 'Course not found: ' + courseError.message },
        { status: 404 }
      );
    }

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    console.log('Found course:', course.title, 'price:', course.price);

    // Check if user already purchased this course (completed status only)
    const { data: existingPurchase, error: purchaseCheckError } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('course_id', courseId)
      .eq('status', 'completed')
      .maybeSingle();

    if (purchaseCheckError) {
      console.error('Purchase check error:', purchaseCheckError);
    }

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Course already purchased' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: course.price * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${courseId}_${Date.now()}`,
      notes: {
        courseId: courseId.toString(),
        userId: session.user.id,
        courseTitle: course.title,
      },
    };

    console.log('Creating Razorpay order with options:', options);

    const order = await razorpay.orders.create(options);

    console.log('Razorpay order created:', order.id);

    // Check if a pending or failed purchase already exists for this user and course
    const { data: existingIncomplete, error: incompleteCheckError } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('course_id', courseId)
      .in('status', ['pending', 'failed'])
      .maybeSingle();

    if (incompleteCheckError) {
      console.error('Incomplete purchase check error:', incompleteCheckError);
    }

    if (existingIncomplete) {
      console.log('Updating existing incomplete purchase:', existingIncomplete.id);
      
      // Update existing purchase with new order ID
      const { error: updateError } = await supabaseAdmin
        .from('purchases')
        .update({
          razorpay_order_id: order.id,
          razorpay_payment_id: null,
          amount: course.price,
          status: 'pending',
          created_at: new Date().toISOString(), // Update timestamp
        })
        .eq('id', existingIncomplete.id);

      if (updateError) {
        console.error('Error updating purchase:', updateError);
        return NextResponse.json(
          { error: 'Failed to update purchase record: ' + updateError.message },
          { status: 500 }
        );
      }

      console.log('Successfully updated purchase');
    } else {
      console.log('Creating new purchase record');
      
      // Create new purchase record
      const { error: insertError } = await supabaseAdmin
        .from('purchases')
        .insert({
          user_id: session.user.id,
          course_id: courseId,
          razorpay_order_id: order.id,
          amount: course.price,
          status: 'pending',
        });

      if (insertError) {
        console.error('Error creating purchase record:', insertError);
        return NextResponse.json(
          { error: 'Failed to create purchase record: ' + insertError.message },
          { status: 500 }
        );
      }

      console.log('Successfully created purchase record');
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order: ' + error.message },
      { status: 500 }
    );
  }
}