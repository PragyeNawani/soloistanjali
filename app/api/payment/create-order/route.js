import { NextResponse } from 'next/server';
import { razorpayInstance } from '@/lib/razorpay';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request) {
  try {
    const { courseId } = await request.json();

    // Get authenticated user
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get course details
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if already purchased
    const { data: existingPurchase } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('course_id', courseId)
      .eq('status', 'completed')
      .single();

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
      receipt: `order_${Date.now()}`,
      notes: {
        courseId: courseId,
        userId: session.user.id,
      },
    };

    const order = await razorpayInstance.orders.create(options);

    // Save order to database
    const { error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .insert([
        {
          user_id: session.user.id,
          course_id: courseId,
          razorpay_order_id: order.id,
          amount: course.price,
          status: 'pending',
        },
      ]);

    if (purchaseError) {
      return NextResponse.json(
        { error: purchaseError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}