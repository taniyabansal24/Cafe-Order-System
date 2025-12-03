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
import { useSession } from "next-auth/react";
import axios from "axios";

export function SectionCards() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState({
    dailySales: 0,
    monthlySales: 0,  // This should show 410 for December
    activeOrders: 0,
    topItem: { name: "-", quantity: 0 },
    debug: { ordersByStatus: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("🔄 Fetching metrics for user:", session.user._id);
        const res = await axios.get("/api/dashboard/metrics");
        console.log("📊 Full API Response:", res.data);
        setMetrics(res.data);
        setError(null);
      } catch (err) {
        console.error("❌ Failed to fetch metrics:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [session]);

  // Fixed currency formatting
  const formatINR = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '₹0';
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Calculate completed orders count
  const completedOrdersCount = metrics.debug?.ordersByStatus?.find(status => status._id === 'completed')?.count || 0;
  
  // Check if there are sales
  const hasSales = metrics.dailySales > 0 || metrics.monthlySales > 0;

  // console.log("📊 SectionCards - Display metrics:", {
  //   dailySales: metrics.dailySales,
  //   monthlySales: metrics.monthlySales,
  //   activeOrders: metrics.activeOrders,
  //   topItem: metrics.topItem,
  //   completedOrdersCount,
  //   hasSales
  // });

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

  if (error) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card col-span-4">
          <CardHeader>
            <CardDescription>Error</CardDescription>
            <CardTitle className="text-red-600">{error}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      
      {/* Current Month Revenue Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Current Month Revenue</CardDescription>
          {completedOrdersCount > 0 && !hasSales && (
            <div className="flex items-center text-amber-600 text-sm mb-2">
              <IconAlertCircle className="h-4 w-4 mr-1" />
              Check order totals in database
            </div>
          )}
          {completedOrdersCount === 0 && (
            <div className="flex items-center text-amber-600 text-sm mb-2">
              <IconAlertCircle className="h-4 w-4 mr-1" />
              No completed orders yet
            </div>
          )}
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatINR(metrics.monthlySales)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {completedOrdersCount > 0 ? `${completedOrdersCount} completed orders` : 'Revenue Overview'}
          </div>
          <div className="text-muted-foreground">
            {completedOrdersCount > 0 && !hasSales 
              ? "Orders exist but revenue calculation issue" 
              : hasSales
              ? "December 2025 performance"
              : "Complete orders to see revenue"
            }
          </div>
        </CardFooter>
      </Card>

      {/* Today's Revenue Card */}
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
                  Today
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
            Revenue generated on December 1, 2025
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
                  {metrics.topItem.quantity} sold
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