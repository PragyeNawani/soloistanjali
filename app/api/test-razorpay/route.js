import { NextResponse } from 'next/server';
import { razorpayInstance } from '@/lib/razorpay';

export async function GET() {
  try {
    console.log('Testing Razorpay configuration...');
    console.log('Key ID:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
    console.log('Key Secret exists:', !!process.env.RAZORPAY_KEY_SECRET);

    // Try creating a test order
    const order = await razorpayInstance.orders.create({
      amount: 100,
      currency: 'INR',
      receipt: 'test_' + Date.now(),
    });

    console.log('Test order created:', order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'Razorpay is configured correctly',
    });
  } catch (error) {
    console.error('Razorpay test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Razorpay configuration error',
      },
      { status: 500 }
    );
  }
}