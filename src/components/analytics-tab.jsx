"use client";

import { TrendingUp } from "lucide-react";
import { IconClock, IconReceipt } from "@tabler/icons-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import {
  getTimeElapsed,
  formatDateTime,
  formatTimeOnly,
  formatDateOnly,
} from "@/lib/timeUtils";
import { timezone } from "@/lib/constants";

export function AnalyticsTab({ peakHourInfo, dateFilter }) {
  if (!peakHourInfo) return null;

  const chartData = peakHourInfo.hourlyData.map((hour) => ({
    hour: hour.hour,
    orders: hour.orders,
    revenue: hour.revenue,
  }));

  const chartConfig = {
    orders: {
      label: "Orders",
      color: "var(--chart-1)",
    },
  };

  // Example: If you had a timestamp to format
  const currentTime = new Date().toISOString();

  return (
    <div className="flex flex-col px-4 lg:px-6 gap-6">
      {/* You could add time information here if needed */}
      {/* <div className="text-sm text-muted-foreground">
        Last updated: {formatTimeOnly(currentTime, timezone)}
      </div> */}

      {/* Peak Hours Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Peak Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {peakHourInfo.peakHour.hour}
            </div>
            <p className="text-xs text-muted-foreground">
              {peakHourInfo.peakHour.orders} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconClock className="h-4 w-4" />
              Busy Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {peakHourInfo.busyHours.length}
            </div>
            <p className="text-xs text-muted-foreground">Above average hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconReceipt className="h-4 w-4" />
              Daily Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peakHourInfo.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Total orders today</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Hours Analysis</CardTitle>
          <CardDescription>
            Order distribution by hour -{" "}
            {dateFilter === "today" ? "Today" : "Selected period"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 20,
                bottom: 50,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="hour"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="orders"
                type="natural"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{
                  fill: "var(--chart-1)",
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Peak hour: {peakHourInfo.peakHour.hour} with{" "}
            {peakHourInfo.peakHour.orders} orders
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Showing order distribution across business hours
          </div>
        </CardFooter>
      </Card>

      {/* Busy Hours Detailed List */}
      {peakHourInfo.busyHours.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Busy Hours Details</CardTitle>
            <CardDescription>
              Hours with above-average order activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {peakHourInfo.busyHours.map((hour, index) => (
                <div
                  key={hour.hour}
                  className={`p-3 rounded-lg border ${
                    index === 0
                      ? "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800"
                      : "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{hour.hour}</span>
                    {index === 0 && (
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs"
                      >
                        Peak
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {hour.orders} orders • ₹{hour.revenue.toFixed(2)}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(hour.orders / peakHourInfo.peakHour.orders) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
