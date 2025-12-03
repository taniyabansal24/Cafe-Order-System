// app/api/verify-code/route.js
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(request) {
  await dbConnect();

  try {
    const { email, code } = await request.json();
    console.log("Email verification request - Email:", email, "Code:", code);

    const normalizedEmail = email.trim().toLowerCase();
    const user = await OwnerModel.findOne({ 
      email: normalizedEmail,
      registrationStep: 'email-verification'
    });

    if (!user) {
      console.error("User not found or wrong registration step:", normalizedEmail);
      return Response.json(
        { success: false, message: "No pending email verification found. Please sign up again." },
        { status: 400 }
      );
    }

    console.log("User found. Stored verifyCode:", user.verifyCode, "Expiry:", user.verifyCodeExpiry);

    // Check if code exists
    if (!user.verifyCode) {
      console.error("No verification code exists for user");
      return Response.json(
        {
          success: false,
          message: "No verification code exists. Please request a new one.",
        },
        { status: 400 }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (!isCodeValid) {
      console.error("Code mismatch - Input:", code, "Stored:", user.verifyCode);
      return Response.json(
        { success: false, message: "Verification code is incorrect" },
        { status: 400 }
      );
    }

    if (!isCodeNotExpired) {
      console.error("Code expired - Expiry time:", user.verifyCodeExpiry);
      return Response.json(
        {
          success: false,
          message: "Verification code has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // ✅ Your added verification update + logging section starts here
    // In your app/api/verify-code/route.js - Check the update part
    // Update user - mark email as verified and move to phone verification
    user.isVerified = true;
    user.registrationStep = 'phone-verification';
    user.verifyCode = undefined;
    user.verifyCodeExpiry = undefined;

    console.log("✅ Email verification successful, updating user:", {
      userId: user._id,
      newRegistrationStep: 'phone-verification',
      isVerified: true
    });

    await user.save();

    // Verify the update worked
    const updatedUser = await OwnerModel.findById(user._id);
    console.log("✅ User after email verification update:", {
      registrationStep: updatedUser.registrationStep,
      isVerified: updatedUser.isVerified
    });
    // ✅ Your added section ends here

    console.log("Email verified successfully, sending phone OTP...");

    // Send phone OTP using Twilio
    try {
      const verification = await client.verify
        .v2.services(process.env.TWILIO_SERVICE_ID)
        .verifications.create({
          to: user.phone.startsWith("+91") ? user.phone : `+91${user.phone}`,
          channel: "sms",
        });

      return Response.json({
        success: true,
        message: "Email verified successfully. Phone OTP sent.",
        registrationId: user._id.toString(),
        nextStep: 'verify-phone'
      });

    } catch (twilioError) {
      console.error("Twilio error:", twilioError.message);
      // Even if Twilio fails, mark email as verified but indicate phone OTP failed
      return Response.json({
        success: true,
        message: "Email verified but failed to send phone OTP. Please try again.",
        registrationId: user._id.toString(),
        nextStep: 'verify-phone',
        phoneOTPSent: false
      });
    }

  } catch (error) {
    console.error("FULL ERROR DETAILS:", error);
    return Response.json(
      {
        success: false,
        message: error.message || "Error during verification",
      },
      { status: 500 }
    );
  }
}
