"use client"

import { useState, useEffect } from 'react';
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
  Pizza
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

  useEffect(() => {
    fetchSalesData();
  }, [timeRange]);

  const fetchSalesData = async () => {
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
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p>Loading sales analytics...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
            <p className="text-muted-foreground">
              Detailed breakdown of revenue, orders, and product performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={timeRange === 'week' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('week')}
            >
              Weekly
            </Button>
            <Button 
              variant={timeRange === 'month' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('month')}
            >
              Monthly
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchSalesData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
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
        backgroundColor: 'rgba(136, 84, 208, 0.6)',
        borderColor: 'rgba(136, 84, 208, 1)',
        borderWidth: 2,
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
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
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
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
        backgroundColor: 'rgba(249, 115, 22, 0.6)',
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 2,
      },
    ],
  };

  const ordersDistributionData = {
    labels: ['Completed Orders', 'Canceled Orders'],
    datasets: [
      {
        data: [salesData.orders.distribution.completed, salesData.orders.distribution.canceled],
        backgroundColor: ['#22c55e', '#ef4444'],
        hoverBackgroundColor: ['#16a34a', '#dc2626'],
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
      },
      {
        label: 'Last Week',
        data: salesData.products.weeklyComparison.previousWeek.map(p => p.sales),
        backgroundColor: 'rgba(156, 163, 175, 0.8)',
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
        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
        hoverBackgroundColor: ['#2563eb', '#d97706', '#059669'],
      },
    ],
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const getSuggestionColor = (suggestion) => {
    switch (suggestion) {
      case 'hide': return 'text-red-600';
      case 'replace': return 'text-amber-600';
      case 'keep': return 'text-green-600';
      default: return 'text-gray-600';
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
    <div className="container mx-auto py-6 px-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
          <p className="text-muted-foreground">
            Detailed breakdown of revenue, orders, and product performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={timeRange === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            Weekly
          </Button>
          <Button 
            variant={timeRange === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            Monthly
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchSalesData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-destructive">Failed to load sales data</h3>
              <div className="mt-2 text-sm text-destructive">
                <p>Error: {error}</p>
                <p className="mt-1">
                  {useMockData 
                    ? "Showing demo data instead." 
                    : "Please try again later."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {useMockData && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Demo Mode</h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>Currently showing sample data as the server is unavailable.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Trends Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Revenue Trends</h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Revenue
              </CardTitle>
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
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return '₹' + value.toLocaleString();
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No monthly revenue data available
                  </div>
                )}
              </div>
              {salesData.revenue.monthly.labels.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={salesData.revenue.monthly.growth >= 0 ? "default" : "destructive"}>
                      {getGrowthIcon(salesData.revenue.monthly.growth)}
                      {Math.abs(salesData.revenue.monthly.growth).toFixed(1)}%
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      vs previous month
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Revenue Trend
              </CardTitle>
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
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return '₹' + value.toLocaleString();
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No weekly revenue data available
                  </div>
                )}
              </div>
              {salesData.revenue.weekly.labels.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={salesData.revenue.weekly.growth >= 0 ? "default" : "destructive"}>
                      {getGrowthIcon(salesData.revenue.weekly.growth)}
                      {Math.abs(salesData.revenue.weekly.growth).toFixed(1)}%
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      vs previous week
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Orders Analytics Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Orders Analytics</h2>
        
        {/* Order Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesData.orders.total}</div>
              <p className="text-xs text-muted-foreground">
                All time orders
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesData.orders.completed}</div>
              <p className="text-xs text-muted-foreground">
                {salesData.orders.total > 0 ? 
                  `${((salesData.orders.completed / salesData.orders.total) * 100).toFixed(1)}% completion rate` : 
                  'No orders'
                }
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Canceled Orders</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesData.orders.canceled}</div>
              <p className="text-xs text-muted-foreground">
                {salesData.orders.total > 0 ? 
                  `${((salesData.orders.canceled / salesData.orders.total) * 100).toFixed(1)}% cancellation rate` : 
                  'No orders'
                }
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{salesData.orders.avgOrderValue}</div>
              <p className="text-xs text-muted-foreground">
                Average per completed order
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Order Charts */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Orders per Day (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {salesData.orders.daily.data.length > 0 ? (
                  <Line 
                    data={dailyOrdersData}
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No daily order data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {salesData.orders.distribution.completed > 0 || salesData.orders.distribution.canceled > 0 ? (
                  <Pie 
                    data={ordersDistributionData}
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No order distribution data
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Orders per Week (Last 12 Weeks)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {salesData.orders.weekly.data.length > 0 ? (
                  <Bar 
                    data={weeklyOrdersData}
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
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
        <h2 className="text-2xl font-bold">Product Analytics</h2>
        
        <Tabs defaultValue="topSelling" className="space-y-4">
          <TabsList>
            <TabsTrigger value="topSelling">Top Selling</TabsTrigger>
            <TabsTrigger value="weeklyComparison">Weekly Comparison</TabsTrigger>
            <TabsTrigger value="lowSelling">Low Selling Items</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="topSelling" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>All Time Top Sellers</CardTitle>
                </CardHeader>
                <CardContent>
                  {salesData.products.topSelling.allTime.length > 0 ? (
                    <div className="space-y-4">
                      {salesData.products.topSelling.allTime.slice(0, 5).map((product, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                          </div>
                          <Badge variant="secondary">₹{product.revenue.toLocaleString()}</Badge>
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

              <Card>
                <CardHeader>
                  <CardTitle>Last Month Top Sellers</CardTitle>
                </CardHeader>
                <CardContent>
                  {salesData.products.topSelling.lastMonth.length > 0 ? (
                    <div className="space-y-4">
                      {salesData.products.topSelling.lastMonth.slice(0, 5).map((product, index) => (
                        <div key={index} className="flex items-center justify-between">
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

              <Card>
                <CardHeader>
                  <CardTitle>Last Week Top Sellers</CardTitle>
                </CardHeader>
                <CardContent>
                  {salesData.products.topSelling.lastWeek.length > 0 ? (
                    <div className="space-y-4">
                      {salesData.products.topSelling.lastWeek.slice(0, 5).map((product, index) => (
                        <div key={index} className="flex items-center justify-between">
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
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Products: This Week vs Last Week</CardTitle>
                <CardDescription>
                  Compare product performance week over week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  {salesData.products.weeklyComparison.currentWeek.length > 0 ? (
                    <Bar 
                      data={weeklyComparisonData}
                      options={{
                        maintainAspectRatio: false,
                        responsive: true,
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Low Selling Items</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Threshold:</span>
                    <input
                      type="number"
                      value={lowSalesThreshold}
                      onChange={(e) => setLowSalesThreshold(Number(e.target.value))}
                      className="w-20 px-2 py-1 border rounded text-sm"
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
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Only {product.orders} orders
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
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
                    No low selling items found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
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
                        options={{
                          maintainAspectRatio: false,
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No category data available
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Coffee className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Drinks</span>
                      </div>
                      <Badge variant="secondary">{salesData.products.categories.drinks}%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Utensils className="h-5 w-5 text-amber-600" />
                        <span className="font-medium">Snacks</span>
                      </div>
                      <Badge variant="secondary">{salesData.products.categories.snacks}%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Pizza className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Meals</span>
                      </div>
                      <Badge variant="secondary">{salesData.products.categories.meals}%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
