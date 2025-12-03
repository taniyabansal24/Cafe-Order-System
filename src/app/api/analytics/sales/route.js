import dbConnect from '@/lib/dbConnect';
import MenuItemModel from '@/model/MenuItem';
import OrderModel from '@/model/Order';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import mongoose from 'mongoose';
import { authOptions } from '../../auth/[...nextauth]/options';

export async function GET(request) {
  try {
    // Get session to identify the owner
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 });
    }

    // Get owner ID from session
    const userId = session.user?._id;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "User ID not found in session" 
      }, { status: 400 });
    }

    await dbConnect();

    // Convert to ObjectId
    const ownerId = new mongoose.Types.ObjectId(userId);
    
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'month';
    
    console.log("📊 Analytics API - Fetching data for owner:", ownerId);
    
    // Get owner's orders and menu items
    const orders = await OrderModel.find({ owner: ownerId }).sort({ createdAt: 1 });
    const menuItems = await MenuItemModel.find({ owner: ownerId });
    
    console.log("📊 Analytics API - Found orders:", orders.length);
    console.log("📊 Analytics API - Found menu items:", menuItems.length);
    
    if (orders.length === 0) {
      // Return empty structure with some default values
      const emptyAnalyticsData = getEmptyAnalyticsData();
      return NextResponse.json({
        success: true,
        data: emptyAnalyticsData,
        message: "No data found for this owner"
      });
    }
    
    // Process data for analytics
    const analyticsData = processAnalyticsData(orders, menuItems, range);
    
    return NextResponse.json({
      success: true,
      data: analyticsData
    });
    
  } catch (error) {
    console.error('❌ Error fetching sales analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Helper function for empty data
function getEmptyAnalyticsData() {
  const currentMonth = new Date().toLocaleString('default', { month: 'short' }) + ' ' + new Date().getFullYear();
  const weekNumber = getWeekNumber(new Date());
  const currentWeek = `Week ${weekNumber}, ${new Date().getFullYear()}`;
  
  return {
    revenue: {
      monthly: {
        labels: [currentMonth],
        data: [0],
        currentMonth: 0,
        previousMonth: 0,
        growth: 0
      },
      weekly: {
        labels: [currentWeek],
        data: [0],
        currentWeek: 0,
        previousWeek: 0,
        growth: 0
      }
    },
    orders: {
      total: 0,
      completed: 0,
      canceled: 0,
      avgOrderValue: 0,
      daily: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [0, 0, 0, 0, 0, 0, 0]
      },
      weekly: {
        labels: [currentWeek],
        data: [0]
      },
      distribution: {
        completed: 0,
        canceled: 0
      }
    },
    products: {
      topSelling: {
        allTime: [],
        lastMonth: [],
        lastWeek: []
      },
      weeklyComparison: {
        currentWeek: [],
        previousWeek: []
      },
      lowSelling: [],
      categories: {
        drinks: 0,
        snacks: 0,
        meals: 0
      }
    }
  };
}

function processAnalyticsData(orders, menuItems, range) {
  const completedOrders = orders.filter(order => order.status === 'completed');
  const canceledOrders = orders.filter(order => order.status === 'cancelled');
  
  // Revenue calculations
  const monthlyRevenue = calculateMonthlyRevenue(completedOrders);
  const weeklyRevenue = calculateWeeklyRevenue(completedOrders);
  
  // Product analytics
  const productAnalytics = calculateProductAnalytics(completedOrders, menuItems);
  
  // Order analytics
  const orderAnalytics = calculateOrderAnalytics(orders, completedOrders, canceledOrders);
  
  return {
    revenue: {
      monthly: monthlyRevenue,
      weekly: weeklyRevenue
    },
    orders: orderAnalytics,
    products: productAnalytics
  };
}

function calculateMonthlyRevenue(orders) {
  const monthlyData = {};
  
  orders.forEach(order => {
    const date = new Date(order.createdAt);
    const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = 0;
    }
    monthlyData[monthYear] += order.total;
  });
  
  const monthlyLabels = [];
  const monthlyRevenue = [];
  
  // Sort by date and prepare chart data
  Object.keys(monthlyData)
    .sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA - dateB;
    })
    .forEach(month => {
      monthlyLabels.push(month);
      monthlyRevenue.push(monthlyData[month]);
    });
  
  // Current vs previous month
  const currentMonthRevenue = monthlyRevenue[monthlyRevenue.length - 1] || 0;
  const previousMonthRevenue = monthlyRevenue[monthlyRevenue.length - 2] || 0;
  const monthlyGrowth = previousMonthRevenue ? 
    ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100) : 0;
  
  // Limit to last 6 months for better display
  const recentMonths = 6;
  return {
    labels: monthlyLabels.slice(-recentMonths),
    data: monthlyRevenue.slice(-recentMonths),
    currentMonth: currentMonthRevenue,
    previousMonth: previousMonthRevenue,
    growth: monthlyGrowth
  };
}

