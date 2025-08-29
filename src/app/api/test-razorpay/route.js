import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if Razorpay keys are configured
    const hasKeyId = !!process.env.RAZORPAY_KEY_ID;
    const hasKeySecret = !!process.env.RAZORPAY_KEY_SECRET;
    
    // Check if keys are test keys (start with rzp_test)
    const isTestKey = process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test');
    
    return NextResponse.json({
      configured: hasKeyId && hasKeySecret,
      hasKeyId,
      hasKeySecret,
      keyId: hasKeyId ? process.env.RAZORPAY_KEY_ID.replace(/.(?=.{4})/g, '*') : 'Not set',
      isTestKey,
      message: hasKeyId && hasKeySecret 
        ? 'Razorpay is configured correctly' + (isTestKey ? ' (TEST MODE)' : '')
        : 'Razorpay is not configured properly'
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}