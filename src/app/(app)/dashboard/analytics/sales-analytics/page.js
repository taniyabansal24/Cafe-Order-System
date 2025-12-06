// analytics/sales-analytics/page.js
"use client"

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp,
  TrendingDown,
  Package,
  CheckCircle,
  XCircle,
  IndianRupee,
  Calendar,
  AlertTriangle,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Utensils,
  Coffee,
  Pizza,
  DollarSign,
  ShoppingBag,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Crown,
  Award
} from 'lucide-react';
import { 
  Bar, 
  Pie, 
  Line 
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Fallback mock data structure
const mockSalesData = {
  revenue: {
    monthly: {
      labels: [],
      data: [],
      currentMonth: 0,
      previousMonth: 0,
      growth: 0
    },
    weekly: {
      labels: [],
      data: [],
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
      labels: [],
      data: []
    },
    weekly: {
      labels: [],
      data: []
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

export default function SalesAnalytics() {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [useMockData, setUseMockData] = useState(false);
  const [lowSalesThreshold, setLowSalesThreshold] = useState(5);

  // make fetchSalesData stable so useEffect can depend on it
  const fetchSalesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/analytics/sales?range=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch sales data');
      }
      
      setSalesData(result.data);
      setUseMockData(false);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError(error.message);
      setSalesData(mockSalesData);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  }, [timeRange]); // re-create only when timeRange changes

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-lg font-medium">Loading sales analytics...</p>
        <p className="text-sm text-muted-foreground">Crunching the numbers</p>
      </div>
    );
  }

  // Check if there's actual data or just empty structure
  const hasActualData = salesData && (
    salesData.orders.total > 0 || 
    salesData.revenue.monthly.currentMonth > 0 ||
    salesData.products.topSelling.allTime.length > 0
  );

  if (!hasActualData && !useMockData) {
    return (
      <div className="container mx-auto py-6 px-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
                <p className="text-muted-foreground">
                  Detailed breakdown of revenue, orders, and product performance
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={timeRange === 'week' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('week')}
              className={timeRange === 'week' ? 'bg-gradient-to-r from-blue-500 to-cyan-600' : ''}
            >
              Weekly
            </Button>
            <Button 
              variant={timeRange === 'month' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('month')}
              className={timeRange === 'month' ? 'bg-gradient-to-r from-purple-500 to-pink-600' : ''}
            >
              Monthly
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <AlertTriangle className="h-10 w-10 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No Sales Data Yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Start by completing some orders to see your sales analytics here.
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/menu'}
                className="mt-4"
              >
                Go to Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const monthlyRevenueData = {
    labels: salesData.revenue.monthly.labels,
    datasets: [
      {
        label: 'Monthly Revenue (₹)',
        data: salesData.revenue.monthly.data,
        backgroundColor: 'rgba(136, 84, 208, 0.8)',
        borderColor: 'rgba(136, 84, 208, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const weeklyRevenueData = {
    labels: salesData.revenue.weekly.labels,
    datasets: [
      {
        label: 'Weekly Revenue (₹)',
        data: salesData.revenue.weekly.data,
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderWidth: 3,
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const dailyOrdersData = {
    labels: salesData.orders.daily.labels,
    datasets: [
      {
        label: 'Orders per Day',
        data: salesData.orders.daily.data,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 2,
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const weeklyOrdersData = {
    labels: salesData.orders.weekly.labels,
    datasets: [
      {
        label: 'Orders per Week',
        data: salesData.orders.weekly.data,
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const ordersDistributionData = {
    labels: ['Completed Orders', 'Canceled Orders'],
    datasets: [
      {
        data: [salesData.orders.distribution.completed, salesData.orders.distribution.canceled],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
        borderWidth: 3,
      },
    ],
  };

  const weeklyComparisonData = {
    labels: salesData.products.weeklyComparison.currentWeek.map(p => p.name),
    datasets: [
      {
        label: 'This Week',
        data: salesData.products.weeklyComparison.currentWeek.map(p => p.sales),
        backgroundColor: 'rgba(136, 84, 208, 0.8)',
        borderColor: 'rgb(136, 84, 208)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Last Week',
        data: salesData.products.weeklyComparison.previousWeek.map(p => p.sales),
        backgroundColor: 'rgba(156, 163, 175, 0.8)',
        borderColor: 'rgb(156, 163, 175)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const categoryPerformanceData = {
    labels: ['Drinks', 'Snacks', 'Meals'],
    datasets: [
      {
        data: [
          salesData.products.categories.drinks,
          salesData.products.categories.snacks,
          salesData.products.categories.meals
        ],
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(16, 185, 129, 0.8)'],
        borderColor: ['rgb(59, 130, 246)', 'rgb(245, 158, 11)', 'rgb(16, 185, 129)'],
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
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: "'Inter', sans-serif"
          },
          color: 'var(--muted-foreground)'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 12
          },
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    }
  };

  const lineChartOptions = {
    ...barChartOptions,
    scales: {
      ...barChartOptions.scales,
      y: {
        ...barChartOptions.scales.y,
        ticks: {
          ...barChartOptions.scales.y.ticks,
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          color: 'var(--muted-foreground)'
        }
      }
    }
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const getSuggestionColor = (suggestion) => {
    switch (suggestion) {
      case 'hide': return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'replace': return 'bg-gradient-to-r from-amber-500 to-amber-600';
      case 'keep': return 'bg-gradient-to-r from-green-500 to-green-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getSuggestionIcon = (suggestion) => {
    switch (suggestion) {
      case 'hide': return <EyeOff className="h-4 w-4" />;
      case 'replace': return <RefreshCw className="h-4 w-4" />;
      case 'keep': return <Eye className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
              <p className="text-muted-foreground">
                Track revenue, orders, and product performance in real-time
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={timeRange === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('week')}
            className={timeRange === 'week' ? 'bg-gradient-to-r from-blue-500 to-cyan-600' : ''}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Weekly
          </Button>
          <Button 
            variant={timeRange === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('month')}
            className={timeRange === 'month' ? 'bg-gradient-to-r from-purple-500 to-pink-600' : ''}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Monthly
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchSalesData}
            disabled={loading}
            className="gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Failed to load sales data</h3>
              <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                {useMockData ? "Showing demo data instead." : "Please try again later."}
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
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-400">Demo Mode</h3>
              <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                Currently showing sample data as the server is unavailable.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Total Orders</CardTitle>
            <div className="p-2 rounded-full bg-blue-500/20">
              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800 dark:text-blue-300">{salesData.orders.total}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              All time orders
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">Completed Orders</CardTitle>
            <div className="p-2 rounded-full bg-green-500/20">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800 dark:text-green-300">{salesData.orders.completed}</div>
            <p className="text-xs text-green-600 dark:text-green-400">
              {salesData.orders.total > 0 ? 
                `${((salesData.orders.completed / salesData.orders.total) * 100).toFixed(1)}% completion rate` : 
                'No orders'
              }
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">Canceled Orders</CardTitle>
            <div className="p-2 rounded-full bg-red-500/20">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-800 dark:text-red-300">{salesData.orders.canceled}</div>
            <p className="text-xs text-red-600 dark:text-red-400">
              {salesData.orders.total > 0 ? 
                `${((salesData.orders.canceled / salesData.orders.total) * 100).toFixed(1)}% cancellation rate` : 
                'No orders'
              }
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">Avg Order Value</CardTitle>
            <div className="p-2 rounded-full bg-purple-500/20">
              <IndianRupee className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-800 dark:text-purple-300">₹{salesData.orders.avgOrderValue}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Average per completed order
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trends Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/10 to-green-600/10">
            <BarChart3 className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Revenue Trends</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Revenue */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 dark:from-purple-900/30 dark:to-purple-800/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Monthly Revenue
                </CardTitle>
                {salesData.revenue.monthly.labels.length > 0 && (
                  <Badge variant={salesData.revenue.monthly.growth >= 0 ? "default" : "destructive"} className={salesData.revenue.monthly.growth >= 0 ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}>
                    {getGrowthIcon(salesData.revenue.monthly.growth)}
                    {Math.abs(salesData.revenue.monthly.growth).toFixed(1)}%
                  </Badge>
                )}
              </div>
              <CardDescription>
                {salesData.revenue.monthly.labels.length > 0 ? (
                  `Revenue comparison: ₹${salesData.revenue.monthly.currentMonth.toLocaleString()} vs ₹${salesData.revenue.monthly.previousMonth.toLocaleString()} previous month`
                ) : (
                  "No revenue data available"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {salesData.revenue.monthly.data.length > 0 ? (
                  <Bar 
                    data={monthlyRevenueData}
                    options={barChartOptions}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No monthly revenue data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Revenue */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-600/10 dark:from-green-900/30 dark:to-green-800/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Weekly Revenue Trend
                </CardTitle>
                {salesData.revenue.weekly.labels.length > 0 && (
                  <Badge variant={salesData.revenue.weekly.growth >= 0 ? "default" : "destructive"} className={salesData.revenue.weekly.growth >= 0 ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}>
                    {getGrowthIcon(salesData.revenue.weekly.growth)}
                    {Math.abs(salesData.revenue.weekly.growth).toFixed(1)}%
                  </Badge>
                )}
              </div>
              <CardDescription>
                {salesData.revenue.weekly.labels.length > 0 ? (
                  `Current week: ₹${salesData.revenue.weekly.currentWeek.toLocaleString()}`
                ) : (
                  "No weekly revenue data available"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {salesData.revenue.weekly.data.length > 0 ? (
                  <Line 
                    data={weeklyRevenueData}
                    options={lineChartOptions}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No weekly revenue data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Orders Analytics Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/10">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold">Orders Analytics</h2>
        </div>

        {/* Order Charts */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-900/30 dark:to-blue-800/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-blue-500" />
                  Orders per Day (Last 7 Days)
                </CardTitle>
                <Badge className="bg-blue-500 hover:bg-blue-600">Daily</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {salesData.orders.daily.data.length > 0 ? (
                  <Line 
                    data={dailyOrdersData}
                    options={lineChartOptions}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No daily order data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-pink-500/10 to-pink-600/10 dark:from-pink-900/30 dark:to-pink-800/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-pink-500" />
                  Orders Distribution
                </CardTitle>
                <Badge className="bg-pink-500 hover:bg-pink-600">Summary</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {salesData.orders.distribution.completed > 0 || salesData.orders.distribution.canceled > 0 ? (
                  <Pie 
                    data={ordersDistributionData}
                    options={pieChartOptions}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No order distribution data
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400">Completed</p>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-300">{salesData.orders.distribution.completed}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">Canceled</p>
                  <p className="text-2xl font-bold text-red-800 dark:text-red-300">{salesData.orders.distribution.canceled}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3 border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 dark:from-orange-900/30 dark:to-orange-800/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  Orders per Week (Last 12 Weeks)
                </CardTitle>
                <Badge className="bg-orange-500 hover:bg-orange-600">Trend</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {salesData.orders.weekly.data.length > 0 ? (
                  <Bar 
                    data={weeklyOrdersData}
                    options={barChartOptions}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No weekly order data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Analytics Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-600/10">
            <ShoppingBag className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold">Product Analytics</h2>
        </div>
        
        <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl p-1">
          <Tabs defaultValue="topSelling" className="space-y-4">
            <TabsList className="grid grid-cols-4 mb-6 bg-transparent">
              <TabsTrigger value="topSelling" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
                <Crown className="h-4 w-4 mr-2" />
                Top Selling
              </TabsTrigger>
              <TabsTrigger value="weeklyComparison" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                <BarChart3 className="h-4 w-4 mr-2" />
                Comparison
              </TabsTrigger>
              <TabsTrigger value="lowSelling" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Low Selling
              </TabsTrigger>
              <TabsTrigger value="categories" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
                <Target className="h-4 w-4 mr-2" />
                Categories
              </TabsTrigger>
            </TabsList>

            <TabsContent value="topSelling" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 dark:from-yellow-900/30 dark:to-yellow-800/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        All Time Top Sellers
                      </CardTitle>
                      <Badge className="bg-yellow-500 hover:bg-yellow-600">Gold</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {salesData.products.topSelling.allTime.length > 0 ? (
                      <div className="space-y-4">
                        {salesData.products.topSelling.allTime.slice(0, 5).map((product, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg hover:shadow-sm transition-shadow">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                            </div>
                            <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-700 dark:text-yellow-400">
                              ₹{product.revenue.toLocaleString()}
                            </Badge>
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

                <Card className="border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-900/30 dark:to-blue-800/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        Last Month Top Sellers
                      </CardTitle>
                      <Badge className="bg-blue-500 hover:bg-blue-600">Monthly</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {salesData.products.topSelling.lastMonth.length > 0 ? (
                      <div className="space-y-4">
                        {salesData.products.topSelling.lastMonth.slice(0, 5).map((product, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-900 rounded-lg">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                            </div>
                            <Badge variant="outline">₹{product.revenue.toLocaleString()}</Badge>
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

                <Card className="border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-600/10 dark:from-green-900/30 dark:to-green-800/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-green-500" />
                        Last Week Top Sellers
                      </CardTitle>
                      <Badge className="bg-green-500 hover:bg-green-600">Weekly</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {salesData.products.topSelling.lastWeek.length > 0 ? (
                      <div className="space-y-4">
                        {salesData.products.topSelling.lastWeek.slice(0, 5).map((product, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-white dark:from-green-900/10 dark:to-gray-900 rounded-lg">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                            </div>
                            <Badge variant="outline">₹{product.revenue.toLocaleString()}</Badge>
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
                      Top 5 Products: This Week vs Last Week
                    </CardTitle>
                    <Badge className="bg-purple-500 hover:bg-purple-600">Comparison</Badge>
                  </div>
                  <CardDescription>
                    Compare product performance week over week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    {salesData.products.weeklyComparison.currentWeek.length > 0 ? (
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
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Threshold:</span>
                      <input
                        type="number"
                        value={lowSalesThreshold}
                        onChange={(e) => setLowSalesThreshold(Number(e.target.value))}
                        className="w-20 px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800"
                        min="1"
                      />
                      <span className="text-sm text-muted-foreground">orders</span>
                    </div>
                  </div>
                  <CardDescription>
                    Products with less than {lowSalesThreshold} orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {salesData.products.lowSelling.length > 0 ? (
                    <div className="space-y-4">
                      {salesData.products.lowSelling
                        .filter(product => product.orders < lowSalesThreshold)
                        .map((product, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg border hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                product.suggestion === 'hide' ? 'bg-red-500/20' :
                                product.suggestion === 'replace' ? 'bg-amber-500/20' :
                                'bg-green-500/20'
                              }`}>
                                {getSuggestionIcon(product.suggestion)}
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Only {product.orders} orders
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getSuggestionColor(product.suggestion)}>
                                {getSuggestionIcon(product.suggestion)}
                                {product.suggestion}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No low selling items found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-600/10 dark:from-green-900/30 dark:to-green-800/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-green-500" />
                      Category Performance
                    </CardTitle>
                    <Badge className="bg-green-500 hover:bg-green-600">Analysis</Badge>
                  </div>
                  <CardDescription>
                    Revenue distribution across menu categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="h-80">
                      {salesData.products.categories.drinks > 0 || 
                       salesData.products.categories.snacks > 0 || 
                       salesData.products.categories.meals > 0 ? (
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
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Coffee className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Drinks</span>
                        </div>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 dark:text-blue-400">{salesData.products.categories.drinks}%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Utensils className="h-5 w-5 text-amber-600" />
                          <span className="font-medium">Snacks</span>
                        </div>
                        <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 dark:text-amber-400">{salesData.products.categories.snacks}%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Pizza className="h-5 w-5 text-green-600" />
                          <span className="font-medium">Meals</span>
                        </div>
                        <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400">{salesData.products.categories.meals}%</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}