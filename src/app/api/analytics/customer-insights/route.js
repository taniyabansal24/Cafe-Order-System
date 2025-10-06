// app/api/analytics/customer-insights/route.js

import { NextResponse } from 'next/server';
import dbConnect from "@/lib/dbConnect";
import OrderModel from '@/model/Order';
 // Assuming you have an Order model

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'month';
    
    await dbConnect();
    
    // Calculate date range
    const startDate = new Date();
    if (range === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === 'day') {
      startDate.setDate(startDate.getDate() - 1);
    } else {
      startDate.setMonth(startDate.getMonth() - 1);
    }
    
    // Get all orders within the time range
    const orders = await OrderModel.find({ 
      createdAt: { $gte: startDate },
      status: { $ne: 'cancelled' }
    }).lean();

    // If no orders, return empty data
    if (orders.length === 0) {
      return NextResponse.json(getEmptyResponse());
    }

    // Process customer data
    const customerMap = new Map();
    const itemFrequency = new Map(); // To track favorite items
    
    for (const order of orders) {
      if (!order.customerPhone) continue;
      
      const phone = order.customerPhone;
      
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
          if (!itemData.customers.has(phone)) {
            itemData.customers.set(phone, {
              name: order.customerName || 'Unknown Customer',
              count: 0
            });
          }
          const customerItemData = itemData.customers.get(phone);
          customerItemData.count += item.quantity || 1;
        });
      }
      
      if (!customerMap.has(phone)) {
        customerMap.set(phone, {
          name: order.customerName || 'Unknown Customer',
          phone: order.customerPhone,
          email: order.customerEmail || '',
          totalSpent: 0,
          orderCount: 0,
          firstOrder: order.createdAt,
          lastOrder: order.createdAt,
          items: new Set() // Track items ordered by this customer
        });
      }
      
      const customer = customerMap.get(phone);
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
    
    // Calculate peak times (assuming orders have a createdAt field with time)
    const timeSlots = {
      '8-10 AM': 0,
      '10-12 PM': 0,
      '12-2 PM': 0,
      '2-4 PM': 0,
      '4-6 PM': 0,
      '6-8 PM': 0,
      '8-10 PM': 0,
      '10-12 AM': 0
    };
    
    orders.forEach(order => {
      if (order.createdAt) {
        const hour = new Date(order.createdAt).getHours();
        if (hour >= 8 && hour < 10) timeSlots['8-10 AM']++;
        else if (hour >= 10 && hour < 12) timeSlots['10-12 PM']++;
        else if (hour >= 12 && hour < 14) timeSlots['12-2 PM']++;
        else if (hour >= 14 && hour < 16) timeSlots['2-4 PM']++;
        else if (hour >= 16 && hour < 18) timeSlots['4-6 PM']++;
        else if (hour >= 18 && hour < 20) timeSlots['6-8 PM']++;
        else if (hour >= 20 && hour < 22) timeSlots['8-10 PM']++;
        else timeSlots['10-12 AM']++;
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
        .slice(0, 5)
        .map(c => ({
          name: c.name,
          totalSpent: c.totalSpent,
          orderCount: c.orderCount
        })),
      customerGrowth: calculateCustomerGrowth(customers, range),
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
      favoriteItems
    };
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error in customer insights API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch customer insights',
        message: error.message
      }, 
      { status: 500 }
    );
  }
}

function getEmptyResponse() {
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
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      data: [0, 0, 0, 0]
    },
    peakTimes: [],
    sameOrderPercentage: 0,
    customerContacts: [],
    favoriteItems: []
  };
}

function formatDateDifference(date) {
  const now = new Date();
  const timestamp = date instanceof Date ? date.getTime() : date;
  const nowTimestamp = now.getTime();
  const diffTime = Math.abs(nowTimestamp - timestamp);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function calculateCustomerGrowth(customers, range) {
  // This is a simplified implementation
  // You might want to query the database for actual historical data
  const labels = range === 'week' 
    ? ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']
    : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  
  // Simple linear distribution for demo purposes
  const data = [];
  for (let i = 0; i < labels.length; i++) {
    data.push(Math.floor(customers.length * (i + 1) / labels.length));
  }
  
  return { labels, data };
}