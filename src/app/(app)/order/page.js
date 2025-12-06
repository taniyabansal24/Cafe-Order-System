"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import CloudinaryImage from "@/components/cloudinary-image";
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  ChefHat,
  Clock,
  Star,
  Wheat,
  Beef,
  Sparkles,
  CreditCard,
  User,
  Phone,
  Mail,
} from "lucide-react";

// Load Razorpay script dynamically
const loadRazorpayScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export default function OrderPage() {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [cart, setCart] = useState([]);
  const [tokenNumber, setTokenNumber] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null); // Add this
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVegFilter, setIsVegFilter] = useState(false);
  const [cafeName, setCafeName] = useState("Delicious Bites Café");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [customerDetailsError, setCustomerDetailsError] = useState({
    name: "",
    phone: "",
  });
  const [razorpayOrderData, setRazorpayOrderData] = useState(null);

  // Download Bill Function - Fixed version with Razorpay amount integration
  const downloadBill = async (
    orderId,
    tokenNumber,
    customerDetails,
    cartItems,
    total
  ) => {
    try {
      console.log("Starting bill download process...");

      // If orderId is available, try to download from API
      if (orderId) {
        console.log("Attempting to download bill from API for order:", orderId);

        // Fixed API endpoint - using correct path
        const response = await fetch(`/api/orders/${orderId}/bill`);

        if (response.ok) {
          console.log("API bill download successful");
          const blob = await response.blob();

          // Check if blob is valid
          if (blob.size === 0) {
            throw new Error("Empty bill received from server");
          }

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `bill-${orderId}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          toast.success("Bill downloaded successfully");
          return;
        } else {
          console.warn("API bill download failed, status:", response.status);
          // Don't throw here, fallback to offline generation
        }
      }

      // Fallback: Generate bill using current data with Razorpay amount integration
      console.log("Using fallback bill generation");

      // Try to fetch order data to get razorpayAmount
      let razorpayAmount = null;
      if (orderId) {
        try {
          const orderResponse = await fetch(`/api/orders/${orderId}`);
          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            razorpayAmount = orderData.razorpayAmount;
            console.log("Fetched razorpayAmount from order:", razorpayAmount);
          }
        } catch (fetchError) {
          console.warn(
            "Could not fetch order data for razorpayAmount:",
            fetchError
          );
        }
      }

      // Use the razorpayAmount if available, otherwise fallback to total
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const charges = calculateCharges(subtotal, razorpayAmount);

      await generateOfflineBill(
        tokenNumber,
        customerDetails,
        cartItems,
        subtotal,
        charges
      );
    } catch (error) {
      console.error("Error downloading bill:", error);

      // Enhanced fallback with better error handling
      try {
        // Calculate charges for fallback
        const subtotal = cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const charges = calculateCharges(subtotal, null); // No razorpayAmount in fallback

        await generateOfflineBill(
          tokenNumber,
          customerDetails,
          cartItems,
          subtotal,
          charges
        );
      } catch (fallbackError) {
        console.error("Fallback bill generation also failed:", fallbackError);
        toast.error("Failed to download bill receipt. Please try again.");
      }
    }
  };

  // Updated calculateCharges function to match Razorpay breakdown
  const calculateCharges = (subtotal, razorpayAmount = null) => {
    // Use the razorpayAmount if available - this should match the final Razorpay total
    if (razorpayAmount && razorpayAmount !== subtotal) {
      const razorpayTotal = razorpayAmount;
      const totalCharges = razorpayTotal - subtotal; // This should be ₹3.52 in your example

      // Razorpay typically charges 2% convenience fee + 18% GST on that fee
      // So: totalCharges = (subtotal * 0.02) + GST on that fee
      // Let's calculate the breakdown:
      const baseConvenienceFee = totalCharges / 1.18; // Remove 18% GST
      const gstOnConvenience = totalCharges - baseConvenienceFee;

      return {
        subtotal: subtotal,
        convenienceCharge: parseFloat(baseConvenienceFee.toFixed(2)),
        gstOnConvenience: parseFloat(gstOnConvenience.toFixed(2)),
        total: parseFloat(razorpayTotal.toFixed(2)),
        isRazorpayBreakdown: true,
      };
    } else {
      // If no razorpayAmount or amount equals subtotal, use simple calculation
      // But this should rarely happen for online payments
      const convenienceFee = subtotal * 0.02;
      const gstOnConvenience = convenienceFee * 0.18;
      const total = subtotal + convenienceFee + gstOnConvenience;

      return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        convenienceCharge: parseFloat(convenienceFee.toFixed(2)),
        gstOnConvenience: parseFloat(gstOnConvenience.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        isRazorpayBreakdown: true,
      };
    }
  };

  // Updated generateOfflineBill function
  const generateOfflineBill = async (
    tokenNumber,
    customerDetails,
    cartItems,
    subtotal,
    charges // Add this parameter
  ) => {
    try {
      const currentCafeName = cafeName || "Delicious Bites Café";

      // Use the pre-calculated charges instead of calculating inside
      // This ensures consistency with Razorpay breakdown

      // Create HTML bill content with accurate pricing
      const billContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Bill Receipt - ${currentCafeName}</title>
  <style>
    /* ... your existing styles remain the same ... */
  </style>
</head>
<body>
  <div class="receipt-container">
    <!-- ... header and order info remain the same ... -->
    
    <div class="content">
      <!-- ... customer info and order summary remain the same ... -->
      
      <div class="section">
        <div class="section-title">PAYMENT SUMMARY</div>
        <div class="payment-summary">
          <div class="payment-row">
            <span>Item Total:</span>
            <span>₹${charges.subtotal.toFixed(2)}</span>
          </div>
          <div class="payment-row">
            <span>Convenience Fee:</span>
            <span>₹${charges.convenienceCharge.toFixed(2)}</span>
          </div>
          <div class="payment-row">
            <span>GST on Convenience Fee (18%):</span>
            <span>₹${charges.gstOnConvenience.toFixed(2)}</span>
          </div>
          <div class="payment-row total-row">
            <span>TOTAL AMOUNT:</span>
            <span>₹${charges.total.toFixed(2)}</span>
          </div>
          <div class="payment-row" style="margin-top: 15px;">
            <span>Payment Status:</span>
            <span class="status-badge">PAID</span>
          </div>
          <div class="payment-row">
            <span>Payment Method:</span>
            <span>Online Payment</span>
          </div>
        </div>
      </div>
      
      <!-- ... rest of your bill content ... -->
    </div>
  </div>
</body>
</html>
`;

      // Create blob and download as HTML file
      const blob = new Blob([billContent], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bill-receipt-${tokenNumber}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Bill receipt downloaded successfully");
    } catch (error) {
      console.error("Error generating offline bill:", error);
      toast.error("Failed to generate bill receipt");
      throw error;
    }
  };

const preferredCategoryOrder = useMemo(() => [
  "Pizza",
  "Burger",
  "Pasta & Noodles",
  "Drinks",
  "Desserts",
  "Snacks",
], []);


  useEffect(() => {
    const fetchMenuAndCafe = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch menu items
        const response = await fetch("/api/menu/my-items", {
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.items || !Array.isArray(data.items)) {
          throw new Error("Invalid menu data format");
        }

        setMenu(data.items);

        // Extract unique categories and sort them
        const uniqueCategories = [
          ...new Set(data.items.map((item) => item.category).filter(Boolean)),
        ];

        const sortedCategories = uniqueCategories.sort((a, b) => {
          const indexA = preferredCategoryOrder.indexOf(a);
          const indexB = preferredCategoryOrder.indexOf(b);

          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.localeCompare(b);
        });

        setCategories(sortedCategories);
        setActiveCategory("");

        // If we have items, get owner ID and fetch cafe name from owner
        if (data.items.length > 0 && data.items[0].owner) {
          const ownerId = data.items[0].owner;
          await fetchCafeName(ownerId);
        }
      } catch (err) {
        console.error("Error fetching menu:", err);
        setError(err.message);
        toast.error("Failed to load menu. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCafeName = async (ownerId) => {
      try {
        const ownerResponse = await fetch(`/api/owner/${ownerId}`);
        const ownerData = await ownerResponse.json();

        if (ownerResponse.ok && ownerData.success && ownerData.owner) {
          setCafeName(ownerData.owner.cafeName);
        } else {
          console.warn("Could not fetch cafe name, using default");
        }
      } catch (ownerError) {
        console.error("Error fetching owner:", ownerError);
        // Continue with default cafe name
      }
    };

    fetchMenuAndCafe();
  }, []);

  const addToCart = (item) => {
    setCart((prev) => {
      const existingItem = prev.find((cartItem) => cartItem._id === item._id);
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((item) => item._id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Validate customer details
  const validateCustomerDetails = () => {
    const errors = {
      name: "",
      phone: "",
    };

    let isValid = true;

    if (!customerDetails.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!customerDetails.phone.trim()) {
      errors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(customerDetails.phone.trim())) {
      errors.phone = "Please enter a valid 10-digit phone number";
      isValid = false;
    }

    setCustomerDetailsError(errors);
    return isValid;
  };

  // Initialize Razorpay payment
  const initializeRazorpayPayment = async () => {
    // First, test if Razorpay is configured
    try {
      const testResponse = await fetch("/api/test-razorpay");
      const testData = await testResponse.json();

      if (!testData.configured) {
        toast.error(
          "Payment system is not configured. Please contact support."
        );
        return;
      }
    } catch (error) {
      console.error("Razorpay config check failed:", error);
      toast.error("Unable to verify payment configuration");
      return;
    }

    // Validate customer details
    if (!validateCustomerDetails()) {
      toast.error("Please fix the errors in customer details");
      return;
    }

    const res = await loadRazorpayScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      toast.error("Payment gateway failed to load. Are you online?");
      return;
    }

    // Create order on your server
    try {
      setIsProcessingPayment(true);
      const orderResponse = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: calculateTotal() * 100, // Convert to paise
          currency: "INR",
          items: cart,
        }),
      });

      // Check if response is JSON
      const contentType = orderResponse.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await orderResponse.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned an invalid response");
      }

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      // Rest of your Razorpay initialization code...
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: cafeName,
        description: "Food Order Payment",
        order_id: orderData.id,
        // Inside your Razorpay handler, after payment verification:
        handler: async function (response) {
          try {
            const verificationResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verificationData = await verificationResponse.json();

            if (verificationResponse.ok && verificationData.success) {
              // Store Razorpay order data for accurate billing
              setRazorpayOrderData(verificationData.orderData);

              // Payment successful, create order
              const orderResponse = await fetch("/api/orders", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  items: cart,
                  total: calculateTotal(),
                  // Use the actual amount from Razorpay for accurate billing
                  razorpayAmount: verificationData.orderData
                    ? verificationData.orderData.amount / 100
                    : calculateTotal(),
                  paymentStatus: "completed",
                  razorpayOrderId: verificationData.razorpayOrderId,
                  razorpayPaymentId: verificationData.razorpayPaymentId,
                  razorpaySignature: verificationData.razorpaySignature,
                  customer: customerDetails,
                }),
              });

              const orderData = await orderResponse.json();

              if (orderResponse.ok) {
                // Store the completed order details with accurate pricing
                const orderDetails = {
                  items: [...cart],
                  total: calculateTotal(),
                  // Use Razorpay amount for accurate billing display
                  razorpayAmount: verificationData.orderData
                    ? verificationData.orderData.amount / 100
                    : calculateTotal(),
                  customer: { ...customerDetails },
                  tokenNumber: orderData.tokenNumber,
                  orderId: orderData._id,
                  date: new Date().toLocaleDateString(),
                  time: new Date().toLocaleTimeString(),
                };

                setCompletedOrder(orderDetails);
                setTokenNumber(orderData.tokenNumber);
                setOrderId(orderData._id);

                toast.success(
                  `Order placed! Your token number is ${orderData.tokenNumber}`
                );

                setCart([]);
                setCustomerDetails({ name: "", phone: "", email: "" });
                setCustomerDetailsError({ name: "", phone: "" });
              } else {
                throw new Error(orderData.message || "Order creation failed");
              }
            } else {
              toast.error(
                verificationData.error ||
                  "Payment verification failed. Please contact support."
              );
            }
          } catch (error) {
            console.error("Order processing error:", error);
            toast.error(
              error.message ||
                "Failed to process order. Please contact support."
            );
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: customerDetails.name || "Customer",
          email: customerDetails.email || "customer@example.com",
          contact: customerDetails.phone || "9999999999",
        },
        theme: {
          color: "#F59E0B",
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error(
        error.message || "Failed to initialize payment. Please try again."
      );
      setIsProcessingPayment(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Initialize Razorpay payment
    await initializeRazorpayPayment();
  };

  // Filter menu items based on search, category, and veg filter
  const filteredMenu = menu.filter((item) => {
    // Skip items that are not available
    if (!item.isAvailable) return false;

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory
      ? item.category === activeCategory
      : true;

    // Use the type property for filtering (Veg/Non-Veg)
    const matchesVegFilter = isVegFilter ? item.type === "Veg" : true;

    return matchesSearch && matchesCategory && matchesVegFilter;
  });

  // // Handle cash payment
  // const handleCashPayment = async () => {
  //   try {
  //     setIsProcessingPayment(true);

  //     // Validate customer details
  //     if (!validateCustomerDetails()) {
  //       toast.error("Please fix the errors in customer details");
  //       setIsProcessingPayment(false);
  //       return;
  //     }

  //     // Create order with cash payment
  //     const orderResponse = await fetch("/api/orders", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         items: cart,
  //         total: calculateTotal(),
  //         paymentStatus: "pending",
  //         paymentMethod: "cash",
  //         customer: customerDetails,
  //       }),
  //     });

  //     const orderData = await orderResponse.json();

  //     if (orderResponse.ok) {
  //       setTokenNumber(orderData.tokenNumber);
  //       toast.success(
  //         `Order placed! Your token number is ${orderData.tokenNumber}. Please pay at the counter.`
  //       );
  //       setCart([]);
  //       setCustomerDetails({ name: "", phone: "", email: "" });
  //       setCustomerDetailsError({ name: "", phone: "" });
  //     } else {
  //       throw new Error(orderData.message || "Order creation failed");
  //     }
  //   } catch (error) {
  //     console.error("Cash order error:", error);
  //     toast.error(error.message || "Failed to place order. Please try again.");
  //   } finally {
  //     setIsProcessingPayment(false);
  //   }
  // };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <Card className="w-full max-w-md border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6 text-center space-y-4">
            <h1 className="text-2xl font-bold text-amber-900">
              Error Loading Menu
            </h1>
            <p className="text-red-500">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-600 mb-4"></div>
        <p className="text-amber-800 font-medium">
          Loading our delicious menu...
        </p>
      </div>
    );
  }

  // Update the order confirmation screen to show accurate charges
  if (tokenNumber && completedOrder) {
    const charges = calculateCharges(completedOrder.total);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <Card className="w-full max-w-lg border-0 shadow-2xl overflow-hidden bg-white/95 backdrop-blur-sm">
          {/* Header with Restaurant Branding */}
          <div className="bg-gradient-to-r from-amber-700 to-orange-700 text-white p-6 text-center border-b-4 border-amber-500">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border-2 border-white/30">
              <ChefHat className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{cafeName}</h1>
            <p className="mt-2 text-amber-100 text-sm font-medium">
              Restaurant & Café
            </p>
            <div className="mt-3 text-xs text-amber-200 opacity-90">
              <p>Order Confirmed • Payment Received</p>
            </div>
          </div>

          <CardContent className="p-0">
            {/* Order Information Header */}
            <div className="bg-amber-600 text-white px-6 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">TOKEN NO</p>
                  <p className="text-2xl font-bold">
                    #{completedOrder.tokenNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">ORDER TIME</p>
                  <p className="text-sm">{completedOrder.time}</p>
                </div>
              </div>
            </div>

            {/* Bill Content */}
            <div className="p-6">
              {/* Customer Information */}
              <div className="mb-6 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                <h3 className="font-bold text-amber-900 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  CUSTOMER INFORMATION
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-amber-700">Name:</span>
                    <p className="text-amber-900">
                      {completedOrder.customer.name}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-amber-700">Phone:</span>
                    <p className="text-amber-900">
                      {completedOrder.customer.phone}
                    </p>
                  </div>
                  {completedOrder.customer.email && (
                    <div className="col-span-2">
                      <span className="font-medium text-amber-700">Email:</span>
                      <p className="text-amber-900">
                        {completedOrder.customer.email}
                      </p>
                    </div>
                  )}
                  <div className="col-span-2 border-t border-amber-200 pt-2 mt-2">
                    <span className="font-medium text-amber-700">
                      Order Date:
                    </span>
                    <p className="text-amber-900">{completedOrder.date}</p>
                  </div>
                </div>
              </div>
              {/* Order Items Table */}
              <div className="mb-6">
                <h3 className="font-bold text-amber-900 mb-3 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  ORDER SUMMARY
                </h3>

                <div className="border border-amber-200 rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-amber-100 px-4 py-2 grid grid-cols-12 gap-2 text-xs font-bold text-amber-900 uppercase">
                    <div className="col-span-6">Item</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-right">Price</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-amber-100">
                    {completedOrder.items.map((item, index) => (
                      <div
                        key={item._id}
                        className="px-4 py-3 grid grid-cols-12 gap-2 text-sm hover:bg-amber-50/50"
                      >
                        <div className="col-span-6 flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${item.type === "Veg" ? "bg-green-500" : "bg-red-500"}`}
                          ></div>
                          <span className="font-medium text-amber-900">
                            {item.name}
                          </span>
                        </div>
                        <div className="col-span-2 text-center text-amber-700">
                          {item.quantity}
                        </div>
                        <div className="col-span-2 text-right text-amber-700">
                          ₹{item.price}
                        </div>
                        <div className="col-span-2 text-right font-semibold text-amber-900">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Payment Summary */}
              {/* In your order confirmation screen, update the payment summary section: */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                <h3 className="font-bold text-amber-900 mb-3">
                  PAYMENT SUMMARY
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-700">Item Total:</span>
                    <span className="text-amber-900">
                      ₹{charges.subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-amber-700">Convenience Fee:</span>
                    <span className="text-amber-900">
                      ₹{charges.convenienceCharge.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-amber-700">
                      GST on Convenience Fee (18%):
                    </span>
                    <span className="text-amber-900">
                      ₹{charges.gstOnConvenience.toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t border-amber-300 pt-2 mt-2">
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span className="text-amber-900">TOTAL AMOUNT:</span>
                      <span className="text-amber-700">
                        ₹{charges.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-amber-200">
                    <span className="text-sm font-medium text-green-600">
                      Payment Status:
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      PAID
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-amber-600 mt-2">
                    <span>Payment Method:</span>
                    <span>Online Payment</span>
                  </div>
                </div>
              </div>
              {/* Order Notes */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-start">
                  <Clock className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Estimated Preparation Time
                    </p>
                    <p className="text-xs text-blue-700">
                      15-20 minutes • Please wait for your token number to be
                      called
                    </p>
                  </div>
                </div>
              </div>
              {/* Thank You Message */}
              <div className="mt-6 text-center">
                <p className="text-sm text-amber-600 italic">
                  Thank you for dining with us! We hope you enjoy your meal.
                </p>
                <p className="text-xs text-amber-500 mt-1">
                  For any queries, please contact: +91 XXXXX XXXXX
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 px-4">
              {/* In your order confirmation screen, update the downloadBill call:*/}
              <Button
                onClick={() =>
                  downloadBill(
                    completedOrder.orderId,
                    completedOrder.tokenNumber,
                    completedOrder.customer,
                    completedOrder.items,
                    completedOrder.total
                  )
                }
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Download Bill Receipt
              </Button>
              <Button
                onClick={() => {
                  setTokenNumber(null);
                  setOrderId(null);
                  setCompletedOrder(null);
                }}
                variant="outline"
                className="w-full border-amber-300 text-amber-700 hover:bg-amber-100 hover:border-amber-400 font-medium py-3 rounded-lg transition-all duration-200"
              >
                Place New Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4 sticky top-0 z-20 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-center">{cafeName}</h1>
          <p className="text-center text-amber-100 text-sm flex items-center justify-center">
            <Sparkles className="h-3 w-3 mr-1" />
            Delicious food, quick service
            <Sparkles className="h-3 w-3 ml-1" />
          </p>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="sticky top-16 z-10 bg-white/80 backdrop-blur-sm p-4 border-b border-amber-200 shadow-sm">
        <div className="container mx-auto space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-amber-600" />
            <Input
              type="text"
              placeholder="Search for dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-amber-300 focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="veg-filter"
                checked={isVegFilter}
                onCheckedChange={setIsVegFilter}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
              />
              <Label
                htmlFor="veg-filter"
                className="text-sm text-amber-800 flex items-center"
              >
                <Wheat className="h-4 w-4 mr-1 text-green-600" />
                Veg Only
              </Label>
            </div>

            <div className="text-xs text-amber-700 flex items-center">
              <Beef className="h-3 w-3 mr-1 text-red-500" />
              Non-Veg
              <Wheat className="h-3 w-3 ml-2 mr-1 text-green-500" />
              Veg
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto bg-white/90 backdrop-blur-sm p-4 space-x-3 sticky top-36 z-10 shadow-sm border-b border-amber-200">
        <Button
          variant={!activeCategory ? "default" : "outline"}
          onClick={() => setActiveCategory("")}
          className="whitespace-nowrap rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-300 hover:from-amber-700 hover:to-orange-700"
        >
          All Items
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            onClick={() => setActiveCategory(category)}
            className="whitespace-nowrap rounded-full bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="container mx-auto p-4">
        {filteredMenu.length === 0 ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-amber-200">
            <Search className="h-12 w-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-amber-800">
              {isVegFilter ? "No vegetarian items found" : "No items found"}
            </h3>
            <p className="text-amber-600">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMenu.map((item) => (
              <Card
                key={item._id}
                className="overflow-hidden border-amber-200 bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 px-4"
              >
                <div className="flex">
                  <div className="w-28 h-28 relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                    <CloudinaryImage
                      src={
                        item.images?.[0] ||
                        "https://res.cloudinary.com/dreeyzl13/image/upload/v1753902411/cafe-items/vmwtbgdybuxkfzfpcppb.jpg"
                      }
                      alt={item.name}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                    {/* Use item.type instead of item.isVeg */}
                    <div
                      className={`absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center ${item.type === "Veg" ? "bg-green-500" : "bg-red-500"} z-20 shadow-md`}
                    >
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    {item.category && (
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-20">
                        {item.category}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-amber-900">
                        {item.name}
                      </h3>
                      <span className="font-bold text-amber-700">
                        ₹{item.price}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                    {item.popular && (
                      <div className="flex items-center mt-2">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span className="text-xs text-amber-600 ml-1">
                          Popular
                        </span>
                      </div>
                    )}
                    <div className="flex justify-end mt-3">
                      <Button
                        size="sm"
                        onClick={() => addToCart(item)}
                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-xl border-t border-amber-200 rounded-t-2xl p-4 z-30">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-amber-900 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Your Order ({cart.length} {cart.length === 1 ? "item" : "items"}
                )
              </h3>
              <span className="font-bold text-amber-700">
                ₹{calculateTotal()}
              </span>
            </div>

            {/* Customer Details Form - Always shown and required */}
            <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-medium mb-2 flex items-center">
                <User className="h-4 w-4 mr-1" />
                Customer Details *
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="name" className="text-xs">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={customerDetails.name}
                    onChange={(e) => {
                      setCustomerDetails({
                        ...customerDetails,
                        name: e.target.value,
                      });
                      // Clear error when user starts typing
                      if (customerDetailsError.name) {
                        setCustomerDetailsError({
                          ...customerDetailsError,
                          name: "",
                        });
                      }
                    }}
                    placeholder="Your name"
                    className={`h-8 text-sm ${customerDetailsError.name ? "border-red-500" : ""}`}
                  />
                  {customerDetailsError.name && (
                    <p className="text-xs text-red-500 mt-1">
                      {customerDetailsError.name}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs">
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerDetails.phone}
                    onChange={(e) => {
                      setCustomerDetails({
                        ...customerDetails,
                        phone: e.target.value,
                      });
                      // Clear error when user starts typing
                      if (customerDetailsError.phone) {
                        setCustomerDetailsError({
                          ...customerDetailsError,
                          phone: "",
                        });
                      }
                    }}
                    placeholder="Phone number"
                    className={`h-8 text-sm ${customerDetailsError.phone ? "border-red-500" : ""}`}
                  />
                  {customerDetailsError.phone && (
                    <p className="text-xs text-red-500 mt-1">
                      {customerDetailsError.phone}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs">
                    Email (Optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        email: e.target.value,
                      })
                    }
                    placeholder="Email (optional)"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto mb-4">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center py-3 border-b border-amber-100 last:border-b-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      {/* Use item.type instead of item.isVeg */}
                      <div
                        className={`w-3 h-3 rounded-full mr-2 flex items-center justify-center ${item.type === "Veg" ? "bg-green-500" : "bg-red-500"}`}
                      >
                        <div className="w-1 h-1 rounded-full bg-white"></div>
                      </div>
                      <p className="font-medium text-amber-900">{item.name}</p>
                    </div>
                    <p className="text-sm text-amber-600 ml-5">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 rounded-full border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={() =>
                        updateQuantity(item._id, item.quantity - 1)
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-6 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 rounded-full border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={() =>
                        updateQuantity(item._id, item.quantity + 1)
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 py-3 text-lg font-semibold rounded-xl text-white flex items-center justify-center"
                onClick={handleSubmitOrder}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Pay ₹{calculateTotal()}
                  </>
                )}
              </Button>

              {/* <Button
                variant="outline"
                onClick={handleCashPayment}
                disabled={isProcessingPayment}
                className="py-3 text-lg font-semibold rounded-xl"
              >
                Pay with Cash at Counter
              </Button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
