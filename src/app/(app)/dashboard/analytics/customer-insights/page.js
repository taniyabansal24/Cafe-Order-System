///dashboard/analytics/customer-insights/page.js
"use client"

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  PieChart, 
  LineChart, 
  Users, 
  UserPlus, 
  Repeat, 
  TrendingUp,
  Clock,
  Star,
  Calendar,
  Phone,
  Mail,
  Coffee,
  RefreshCw,
  AlertCircle,
  Crown,
  Award,
  Target,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  IndianRupee,
  TrendingDown,
  Sparkles
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

// Mock data for fallback - updated to match API structure
const mockCustomerData = {
  totalCustomers: 1247,
  newCustomers: 86,
  returningCustomers: 342,
  repeatRate: 72,
  avgOrderValue: 850,
  avgOrdersPerCustomer: 9,
  sameOrderPercentage: 35,
  customerGrowth: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    data: [45, 68, 92, 124]
  },
  topSpenders: [
    { name: 'Rahul Sharma', totalSpent: 12500, orderCount: 15 },
    { name: 'Priya Patel', totalSpent: 9800, orderCount: 12 },
    { name: 'Ankit Verma', totalSpent: 8200, orderCount: 10 },
    { name: 'Sneha Singh', totalSpent: 7500, orderCount: 9 },
    { name: 'Vikram Mehta', totalSpent: 6800, orderCount: 8 }
  ],
  topLoyalCustomers: [
    { name: 'Rahul Sharma', orderCount: 15, lastOrder: '2 hours ago' },
    { name: 'Priya Patel', orderCount: 12, lastOrder: '1 day ago' },
    { name: 'Ankit Verma', orderCount: 10, lastOrder: '3 days ago' },
    { name: 'Sneha Singh', orderCount: 9, lastOrder: '5 days ago' },
    { name: 'Vikram Mehta', orderCount: 8, lastOrder: '1 week ago' }
  ],
  peakTimes: [
    { range: '6:00 PM - 9:00 PM', orders: 245 },
    { range: '12:00 PM - 2:00 PM', orders: 180 },
    { range: '8:00 AM - 10:00 AM', orders: 120 }
  ],
  customerContacts: [
    { name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul@example.com', orderCount: 15 },
    { name: 'Priya Patel', phone: '+91 98765 43211', email: 'priya@example.com', orderCount: 12 },
    { name: 'Ankit Verma', phone: '+91 98765 43212', email: 'ankit@example.com', orderCount: 10 }
  ],
  favoriteItems: [
    { item: 'Palak Paneer', orders: 45 },
    { item: 'Shahi Paneer', orders: 38 },
    { item: 'Butter Chicken', orders: 32 },
    { item: 'Garlic Naan', orders: 56 }
  ],
  metadata: {
    hasData: true,
    message: "Live customer data"
  }
};