function calculateWeeklyRevenue(orders) {
  const weeklyData = {};
  
  orders.forEach(order => {
    const date = new Date(order.createdAt);
    const weekNumber = getWeekNumber(date);
    const year = date.getFullYear();
    const weekKey = `Week ${weekNumber}, ${year}`;
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = 0;
    }
    weeklyData[weekKey] += order.total;
  });
  
  const weeklyLabels = [];
  const weeklyRevenue = [];
  
  // Sort by week and prepare chart data
  Object.keys(weeklyData)
    .sort((a, b) => {
      const weekA = parseInt(a.split(' ')[1]);
      const weekB = parseInt(b.split(' ')[1]);
      const yearA = parseInt(a.split(', ')[1]);
      const yearB = parseInt(b.split(', ')[1]);
      
      if (yearA !== yearB) return yearA - yearB;
      return weekA - weekB;
    })
    .forEach(week => {
      weeklyLabels.push(week);
      weeklyRevenue.push(weeklyData[week]);
    });
  
  // Current vs previous week
  const currentWeekRevenue = weeklyRevenue[weeklyRevenue.length - 1] || 0;
  const previousWeekRevenue = weeklyRevenue[weeklyRevenue.length - 2] || 0;
  const weeklyGrowth = previousWeekRevenue ? 
    ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue * 100) : 0;
  
  // Last 8 weeks
  return {
    labels: weeklyLabels.slice(-8),
    data: weeklyRevenue.slice(-8),
    currentWeek: currentWeekRevenue,
    previousWeek: previousWeekRevenue,
    growth: weeklyGrowth
  };
}

function calculateProductAnalytics(orders, menuItems) {
  const productSales = {};
  
  // Calculate product sales
  orders.forEach(order => {
    order.items.forEach(item => {
      const productId = item.menuItemId?.toString() || item.name;
      if (!productSales[productId]) {
        productSales[productId] = {
          id: productId,
          name: item.name,
          sales: 0,
          revenue: 0,
          quantity: 0
        };
      }
      productSales[productId].sales += item.quantity;
      productSales[productId].revenue += item.price * item.quantity;
      productSales[productId].quantity += item.quantity;
    });
  });
  
  // Convert to arrays and sort
  const allTimeTopSelling = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  // Calculate last month and last week top sellers
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const lastMonthOrders = orders.filter(order => 
    new Date(order.createdAt) >= oneMonthAgo
  );
  const lastWeekOrders = orders.filter(order => 
    new Date(order.createdAt) >= oneWeekAgo
  );
  
  const lastMonthTopSelling = calculateTopSellingForPeriod(lastMonthOrders);
  const lastWeekTopSelling = calculateTopSellingForPeriod(lastWeekOrders);
  
  // Weekly comparison
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const previousWeekOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= twoWeeksAgo && orderDate < oneWeekAgo;
  });
  
  const weeklyComparison = {
    currentWeek: calculateTopSellingForPeriod(lastWeekOrders).slice(0, 5),
    previousWeek: calculateTopSellingForPeriod(previousWeekOrders).slice(0, 5)
  };
  
  // Low selling items (less than 5 orders)
  const lowSelling = Object.values(productSales)
    .filter(product => product.sales < 5)
    .map(product => ({
      name: product.name,
      orders: product.sales,
      suggestion: product.sales < 2 ? 'hide' : product.sales < 4 ? 'replace' : 'keep'
    }));
  
  // Categorize products
  const categorizedProducts = categorizeProducts(menuItems, productSales);
  
  return {
    topSelling: {
      allTime: allTimeTopSelling,
      lastMonth: lastMonthTopSelling,
      lastWeek: lastWeekTopSelling
    },
    weeklyComparison,
    lowSelling,
    categories: categorizedProducts
  };
}

function calculateTopSellingForPeriod(orders) {
  const productSales = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      const productId = item.menuItemId?.toString() || item.name;
      if (!productSales[productId]) {
        productSales[productId] = {
          name: item.name,
          sales: 0,
          revenue: 0
        };
      }
      productSales[productId].sales += item.quantity;
      productSales[productId].revenue += item.price * item.quantity;
    });
  });
  
  return Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
}

