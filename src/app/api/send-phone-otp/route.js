// app/api/send-phone-otp/route.js
import twilio from "twilio";
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req) {
  const { registrationId } = await req.json();

  try {
    await dbConnect();

    console.log("📱 Resend Phone OTP Request:", {
      registrationId,
      timestamp: new Date().toISOString()
    });

    if (!registrationId) {
      return Response.json(
        {
          success: false,
          message: "Registration ID is required"
        },
        { status: 400 }
      );
    }

    // Find user with less strict conditions for debugging
    const user = await OwnerModel.findOne({
      _id: registrationId
    });

    console.log("🔍 User found for resend OTP:", {
      userExists: !!user,
      userId: user?._id,
      registrationStep: user?.registrationStep,
      isVerified: user?.isVerified,
      isPhoneVerified: user?.isPhoneVerified,
      email: user?.email,
      phone: user?.phone
    });

    if (!user) {
      console.error("❌ User not found for resend OTP:", registrationId);
      return Response.json(
        {
          success: false,
          message: "User not found. Please start over."
        },
        { status: 400 }
      );
    }

    // Check if user is in correct state for phone verification
    if (!user.isVerified) {
      console.error("❌ Email not verified for resend OTP");
      return Response.json(
        {
          success: false,
          message: "Please complete email verification first."
        },
        { status: 400 }
      );
    }

    if (user.isPhoneVerified) {
      console.error("❌ Phone already verified for resend OTP");
      return Response.json(
        {
          success: false,
          message: "Phone number already verified."
        },
        { status: 400 }
      );
    }

    console.log("✅ Sending new phone OTP to:", user.phone);

    // Send phone OTP using Twilio
    const verification = await client.verify
      .v2.services(process.env.TWILIO_SERVICE_ID)
      .verifications.create({
        to: user.phone.startsWith("+91") ? user.phone : `+91${user.phone}`,
        channel: "sms",
      });

    console.log("✅ Phone OTP sent successfully via Twilio");

    return Response.json({
      success: true,
      message: "Phone OTP sent successfully",
    });
  } catch (error) {
    console.error("❌ Resend Phone OTP error:", error);
    
    if (error.code === 60203) {
      return Response.json(
        {
          success: false,
          message: "Too many attempts. Please try again later."
        },
        { status: 400 }
      );
    }

    return Response.json(
      { 
        success: false, 
        message: "Failed to send OTP. Please try again." 
      },
      { status: 500 }
    );
  }
}