import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import OrderModel from '@/model/Order';
import mongoose from 'mongoose';
import { authOptions } from '../../auth/[...nextauth]/options';

export async function GET(request) {
  try {
    // Get session to identify the owner
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Please login to access customer insights'
      }, { status: 401 });
    }

    // Get owner ID from session
    const userId = session.user?._id;
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID not found',
        message: 'User information is missing'
      }, { status: 400 });
    }

    await dbConnect();

    // Convert to ObjectId
    const ownerId = new mongoose.Types.ObjectId(userId);
    
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'month';
    
    console.log("👥 Customer Insights API - Owner ID:", ownerId);
    
    // Calculate date range
    const startDate = new Date();
    if (range === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === 'day') {
      startDate.setDate(startDate.getDate() - 1);
    } else {
      startDate.setMonth(startDate.getMonth() - 1);
    }
    
    // Get orders for this specific owner within the time range
    const orders = await OrderModel.find({ 
      owner: ownerId, // 👈 Add owner filter
      createdAt: { $gte: startDate },
      status: { $ne: 'cancelled' }
    }).lean();

    console.log("👥 Customer Insights API - Found orders:", orders.length);

    // If no orders, return empty data
    if (orders.length === 0) {
      const emptyData = getEmptyResponse(range);
      return NextResponse.json(emptyData);
    }

    // Process customer data
    const customerMap = new Map();
    const itemFrequency = new Map(); // To track favorite items
    
    for (const order of orders) {
      // Use phone number as unique customer identifier
      const customerIdentifier = order.customerPhone || order.customerEmail || `anonymous_${order._id}`;
      
      // Track item frequency for favorite items
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const itemName = item.name || 'Unknown Item';
          if (!itemFrequency.has(itemName)) {
            itemFrequency.set(itemName, { count: 0, customers: new Map() });
          }
          const itemData = itemFrequency.get(itemName);
          itemData.count += item.quantity || 1;
          
          // Track which customers ordered this item
          if (!itemData.customers.has(customerIdentifier)) {
            itemData.customers.set(customerIdentifier, {
              name: order.customerName || 'Unknown Customer',
              count: 0
            });
          }
          const customerItemData = itemData.customers.get(customerIdentifier);
          customerItemData.count += item.quantity || 1;
        });
      }
      
      if (!customerMap.has(customerIdentifier)) {
        customerMap.set(customerIdentifier, {
          name: order.customerName || 'Unknown Customer',
          phone: order.customerPhone || 'N/A',
          email: order.customerEmail || '',
          totalSpent: 0,
          orderCount: 0,
          firstOrder: order.createdAt,
          lastOrder: order.createdAt,
          items: new Set() // Track items ordered by this customer
        });
      }
      
      const customer = customerMap.get(customerIdentifier);
      customer.totalSpent += order.total || 0;
      customer.orderCount += 1;
      
      // Track items for this customer
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item.name) customer.items.add(item.name);
        });
      }
      
      if (order.createdAt < customer.firstOrder) {
        customer.firstOrder = order.createdAt;
      }
      
      if (order.createdAt > customer.lastOrder) {
        customer.lastOrder = order.createdAt;
      }
    }
    
    const customers = Array.from(customerMap.values());
    
    // Calculate metrics
    const totalCustomers = customers.length;
    const newCustomers = customers.filter(c => c.firstOrder >= startDate).length;
    const returningCustomers = customers.filter(c => c.orderCount > 1).length;
    const repeatRate = totalCustomers > 0 ? Math.round((returningCustomers / totalCustomers) * 100) : 0;
    const avgOrdersPerCustomer = totalCustomers > 0 ? (orders.length / totalCustomers).toFixed(2) : 0;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const avgOrderValue = orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : 0;
    
    // Calculate peak times
    const timeSlots = {
      '7-9 AM': 0,
      '9-11 AM': 0,
      '11-1 PM': 0,
      '1-3 PM': 0,
      '3-5 PM': 0,
      '5-7 PM': 0,
      '7-9 PM': 0,
      '9-11 PM': 0
    };
    
    orders.forEach(order => {
      if (order.createdAt) {
        const hour = new Date(order.createdAt).getHours();
        if (hour >= 7 && hour < 9) timeSlots['7-9 AM']++;
        else if (hour >= 9 && hour < 11) timeSlots['9-11 AM']++;
        else if (hour >= 11 && hour < 13) timeSlots['11-1 PM']++;
        else if (hour >= 13 && hour < 15) timeSlots['1-3 PM']++;
        else if (hour >= 15 && hour < 17) timeSlots['3-5 PM']++;
        else if (hour >= 17 && hour < 19) timeSlots['5-7 PM']++;
        else if (hour >= 19 && hour < 21) timeSlots['7-9 PM']++;
        else if (hour >= 21 && hour < 23) timeSlots['9-11 PM']++;
      }
    });
    
    // Calculate same order percentage
    let sameOrderCount = 0;
    customers.forEach(customer => {
      if (customer.items.size === 1) sameOrderCount++;
    });
    const sameOrderPercentage = totalCustomers > 0 
      ? Math.round((sameOrderCount / totalCustomers) * 100) 
      : 0;
    
    // Prepare favorite items data
    const favoriteItems = Array.from(itemFrequency.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([itemName, itemData]) => {
        // Find the customer who ordered this item the most
        const topCustomer = Array.from(itemData.customers.entries())
          .sort((a, b) => b[1].count - a[1].count)[0];
        
        return {
          customerName: topCustomer ? topCustomer[1].name : 'Unknown Customer',
          favoriteItem: itemName,
          timesOrdered: topCustomer ? topCustomer[1].count : 0
        };
      });
    
    // Get customer growth data
    const customerGrowth = await calculateCustomerGrowth(ownerId, range);
    
    // Prepare response data
    const responseData = {
      totalCustomers,
      newCustomers,
      returningCustomers,
      repeatRate,
      avgOrdersPerCustomer: parseFloat(avgOrdersPerCustomer),
      avgOrderValue: parseFloat(avgOrderValue),
      topLoyalCustomers: customers
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5)
        .map(c => ({
          name: c.name,
          orderCount: c.orderCount,
          lastOrder: formatDateDifference(c.lastOrder)
        })),
      topSpenders: customers
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10)
        .map(c => ({
          name: c.name,
          totalSpent: c.totalSpent,
          orderCount: c.orderCount
        })),
      customerGrowth: customerGrowth,
      peakTimes: Object.entries(timeSlots)
        .filter(([_, count]) => count > 0)
        .map(([range, orders]) => ({ range, orders })),
      sameOrderPercentage,
      customerContacts: customers
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5)
        .map(c => ({
          name: c.name,
          phone: c.phone,
          email: c.email,
          orderCount: c.orderCount
        })),
      favoriteItems,
      metadata: {
        ownerId: userId,
        orderCount: orders.length,
        timeRange: range,
        dataGeneratedAt: new Date().toISOString()
      }
    };
    
    console.log("👥 Customer Insights API - Returning data for:", {
      totalCustomers,
      newCustomers,
      returningCustomers,
      repeatRate,
      orderCount: orders.length
    });
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('❌ Error in customer insights API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch customer insights',
        message: error.message
      }, 
      { status: 500 }
    );
  }
}

