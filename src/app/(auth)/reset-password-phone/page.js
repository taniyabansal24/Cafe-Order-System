// app/api/reset-password-phone/route.js
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await dbConnect();
    const { phone, newPassword } = await request.json();

    if (!phone || !newPassword) {
      return NextResponse.json(
        { message: "Phone and new password are required" },
        { status: 400 }
      );
    }

    // Find user by phone
    const user = await OwnerModel.findOne({ phone });
    if (!user) {
      return NextResponse.json(
        { message: "No account found with this phone number" },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    user.password = hashedPassword;
    await user.save();

    console.log(`Password reset successful for phone: ${phone}`);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully! You can now sign in with your new password.",
    });

  } catch (error) {
    console.error("Reset password phone error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}