// api/debug/orders/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/model/Order";

export async function GET() {
  try {
    await dbConnect();

    // Check if any orders exist
    const totalOrders = await OrderModel.countDocuments();
    const allOrders = await OrderModel.find({}).lean();

    return NextResponse.json({
      success: true,
      totalOrders,
      orders: allOrders,
      message: totalOrders === 0 ? "No orders found in database" : "Orders found"
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: "Database connection error"
    });
  }
}