// app/api/verify-phone-otp/route.js
import twilio from "twilio";
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req) {
  const { registrationId, code } = await req.json();

  try {
    await dbConnect();

    console.log("🔍 Phone OTP Verification Request:", {
      registrationId,
      code,
      timestamp: new Date().toISOString()
    });

    // Validate input
    if (!registrationId || !code) {
      return Response.json(
        {
          success: false,
          message: "Registration ID and OTP code are required"
        },
        { status: 400 }
      );
    }

    // Find user with multiple conditions to debug
    const user = await OwnerModel.findOne({
      _id: registrationId
    });

    console.log("🔍 User found in database:", {
      userExists: !!user,
      userId: user?._id,
      registrationStep: user?.registrationStep,
      isVerified: user?.isVerified,
      isPhoneVerified: user?.isPhoneVerified,
      email: user?.email
    });

    // Check specific conditions
    if (!user) {
      console.error("❌ User not found with registrationId:", registrationId);
      return Response.json(
        {
          success: false,
          message: "Phone verification session expired or not found. Please start over."
        },
        { status: 400 }
      );
    }

    if (user.registrationStep !== 'phone-verification') {
      console.error("❌ Wrong registration step:", user.registrationStep);
      return Response.json(
        {
          success: false,
          message: `Invalid registration step: ${user.registrationStep}. Expected: phone-verification`
        },
        { status: 400 }
      );
    }

    if (!user.isVerified) {
      console.error("❌ Email not verified");
      return Response.json(
        {
          success: false,
          message: "Email not verified. Please complete email verification first."
        },
        { status: 400 }
      );
    }

    if (user.isPhoneVerified) {
      console.error("❌ Phone already verified");
      return Response.json(
        {
          success: false,
          message: "Phone number already verified."
        },
        { status: 400 }
      );
    }

    console.log("✅ User validation passed, verifying OTP with Twilio...");

    // Verify phone OTP with Twilio
    const verificationCheck = await client.verify
      .v2.services(process.env.TWILIO_SERVICE_ID)
      .verificationChecks.create({
        to: user.phone.startsWith("+91") ? user.phone : `+91${user.phone}`,
        code: code,
      });

    console.log("📱 Twilio verification response:", verificationCheck.status);

    if (verificationCheck.status === "approved") {
      // Complete registration - mark user as fully verified
      user.isPhoneVerified = true;
      user.registrationStep = 'completed';
      await user.save();

      console.log("✅ Phone verification completed successfully for user:", user.email);

      return Response.json({
        success: true,
        message: "Phone number verified and registration completed successfully! You can now sign in.",
      });
    } else {
      console.error("❌ Invalid OTP from Twilio");
      return Response.json(
        {
          success: false,
          message: "Invalid OTP. Please check the code and try again."
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("❌ Phone OTP verification error:", error);
    
    // Handle specific Twilio errors
    if (error.code === 20404 || error.message.includes('Verification check was not found')) {
      return Response.json(
        {
          success: false,
          message: "Invalid OTP or OTP has expired. Please request a new one."
        },
        { status: 400 }
      );
    }
    
    if (error.code === 60200 || error.message.includes('Invalid parameter')) {
      return Response.json(
        {
          success: false,
          message: "Invalid OTP format. Please enter a 6-digit code."
        },
        { status: 400 }
      );
    }

    return Response.json(
      { 
        success: false, 
        message: "Verification failed. Please try again." 
      },
      { status: 500 }
    );
  }
}