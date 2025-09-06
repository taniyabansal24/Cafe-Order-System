// app/api/dashboard/metrics/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OrderModel from '@/model/Order';

export async function GET() {
  try {
    await dbConnect();

    const now = new Date();

    // --- Daily Sales (completed orders only) ---
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const dailyResult = await OrderModel.aggregate([
      { $match: { status: "completed", createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    // Remove the division by 100 - the frontend will format it
    const dailySales = dailyResult[0]?.total || 0;

    // --- Monthly Sales (completed orders only) ---
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyResult = await OrderModel.aggregate([
      { $match: { status: "completed", createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    // Remove the division by 100 - the frontend will format it
    const monthlySales = monthlyResult[0]?.total || 0;

    // --- Get ALL completed orders for debugging ---
    const allCompletedOrders = await OrderModel.find({
      status: "completed"
    }).select('total createdAt items');

    // --- Active Orders ---
    const activeOrders = await OrderModel.countDocuments({
      status: { $in: ["pending", "preparing"] },
    });

    // --- Top-Selling Item (from all orders, not just completed) ---
    const topItemResult = await OrderModel.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" } } },
      { $sort: { quantity: -1 } },
      { $limit: 1 },
    ]);
    const topItem = topItemResult[0] || { _id: "-", quantity: 0 };

    // --- Debug info: Count orders by status ---
    const ordersByStatus = await OrderModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      dailySales,
      monthlySales,
      activeOrders,
      topItem: { name: topItem._id, quantity: topItem.quantity },
      debug: { 
        ordersByStatus,
        allCompletedOrdersCount: allCompletedOrders.length,
        completedOrders: allCompletedOrders.map(order => ({
          total: order.total,
          totalInPaise: order.total, // Store as paise
          createdAt: order.createdAt,
          items: order.items
        }))
      }
    });
  } catch (error) {
    console.error('Metrics API Error:', error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}