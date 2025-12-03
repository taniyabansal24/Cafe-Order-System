// app/api/debug/verify-password/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OwnerModel from '@/model/Owner';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email, password } = await request.json();

    console.log("🔐 Debug password verification for:", email);

    const user = await OwnerModel.findOne({ email });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    console.log("🔐 Password verification result:", {
      email: user.email,
      isPasswordCorrect,
      passwordHash: user.password?.substring(0, 20) + '...',
      isVerified: user.isVerified,
      isPhoneVerified: user.isPhoneVerified
    });

    return NextResponse.json({
      success: true,
      isPasswordCorrect,
      user: {
        email: user.email,
        isVerified: user.isVerified,
        isPhoneVerified: user.isPhoneVerified,
        registrationStep: user.registrationStep
      }
    });

  } catch (error) {
    console.error('❌ Password verification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error verifying password',
      error: error.message
    });
  }
}