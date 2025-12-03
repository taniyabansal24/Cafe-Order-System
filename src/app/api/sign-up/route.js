// app/api/sign-up/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OwnerModel from '@/model/Owner';
import { sendVerificationEmail } from '@/helpers/sendVerificationCode';
import { getCurrentTimestamp, getTTLTimestamp } from '@/lib/dateUtils';

export async function POST(request) {
  try {
    await dbConnect();
    
    const {
      name, email, password, cafeName,
      address, phone, city, state, pincode
    } = await request.json();

    // Check if email already exists and is fully verified
    const existingVerifiedOwner = await OwnerModel.findOne({ 
      email, 
      isVerified: true,
      isPhoneVerified: true
    });
    
    if (existingVerifiedOwner) {
      return NextResponse.json({
        success: false,
        message: 'User already exists with this email'
      }, { status: 400 });
    }

    // Generate email OTP
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const ownerData = {
      name,
      email,
      password,
      cafeName,
      address,
      phone,
      city,
      state,
      pincode,
      verifyCode,
      verifyCodeExpiry: getTTLTimestamp(10), // 10 minutes
      isVerified: false,
      isPhoneVerified: false,
      registrationStep: 'email-verification',
      ttlExpireAt: getTTLTimestamp(10) // 10 minutes for TTL
    };

    let owner = await OwnerModel.findOne({ email });
    
    if (owner) {
      // Update existing unverified owner
      Object.assign(owner, ownerData);
      await owner.save();
    } else {
      // Create new owner
      owner = new OwnerModel(ownerData);
      await owner.save();
    }

    // Send email OTP using your existing function
    const emailResponse = await sendVerificationEmail(email, name, verifyCode);

    if (!emailResponse.success) {
      return NextResponse.json({
        success: false,
        message: emailResponse.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email OTP sent successfully. Please verify within 10 minutes.',
      registrationId: owner._id.toString(),
      nextStep: 'verify-email',
      expiresAt: owner.ttlExpireAt // For debugging
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Registration failed',
      error: error.message
    }, { status: 500 });
  }
}