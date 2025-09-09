import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/model/Order";
import { timezone } from "@/lib/constants";

export async function GET(req) {
  try {
    await dbConnect();

    // Fetch only completed orders
    const orders = await OrderModel.aggregate([
      {
        $match: { status: "completed" },
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
          totalSales: { $sum: "$total" }, // This is in paise
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format data for Recharts - convert paise to rupees
    const chartData = orders.map((item) => ({
      date: item._id,
      sales: item.totalSales, // Convert paise to rupees
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
