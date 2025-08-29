import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { ownerId } = await params; // Note the await here

    if (!ownerId) {
      return NextResponse.json(
        { success: false, message: "Owner ID is required" },
        { status: 400 }
      );
    }

    const owner = await OwnerModel.findById(ownerId).select('-password -verifyCode -verifyCodeExpiry');

    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Owner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      owner: {
        cafeName: owner.cafeName,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        address: owner.address,
        city: owner.city,
        state: owner.state,
        pincode: owner.pincode
      }
    });
  } catch (error) {
    console.error("Error fetching owner:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}