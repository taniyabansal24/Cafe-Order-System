import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req) {
  const { phone, code } = await req.json();

  try {
    const verificationCheck = await client.verify
      .v2.services(process.env.TWILIO_SERVICE_ID)
      .verificationChecks.create({
        to: phone.startsWith("+91") ? phone : `+91${phone}`,
        code: code,
      });

    if (verificationCheck.status === "approved") {
      return Response.json({
        success: true,
        message: "Phone number verified",
      });
    } else {
      return Response.json(
        {
          success: false,
          message: "Invalid OTP",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Twilio error:", error.message);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
