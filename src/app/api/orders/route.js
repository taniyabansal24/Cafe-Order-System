// app/api/orders/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/model/Order";
import MenuItemModel from "@/model/MenuItem";

// POST: Create a new order (owner comes from session)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?._id) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await dbConnect();

    const {
      items,
      total,
      paymentStatus = "completed",
      paymentMethod = "razorpay",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      customer,
    } = await request.json();

    // Validate items
    for (const item of items) {
      const menuItem = await MenuItemModel.findById(item._id);
      if (!menuItem) {
        return NextResponse.json(
          { success: false, message: `Item ${item.name} not found` },
          { status: 400 }
        );
      }
    }

    // Owner id from session
    const ownerId = session.user._id;

    // ✅ Get next token number FOR THIS SPECIFIC OWNER
    const tokenNumber = await OrderModel.getNextTokenNumber(ownerId);

    // Prepare order items
    const orderItems = items.map((item) => ({
      menuItemId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    // FIXED: Always set status to "pending" for new orders
    const orderStatus = "pending";

    // Create order (attach owner)
    const order = await OrderModel.create({
      tokenNumber,
      items: orderItems,
      total,
      paymentStatus,
      paymentMethod,
      status: orderStatus, // Always "pending"
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      customerName: customer?.name,
      customerPhone: customer?.phone,
      customerEmail: customer?.email,
      owner: ownerId,
    });

    console.log("✅ Order created:", {
      orderId: order._id,
      tokenNumber: order.tokenNumber,
      owner: order.owner,
      status: order.status
    });

    return NextResponse.json(
      {
        success: true,
        tokenNumber: order.tokenNumber,
        orderId: order._id,
        message: "Order placed successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

// GET: Fetch orders with status filtering + pagination (owner-scoped), populate menu items
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?._id) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await dbConnect();
    const ownerId = session.user._id;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    // Build query based on status (owner-scoped)
    let query = { owner: ownerId };

    if (status && status !== "all") {
      if (status === "pending") {
        query.status = { $in: ["pending", "preparing", "ready"] };
      } else {
        query.status = status;
      }
    }

    // Get orders with pagination and populate menuItem details for each item
    const ordersQuery = OrderModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate({
        path: "items.menuItemId",
        model: "MenuItem",
        select: "_id name price description", // adjust fields as needed
      });

    const [orders, total] = await Promise.all([
      ordersQuery.lean(),
      OrderModel.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// PATCH: Update order status (owner must own the order)
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?._id) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id, status } = await request.json();

    const validStatuses = [
      "pending",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    // Ensure the owner only updates their own orders
    const ownerId = session.user._id;
    const order = await OrderModel.findOneAndUpdate(
      { _id: id, owner: ownerId },
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
