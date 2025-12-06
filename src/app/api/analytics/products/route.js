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
    const threshold = parseInt(searchParams.get('threshold')) || 5;
    
    console.log("📊 Product Analytics API - Fetching data for owner:", ownerId);
    console.log("📊 Low selling threshold:", threshold);
    
    // Get owner's orders and menu items
    const orders = await OrderModel.find({ 
      owner: ownerId,
      status: 'completed' 
    }).sort({ createdAt: 1 });
    
    const menuItems = await MenuItemModel.find({ owner: ownerId });
    
    console.log("📊 Product Analytics API - Found completed orders:", orders.length);
    console.log("📊 Product Analytics API - Found menu items:", menuItems.length);
    
    if (orders.length === 0 || menuItems.length === 0) {
      // Return empty structure with some default values
      const emptyProductData = getEmptyProductData();
      return NextResponse.json({
        success: true,
        data: emptyProductData,
        message: "No product data found for this owner"
      });
    }
    
    // Process data for product analytics
    const productData = processProductData(orders, menuItems, range, threshold);
    
    return NextResponse.json({
      success: true,
      data: productData
    });
    
  } catch (error) {
    console.error('❌ Error fetching product analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Helper function for empty data
function getEmptyProductData() {
  return {
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
      meals: 0,
      other: 0
    },
    summary: {
      totalProducts: 0,
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      topCategory: "None"
    }
  };
}

function processProductData(orders, menuItems, range, threshold) {
  // Calculate product analytics
  const productAnalytics = calculateProductAnalytics(orders, menuItems, threshold);
  
  // Calculate summary statistics
  const summary = calculateSummary(orders, menuItems, productAnalytics);
  
  return {
    ...productAnalytics,
    summary
  };
}

function calculateProductAnalytics(orders, menuItems, threshold) {
  const productSales = {};
  const menuItemMap = {};
  
  // Create a map for quick menu item lookup
  menuItems.forEach(item => {
    menuItemMap[item._id.toString()] = {
      name: item.name,
      price: item.price,
      category: item.category || 'other'
    };
  });
  
  // Calculate product sales from completed orders
  orders.forEach(order => {
    order.items.forEach(item => {
      const productId = item.menuItemId?.toString();
      if (!productId) return;
      
      const menuItem = menuItemMap[productId];
      if (!menuItem) return;
      
      if (!productSales[productId]) {
        productSales[productId] = {
          id: productId,
          name: menuItem.name,
          price: menuItem.price,
          orders: 0,
          quantity: 0,
          revenue: 0,
          category: menuItem.category
        };
      }
      
      productSales[productId].orders += 1;
      productSales[productId].quantity += item.quantity || 1;
      productSales[productId].revenue += item.price * (item.quantity || 1);
    });
  });
  
  console.log("📊 Product sales calculated:", Object.keys(productSales).length);
  
  // Convert to arrays and sort by revenue
  const allProducts = Object.values(productSales);
  const allTimeTopSelling = [...allProducts]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 15);
  
  // Calculate time-based analytics
  const timeAnalytics = calculateTimeBasedAnalytics(orders, menuItemMap);
  
  // Calculate low selling products
  const lowSelling = calculateLowSellingProducts(allProducts, threshold);
  
  console.log("📊 Low selling products found:", lowSelling.length);
  
  // Categorize products - USING THE SAME LOGIC AS SALES API
  const categorizedProducts = categorizeProducts(menuItems, productSales);
  
  return {
    topSelling: {
      allTime: allTimeTopSelling,
      lastMonth: timeAnalytics.lastMonthTopSelling,
      lastWeek: timeAnalytics.lastWeekTopSelling
    },
    weeklyComparison: timeAnalytics.weeklyComparison,
    lowSelling: lowSelling,
    categories: categorizedProducts
  };
}