export default function CustomerInsights() {
  const [customerData, setCustomerData] = useState(mockCustomerData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [useMockData, setUseMockData] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // make fetchCustomerData stable so useEffect can depend on it
  const fetchCustomerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/analytics/customer-insights?range=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCustomerData(data);
      setUseMockData(false);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      setError(error.message);
      setCustomerData(mockCustomerData);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  }, [timeRange]); // only re-create when timeRange changes

  // call stable function from effect
  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-lg font-medium">Loading customer insights...</p>
        <p className="text-sm text-muted-foreground">Fetching the latest data</p>
      </div>
    );
  }

  // Check if there's actual data
  const hasActualData = customerData && (
    customerData.totalCustomers > 0 || 
    (customerData.topSpenders && customerData.topSpenders.length > 0) ||
    (customerData.metadata && customerData.metadata.hasData === true)
  );

  if (!loading && !hasActualData && !useMockData) {
    return (
      <div className="container mx-auto py-6 px-6 space-y-6">
        <div className="text-center max-w-2xl mx-auto py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 mb-6">
            <Users className="h-10 w-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3">No Customer Data Yet</h2>
          <p className="text-muted-foreground mb-6">
            Start receiving orders to unlock powerful customer insights
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
              <div className="text-blue-600 dark:text-blue-400 font-bold text-lg mb-1">1</div>
              <p className="text-sm">Start taking orders</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
              <div className="text-green-600 dark:text-green-400 font-bold text-lg mb-1">2</div>
              <p className="text-sm">Get customer info</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
              <div className="text-purple-600 dark:text-purple-400 font-bold text-lg mb-1">3</div>
              <p className="text-sm">See insights</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const newVsReturningData = {
    labels: ['New Customers', 'Returning Customers'],
    datasets: [
      {
        data: [
          customerData.newCustomers || 0,
          customerData.returningCustomers || 0
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(139, 92, 246)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const customerGrowthData = {
    labels: customerData.customerGrowth?.labels || ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Customer Growth',
        data: customerData.customerGrowth?.data || [0, 0, 0, 0],
        fill: true,
        backgroundColor: 'rgba(136, 84, 208, 0.2)',
        borderColor: 'rgba(136, 84, 208, 1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(136, 84, 208)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const topSpendersData = {
    labels: (customerData.topSpenders || []).slice(0, 6).map(c => c.name || 'Unknown'),
    datasets: [
      {
        label: 'Total Spending (₹)',
        data: (customerData.topSpenders || []).slice(0, 6).map(c => c.totalSpent || 0),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(139, 92, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(236, 72, 153)'
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  // Chart options
  const lineChartOptions = {
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

  const barChartOptions = {
    ...lineChartOptions,
    scales: {
      ...lineChartOptions.scales,
      y: {
        ...lineChartOptions.scales.y,
        ticks: {
          callback: function(value) {
            return '₹' + value;
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

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Customer Insights</h1>
              <p className="text-muted-foreground">
                Understand your customers better with AI-powered analytics
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={timeRange === 'week' ? 'default' : 'outline'} 
            className={`px-3 py-1 cursor-pointer ${timeRange === 'week' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            <Calendar className="h-3 w-3 mr-1" />
            This Week
          </Badge>
          <Badge 
            variant={timeRange === 'month' ? 'default' : 'outline'} 
            className={`px-3 py-1 cursor-pointer ${timeRange === 'month' ? 'bg-gradient-to-r from-green-500 to-blue-600' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            <Calendar className="h-3 w-3 mr-1" />
            This Month
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchCustomerData}
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
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Failed to load customer data</h3>
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
              <Sparkles className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-400">Demo Mode Active</h3>
              <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                Showing sample data. Connect to your database to see real customer insights.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards - Colorful Version */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Total Customers</CardTitle>
            <div className="p-2 rounded-full bg-blue-500/20">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800 dark:text-blue-300">{customerData.totalCustomers}</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <p className="text-xs text-blue-600 dark:text-blue-400">
                ↑ 12% from last month
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">New Customers</CardTitle>
            <div className="p-2 rounded-full bg-green-500/20">
              <UserPlus className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800 dark:text-green-300">{customerData.newCustomers}</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <p className="text-xs text-green-600 dark:text-green-400">
                ↑ 8% from last week
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">Returning Rate</CardTitle>
            <div className="p-2 rounded-full bg-purple-500/20">
              <Repeat className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-800 dark:text-purple-300">{customerData.repeatRate}%</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <p className="text-xs text-purple-600 dark:text-purple-400">
                ↑ 5% customer loyalty
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">Avg Order Value</CardTitle>
            <div className="p-2 rounded-full bg-orange-500/20">
              <IndianRupee className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-800 dark:text-orange-300">₹{customerData.avgOrderValue}</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <p className="text-xs text-orange-600 dark:text-orange-400">
                ↑ ₹120 per customer
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl p-1">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6 bg-transparent">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="frequency" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">
              <Target className="h-4 w-4 mr-2" />
              Frequency
            </TabsTrigger>
            <TabsTrigger value="spending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
              <Crown className="h-4 w-4 mr-2" />
              Spending
            </TabsTrigger>
            <TabsTrigger value="behavior" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white">
              <Zap className="h-4 w-4 mr-2" />
              Behavior
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-900/30 dark:to-blue-800/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <LineChartIcon className="h-5 w-5 text-blue-500" />
                      Customer Growth Trend
                    </CardTitle>
                    <Badge className="bg-blue-500 hover:bg-blue-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Positive Trend
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80">
                    <Line 
                      data={customerGrowthData}
                      options={lineChartOptions}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-3 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 dark:from-purple-900/30 dark:to-purple-800/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-purple-500" />
                      Customer Types Distribution
                    </CardTitle>
                    <Badge className="bg-purple-500 hover:bg-purple-600">Live</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80">
                    <Pie 
                      data={newVsReturningData}
                      options={pieChartOptions}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-sm text-blue-600 dark:text-blue-400">New Customers</p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{customerData.newCustomers}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                      <p className="text-sm text-purple-600 dark:text-purple-400">Returning</p>
                      <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">{customerData.returningCustomers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-600/10 dark:from-green-900/30 dark:to-green-800/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Crown className="h-5 w-5 text-green-500" />
                    Top Customers by Spending
                  </CardTitle>
                  <Badge className="bg-green-500 hover:bg-green-600">VIP Analysis</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <Bar 
                    data={topSpendersData}
                    options={barChartOptions}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {customerData.topSpenders.slice(0, 3).map((customer, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl border">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
                          {customer.name?.charAt(0) || 'C'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{customer.name || 'Unknown Customer'}</p>
                          <p className="text-sm text-muted-foreground">{customer.orderCount} orders</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">₹{customer.totalSpent}</p>
                          <Badge className="mt-1 bg-gradient-to-r from-yellow-500 to-orange-500">
                            VIP Level {index + 1}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="frequency" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 dark:from-orange-900/30 dark:to-orange-800/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-500" />
                      Loyal Customer Frequency
                    </CardTitle>
                    <Badge className="bg-orange-500 hover:bg-orange-600">
                      <Clock className="h-3 w-3 mr-1" />
                      {customerData.avgOrdersPerCustomer} avg orders
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {customerData.topLoyalCustomers.slice(0, 5).map((customer, index) => (
                      <div key={index} className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                            index === 2 ? 'bg-gradient-to-r from-amber-700 to-amber-800' :
                            'bg-gradient-to-r from-gray-300 to-gray-400'
                          } text-white font-bold text-lg`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{customer.name || 'Unknown Customer'}</p>
                            <p className="text-sm text-muted-foreground">{customer.orderCount} total orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="mb-2 bg-gradient-to-r from-green-500 to-green-600">
                            <Repeat className="h-3 w-3 mr-1" />
                            {customer.orderCount} orders
                          </Badge>
                          <p className="text-xs text-muted-foreground">Last order: {customer.lastOrder}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-3 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-900/30 dark:to-blue-800/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      Loyalty Distribution
                    </CardTitle>
                    <Badge className="bg-blue-500 hover:bg-blue-600">Analysis</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">New (1 order)</span>
                        <span className="text-sm font-bold text-blue-600">35%</span>
                      </div>
                      <Progress value={35} className="h-3 bg-blue-100" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Regular (2-5 orders)</span>
                        <span className="text-sm font-bold text-green-600">45%</span>
                      </div>
                      <Progress value={45} className="h-3 bg-green-100" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Loyal (5+ orders)</span>
                        <span className="text-sm font-bold text-purple-600">20%</span>
                      </div>
                      <Progress value={20} className="h-3 bg-purple-100" />
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 rounded-xl">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-green-500/20 mr-3">
                        <Award className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Loyalty Program Ready</p>
                        <p className="text-sm text-muted-foreground">20% of customers are loyal! Consider implementing a rewards program.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="spending" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 dark:from-purple-900/30 dark:to-purple-800/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-500" />
                    High-Value Customers
                  </CardTitle>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                    <Star className="h-3 w-3 mr-1" />
                    VIP Segment
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customerData.topSpenders.slice(0, 6).map((customer, index) => (
                    <div key={index} className={`p-6 rounded-xl border-2 ${
                      index === 0 ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20' :
                      index === 1 ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900' :
                      index === 2 ? 'border-amber-600 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20' :
                      'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <Badge className={`mb-2 ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            index === 1 ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
                            index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                            'bg-gradient-to-r from-blue-500 to-blue-600'
                          }`}>
                            {index === 0 ? '🥇 Gold Tier' :
                             index === 1 ? '🥈 Silver Tier' :
                             index === 2 ? '🥉 Bronze Tier' :
                             '🌟 Premium'}
                          </Badge>
                          <h3 className="text-xl font-bold">{customer.name || 'Unknown Customer'}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{customer.orderCount} total orders</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-600">₹{customer.totalSpent}</div>
                          <p className="text-xs text-muted-foreground">Lifetime Value</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Customer Value Score</span>
                          <span className="text-sm font-bold">{
                            index === 0 ? '98/100' :
                            index === 1 ? '92/100' :
                            index === 2 ? '88/100' :
                            '85/100'
                          }</span>
                        </div>
                        <Progress value={
                          index === 0 ? 98 :
                          index === 1 ? 92 :
                          index === 2 ? 88 :
                          85
                        } className={`h-2 ${
                          index === 0 ? 'bg-yellow-100' :
                          index === 1 ? 'bg-gray-100' :
                          index === 2 ? 'bg-amber-100' :
                          'bg-blue-100'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-red-500/10 to-red-600/10 dark:from-red-900/30 dark:to-red-800/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Clock className="h-5 w-5 text-red-500" />
                      Peak Order Times
                    </CardTitle>
                    <Badge className="bg-red-500 hover:bg-red-600">Busy Hours</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {customerData.peakTimes.map((time, index) => (
                      <div key={index} className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${
                              index === 0 ? 'bg-red-500/20' :
                              index === 1 ? 'bg-orange-500/20' :
                              'bg-yellow-500/20'
                            }`}>
                              <Clock className={`h-5 w-5 ${
                                index === 0 ? 'text-red-600' :
                                index === 1 ? 'text-orange-600' :
                                'text-yellow-600'
                              }`} />
                            </div>
                            <div>
                              <p className="font-semibold text-lg">{time.range}</p>
                              <p className="text-sm text-muted-foreground">Peak ordering time</p>
                            </div>
                          </div>
                          <div className="ml-11">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">{time.orders} orders</span>
                              <span className="text-sm font-bold">{
                                index === 0 ? '35% of daily orders' :
                                index === 1 ? '25% of daily orders' :
                                '15% of daily orders'
                              }</span>
                            </div>
                            <Progress value={
                              index === 0 ? 35 :
                              index === 1 ? 25 :
                              15
                            } className={`h-2 ${
                              index === 0 ? 'bg-red-100' :
                              index === 1 ? 'bg-orange-100' :
                              'bg-yellow-100'
                            }`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-3 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-600/10 dark:from-green-900/30 dark:to-green-800/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-500" />
                      Ordering Patterns
                    </CardTitle>
                    <Badge className="bg-green-500 hover:bg-green-600">Behavior</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="font-semibold">Same Order Preference</p>
                          <p className="text-sm text-muted-foreground">Customers who always order the same items</p>
                        </div>
                        <div className="text-3xl font-bold text-blue-600">{customerData.sameOrderPercentage}%</div>
                      </div>
                      <Progress value={customerData.sameOrderPercentage} className="h-2 bg-blue-100" />
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="font-semibold">Variety Seekers</p>
                          <p className="text-sm text-muted-foreground">Customers who try different items</p>
                        </div>
                        <div className="text-3xl font-bold text-purple-600">{100 - customerData.sameOrderPercentage}%</div>
                      </div>
                      <Progress value={100 - customerData.sameOrderPercentage} className="h-2 bg-purple-100" />
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-800/20 rounded-xl">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-yellow-500/20 mr-3">
                        <Zap className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Behavior Insight</p>
                        <p className="text-sm text-muted-foreground">
                          {customerData.sameOrderPercentage > 50 
                            ? "Most customers prefer consistency. Consider loyalty rewards for their favorite items." 
                            : "Customers enjoy variety! Rotate specials to keep them engaged."}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 dark:from-indigo-900/30 dark:to-indigo-800/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-500" />
                    Top Customer Contacts
                  </CardTitle>
                  <Badge className="bg-indigo-500 hover:bg-indigo-600">Marketing Ready</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customerData.customerContacts.slice(0, 6).map((customer, index) => (
                    <div key={index} className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl">
                          {customer.name?.charAt(0) || 'C'}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{customer.name || 'Unknown Customer'}</h3>
                          <Badge className="mt-1 bg-gradient-to-r from-green-500 to-green-600">
                            {customer.orderCount} orders
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{customer.phone || 'No phone'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-red-500" />
                          <span className="text-sm truncate">{customer.email || 'No email'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}