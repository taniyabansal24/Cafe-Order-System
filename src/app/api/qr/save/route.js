import { NextResponse } from "next/server";
import QrCode from "@/model/QrCode";
import dbConnect from "@/lib/dbConnect";

export async function POST(req) {
  try {
    await dbConnect();
    const { ownerId, qrUrl } = await req.json();

    if (!ownerId || !qrUrl) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Check if QR already exists
    const existing = await QrCode.findOne({ ownerId });
    if (existing) {
      existing.qrUrl = qrUrl; // ✅ Update qrUrl if already exists
      await existing.save();
      return NextResponse.json({ message: "QR updated" });
    }

    const newQr = new QrCode({
      ownerId,
      qrUrl,
    });

    await newQr.save();

    return NextResponse.json({ message: "QR saved successfully" });
  } catch (error) {
    console.error("QR save error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
