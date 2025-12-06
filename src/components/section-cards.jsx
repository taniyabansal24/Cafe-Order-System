// src/components/section-cards.jsx
import { 
  IconTrendingUp, 
  IconAlertCircle,
  IconCurrencyRupee,
  IconClock,
  IconPackage,
  IconChartBar
} from "@tabler/icons-react";
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
    monthlySales: 0,
    activeOrders: 0,
    topItem: { name: "-", quantity: 0 },
    debug: { ordersByStatus: [] },
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
    if (typeof amount !== "number" || isNaN(amount)) {
      return "₹0";
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // Calculate completed orders count
  const completedOrdersCount =
    metrics.debug?.ordersByStatus?.find((status) => status._id === "completed")
      ?.count || 0;

  // Check if there are sales
  const hasSales = metrics.dailySales > 0 || metrics.monthlySales > 0;

  // Card color configurations matching home page
  const cardConfigs = [
    {
      title: "Current Month Revenue",
      description: "Monthly performance",
      icon: <IconCurrencyRupee className="h-5 w-5" />,
      gradient: "from-blue-500/10 to-blue-600/5",
      border: "border-blue-500/20",
      iconColor: "text-blue-600",
      badgeColor: "bg-blue-100 text-blue-700 hover:bg-blue-100"
    },
    {
      title: "Today's Revenue",
      description: "Daily performance",
      icon: <IconChartBar className="h-5 w-5" />,
      gradient: "from-green-500/10 to-green-600/5",
      border: "border-green-500/20",
      iconColor: "text-green-600",
      badgeColor: "bg-green-100 text-green-700 hover:bg-green-100"
    },
    {
      title: "Active Orders",
      description: "Orders being processed",
      icon: <IconClock className="h-5 w-5" />,
      gradient: "from-purple-500/10 to-purple-600/5",
      border: "border-purple-500/20",
      iconColor: "text-purple-600",
      badgeColor: "bg-purple-100 text-purple-700 hover:bg-purple-100"
    },
    {
      title: "Top-Selling Item",
      description: "Most popular menu item",
      icon: <IconPackage className="h-5 w-5" />,
      gradient: "from-amber-500/10 to-amber-600/5",
      border: "border-amber-500/20",
      iconColor: "text-amber-600",
      badgeColor: "bg-amber-100 text-amber-700 hover:bg-amber-100"
    }
  ];

  const cardData = [
    {
      value: formatINR(metrics.monthlySales),
      badgeText: metrics.monthlySales > 0 ? "Monthly" : "No data",
      additionalInfo: completedOrdersCount > 0 
        ? `${completedOrdersCount} completed orders` 
        : "Revenue Overview",
      footerText: completedOrdersCount > 0 && !hasSales
        ? "Orders exist but revenue calculation issue"
        : hasSales
          ? `${new Date().toLocaleString("default", { month: "long" })} ${new Date().getFullYear()} performance`
          : "Complete orders to see revenue"
    },
    {
      value: formatINR(metrics.dailySales),
      badgeText: metrics.dailySales > 0 ? "Today" : "No sales",
      additionalInfo: "Daily performance",
      footerText: `Revenue generated on ${new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}`
    },
    {
      value: metrics.activeOrders,
      badgeText: metrics.activeOrders > 0 ? "Active" : "No active",
      additionalInfo: "Orders being processed",
      footerText: "Track cafe workflow"
    },
    {
      value: metrics.topItem.name,
      badgeText: metrics.topItem.quantity > 0 ? `${metrics.topItem.quantity} sold` : "No sales",
      additionalInfo: "Most popular menu item",
      footerText: "Update menu or stock"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="animate-pulse">
            <CardHeader>
              <CardDescription>
                <div className="h-4 w-24 bg-gray-200 rounded dark:bg-gray-700"></div>
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                <div className="h-8 w-16 bg-gray-200 rounded dark:bg-gray-700"></div>
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <div className="h-4 w-12 bg-gray-200 rounded dark:bg-gray-700"></div>
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
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="col-span-4 border-red-200 dark:border-red-900">
          <CardHeader>
            <CardDescription>Error</CardDescription>
            <CardTitle className="text-red-600 dark:text-red-400">{error}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cardConfigs.map((config, index) => (
        <Card 
          key={index}
          className={`
            bg-gradient-to-br ${config.gradient} 
            ${config.border} 
            hover:${config.border.replace('/20', '/40')}
            transition-all duration-300
          `}
        >
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardDescription>{config.title}</CardDescription>
            </div>
            
            {index === 0 && completedOrdersCount > 0 && !hasSales && (
              <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm mb-2">
                <IconAlertCircle className="h-4 w-4 mr-1" />
                Check order totals in database
              </div>
            )}
            
            {index === 0 && completedOrdersCount === 0 && (
              <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm mb-2">
                <IconAlertCircle className="h-4 w-4 mr-1" />
                No completed orders yet
              </div>
            )}
            
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {cardData[index].value}
            </CardTitle>
            
            <CardAction>
              <Badge className={config.badgeColor}>
                {cardData[index].badgeText.includes("No") ? (
                  cardData[index].badgeText
                ) : (
                  <>
                    <IconTrendingUp className="h-3 w-3 mr-1" />
                    {cardData[index].badgeText}
                  </>
                )}
              </Badge>
            </CardAction>
          </CardHeader>
          
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {cardData[index].additionalInfo}
              {index === 1 && cardData[index].badgeText === "Today" && (
                <IconTrendingUp className="h-4 w-4" />
              )}
            </div>
             <div className="text-muted-foreground">
              {cardData[index].footerText}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}