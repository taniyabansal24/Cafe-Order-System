// app/api/resend-reset-otp/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OwnerModel from '@/model/Owner';
import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(request) {
  try {
    await dbConnect();
    
    const { userId } = await request.json();

    console.log("🔄 Resend OTP request for userId:", userId);

    const user = await OwnerModel.findOne({ 
      _id: userId,
      isVerified: true,
      isPhoneVerified: true
    });

    if (!user) {
      console.error("❌ User not found for resend OTP:", userId);
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 400 });
    }

    console.log("✅ Resending OTP to user:", {
      email: user.email,
      phone: user.phone
    });

    // Send phone OTP via Twilio
    try {
      const verification = await client.verify
        .v2.services(process.env.TWILIO_SERVICE_ID)
        .verifications.create({
          to: user.phone.startsWith("+91") ? user.phone : `+91${user.phone}`,
          channel: "sms",
        });

      console.log("📱 Phone OTP resent via Twilio:", verification.status);

      return NextResponse.json({
        success: true,
        message: `New OTP sent to your phone number ending with ${user.phone.slice(-4)}`
      });

    } catch (twilioError) {
      console.error("❌ Twilio error on resend:", twilioError.message);
      return NextResponse.json({
        success: false,
        message: 'Failed to resend OTP. Please try again.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Resend OTP error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    }, { status: 500 });
  }
}