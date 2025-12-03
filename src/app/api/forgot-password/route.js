// app/api/forgot-password/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OwnerModel from '@/model/Owner';
import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email } = await request.json();

    console.log("🔐 Forgot password request for email:", email);

    // Find user by email
    const user = await OwnerModel.findOne({ 
      email: email.toLowerCase().trim(),
      isVerified: true,
      isPhoneVerified: true
    });

    if (!user) {
      console.error("❌ User not found or not verified:", email);
      return NextResponse.json({
        success: false,
        message: 'No verified user found with this email'
      }, { status: 400 });
    }

    console.log("✅ User found:", {
      email: user.email,
      phone: user.phone,
      name: user.name
    });

    // Send phone OTP via Twilio
    try {
      const verification = await client.verify
        .v2.services(process.env.TWILIO_SERVICE_ID)
        .verifications.create({
          to: user.phone.startsWith("+91") ? user.phone : `+91${user.phone}`,
          channel: "sms",
        });

      console.log("📱 Phone OTP sent via Twilio:", verification.status);

      return NextResponse.json({
        success: true,
        message: `OTP sent to your phone number ending with ${user.phone.slice(-4)}`,
        userId: user._id.toString(),
        userPhone: user.phone,
        userEmail: user.email
      });

    } catch (twilioError) {
      console.error("❌ Twilio error:", twilioError.message);
      return NextResponse.json({
        success: false,
        message: 'Failed to send OTP to your phone. Please try again.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to process password reset',
      error: error.message
    }, { status: 500 });
  }
}