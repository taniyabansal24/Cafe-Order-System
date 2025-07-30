import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import OwnerModel from "@/model/Owner";
import MenuItemModel from "@/model/MenuItem";
import dbConnect from "@/lib/dbConnect";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET() {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const owner = await OwnerModel.findOne({ email: session.user.email });
    if (!owner) {
      return NextResponse.json({ message: "Owner not found" }, { status: 404 });
    }

    const items = await MenuItemModel.find({ owner: owner._id }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, items }, { status: 200 });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