function categorizeProducts(menuItems, productSales) {
  // Use actual categories from menu items if available
  const categories = {
    drinks: 0,
    snacks: 0,
    meals: 0,
    other: 0
  };
  
  let totalRevenue = 0;
  
  // First, try to use menu item categories
  const menuItemMap = {};
  menuItems.forEach(item => {
    menuItemMap[item._id.toString()] = item;
  });
  
  Object.values(productSales).forEach(product => {
    totalRevenue += product.revenue;
    
    // Try to get category from menu item
    const menuItem = menuItemMap[product.id];
    if (menuItem && menuItem.category) {
      const category = menuItem.category.toLowerCase();
      if (category.includes('drink') || category.includes('beverage') || category.includes('coffee') || category.includes('tea')) {
        categories.drinks += product.revenue;
      } else if (category.includes('snack') || category.includes('appetizer') || category.includes('dessert')) {
        categories.snacks += product.revenue;
      } else if (category.includes('meal') || category.includes('main') || category.includes('entree') || category.includes('curry') || category.includes('rice') || category.includes('bread')) {
        categories.meals += product.revenue;
      } else {
        categories.other += product.revenue;
      }
    } else {
      // Fallback to name-based categorization
      const name = product.name.toLowerCase();
      if (name.includes('coffee') || name.includes('tea') || name.includes('cappuccino') || name.includes('cold') || name.includes('drink') || name.includes('juice') || name.includes('soda')) {
        categories.drinks += product.revenue;
      } else if (name.includes('fries') || name.includes('nuggets') || name.includes('samosa') || name.includes('brownie') || name.includes('cheesecake') || name.includes('fries') || name.includes('chips') || name.includes('snack')) {
        categories.snacks += product.revenue;
      } else if (name.includes('burger') || name.includes('pizza') || name.includes('pasta') || name.includes('rice') || name.includes('curry') || name.includes('sandwich') || name.includes('wrap') || name.includes('meal')) {
        categories.meals += product.revenue;
      } else {
        categories.other += product.revenue;
      }
    }
  });
  
  // Convert to percentages
  if (totalRevenue > 0) {
    categories.drinks = Math.round((categories.drinks / totalRevenue) * 100);
    categories.snacks = Math.round((categories.snacks / totalRevenue) * 100);
    categories.meals = Math.round((categories.meals / totalRevenue) * 100);
    categories.other = Math.round((categories.other / totalRevenue) * 100);
  }
  
  return categories;
}

function calculateOrderAnalytics(orders, completedOrders, canceledOrders) {
  const totalOrders = orders.length;
  const completedCount = completedOrders.length;
  const canceledCount = canceledOrders.length;
  
  // Average order value
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue = completedCount > 0 ? Math.round(totalRevenue / completedCount) : 0;
  
  // Daily orders (last 7 days)
  const dailyOrders = calculateDailyOrders(completedOrders);
  
  // Weekly orders (last 12 weeks)
  const weeklyOrders = calculateWeeklyOrders(completedOrders);
  
  return {
    total: totalOrders,
    completed: completedCount,
    canceled: canceledCount,
    avgOrderValue,
    daily: dailyOrders,
    weekly: weeklyOrders,
    distribution: {
      completed: completedCount,
      canceled: canceledCount
    }
  };
}

function calculateDailyOrders(orders) {
  const dailyData = {};
  const last7Days = [];
  
  // Generate last 7 days labels
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
    last7Days.push(dayLabel);
    dailyData[dayLabel] = 0;
  }
  
  // Count orders for each day
  orders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    const diffTime = today - orderDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 6) {
      const dayLabel = orderDate.toLocaleDateString('en-US', { weekday: 'short' });
      dailyData[dayLabel] = (dailyData[dayLabel] || 0) + 1;
    }
  });
  
  return {
    labels: last7Days,
    data: last7Days.map(day => dailyData[day] || 0)
  };
}

function calculateWeeklyOrders(orders) {
  const weeklyData = {};
  
  orders.forEach(order => {
    const date = new Date(order.createdAt);
    const weekNumber = getWeekNumber(date);
    const year = date.getFullYear();
    const weekKey = `Week ${weekNumber}, ${year}`;
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = 0;
    }
    weeklyData[weekKey]++;
  });
  
  const weeklyLabels = Object.keys(weeklyData).sort((a, b) => {
    const weekA = parseInt(a.split(' ')[1]);
    const weekB = parseInt(b.split(' ')[1]);
    const yearA = parseInt(a.split(', ')[1]);
    const yearB = parseInt(b.split(', ')[1]);
    
    if (yearA !== yearB) return yearA - yearB;
    return weekA - weekB;
  }).slice(-12); // Last 12 weeks
  
  const weeklyCounts = weeklyLabels.map(week => weeklyData[week]);
  
  return {
    labels: weeklyLabels,
    data: weeklyCounts
  };
}

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}