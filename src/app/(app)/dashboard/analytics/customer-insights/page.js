"use client"

import { useState, useEffect } from 'react';
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
  AlertCircle
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

// Mock data for fallback
const mockCustomerData = {
  totalCustomers: 1248,
  newCustomers: 42,
  returningCustomers: 286,
  repeatRate: 68,
  avgOrderValue: 1250,
  avgOrdersPerCustomer: 3.2,
  sameOrderPercentage: 45,
  customerGrowth: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [850, 920, 1020, 1100, 1150, 1248]
  },
  topSpenders: [
    { name: 'Rajesh Kumar', totalSpent: 18500, orderCount: 14 },
    { name: 'Priya Sharma', totalSpent: 16200, orderCount: 12 },
    { name: 'Vikram Singh', totalSpent: 14350, orderCount: 11 },
    { name: 'Anjali Patel', totalSpent: 13200, orderCount: 10 },
    { name: 'Mohammed Khan', totalSpent: 11800, orderCount: 9 }
  ],
  topLoyalCustomers: [
    { name: 'Sneha Gupta', orderCount: 18, lastOrder: '2 days ago' },
    { name: 'Amit Verma', orderCount: 16, lastOrder: '5 days ago' },
    { name: 'Neha Joshi', orderCount: 15, lastOrder: '1 week ago' },
    { name: 'Rahul Desai', orderCount: 14, lastOrder: '3 days ago' },
    { name: 'Divya Mehta', orderCount: 13, lastOrder: 'yesterday' }
  ],
  peakTimes: [
    { range: '7:00-9:00 AM', orders: 125 },
    { range: '12:00-2:00 PM', orders: 342 },
    { range: '6:00-8:00 PM', orders: 287 }
  ],
  customerContacts: [
    { name: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh.k@example.com', orderCount: 14 },
    { name: 'Priya Sharma', phone: '+91 97654 32109', email: 'priya.s@example.com', orderCount: 12 },
    { name: 'Vikram Singh', phone: '+91 96543 21098', email: 'vikram.s@example.com', orderCount: 11 },
    { name: 'Anjali Patel', phone: '+91 95432 10987', email: 'anjali.p@example.com', orderCount: 10 },
    { name: 'Mohammed Khan', phone: '+91 94321 09876', email: 'mohammed.k@example.com', orderCount: 9 }
  ]
};

export default function CustomerInsights() {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month'); // 'week' or 'month'
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    fetchCustomerData();
  }, [timeRange]);

  const fetchCustomerData = async () => {
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
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p>Loading customer data...</p>
      </div>
    );
  }

  // Prepare data for charts
  const newVsReturningData = {
    labels: ['New Customers', 'Returning Customers'],
    datasets: [
      {
        data: [customerData.newCustomers, customerData.returningCustomers],
        backgroundColor: ['#FF6384', '#36A2EB'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB'],
      },
    ],
  };

  const customerGrowthData = {
    labels: customerData.customerGrowth.labels,
    datasets: [
      {
        label: 'Total Customers',
        data: customerData.customerGrowth.data,
        fill: false,
        backgroundColor: 'rgba(136, 84, 208, 0.4)',
        borderColor: 'rgba(136, 84, 208, 1)',
        tension: 0.1,
      },
    ],
  };

  const topSpendersData = {
    labels: customerData.topSpenders.slice(0, 10).map(c => c.name || 'Unknown'),
    datasets: [
      {
        label: 'Total Spending (₹)',
        data: customerData.topSpenders.slice(0, 10).map(c => c.totalSpent),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  return (
    <div className="container mx-auto py-6 px-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Insights</h1>
          <p className="text-muted-foreground">
            Analyze customer behavior and loyalty patterns
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={timeRange === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            This Week
          </Button>
          <Button 
            variant={timeRange === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            This Month
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchCustomerData}
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
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-destructive">Failed to load customer data</h3>
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
              <AlertCircle className="h-5 w-5 text-amber-500" />
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

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerData.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              All unique customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerData.newCustomers}</div>
            <p className="text-xs text-muted-foreground">
              This {timeRange}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returning Customers</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerData.returningCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {customerData.repeatRate}% repeat rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{customerData.avgOrderValue}</div>
            <p className="text-xs text-muted-foreground">
              Per customer
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="frequency">Frequency</TabsTrigger>
          <TabsTrigger value="spending">Spending</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-80">
                  <Line 
                    data={customerGrowthData}
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Customer Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Pie 
                    data={newVsReturningData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Customers by Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Bar 
                  data={topSpendersData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frequency" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Customer Frequency</CardTitle>
                <CardDescription>
                  Average orders per customer: {customerData.avgOrdersPerCustomer}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerData.topLoyalCustomers.slice(0, 5).map((customer, index) => (
                    <div key={index} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {customer.name || 'Unknown Customer'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {customer.orderCount} orders • Last order: {customer.lastOrder}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        <Badge variant="outline">
                          <Clock className="mr-1 h-3 w-3" />
                          Loyal
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Loyalty Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-20 text-sm text-muted-foreground">1 order</div>
                    <div className="flex-1">
                      <Progress value={35} className="h-2" />
                    </div>
                    <div className="w-10 text-right text-sm">35%</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-20 text-sm text-muted-foreground">2-5 orders</div>
                    <div className="flex-1">
                      <Progress value={45} className="h-2" />
                    </div>
                    <div className="w-10 text-right text-sm">45%</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-20 text-sm text-muted-foreground">5+ orders</div>
                    <div className="flex-1">
                      <Progress value={20} className="h-2" />
                    </div>
                    <div className="w-10 text-right text-sm">20%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="spending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>High-Value Customers</CardTitle>
              <CardDescription>
                Customers with the highest lifetime value
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerData.topSpenders.slice(0, 5).map((customer, index) => (
                  <div key={index} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {customer.name || 'Unknown Customer'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {customer.orderCount} orders • ₹{customer.totalSpent} total spent
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      <Badge variant="secondary">
                        <Star className="mr-1 h-3 w-3" />
                        VIP
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Peak Order Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerData.peakTimes.map((time, index) => (
                    <div key={index} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {time.range}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {time.orders} orders during this time
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        <Badge variant="outline">
                          <Calendar className="mr-1 h-3 w-3" />
                          Peak
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Ordering Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Same Order Preference
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Customers who always order the same items
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {customerData.sameOrderPercentage}%
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Variety Seekers
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Customers who try different items
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {100 - customerData.sameOrderPercentage}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Contacts</CardTitle>
              <CardDescription>
                Contact information for your top customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerData.customerContacts.slice(0, 5).map((customer, index) => (
                  <div key={index} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {customer.name || 'Unknown Customer'}
                      </p>
                      <div className="flex items-center pt-1">
                        {customer.phone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="mr-1 h-3 w-3" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center text-sm text-muted-foreground ml-4">
                            <Mail className="mr-1 h-3 w-3" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-auto font-medium">
                      <Badge variant="outline">
                        <Coffee className="mr-1 h-3 w-3" />
                        {customer.orderCount} orders
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}