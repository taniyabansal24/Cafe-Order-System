// app/api/reset-password/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OwnerModel from '@/model/Owner';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { userId, password } = await request.json();

    console.log("🔐 Reset password request:", {
      userId,
      passwordLength: password?.length
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

    console.log("✅ User found:", user.email);

    // Test the bcrypt version and hashing
    console.log("🔐 Testing bcrypt...");
    const testHash = await bcrypt.hash("test123", 12);
    const testCompare = await bcrypt.compare("test123", testHash);
    console.log("🔐 Bcrypt self-test:", testCompare);

    // Hash new password with consistent settings
    console.log("🔐 Hashing new password...");
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log("🔐 Hash details:", {
      passwordLength: password.length,
      hashLength: hashedPassword.length,
      hashPrefix: hashedPassword.substring(0, 20)
    });

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Immediate verification
    const verifyUser = await OwnerModel.findById(userId);
    const isImmediateMatch = await bcrypt.compare(password, verifyUser.password);
    console.log("🔐 Immediate password verification:", isImmediateMatch);

    if (!isImmediateMatch) {
      console.error("❌ CRITICAL: Password verification failed immediately after reset!");
      return NextResponse.json({
        success: false,
        message: 'Password reset failed - verification error'
      }, { status: 500 });
    }

    console.log("✅ Password reset and verified successfully");

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    }, { status: 500 });
  }
}