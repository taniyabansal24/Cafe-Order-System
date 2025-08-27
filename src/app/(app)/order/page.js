"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import CloudinaryImage from "@/components/cloudinary-image";
import { Search, Plus, Minus, ShoppingCart, ChefHat, Clock, Star, Wheat, Beef, Sparkles } from "lucide-react";

export default function OrderPage() {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [cart, setCart] = useState([]);
  const [tokenNumber, setTokenNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVegFilter, setIsVegFilter] = useState(false);
  const [cafeName, setCafeName] = useState("Delicious Bites Café"); // Default name

  // Define your preferred category order here
  const preferredCategoryOrder = [
    "Pizza",
    "Burger",
    "Pasta & Noodles",
    "Drinks",
    "Desserts",
    "Snacks",
  ];

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setIsLoading(true);
        setError(null);

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

        // Extract unique categories and sort them according to preferred order
        const uniqueCategories = [
          ...new Set(data.items.map((item) => item.category).filter(Boolean)),
        ];
        
        // Sort categories based on preferred order
        const sortedCategories = uniqueCategories.sort((a, b) => {
          const indexA = preferredCategoryOrder.indexOf(a);
          const indexB = preferredCategoryOrder.indexOf(b);
          
          // If both categories are in the preferred order, sort by that order
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }
          
          // If only one category is in the preferred order, it comes first
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          
          // If neither category is in the preferred order, sort alphabetically
          return a.localeCompare(b);
        });

        setCategories(sortedCategories);

        // Set activeCategory to empty string to show all items by default
        setActiveCategory("");

        // Try to get cafe name from menu data if available
        if (data.cafeName) {
          setCafeName(data.cafeName);
        } else if (data.items.length > 0 && data.items[0].cafeName) {
          setCafeName(data.items[0].cafeName);
        }

      } catch (err) {
        console.error("Error fetching menu:", err);
        setError(err.message);
        toast.error("Failed to load menu. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
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

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          total: calculateTotal(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Order failed");

      setTokenNumber(data.tokenNumber);
      toast.success(`Order placed! Your token number is ${data.tokenNumber}`);
      setCart([]);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter menu items based on search, category, and veg filter
  const filteredMenu = menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory ? item.category === activeCategory : true;
    
    // Use the type property for filtering (Veg/Non-Veg)
    const matchesVegFilter = isVegFilter ? item.type === "Veg" : true;
    
    return matchesSearch && matchesCategory && matchesVegFilter;
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <Card className="w-full max-w-md border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6 text-center space-y-4">
            <h1 className="text-2xl font-bold text-amber-900">Error Loading Menu</h1>
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
        <p className="text-amber-800 font-medium">Loading our delicious menu...</p>
      </div>
    );
  }

  if (tokenNumber) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <Card className="w-full max-w-md border-0 shadow-xl overflow-hidden bg-white/90 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Order Confirmed!</h1>
            <p className="mt-2 text-amber-100">Your delicious food is being prepared</p>
          </div>
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-5xl font-bold text-amber-600 my-6 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              #{tokenNumber}
            </div>
            <p className="text-gray-600">Please wait for your token number to be called</p>
            <p className="text-gray-600">You can show this number to collect your order</p>
            <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>Estimated wait time: 15-20 minutes</span>
            </div>
            <Button 
              onClick={() => setTokenNumber(null)} 
              className="w-full mt-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            >
              Place New Order
            </Button>
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
              <Label htmlFor="veg-filter" className="text-sm text-amber-800 flex items-center">
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
              <Card key={item._id} className="overflow-hidden border-amber-200 bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 px-4">
                <div className="flex">
                  <div className="w-28 h-28 relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                    <CloudinaryImage
                      src={item.images?.[0] || "https://res.cloudinary.com/dreeyzl13/image/upload/v1753902411/cafe-items/vmwtbgdybuxkfzfpcppb.jpg"}
                      alt={item.name}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                    {/* Use item.type instead of item.isVeg */}
                    <div className={`absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center ${item.type === "Veg" ? 'bg-green-500' : 'bg-red-500'} z-20 shadow-md`}>
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
                      <h3 className="font-semibold text-amber-900">{item.name}</h3>
                      <span className="font-bold text-amber-700">₹{item.price}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                    {item.popular && (
                      <div className="flex items-center mt-2">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span className="text-xs text-amber-600 ml-1">Popular</span>
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

      {/* Cart Drawer */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-xl border-t border-amber-200 rounded-t-2xl p-4 z-30">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-amber-900 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Your Order ({cart.length} {cart.length === 1 ? 'item' : 'items'})
              </h3>
              <span className="font-bold text-amber-700">₹{calculateTotal()}</span>
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
                      <div className={`w-3 h-3 rounded-full mr-2 flex items-center justify-center ${item.type === "Veg" ? 'bg-green-500' : 'bg-red-500'}`}>
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
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-6 text-center font-medium">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 rounded-full border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <Button
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 py-3 text-lg font-semibold rounded-xl text-white"
              onClick={handleSubmitOrder}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Placing Order...
                </>
              ) : (
                `Place Order - ₹${calculateTotal()}`
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}