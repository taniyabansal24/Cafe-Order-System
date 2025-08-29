"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle,
  RefreshCw,
  XCircle,
  User,
  Phone,
  Mail,
  Receipt,
  Calendar,
  Package,
  Search,
  Filter,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchPendingOrders = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const response = await fetch(`${window.location.origin}/api/orders?status=pending`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        setFilteredOrders(data.orders);
        if (data.orders.length > 0) {
          toast.success(`Loaded ${data.orders.length} pending orders`);
        }
      } else {
        throw new Error(data.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching pending orders:", err);
      setError(err.message);
      setOrders([]);
      setFilteredOrders([]);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: orderId,
          status: newStatus,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchPendingOrders();
      } else {
        throw new Error(data.message || "Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter(order =>
      order.tokenNumber.toString().includes(searchTerm) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredOrders(filtered);
  }, [searchTerm, orders]);

  const getTimeElapsed = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now - created;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pending Orders</h1>
            <p className="text-muted-foreground">Manage orders that need attention</p>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="bg-muted py-4">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-20" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pending Orders</h1>
          <p className="text-muted-foreground">Manage orders that need attention</p>
        </div>
        <Button 
          onClick={fetchPendingOrders}
          variant="outline"
          className="flex items-center"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <select className="w-full p-2 border rounded-md bg-background">
                  <option value="">All methods</option>
                  <option value="cash">Cash</option>
                  <option value="razorpay">Online</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Min Amount</Label>
                <Input type="number" placeholder="₹ Min" />
              </div>
              <div className="space-y-2">
                <Label>Time Range</Label>
                <select className="w-full p-2 border rounded-md bg-background">
                  <option value="">All time</option>
                  <option value="1">Last hour</option>
                  <option value="24">Last 24 hours</option>
                  <option value="168">Last week</option>
                </select>
              </div>
            </div>
          </Card>
        )}
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive">
              <h3 className="font-medium mb-2">Error Loading Orders</h3>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!error && filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No pending orders</h3>
            <p className="text-muted-foreground">New orders will appear here when customers place them</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <Card key={order._id} className="overflow-hidden border-l-4 border-l-amber-500">
              <CardHeader className="bg-muted py-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <CardTitle className="text-lg flex items-center">
                    <Receipt className="h-5 w-5 mr-2 text-amber-600" />
                    Order #{order.tokenNumber}
                    <Badge variant="secondary" className="ml-2">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatTime(order.createdAt)}
                    <span className="mx-2">•</span>
                    {getTimeElapsed(order.createdAt)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                {/* Customer Information */}
                {(order.customerName || order.customerPhone || order.customerEmail) && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-200">Customer Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      {order.customerName && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                          <span className="text-blue-800 dark:text-blue-300">{order.customerName}</span>
                        </div>
                      )}
                      {order.customerPhone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                          <span className="text-blue-800 dark:text-blue-300">{order.customerPhone}</span>
                        </div>
                      )}
                      {order.customerEmail && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                          <span className="text-blue-800 dark:text-blue-300">{order.customerEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2 text-foreground">Order Items:</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-border last:border-b-0"
                      >
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">
                            {item.quantity} x {item.name}
                          </span>
                        </div>
                        <span className="text-foreground">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Info */}
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-800 dark:text-green-200">Payment Method:</span>
                    <Badge variant="outline" className="bg-background">
                      {order.paymentMethod?.toUpperCase() || "CASH"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-green-800 dark:text-green-200">Payment Status:</span>
                    <Badge
                      variant={order.paymentStatus === "completed" ? "success" : "secondary"}
                    >
                      {order.paymentStatus?.toUpperCase() || "PENDING"}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t pt-4">
                  <div className="text-xl font-bold text-foreground">
                    Total: ₹{order.total}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => updateOrderStatus(order._id, "completed")}
                      className="bg-green-600 hover:bg-green-700 flex items-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark as Completed
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateOrderStatus(order._id, "cancelled")}
                      className="flex items-center"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancel Order
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}