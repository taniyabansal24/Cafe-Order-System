// analytics/product-analytics/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  ShoppingBag,
  BarChart3,
  PieChart,
  Target,
  Crown,
  Award,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Coffee,
  Utensils,
  Pizza,
  DollarSign,
  ShoppingCart,
  Percent,
  Star,
  Filter,
  Search,
} from "lucide-react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Fallback mock data
const mockProductData = {
  topSelling: {
    allTime: [
      {
        id: "1",
        name: "Cappuccino",
        price: 200,
        orders: 156,
        quantity: 234,
        revenue: 46800,
        category: "drinks",
      },
      {
        id: "2",
        name: "Chocolate Brownie",
        price: 200,
        orders: 128,
        quantity: 192,
        revenue: 38400,
        category: "snacks",
      },
      {
        id: "3",
        name: "Margherita Pizza",
        price: 300,
        orders: 112,
        quantity: 168,
        revenue: 50400,
        category: "meals",
      },
      {
        id: "4",
        name: "Latte",
        price: 200,
        orders: 98,
        quantity: 147,
        revenue: 29400,
        category: "drinks",
      },
      {
        id: "5",
        name: "Garlic Bread",
        price: 150,
        orders: 87,
        quantity: 130,
        revenue: 19500,
        category: "snacks",
      },
    ],
    lastMonth: [
      {
        id: "1",
        name: "Cappuccino",
        price: 200,
        orders: 45,
        quantity: 67,
        revenue: 13400,
        category: "drinks",
      },
      {
        id: "2",
        name: "Chocolate Brownie",
        price: 200,
        orders: 38,
        quantity: 57,
        revenue: 11400,
        category: "snacks",
      },
      {
        id: "3",
        name: "Margherita Pizza",
        price: 300,
        orders: 32,
        quantity: 48,
        revenue: 14400,
        category: "meals",
      },
    ],
    lastWeek: [
      {
        id: "1",
        name: "Cappuccino",
        price: 200,
        orders: 12,
        quantity: 18,
        revenue: 3600,
        category: "drinks",
      },
      {
        id: "2",
        name: "Chocolate Brownie",
        price: 200,
        orders: 10,
        quantity: 15,
        revenue: 3000,
        category: "snacks",
      },
      {
        id: "3",
        name: "Latte",
        price: 200,
        orders: 8,
        quantity: 12,
        revenue: 2400,
        category: "drinks",
      },
    ],
  },
  weeklyComparison: {
    currentWeek: [
      { id: "1", name: "Cappuccino", sales: 12, revenue: 3600 },
      { id: "2", name: "Brownie", sales: 10, revenue: 3000 },
      { id: "3", name: "Latte", sales: 8, revenue: 2400 },
      { id: "4", name: "Pizza", sales: 6, revenue: 1800 },
      { id: "5", name: "Tea", sales: 5, revenue: 1000 },
    ],
    previousWeek: [
      { id: "1", name: "Cappuccino", sales: 10, revenue: 3000 },
      { id: "2", name: "Brownie", sales: 8, revenue: 2400 },
      { id: "3", name: "Latte", sales: 7, revenue: 2100 },
      { id: "4", name: "Pizza", sales: 5, revenue: 1500 },
      { id: "5", name: "Tea", sales: 4, revenue: 800 },
    ],
  },
  lowSelling: [
    {
      id: "6",
      name: "Green Tea",
      price: 100,
      orders: 3,
      quantity: 5,
      revenue: 500,
      category: "drinks",
      suggestion: "hide",
    },
    {
      id: "7",
      name: "Salad",
      price: 200,
      orders: 4,
      quantity: 6,
      revenue: 1200,
      category: "meals",
      suggestion: "consider replacing",
    },
    {
      id: "8",
      name: "Smoothie",
      price: 200,
      orders: 5,
      quantity: 8,
      revenue: 1600,
      category: "drinks",
      suggestion: "promote",
    },
    {
      id: "9",
      name: "Cookie",
      price: 100,
      orders: 6,
      quantity: 9,
      revenue: 900,
      category: "snacks",
      suggestion: "keep",
    },
  ],
  categories: {
    drinks: 45,
    snacks: 30,
    meals: 25,
    other: 0,
  },
  summary: {
    totalProducts: 25,
    totalRevenue: 150000,
    totalOrders: 750,
    avgOrderValue: 200,
    topCategory: "Drinks",
    topCategoryPercentage: 45,
  },
};

