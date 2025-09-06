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
  RefreshCw,
  CheckCircle,
  XCircle,
  User,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Receipt,
  Clock,
  ChefHat
} from "lucide-react";

export default function AllOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchAllOrders = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/orders?status=all");
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
      
      if (response.ok) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchAllOrders();
      } else {
        throw new Error(data.message || "Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  useEffect(() => {
    let filtered = orders.filter(order =>
      order.tokenNumber.toString().includes(searchTerm) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "secondary", icon: <Clock className="h-3 w-3 mr-1" /> },
      preparing: { variant: "default", icon: <ChefHat className="h-3 w-3 mr-1" /> },
      completed: { variant: "success", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      cancelled: { variant: "destructive", icon: <XCircle className="h-3 w-3 mr-1" /> },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge variant={config.variant} className="flex items-center text-xs">
        {config.icon}
        <span className="hidden sm:inline">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        <span className="sm:hidden">{status.charAt(0).toUpperCase()}</span>
      </Badge>
    );
  };

  // Function to get token number color based on status
  const getTokenNumberColor = (status) => {
    switch (status) {
      case "pending":
        return "text-amber-600 dark:text-amber-500"; // Orange for pending
      case "completed":
        return "text-green-600 dark:text-green-500"; // Green for completed
      case "cancelled":
        return "text-red-600 dark:text-red-500"; // Red for cancelled
    }
  };

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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">All Orders</h1>
            <p className="text-muted-foreground">View and manage all orders</p>
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
                <Skeleton className="h-5 w-20" />
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">All Orders</h1>
          <p className="text-muted-foreground">View and manage all orders</p>
        </div>
        <Button 
          onClick={fetchAllOrders}
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
              placeholder="Search all orders..."
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
                <Label>Status</Label>
                <select 
                  className="w-full p-2 border rounded-md bg-background"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Min Amount</Label>
                <Input 
                  type="number" 
                  placeholder="₹ Min" 
                  className="bg-background"
                />
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
            <div className="h-16 w-16 text-muted-foreground mb-4">📦</div>
            <h3 className="text-lg font-medium text-foreground mb-2">No orders yet</h3>
            <p className="text-muted-foreground text-center">Orders will appear here when customers place them</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Table Header - Hidden on mobile */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-muted rounded-lg font-medium text-sm text-muted-foreground">
            <div className="col-span-2">Order #</div>
            <div className="col-span-2">Customer</div>
            <div className="col-span-2">Items</div>
            <div className="col-span-2">Total</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Time</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Orders List */}
          {filteredOrders.map((order) => (
            <Card key={order._id} className="overflow-hidden">
              <div className="grid grid-cols-12 gap-2 md:gap-4 items-center p-3 md:p-4 cursor-pointer" onClick={() => toggleExpand(order._id)}>
                <div className="col-span-6 md:col-span-2 font-semibold">
                  <div className={`flex items-center ${getTokenNumberColor(order.status)}`}>
                    <Receipt className="h-4 w-4 mr-1" />
                    <span className="truncate">#{order.tokenNumber}</span>
                  </div>
                </div>
                
                <div className="hidden md:block col-span-2">
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
                
                <div className="col-span-3 md:col-span-2">
                  {getStatusBadge(order.status)}
                </div>
                
                <div className="hidden md:block col-span-1 text-sm text-muted-foreground">
                  {getTimeElapsed(order.createdAt)}
                </div>
                
                <div className="col-span-3 md:col-span-1 flex justify-end">
                  <div className="md:hidden text-xs text-muted-foreground mr-2">
                    {getTimeElapsed(order.createdAt)}
                  </div>
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

              {/* Expanded Details & Actions */}
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
                          <Badge variant={order.paymentStatus === "completed" ? "success" : "secondary"}>
                            {order.paymentStatus?.toUpperCase() || 'PENDING'}
                          </Badge>
                        </div>
                      </div>
                      
                      <h4 className="font-medium mb-3 text-foreground mt-4">Items</h4>
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
                    
                    <div>
                      <h4 className="font-medium mb-3 text-foreground">Actions</h4>
                      <div className="space-y-2">
                        {order.status === "pending" && (
                          <>
                            <Button
                              onClick={() => updateOrderStatus(order._id, "completed")}
                              className="w-full bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Completed
                            </Button>
                            <Button
                              onClick={() => updateOrderStatus(order._id, "cancelled")}
                              variant="outline"
                              className="w-full"
                              size="sm"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Order
                            </Button>
                          </>
                        )}
                        {order.status === "completed" && (
                          <div className="text-sm text-green-600 font-medium p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <CheckCircle className="h-4 w-4 mr-2 inline" />
                            Order completed {getTimeElapsed(order.updatedAt)}
                          </div>
                        )}
                        {order.status === "cancelled" && (
                          <div className="text-sm text-red-600 font-medium p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                            <XCircle className="h-4 w-4 mr-2 inline" />
                            Order was cancelled
                          </div>
                        )}
                        {order.status === "preparing" && (
                          <Button
                            onClick={() => updateOrderStatus(order._id, "completed")}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Ready
                          </Button>
                        )}
                      </div>

                      {(order.customerName || order.customerPhone) && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-200">Customer Info</h4>
                          {order.customerName && (
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                              <User className="h-3 w-3 mr-1 inline" />
                              {order.customerName}
                            </p>
                          )}
                          {order.customerPhone && (
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                              📞 {order.customerPhone}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}