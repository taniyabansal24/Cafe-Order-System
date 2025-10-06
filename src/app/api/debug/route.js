// app/api/debug/route.js
import { NextResponse } from 'next/server';
import dbConnect from "@/lib/dbConnect";

export async function GET() {
  try {
    const { db } = await dbConnect();
    
    // Test if orders collection exists and has data
    const ordersCount = await db.collection('orders').countDocuments();
    const orders = await db.collection('orders').find({}).limit(5).toArray();
    
    return NextResponse.json({
      success: true,
      ordersCount,
      sampleOrders: orders,
      message: "Database connection successful"
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}