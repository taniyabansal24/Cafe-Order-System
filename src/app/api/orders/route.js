import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/model/Order";
import MenuItemModel from "@/model/MenuItem";

// POST: Create a new order
export async function POST(request) {
  try {
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

    // Get next token number
    const tokenNumber = await OrderModel.getNextTokenNumber();

    // Prepare order items
    const orderItems = items.map((item) => ({
      menuItemId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    // FIXED: Always set status to "pending" for new orders
    const orderStatus = "pending";

    // Create order
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
    });

    return NextResponse.json({
      success: true,
      tokenNumber: order.tokenNumber,
      orderId: order._id,
      message: "Order placed successfully",
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

// GET: Fetch orders with status filtering
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await OrderModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      orders: orders || [],
    });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// PATCH: Update order status
export async function PATCH(request) {
  try {
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

    const order = await OrderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
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