function calculateTimeBasedAnalytics(orders, menuItemMap) {
  const now = new Date();
  
  // Last month (30 days ago)
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  
  // Last week (7 days ago)
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  // Two weeks ago (for previous week comparison)
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  // Filter orders by time periods
  const lastMonthOrders = orders.filter(order => 
    new Date(order.createdAt) >= oneMonthAgo
  );
  
  const lastWeekOrders = orders.filter(order => 
    new Date(order.createdAt) >= oneWeekAgo
  );
  
  const previousWeekOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= twoWeeksAgo && orderDate < oneWeekAgo;
  });
  
  // Calculate sales for each period
  const lastMonthSales = calculateSalesForPeriod(lastMonthOrders, menuItemMap);
  const lastWeekSales = calculateSalesForPeriod(lastWeekOrders, menuItemMap);
  const previousWeekSales = calculateSalesForPeriod(previousWeekOrders, menuItemMap);
  
  // Get top sellers for each period
  const lastMonthTopSelling = lastMonthSales
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
    
  const lastWeekTopSelling = lastWeekSales
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  // Prepare weekly comparison data
  const weeklyComparison = prepareWeeklyComparison(lastWeekSales, previousWeekSales);
  
  return {
    lastMonthTopSelling,
    lastWeekTopSelling,
    weeklyComparison
  };
}

function calculateSalesForPeriod(orders, menuItemMap) {
  const periodSales = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      const productId = item.menuItemId?.toString();
      if (!productId) return;
      
      const menuItem = menuItemMap[productId];
      if (!menuItem) return;
      
      if (!periodSales[productId]) {
        periodSales[productId] = {
          id: productId,
          name: menuItem.name,
          sales: 0,
          revenue: 0,
          quantity: 0
        };
      }
      
      periodSales[productId].sales += 1;
      periodSales[productId].quantity += item.quantity || 1;
      periodSales[productId].revenue += item.price * (item.quantity || 1);
    });
  });
  
  return Object.values(periodSales);
}

function prepareWeeklyComparison(currentWeekSales, previousWeekSales) {
  // Take top 8 products from current week
  const currentWeekTop = currentWeekSales
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);
  
  // Create a map for previous week sales
  const previousWeekMap = {};
  previousWeekSales.forEach(product => {
    previousWeekMap[product.id] = product;
  });
  
  // Prepare arrays for chart data
  const currentWeekData = [];
  const previousWeekData = [];
  
  currentWeekTop.forEach(product => {
    currentWeekData.push({
      id: product.id,
      name: product.name,
      sales: product.sales,
      revenue: product.revenue
    });
    
    const previousWeekProduct = previousWeekMap[product.id];
    if (previousWeekProduct) {
      previousWeekData.push({
        id: product.id,
        name: product.name,
        sales: previousWeekProduct.sales,
        revenue: previousWeekProduct.revenue
      });
    } else {
      previousWeekData.push({
        id: product.id,
        name: product.name,
        sales: 0,
        revenue: 0
      });
    }
  });
  
  return {
    currentWeek: currentWeekData,
    previousWeek: previousWeekData
  };
}

function calculateLowSellingProducts(allProducts, threshold) {
  // First, find products that have fewer orders than the threshold
  const lowSellingProducts = allProducts
    .filter(product => product.orders < threshold)
    .sort((a, b) => a.orders - b.orders);
  
  console.log("📊 Filtering low selling with threshold:", threshold);
  console.log("📊 Products with orders < threshold:", lowSellingProducts.length);
  
  // Add suggestion based on order count
  return lowSellingProducts.map(product => {
    let suggestion;
    
    if (product.orders === 0) {
      suggestion = 'hide';
    } else if (product.orders <= Math.floor(threshold * 0.3)) {
      suggestion = 'consider replacing';
    } else if (product.orders <= Math.floor(threshold * 0.6)) {
      suggestion = 'promote';
    } else {
      suggestion = 'keep';
    }
    
    return {
      ...product,
      suggestion
    };
  });
}

