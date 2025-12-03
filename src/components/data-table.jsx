"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
  IconClock,
  IconUser,
  IconReceipt,
  IconCoffee,
  IconCalendar,
  IconRefresh,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsTab } from "@/components/analytics-tab";
import {
  getTimeElapsed,
  formatDateTime,
  formatTimeOnly,
  formatDateOnly,
} from "@/lib/timeUtils";
import { timezone } from "@/lib/constants";

// Helper function to transform API data to component format
const transformApiData = (apiData) => {
  if (!apiData || !apiData.orders || !Array.isArray(apiData.orders)) return [];

  return apiData.orders.map((order, index) => ({
    id: index + 1,
    orderId: order._id || `ORD-${index + 1}`,
    customer: order.customerName || "Unknown Customer",
    items: order.items || [],
    total: order.total || 0,
    status: order.status || "Unknown",
    orderTime: order.createdAt || new Date().toISOString(),
    completionTime: order.updatedAt,
    server: order.customerPhone || "Unknown Server",
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    tokenNumber: order.tokenNumber,
  }));
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  preparing: "bg-blue-100 text-blue-800 border-blue-200",
  ready: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-purple-100 text-purple-800 border-purple-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

// Create a separate component for the drag handle
function DragHandle({ id }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

const columns = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "orderId",
    header: "Order ID",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IconUser className="size-4" />
        {row.original.customer || "Unknown Customer"}
      </div>
    ),
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => (
      <div className="max-w-48">
        {row.original.items?.slice(0, 2).map((item, index) => (
          <div key={index} className="text-sm truncate">
            {item.quantity}x {item.name}
          </div>
        )) || "No items"}
        {row.original.items?.length > 2 && (
          <div className="text-xs text-muted-foreground">
            +{row.original.items.length - 2} more items
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "total",
    header: () => <div className="w-full text-right">Total</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        ₹{(row.original.total || 0).toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status?.toLowerCase() || "unknown";
      return (
        <Badge
          variant="outline"
          className={`px-2 py-1 ${statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}
        >
          {row.original.status || "Unknown"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "orderTime",
    header: "Order Time",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm">
        <IconClock className="size-4" />
        {formatTimeOnly(row.original.orderTime, timezone)}
      </div>
    ),
  },
  {
    accessorKey: "tokenNumber",
    header: "Token #",
    cell: ({ row }) => (
      <div className="text-sm font-mono">
        #{row.original.tokenNumber || "N/A"}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(row.original.orderId)}
          >
            Copy Order ID
          </DropdownMenuItem>
          <DropdownMenuItem>Update Status</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            Cancel Order
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function DraggableRow({ row }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable() {
  const { data: session, status: sessionStatus } = useSession();
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [dateFilter, setDateFilter] = React.useState("all");
  const [customStartDate, setCustomStartDate] = React.useState("");
  const [customEndDate, setCustomEndDate] = React.useState("");
  const [lastUpdated, setLastUpdated] = React.useState(new Date());
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );
  const isMobile = useIsMobile();

  // Fetch data from API (owner-scoped)
  const fetchOrders = React.useCallback(async () => {
    try {
      setIsRefreshing(true);

      // If session is loading, don't fetch yet
      if (sessionStatus === "loading") return;

      // If user is not authenticated, show a helpful message
      if (sessionStatus !== "authenticated") {
        setError("Not authenticated");
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      const res = await fetch("/api/orders?status=all", {
        method: "GET",
        credentials: "same-origin", // ensure cookies (next-auth) are sent
      });

      if (res.status === 401) {
        setError("Not authenticated to fetch orders");
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || "Failed to fetch orders");
      }

      setData(transformApiData(json));
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
      toast.error("Failed to load orders data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [sessionStatus]);

  React.useEffect(() => {
    // Trigger fetch when session becomes authenticated
    if (sessionStatus === "authenticated") {
      fetchOrders();
    }
    // If session is loading, wait; if unauthenticated, set loading false
    if (sessionStatus === "unauthenticated") {
      setLoading(false);
      setData([]);
    }
  }, [fetchOrders, sessionStatus]);

  const dataIds = React.useMemo(() => data?.map(({ id }) => id) || [], [data]);

  // Filter data by date
  const filteredData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    if (dateFilter === "all") {
      return data;
    }

    const now = new Date();
    let startDate, endDate;

    switch (dateFilter) {
      case "today":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "yesterday":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setDate(now.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "last7days":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "custom":
        if (!customStartDate || !customEndDate) return data;
        startDate = new Date(customStartDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        return data;
    }

    return data.filter((order) => {
      if (!order || !order.orderTime) return false;
      const orderDate = new Date(order.orderTime);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }, [data, dateFilter, customStartDate, customEndDate]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id?.toString() || Math.random().toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  // Calculate daily stats
  const dailyStats = React.useMemo(() => {
    const orders = filteredData || [];
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );
    const completedOrders = orders.filter(
      (order) => order.status?.toLowerCase() === "completed"
    ).length;
    const averageOrderValue =
      orders.length > 0 ? totalRevenue / orders.length : 0;

    return {
      totalOrders: orders.length,
      totalRevenue,
      completedOrders,
      averageOrderValue,
    };
  }, [filteredData]);

  // New function to calculate hourly order data
  const calculateHourlyData = React.useCallback((orders) => {
    if (!orders || !Array.isArray(orders)) return [];

    // Initialize hours array from 9 AM to 9 PM
    const hours = Array.from({ length: 13 }, (_, i) => {
      const hour = i + 9; // Start from 9 AM
      return {
        hour: hour <= 12 ? `${hour} AM` : `${hour - 12} PM`,
        hour24: hour,
        orders: 0,
        revenue: 0,
      };
    });

    // Count orders and revenue by hour
    orders.forEach((order) => {
      if (!order.orderTime) return;

      const orderDate = new Date(order.orderTime);
      const orderHour = orderDate.getHours();

      // Find the corresponding hour slot
      const hourIndex = hours.findIndex((h) => h.hour24 === orderHour);
      if (hourIndex !== -1) {
        hours[hourIndex].orders += 1;
        hours[hourIndex].revenue += order.total || 0;
      }
    });

    return hours;
  }, []);

  // Calculate peak hour information
  const peakHourInfo = React.useMemo(() => {
    if (!filteredData.length) return null;

    const hourlyData = calculateHourlyData(filteredData);
    if (!hourlyData.length) return null;

    // Find the hour with maximum orders
    const peakHour = hourlyData.reduce(
      (max, hour) => (hour.orders > max.orders ? hour : max),
      hourlyData[0]
    );

    // Calculate average orders per hour
    const totalOrders = hourlyData.reduce((sum, hour) => sum + hour.orders, 0);
    const averageOrders = totalOrders / hourlyData.length;

    // Find all busy hours (hours with above-average orders)
    const busyHours = hourlyData
      .filter((hour) => hour.orders > averageOrders)
      .sort((a, b) => b.orders - a.orders);

    return {
      peakHour,
      busyHours,
      averageOrders,
      totalOrders,
      hourlyData,
    };
  }, [filteredData, calculateHourlyData]);

  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!peakHourInfo) return [];

    return peakHourInfo.hourlyData.map((hour) => ({
      hour: hour.hour,
      orders: hour.orders,
      revenue: hour.revenue,
    }));
  }, [peakHourInfo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-destructive text-2xl mb-2">Error</div>
          <p className="text-muted-foreground">
            Failed to load orders: {error}
          </p>
          <Button onClick={fetchOrders} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="orders" className="w-full flex-col justify-start gap-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <Label
            htmlFor="date-filter"
            className="text-sm font-medium whitespace-nowrap"
          >
            Date Filter:
          </Label>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-40" id="date-filter">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {dateFilter === "custom" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full sm:w-36"
                placeholder="Start date"
              />
              <span className="text-muted-foreground hidden sm:inline">to</span>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full sm:w-36"
                placeholder="End date"
              />
            </div>
          )}
        </div>

        <TabsList className="w-full sm:w-auto flex @4xl/main:flex">
          <TabsTrigger value="orders" className="flex-1 sm:flex-initial">
            Orders
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 sm:flex-initial">
            Analytics{" "}
            <Badge variant="secondary" className="ml-2">
              {filteredData.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            onClick={fetchOrders}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="flex-shrink-0"
          >
            {isRefreshing ? (
              <IconLoader className="h-4 w-4 animate-spin" />
            ) : (
              <IconRefresh className="h-4 w-4" />
            )}
            <span className="hidden lg:inline ml-2">Refresh</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-shrink-0">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <TabsContent
        value="orders"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No orders found for selected date filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="analytics">
        <AnalyticsTab peakHourInfo={peakHourInfo} dateFilter={dateFilter} />
      </TabsContent>
    </Tabs>
  );
}

// const chartData = [
//   { hour: "9 AM", sales: 186 },
//   { hour: "10 AM", sales: 305 },
//   { hour: "11 AM", sales: 437 },
//   { hour: "12 PM", sales: 673 },
//   { hour: "1 PM", sales: 409 },
//   { hour: "2 PM", sales: 314 },
//   { hour: "3 PM", sales: 237 },
//   { hour: "4 PM", sales: 173 },
// ];

// const chartConfig = {
//   sales: {
//     label: "Sales",
//     color: "var(--primary)",
//   },
//   orders: {
//     label: "Orders",
//     color: "var(--chart-1)",
//   },
//   revenue: {
//     label: "Revenue",
//     color: "var(--color-revenue)",
//   },
// };

function TableCellViewer({ item }) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left font-mono"
        >
          #{item.orderId || "N/A"}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Order #{item.orderId || "N/A"}</DrawerTitle>
          <DrawerDescription>
            {item.orderTime
              ? formatDateTime(item.orderTime, timezone)
              : "Date not available"}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">Customer</span>
              <span className="font-medium">
                {item.customer || "Unknown Customer"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">Phone</span>
              <span className="font-medium">{item.server || "Unknown"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">Status</span>
              <Badge
                variant="outline"
                className={`w-fit ${statusColors[item.status?.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200"}`}
              >
                {item.status || "Unknown"}
              </Badge>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">Token #</span>
              <span className="font-medium">#{item.tokenNumber || "N/A"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">
                Payment Status
              </span>
              <Badge
                variant="outline"
                className={`w-fit ${item.paymentStatus === "completed" ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}`}
              >
                {item.paymentStatus || "Unknown"}
              </Badge>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">
                Payment Method
              </span>
              <span className="font-medium">
                {item.paymentMethod || "Unknown"}
              </span>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Order Items</h4>
            <div className="space-y-2">
              {item.items?.length > 0 ? (
                item.items.map((orderItem, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <span className="font-medium">
                        {orderItem.quantity}x{" "}
                      </span>
                      {orderItem.name}
                    </div>
                    <div>
                      ₹
                      {(
                        (orderItem.quantity || 0) * (orderItem.price || 0)
                      ).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">
                  No items in this order
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex justify-between font-medium">
            <span>Total:</span>
            <span>₹{(item.total || 0).toFixed(2)}</span>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <Label htmlFor="status">Update Status</Label>
            <Select defaultValue={item.status || "pending"}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {item.completionTime && (
            <div className="text-xs text-muted-foreground">
              Completed at: {formatTimeOnly(item.completionTime, timezone)}
            </div>
          )}
        </div>
        <DrawerFooter>
          <Button>Save Changes</Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