export default function ProductAnalytics() {
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("week");
  const [useMockData, setUseMockData] = useState(false);
  const [lowSalesThreshold, setLowSalesThreshold] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const fetchProductData = useCallback (async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/analytics/products?range=${timeRange}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch product data");
      }

      setProductData(result.data);
      setUseMockData(false);
    } catch (error) {
      console.error("Error fetching product data:", error);
      setError(error.message);
      setProductData(mockProductData);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  },[timeRange]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-lg font-medium">Loading product analytics...</p>
        <p className="text-sm text-muted-foreground">
          Analyzing product performance
        </p>
      </div>
    );
  };

  // Check if there's actual data
  const hasActualData =
    productData &&
    (productData.topSelling?.allTime?.length > 0 ||
      productData.summary?.totalProducts > 0);

  if (!hasActualData && !useMockData) {
    return (
      <div className="container mx-auto py-6 px-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <ShoppingBag className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Product Analytics
                </h1>
                <p className="text-muted-foreground">
                  Detailed analysis of product performance and sales trends
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeRange === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("week")}
              className={
                timeRange === "week"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-600"
                  : ""
              }
            >
              Weekly
            </Button>
            <Button
              variant={timeRange === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("month")}
              className={
                timeRange === "month"
                  ? "bg-gradient-to-r from-purple-500 to-pink-600"
                  : ""
              }
            >
              Monthly
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <Package className="h-10 w-10 text-purple-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No Product Data Yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Start by adding products and completing orders to see product
                  analytics here.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/menu")}
                  className="mt-4"
                >
                  Go to Menu
                </Button>
                <Button
                  variant="default"
                  onClick={() => (window.location.href = "/products/add")}
                  className="mt-4 bg-gradient-to-r from-purple-500 to-pink-600"
                >
                  Add Products
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const weeklyComparisonData = {
    labels: productData.weeklyComparison.currentWeek.map((p) => p.name),
    datasets: [
      {
        label: "This Week",
        data: productData.weeklyComparison.currentWeek.map((p) => p.sales),
        backgroundColor: "rgba(136, 84, 208, 0.8)",
        borderColor: "rgb(136, 84, 208)",
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: "Last Week",
        data: productData.weeklyComparison.previousWeek.map((p) => p.sales),
        backgroundColor: "rgba(156, 163, 175, 0.8)",
        borderColor: "rgb(156, 163, 175)",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const categoryPerformanceData = {
    labels: ["Drinks", "Snacks", "Meals", "Other"],
    datasets: [
      {
        data: [
          productData.categories.drinks || 0,
          productData.categories.snacks || 0,
          productData.categories.meals || 0,
          productData.categories.other || 0,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(156, 163, 175, 0.8)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(245, 158, 11)",
          "rgb(16, 185, 129)",
          "rgb(156, 163, 175)",
        ],
        borderWidth: 3,
      },
    ],
  };

  // Chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
            family: "'Inter', sans-serif",
          },
          color: "var(--muted-foreground)",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: "var(--muted-foreground)",
        },
      },
    },
  };

  const getSuggestionColor = (suggestion) => {
    switch (suggestion?.toLowerCase()) {
      case "hide":
        return "bg-gradient-to-r from-red-500 to-red-600";
      case "consider replacing":
        return "bg-gradient-to-r from-amber-500 to-amber-600";
      case "promote":
        return "bg-gradient-to-r from-blue-500 to-cyan-600";
      case "keep":
        return "bg-gradient-to-r from-green-500 to-green-600";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  const getSuggestionIcon = (suggestion) => {
    switch (suggestion?.toLowerCase()) {
      case "hide":
        return <EyeOff className="h-4 w-4" />;
      case "consider replacing":
        return <RefreshCw className="h-4 w-4" />;
      case "promote":
        return <TrendingUp className="h-4 w-4" />;
      case "keep":
        return <Eye className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "drinks":
        return <Coffee className="h-4 w-4" />;
      case "snacks":
        return <Utensils className="h-4 w-4" />;
      case "meals":
        return <Pizza className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case "drinks":
        return "text-blue-600 dark:text-blue-400";
      case "snacks":
        return "text-amber-600 dark:text-amber-400";
      case "meals":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getCategoryBgColor = (category) => {
    switch (category?.toLowerCase()) {
      case "drinks":
        return "bg-blue-100 dark:bg-blue-900/30";
      case "snacks":
        return "bg-amber-100 dark:bg-amber-900/30";
      case "meals":
        return "bg-green-100 dark:bg-green-900/30";
      default:
        return "bg-gray-100 dark:bg-gray-900/30";
    }
  };

  // Filter products based on search and category
  const filteredLowSelling = productData.lowSelling.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" ||
      (product.category && product.category.toLowerCase() === filterCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <ShoppingBag className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Product Analytics
              </h1>
              <p className="text-muted-foreground">
                Analyze product performance, sales trends, and category
                distribution
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("week")}
            className={
              timeRange === "week"
                ? "bg-gradient-to-r from-blue-500 to-cyan-600"
                : ""
            }
          >
            <Calendar className="h-3 w-3 mr-1" />
            Weekly
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("month")}
            className={
              timeRange === "month"
                ? "bg-gradient-to-r from-purple-500 to-pink-600"
                : ""
            }
          >
            <Calendar className="h-3 w-3 mr-1" />
            Monthly
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProductData}
            disabled={loading}
            className="gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                Failed to load product data
              </h3>
              <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                {useMockData
                  ? "Showing demo data instead."
                  : "Please try again later."}
              </p>
            </div>
          </div>
        </div>
      )}

      {useMockData && (
        <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-800/20 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-400">
                Demo Mode
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                Currently showing sample product data as the server is
                unavailable.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
              Total Products
            </CardTitle>
            <div className="p-2 rounded-full bg-purple-500/20">
              <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-800 dark:text-purple-300">
              {productData.summary?.totalProducts || 0}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Analyzed in system
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Total Revenue
            </CardTitle>
            <div className="p-2 rounded-full bg-blue-500/20">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800 dark:text-blue-300">
              ₹{productData.summary?.totalRevenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              From product sales
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
              Avg Order Value
            </CardTitle>
            <div className="p-2 rounded-full bg-green-500/20">
              <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800 dark:text-green-300">
              ₹{productData.summary?.avgOrderValue || 0}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Average per order
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Top Category
            </CardTitle>
            <div className="p-2 rounded-full bg-amber-500/20">
              <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-800 dark:text-amber-300">
              {productData.summary?.topCategory || "None"}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {productData.summary?.topCategoryPercentage || 0}% of revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Product Analytics */}
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl p-1">
        <Tabs defaultValue="topSelling" className="space-y-4">
          <TabsList className="grid grid-cols-4 mb-6 bg-transparent">
            <TabsTrigger
              value="topSelling"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
            >
              <Crown className="h-4 w-4 mr-2" />
              Top Selling
            </TabsTrigger>
            <TabsTrigger
              value="weeklyComparison"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Comparison
            </TabsTrigger>
            <TabsTrigger
              value="lowSelling"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Low Selling
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
            >
              <Target className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topSelling" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-3">
              {/* All Time Top Sellers */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 dark:from-yellow-900/30 dark:to-yellow-800/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      All Time Top Sellers
                    </CardTitle>
                    <Badge className="bg-yellow-500 hover:bg-yellow-600">
                      Gold
                    </Badge>
                  </div>
                  <CardDescription>Based on total revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  {productData.topSelling.allTime.length > 0 ? (
                    <div className="space-y-4">
                      {productData.topSelling.allTime
                        .slice(0, 8)
                        .map((product, index) => (
                          <div
                            key={product.id || index}
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${getCategoryBgColor(product.category)}`}
                              >
                                {getCategoryIcon(product.category)}
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <div className="flex gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {product.quantity} sold
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getCategoryColor(product.category)}`}
                                  >
                                    {product.category || "other"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">
                                ₹{product.revenue?.toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {product.orders} orders
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No top selling products data
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Last Month Top Sellers */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-900/30 dark:to-blue-800/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      Last Month Top Sellers
                    </CardTitle>
                    <Badge className="bg-blue-500 hover:bg-blue-600">
                      Monthly
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {productData.topSelling.lastMonth.length > 0 ? (
                    <div className="space-y-4">
                      {productData.topSelling.lastMonth
                        .slice(0, 5)
                        .map((product, index) => (
                          <div
                            key={product.id || index}
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-900 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <div className="flex gap-4 mt-1">
                                <p className="text-sm text-muted-foreground">
                                  {product.orders} orders
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {product.quantity} units
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-blue-500/20 text-blue-700 dark:text-blue-400"
                            >
                              ₹{product.revenue?.toLocaleString()}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No last month data
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Last Week Top Sellers */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-600/10 dark:from-green-900/30 dark:to-green-800/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-500" />
                      Last Week Top Sellers
                    </CardTitle>
                    <Badge className="bg-green-500 hover:bg-green-600">
                      Weekly
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {productData.topSelling.lastWeek.length > 0 ? (
                    <div className="space-y-4">
                      {productData.topSelling.lastWeek
                        .slice(0, 5)
                        .map((product, index) => (
                          <div
                            key={product.id || index}
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-white dark:from-green-900/10 dark:to-gray-900 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <div className="flex gap-4 mt-1">
                                <p className="text-sm text-muted-foreground">
                                  {product.orders} orders
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {product.quantity} units
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline">
                              ₹{product.revenue?.toLocaleString()}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No last week data
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="weeklyComparison" className="space-y-4">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 dark:from-purple-900/30 dark:to-purple-800/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    Weekly Product Comparison
                  </CardTitle>
                  <Badge className="bg-purple-500 hover:bg-purple-600">
                    Week-over-Week
                  </Badge>
                </div>
                <CardDescription>
                  Compare product performance between this week and last week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  {productData.weeklyComparison.currentWeek.length > 0 ? (
                    <Bar
                      data={weeklyComparisonData}
                      options={barChartOptions}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No weekly comparison data available
                    </div>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">This Week Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Products Sold:</span>
                        <span className="font-medium">
                          {productData.weeklyComparison.currentWeek.reduce(
                            (sum, p) => sum + p.sales,
                            0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Revenue:</span>
                        <span className="font-medium">
                          ₹
                          {productData.weeklyComparison.currentWeek
                            .reduce((sum, p) => sum + p.revenue, 0)
                            .toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Last Week Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Products Sold:</span>
                        <span className="font-medium">
                          {productData.weeklyComparison.previousWeek.reduce(
                            (sum, p) => sum + p.sales,
                            0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Revenue:</span>
                        <span className="font-medium">
                          ₹
                          {productData.weeklyComparison.previousWeek
                            .reduce((sum, p) => sum + p.revenue, 0)
                            .toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lowSelling" className="space-y-4">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-red-500/10 to-red-600/10 dark:from-red-900/30 dark:to-red-800/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Low Selling Items
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800"
                      >
                        <option value="all">All Categories</option>
                        <option value="drinks">Drinks</option>
                        <option value="snacks">Snacks</option>
                        <option value="meals">Meals</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-40 h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <CardDescription>
                  Products that need attention based on sales performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredLowSelling.length > 0 ? (
                  <div className="space-y-4">
                    {filteredLowSelling.map((product, index) => (
                      <div
                        key={product.id || index}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg border hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-lg ${getSuggestionColor(product.suggestion)}/20`}
                          >
                            {getSuggestionIcon(product.suggestion)}
                          </div>
                          <div>
                            <p className="font-medium text-lg">
                              {product.name}
                            </p>
                            <div className="flex gap-4 mt-1">
                              <Badge
                                variant="outline"
                                className={getCategoryColor(product.category)}
                              >
                                {getCategoryIcon(product.category)}
                                {product.category || "other"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Price: ₹{product.price}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                Sold: {product.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Revenue
                            </p>
                            <p className="font-bold">
                              ₹{product.revenue?.toLocaleString()}
                            </p>
                          </div>
                          <Badge
                            className={getSuggestionColor(product.suggestion)}
                          >
                            {getSuggestionIcon(product.suggestion)}
                            {product.suggestion}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    {searchQuery || filterCategory !== "all"
                      ? "No products match your filters"
                      : "No low selling items found"}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-600/10 dark:from-green-900/30 dark:to-green-800/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-green-500" />
                      Category Distribution
                    </CardTitle>
                    <Badge className="bg-green-500 hover:bg-green-600">
                      Revenue Share
                    </Badge>
                  </div>
                  <CardDescription>
                    Revenue distribution across product categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {productData.categories &&
                    (productData.categories.drinks > 0 ||
                      productData.categories.snacks > 0 ||
                      productData.categories.meals > 0) ? (
                      <Pie
                        data={categoryPerformanceData}
                        options={pieChartOptions}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No category data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-900/30 dark:to-blue-800/30">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    Category Performance
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <Coffee className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Drinks</p>
                          <p className="text-sm text-muted-foreground">
                            Beverages, Coffee, Tea, etc.
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-blue-500 hover:bg-blue-600">
                          {productData.categories?.drinks || 0}%
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Revenue Share
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/20">
                          <Utensils className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">Snacks</p>
                          <p className="text-sm text-muted-foreground">
                            Appetizers, Desserts, Small bites
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-amber-500 hover:bg-amber-600">
                          {productData.categories?.snacks || 0}%
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Revenue Share
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/20">
                          <Pizza className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Meals</p>
                          <p className="text-sm text-muted-foreground">
                            Main courses, Full meals
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-500 hover:bg-green-600">
                          {productData.categories?.meals || 0}%
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Revenue Share
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-500/20">
                          <Package className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">Other</p>
                          <p className="text-sm text-muted-foreground">
                            Miscellaneous items
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {productData.categories?.other || 0}%
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Revenue Share
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