// THIS IS THE FIXED CATEGORIZATION FUNCTION - USING SAME LOGIC AS SALES API
function categorizeProducts(menuItems, productSales) {
  console.log("📊 Categorizing products...");
  console.log("📊 Menu items:", menuItems.length);
  console.log("📊 Product sales:", Object.keys(productSales).length);
  
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
  
  console.log("📊 Menu item map created with", Object.keys(menuItemMap).length, "items");
  
  Object.values(productSales).forEach(product => {
    totalRevenue += product.revenue;
    
    // Try to get category from menu item
    const menuItem = menuItemMap[product.id];
    let category = 'other';
    
    if (menuItem && menuItem.category) {
      // Use the category from the menu item
      const menuItemCategory = menuItem.category.toLowerCase();
      
      if (menuItemCategory.includes('drink') || menuItemCategory.includes('beverage') || 
          menuItemCategory.includes('coffee') || menuItemCategory.includes('tea') ||
          menuItemCategory.includes('juice') || menuItemCategory.includes('soda') ||
          menuItemCategory.includes('shake') || menuItemCategory.includes('cold')) {
        category = 'drinks';
      } else if (menuItemCategory.includes('snack') || menuItemCategory.includes('appetizer') || 
                 menuItemCategory.includes('dessert') || menuItemCategory.includes('cake') ||
                 menuItemCategory.includes('brownie') || menuItemCategory.includes('cookie') ||
                 menuItemCategory.includes('chips') || menuItemCategory.includes('fries')) {
        category = 'snacks';
      } else if (menuItemCategory.includes('meal') || menuItemCategory.includes('main') || 
                 menuItemCategory.includes('entree') || menuItemCategory.includes('curry') || 
                 menuItemCategory.includes('rice') || menuItemCategory.includes('bread') ||
                 menuItemCategory.includes('pizza') || menuItemCategory.includes('burger') ||
                 menuItemCategory.includes('pasta') || menuItemCategory.includes('sandwich') ||
                 menuItemCategory.includes('wrap') || menuItemCategory.includes('thali') ||
                 menuItemCategory.includes('roti') || menuItemCategory.includes('naan') ||
                 menuItemCategory.includes('biryani')) {
        category = 'meals';
      } else {
        category = 'other';
      }
    } else {
      // Fallback to name-based categorization (same as sales API)
      const name = product.name.toLowerCase();
      
      if (name.includes('coffee') || name.includes('tea') || name.includes('cappuccino') || 
          name.includes('latte') || name.includes('cold') || name.includes('drink') || 
          name.includes('juice') || name.includes('soda') || name.includes('shake') ||
          name.includes('milk') || name.includes('water') || name.includes('smoothie')) {
        category = 'drinks';
      } else if (name.includes('fries') || name.includes('nuggets') || name.includes('samosa') || 
                 name.includes('brownie') || name.includes('cheesecake') || name.includes('chips') || 
                 name.includes('snack') || name.includes('appetizer') || name.includes('dessert') ||
                 name.includes('cake') || name.includes('cookie') || name.includes('pastry') ||
                 name.includes('muffin') || name.includes('doughnut') || name.includes('pie')) {
        category = 'snacks';
      } else if (name.includes('burger') || name.includes('pizza') || name.includes('pasta') || 
                 name.includes('rice') || name.includes('curry') || name.includes('sandwich') || 
                 name.includes('wrap') || name.includes('meal') || name.includes('thali') ||
                 name.includes('roti') || name.includes('naan') || name.includes('biryani') ||
                 name.includes('paratha') || name.includes('kulcha') || name.includes('pulao') ||
                 name.includes('soup') || name.includes('salad') || name.includes('taco') ||
                 name.includes('burrito') || name.includes('steak') || name.includes('chicken')) {
        category = 'meals';
      } else {
        category = 'other';
      }
    }
    
    // Add revenue to the appropriate category
    if (category === 'drinks') {
      categories.drinks += product.revenue;
    } else if (category === 'snacks') {
      categories.snacks += product.revenue;
    } else if (category === 'meals') {
      categories.meals += product.revenue;
    } else {
      categories.other += product.revenue;
    }
  });
  
  console.log("📊 Category totals before percentage:", categories);
  console.log("📊 Total revenue:", totalRevenue);
  
  // Convert to percentages
  if (totalRevenue > 0) {
    categories.drinks = Math.round((categories.drinks / totalRevenue) * 100);
    categories.snacks = Math.round((categories.snacks / totalRevenue) * 100);
    categories.meals = Math.round((categories.meals / totalRevenue) * 100);
    categories.other = Math.round((categories.other / totalRevenue) * 100);
  }
  
  console.log("📊 Final categories:", categories);
  
  return categories;
}

function calculateSummary(orders, menuItems, productAnalytics) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  
  // Find top category
  const categories = productAnalytics.categories;
  let topCategory = "None";
  let topPercentage = 0;
  
  Object.entries(categories).forEach(([category, percentage]) => {
    if (percentage > topPercentage) {
      topPercentage = percentage;
      topCategory = category.charAt(0).toUpperCase() + category.slice(1);
    }
  });
  
  return {
    totalProducts: menuItems.length,
    totalRevenue,
    totalOrders,
    avgOrderValue,
    topCategory,
    topCategoryPercentage: topPercentage
  };
}