// app/api/owner/profile/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import OwnerModel from "@/model/Owner";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?._id) {
      return Response.json({
        success: false,
        message: "Not authenticated"
      }, { status: 401 });
    }

    await dbConnect();

    const owner = await OwnerModel.findById(session.user._id).select('-password');
    
    if (!owner) {
      return Response.json({
        success: false,
        message: "Owner not found"
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      owner: {
        _id: owner._id,
        name: owner.name,
        email: owner.email,
        cafeName: owner.cafeName,
        phone: owner.phone,
        address: owner.address,
        city: owner.city,
        state: owner.state,
        pincode: owner.pincode,
        isVerified: owner.isVerified,
        isPhoneVerified: owner.isPhoneVerified
      }
    });

  } catch (error) {
    console.error("Owner profile error:", error);
    return Response.json({
      success: false,
      message: "Failed to fetch owner profile"
    }, { status: 500 });
  }
}