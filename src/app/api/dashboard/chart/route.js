import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/model/Order";
import mongoose from 'mongoose';
import { timezone } from "@/lib/constants";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Use _id instead of id
    const userId = session.user?._id;
    
    if (!userId) {
      console.error("❌ No user _id found in session.user:", session.user);
      return NextResponse.json({ message: "User ID not found in session" }, { status: 400 });
    }

    await dbConnect();

    // Convert to ObjectId
    const ownerId = new mongoose.Types.ObjectId(userId);

    const orders = await OrderModel.aggregate([
      {
        $match: { 
          owner: ownerId,
          status: "completed" 
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: timezone,
            },
          },
          totalSales: { $sum: "$total" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const chartData = orders.map((item) => ({
      date: item._id,
      sales: item.totalSales,
      orders: item.totalOrders,
    }));

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}