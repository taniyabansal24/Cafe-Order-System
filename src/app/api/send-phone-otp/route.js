import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req) {
  const { phone } = await req.json();

  try {
    const verification = await client.verify
      .v2.services(process.env.TWILIO_SERVICE_ID)
      .verifications.create({
        to: phone.startsWith("+91") ? phone : `+91${phone}`,
         // ✅ must be in E.164 format like +919999999999
        channel: "sms",    // or "call"
      });

    return Response.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Twilio error:", error.message);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
