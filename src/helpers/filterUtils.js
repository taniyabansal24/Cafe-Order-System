// helpers/filterUtils.js

// Main filter function that applies all filters
export const applyOrderFilters = (orders, filters) => {
  let filtered = [...orders];

  // Search filter
  if (filters.searchTerm) {
    filtered = filtered.filter(
      (order) =>
        order.tokenNumber.toString().includes(filters.searchTerm) ||
        order.customerName
          ?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        order.items.some((item) =>
          item.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
        )
    );
  }

  // Status filter
  if (filters.status) {
    filtered = filtered.filter((order) => order.status === filters.status);
  }

  // Min amount filter
  if (filters.minAmount) {
    const minAmount = parseFloat(filters.minAmount);
    filtered = filtered.filter((order) => order.total >= minAmount);
  }

  // Date filter
  if (filters.date) {
    filtered = filtered.filter((order) => {
      const orderDate = new Date(order.createdAt).toLocaleDateString("en-CA");
      return orderDate === filters.date;
    });
  }

  // Payment method filter
  if (filters.paymentMethod) {
    filtered = filtered.filter(
      (order) => order.paymentMethod === filters.paymentMethod
    );
  }

  // Time range filter (for pending page)
  if (filters.timeRange) {
    const now = new Date();
    let startDate = new Date();

    switch (filters.timeRange) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "thisWeek":
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case "thisMonth":
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        break;
    }

    filtered = filtered.filter(
      (order) => new Date(order.createdAt) >= startDate
    );
  }

  return filtered;
};

// Helper to check if any filters are active
export const hasActiveFilters = (filters) => {
  return Object.values(filters).some(
    (value) =>
      value !== undefined && value !== null && value !== "" && value !== false
  );
};

// Helper to clear all filters
export const getInitialFilters = (defaultFilters = {}) => {
  return {
    searchTerm: "",
    status: "",
    minAmount: "",
    date: "",
    paymentMethod: "",
    timeRange: "",
    ...defaultFilters,
  };
};

// Filter configuration for different pages
export const getFilterConfig = (pageType) => {
  const baseConfig = {
    searchTerm: {
      type: "search",
      placeholder: "Search orders...",
    },
  };

  const pageConfigs = {
    allOrders: {
      ...baseConfig,
      status: {
        placeholder: "Status",
        type: "select",
        options: [
          { value: "", label: "All statuses" },
          { value: "pending", label: "Pending" },
          { value: "completed", label: "Completed" },
          { value: "cancelled", label: "Cancelled" },
        ],
      },
      minAmount: {
        type: "number",
        placeholder: "Min Amount (₹)",
        min: 0,
      },
      date: {
        type: "date",
        placeholder: "Select date",
      },
    },
    pending: {
      ...baseConfig,
      paymentMethod: {
        type: "select",
        options: [
          { value: "", label: "All methods" },
          { value: "cash", label: "Cash" },
          { value: "razorpay", label: "Online" },
        ],
      },
      timeRange: {
        type: "select",
        options: [
          { value: "", label: "All time" },
          { value: "today", label: "Today" },
          { value: "thisWeek", label: "This Week" },
          { value: "thisMonth", label: "This Month" },
        ],
      },
    },
    completed: {
      ...baseConfig,
      date: {
        type: "date",
        placeholder: "Select date",
      },
      paymentMethod: {
        type: "select",
        options: [
          { value: "", label: "All methods" },
          { value: "cash", label: "Cash" },
          { value: "razorpay", label: "Online" },
        ],
      },
    },
  };

  return pageConfigs[pageType] || baseConfig;
};
