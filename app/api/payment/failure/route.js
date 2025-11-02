import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request) {
  try {
    const { razorpay_order_id, error_description } = await request.json();

    // Get authenticated user
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update purchase status to failed (but keep it as pending so user can retry)
    const { error: updateError } = await supabaseAdmin
      .from('purchases')
      .update({
        status: 'pending', // Keep as pending so user can retry with same record
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', session.user.id);

    if (updateError) {
      console.error('Error updating purchase on failure:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment failure recorded',
    });
  } catch (error) {
    console.error('Payment failure handler error:', error);
    return NextResponse.json(
      { error: 'Failed to record payment failure' },
      { status: 500 }
    );
  }
}