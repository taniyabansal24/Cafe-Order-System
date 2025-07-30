// /api/verify-code/route.js
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";

export async function POST(request) {
  await dbConnect();

  try {
    const { email, code } = await request.json();
    console.log("Verification request received - Email:", email, "Code:", code);

    const normalizedEmail = email.trim().toLowerCase();
    const user = await OwnerModel.findOne({ email: normalizedEmail });

    if (!user) {
      console.error("User not found for email:", normalizedEmail);
      return Response.json(
        { success: false, message: "Owner not found. Please sign up again." },
        { status: 400 }
      );
    }

    console.log(
      "User found. Stored verifyCode:",
      user.verifyCode,
      "Expiry:",
      user.verifyCodeExpiry
    );

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

    // Check if already verified
    if (user.isVerified) {
      return Response.json(
        { success: false, message: "Account is already verified" },
        { status: 400 }
      );
    }

    // Validate code
    if (user.verifyCode !== code) {
      return Response.json(
        { success: false, message: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > user.verifyCodeExpiry) {
      return Response.json(
        { success: false, message: "Verification code has expired" },
        { status: 400 }
      );
    }

    // Update user
    user.set({
      isVerified: true,
    });
    user.set("verifyCode", undefined, { strict: false });
    user.set("verifyCodeExpiry", undefined, { strict: false });
    await user.save();

    console.log("User verified successfully");

    return Response.json(
      { success: true, message: "Account verified successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("FULL ERROR DETAILS:", error);
    if (error.name === "MongoError") {
      console.error("MongoDB Error Details:", error.message, error.code);
    }
    return Response.json(
      {
        success: false,
        message: error.message || "Error during verification",
      },
      { status: 500 }
    );
  }
}
