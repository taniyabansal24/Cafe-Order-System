// /app/api/qr/get/route.js

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import QrCode from "@/model/QrCode";

export async function GET(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get("ownerId");

  if (!ownerId) {
    return NextResponse.json({ error: "Missing ownerId" }, { status: 400 });
  }

  try {
    const qr = await QrCode.findOne({ ownerId });
    if (!qr) {
      return NextResponse.json({ message: "QR not found" }, { status: 404 });
    }

    return NextResponse.json({ qrUrl: qr.qrUrl });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
