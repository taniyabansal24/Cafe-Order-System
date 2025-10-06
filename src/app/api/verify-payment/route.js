import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment parameters' },
        { status: 400 }
      );
    }

    // Create the expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Compare the signatures
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Fetch order details from Razorpay API
      let orderData = null;
      try {
        const auth = Buffer.from(
          `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
        ).toString('base64');

        const response = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          orderData = await response.json();
          
          // Extract only the necessary fields to avoid large response
          orderData = {
            id: orderData.id,
            amount: orderData.amount,
            currency: orderData.currency,
            status: orderData.status,
            attempts: orderData.attempts,
            created_at: orderData.created_at,
            amount_due: orderData.amount_due,
            amount_paid: orderData.amount_paid,
          };
        } else {
          console.warn('Failed to fetch Razorpay order details:', response.status);
        }
      } catch (fetchError) {
        console.error('Error fetching Razorpay order details:', fetchError);
        // Continue without order details
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Payment verified successfully',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        orderData: orderData
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}