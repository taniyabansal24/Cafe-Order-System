// app/api/orders/fix-status/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/model/Order";

export async function GET() {
  try {
    await dbConnect();

    // Update all orders with status "preparing" to "pending"
    const result = await OrderModel.updateMany(
      { status: "preparing" },
      { $set: { status: "pending" } }
    );

    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} orders from 'preparing' to 'pending' status`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Fix orders error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}