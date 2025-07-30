import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail"; // adjust the path if needed

export async function sendVerificationEmail(email, name, verifyCode) {
  try {
    await resend.emails.send({
      from: 'Cafe Order System <onboarding@resend.dev>', // More professional format
      to: [email], // safer to use an array
      subject: 'Cafe-Order-System | Your Verification Code',
      react: <VerificationEmail name={name} otp={verifyCode} />, // ⬅️ important: JSX element, not a function call
    });

    return {
      success: true,
      message: 'Verification email sent successfully',
    };
  } catch (emailError) {
    console.error("❌ Error sending verification email:", emailError);
    return {
      success: false,
      message: 'Failed to send verification email',
    };
  }
}