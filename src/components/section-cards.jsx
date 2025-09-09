import { IconTrendingUp, IconAlertCircle } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import axios from "axios";

export function SectionCards() {
  const [metrics, setMetrics] = useState({
    dailySales: 0,
    monthlySales: 0,
    activeOrders: 0,
    topItem: { name: "-", quantity: 0 },
    debug: { ordersByStatus: [], completedOrders: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from backend API
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/dashboard/metrics");
        console.log("API Response:", res.data);
        setMetrics(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  // Format currency in Indian Rupees
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="@container/card">
            <CardHeader>
              <CardDescription>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-2xl">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                </Badge>
              </CardAction>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const hasCompletedOrders = metrics.debug?.completedOrders?.length > 0;
  const hasSales = metrics.dailySales > 0 || metrics.monthlySales > 0;
  const completedOrdersCount = metrics.debug?.ordersByStatus?.find(status => status._id === 'completed')?.count || 0;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      
      {/* Total Revenue Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          {hasCompletedOrders && !hasSales && (
            <div className="flex items-center text-amber-600 text-sm mb-2">
              <IconAlertCircle className="h-4 w-4 mr-1" />
              Completed orders with ₹0 total
            </div>
          )}
          {!hasCompletedOrders && (
            <div className="flex items-center text-amber-600 text-sm mb-2">
              <IconAlertCircle className="h-4 w-4 mr-1" />
              No completed orders yet
            </div>
          )}
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatINR(metrics.monthlySales)}
          </CardTitle>
          {/* <CardAction>
            <Badge variant={hasSales ? "default" : "outline"}>
              {hasSales ? (
                <>
                  <IconTrendingUp className="h-4 w-4 mr-1" />
                  +12.5%
                </>
              ) : (
                <>
                  <IconAlertCircle className="h-4 w-4 mr-1" />
                  0%
                </>
              )}
            </Badge>
          </CardAction> */}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {hasCompletedOrders ? `${completedOrdersCount} completed orders` : 'Revenue Overview'}
          </div>
          <div className="text-muted-foreground">
            {hasCompletedOrders && !hasSales 
              ? "Check order totals in database" 
              : hasSales
              ? "Monthly performance"
              : "Complete orders to see revenue"
            }
          </div>
        </CardFooter>
      </Card>

      {/* Daily Revenue Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Today's Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatINR(metrics.dailySales)}
          </CardTitle>
          <CardAction>
            <Badge variant={metrics.dailySales > 0 ? "default" : "outline"}>
              {metrics.dailySales > 0 ? (
                <>
                  <IconTrendingUp className="h-4 w-4 mr-1" />
                  +5%
                </>
              ) : (
                "No sales today"
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Daily performance <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Revenue generated today
          </div>
        </CardFooter>
      </Card>

      {/* Active Orders Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.activeOrders}
          </CardTitle>
          <CardAction>
            <Badge variant={metrics.activeOrders > 0 ? "default" : "outline"}>
              {metrics.activeOrders > 0 ? (
                <>
                  <IconTrendingUp className="h-4 w-4 mr-1" />
                  Active
                </>
              ) : (
                "No active orders"
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Orders being processed
          </div>
          <div className="text-muted-foreground">Track cafe workflow</div>
        </CardFooter>
      </Card>

      {/* Top-Selling Item Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Top-Selling Item</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-[22px]">
            {metrics.topItem.name}
          </CardTitle>
          <CardAction>
            <Badge variant={metrics.topItem.quantity > 0 ? "default" : "outline"}>
              {metrics.topItem.quantity > 0 ? (
                <>
                  <IconTrendingUp className="h-4 w-4 mr-1" />
                  Popular
                </>
              ) : (
                "No sales yet"
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Most popular menu item
          </div>
          <div className="text-muted-foreground">Update menu or stock</div>
        </CardFooter>
      </Card>

    </div>
  );
}