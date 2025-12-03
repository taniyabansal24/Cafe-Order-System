// app/api/verify-reset-otp/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OwnerModel from '@/model/Owner';
import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(request) {
  try {
    await dbConnect();
    
    const { userId, code } = await request.json();

    console.log("🔐 Verify reset OTP request:", {
      userId,
      code
    });

    // Find user by ID
    const user = await OwnerModel.findOne({ 
      _id: userId,
      isVerified: true,
      isPhoneVerified: true
    });

    if (!user) {
      console.error("❌ User not found:", userId);
      return NextResponse.json({
        success: false,
        message: 'User not found or not verified'
      }, { status: 400 });
    }

    console.log("🔍 Verifying OTP for user:", {
      email: user.email,
      phone: user.phone
    });

    // Verify phone OTP with Twilio
    try {
      const verificationCheck = await client.verify
        .v2.services(process.env.TWILIO_SERVICE_ID)
        .verificationChecks.create({
          to: user.phone.startsWith("+91") ? user.phone : `+91${user.phone}`,
          code: code,
        });

      console.log("📱 Twilio verification response:", verificationCheck.status);

      if (verificationCheck.status === "approved") {
        console.log("✅ Phone OTP verified successfully");
        return NextResponse.json({
          success: true,
          message: 'Phone number verified successfully',
          userEmail: user.email
        });
      } else {
        console.error("❌ Invalid OTP from Twilio");
        return NextResponse.json({
          success: false,
          message: 'Invalid OTP. Please check the code and try again.'
        }, { status: 400 });
      }
    } catch (twilioError) {
      console.error("❌ Twilio verification error:", twilioError.message);
      
      if (twilioError.code === 20404 || twilioError.message.includes('Verification check was not found')) {
        return NextResponse.json({
          success: false,
          message: 'Invalid OTP or OTP has expired. Please request a new one.'
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: false,
        message: 'OTP verification failed. Please try again.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Verify reset OTP error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    }, { status: 500 });
  }
}