import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import dbConnect from '@/lib/dbConnect';
import OrderModel from '@/model/Order';
import mongoose from 'mongoose';
import { authOptions } from '../../auth/[...nextauth]/options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user?._id;

    if (!userId) {
      console.error("❌ No user _id found in session.user:", session.user);
      return NextResponse.json({
        message: "User ID not found in session",
        sessionUser: session.user
      }, { status: 400 });
    }

    await dbConnect();

    // Convert string ID → ObjectId
    let ownerId;
    try {
      ownerId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      console.error("❌ Invalid user ID format:", userId, error);
      return NextResponse.json({
        message: "Invalid user ID format",
        userId: userId
      }, { status: 400 });
    }

    const now = new Date();

    // --- GET ALL COMPLETED ORDERS ---
    const allCompletedOrders = await OrderModel.find({
      owner: ownerId,
      status: "completed"
    })
      .select("total createdAt")
      .sort({ createdAt: -1 });

    // --- DAILY SALES ---
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    const dailyResult = await OrderModel.aggregate([
      {
        $match: {
          owner: ownerId,
          status: "completed",
          createdAt: { $gte: startOfDay, $lt: endOfDay }
        }
      },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const dailySales = dailyResult[0]?.total || 0;

    // --- MONTHLY SALES ---
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const monthlyResult = await OrderModel.aggregate([
      {
        $match: {
          owner: ownerId,
          status: "completed",
          createdAt: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const monthlySales = monthlyResult[0]?.total || 0;

    // --- ACTIVE ORDERS ---
    const activeOrders = await OrderModel.countDocuments({
      owner: ownerId,
      status: { $in: ["pending", "preparing"] }
    });

    // --- TOP SELLING ITEM ---
    const topItemResult = await OrderModel.aggregate([
      { $match: { owner: ownerId } },
      { $unwind: "$items" },
      { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" } } },
      { $sort: { quantity: -1 } },
      { $limit: 1 }
    ]);

    const topItem = topItemResult[0] || { _id: "-", quantity: 0 };

    // --- ORDERS BY STATUS ---
    const ordersByStatus = await OrderModel.aggregate([
      { $match: { owner: ownerId } },
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
        ownerId: userId,
        dateInfo: {
          currentDate: now.toISOString(),
          startOfDay: startOfDay.toISOString(),
          endOfDay: endOfDay.toISOString(),
          startOfMonth: startOfMonth.toISOString(),
          endOfMonth: endOfMonth.toISOString()
        }
      }
    });

  } catch (error) {
    console.error("❌ Metrics API Error:", error);
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}