function getEmptyResponse(range) {
  // Generate default labels based on range
  let labels = [];
  if (range === 'week') {
    labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  } else {
    const now = new Date();
    labels = [];
    for (let i = 3; i >= 0; i--) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
    }
  }
  
  return {
    totalCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
    repeatRate: 0,
    avgOrdersPerCustomer: 0,
    avgOrderValue: 0,
    topLoyalCustomers: [],
    topSpenders: [],
    customerGrowth: {
      labels: labels,
      data: labels.map(() => 0)
    },
    peakTimes: [],
    sameOrderPercentage: 0,
    customerContacts: [],
    favoriteItems: [],
    metadata: {
      message: "No customer data available yet",
      hasData: false
    }
  };
}

function formatDateDifference(date) {
  if (!date) return 'Never';
  
  const orderDate = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now - orderDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

async function calculateCustomerGrowth(ownerId, range) {
  try {
    let labels = [];
    let data = [];
    
    if (range === 'week') {
      // Last 7 days
      labels = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      }
      
      // For each day, count unique customers
      data = await Promise.all(
        labels.map(async (label, index) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - index));
          const startOfDay = new Date(date.setHours(0, 0, 0, 0));
          const endOfDay = new Date(date.setHours(23, 59, 59, 999));
          
          const orders = await OrderModel.find({
            owner: ownerId,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: 'cancelled' }
          });
          
          // Count unique customers for this day
          const customers = new Set();
          orders.forEach(order => {
            const identifier = order.customerPhone || order.customerEmail || `anonymous_${order._id}`;
            customers.add(identifier);
          });
          
          return customers.size;
        })
      );
    } else {
      // Last 4 months
      labels = [];
      const now = new Date();
      for (let i = 3; i >= 0; i--) {
        const date = new Date();
        date.setMonth(now.getMonth() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
      }
      
      // For each month, count unique customers
      data = await Promise.all(
        labels.map(async (label, index) => {
          const date = new Date();
          const monthIndex = date.getMonth() - (3 - index);
          const year = date.getFullYear();
          const startDate = new Date(year, monthIndex, 1);
          const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
          
          const orders = await OrderModel.find({
            owner: ownerId,
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $ne: 'cancelled' }
          });
          
          // Count unique customers for this month
          const customers = new Set();
          orders.forEach(order => {
            const identifier = order.customerPhone || order.customerEmail || `anonymous_${order._id}`;
            customers.add(identifier);
          });
          
          return customers.size;
        })
      );
    }
    
    return { labels, data };
  } catch (error) {
    console.error('Error calculating customer growth:', error);
    return {
      labels: range === 'week' 
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Jan', 'Feb', 'Mar', 'Apr'],
      data: [0, 0, 0, 0]
    };
  }
}