"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  CheckCircle, 
  RefreshCw,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Receipt
} from "lucide-react";

export default function CompletedOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchCompletedOrders = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/orders?status=completed");
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.orders || []);
        setFilteredOrders(data.orders || []);
      } else {
        throw new Error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompletedOrders();
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
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Completed Orders</h1>
            <p className="text-muted-foreground">View all completed orders</p>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Completed Orders</h1>
          <p className="text-muted-foreground">View all completed orders</p>
        </div>
        <Button 
          onClick={fetchCompletedOrders}
          variant="outline"
          className="flex items-center w-full sm:w-auto justify-center"
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
              placeholder="Search completed orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <select className="w-full p-2 border rounded-md bg-background">
                  <option value="">All dates</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Min Amount</Label>
                <Input type="number" placeholder="₹ Min" />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <select className="w-full p-2 border rounded-md bg-background">
                  <option value="">All methods</option>
                  <option value="cash">Cash</option>
                  <option value="razorpay">Online</option>
                </select>
              </div>
            </div>
          </Card>
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No completed orders yet</h3>
            <p className="text-muted-foreground text-center">Completed orders will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Table Header - Hidden on mobile */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-muted rounded-lg font-medium text-sm text-muted-foreground">
            <div className="col-span-2">Order #</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-2">Items</div>
            <div className="col-span-2">Total</div>
            <div className="col-span-2">Completed</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Orders List */}
          {filteredOrders.map((order) => (
            <Card key={order._id} className="overflow-hidden">
              <div className="grid grid-cols-12 gap-2 md:gap-4 items-center p-3 md:p-4 cursor-pointer" onClick={() => toggleExpand(order._id)}>
                <div className="col-span-6 md:col-span-2 font-semibold text-green-600">
                  <div className="flex items-center">
                    <Receipt className="h-4 w-4 mr-1" />
                    <span className="truncate">#{order.tokenNumber}</span>
                  </div>
                </div>
                
                <div className="hidden md:block col-span-3">
                  {order.customerName ? (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="truncate">{order.customerName}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Guest</span>
                  )}
                </div>
                
                <div className="hidden md:block col-span-2 text-sm">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </div>
                
                <div className="col-span-3 md:col-span-2 font-semibold text-sm md:text-base">
                  ₹{order.total}
                </div>
                
                <div className="col-span-3 md:col-span-2 text-sm text-muted-foreground">
                  {getTimeElapsed(order.updatedAt || order.createdAt)}
                </div>
                
                <div className="col-span-3 md:col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(order._id);
                    }}
                  >
                    {expandedOrder === order._id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Mobile customer info */}
              <div className="md:hidden px-4 pb-2">
                {order.customerName && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-3 w-3 mr-1" />
                    <span className="truncate">{order.customerName}</span>
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order._id && (
                <div className="border-t p-4 bg-muted/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 text-foreground">Order Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Order Date:</span>
                          <span>{formatDateTime(order.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Method:</span>
                          <Badge variant="outline">
                            {order.paymentMethod?.toUpperCase() || 'CASH'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Status:</span>
                          <Badge variant="success">
                            {order.paymentStatus?.toUpperCase() || 'COMPLETED'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3 text-foreground">Items</h4>
                      <div className="space-y-2 text-sm">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{item.quantity} × {item.name}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 font-semibold">
                          <div className="flex justify-between">
                            <span>Total:</span>
                            <span>₹{order.total}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {order.customerPhone && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2 text-foreground">Customer Contact</h4>
                      <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}