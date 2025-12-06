"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  Loader2,
  Search,
  Filter,
  Package,
  IndianRupee,
  Percent,
  Tag,
  Coffee,
  Utensils,
  Pizza,
  CheckCircle,
  XCircle,
  MoreVertical,
  Edit,
  Plus,
  Save,
  X,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function AllItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Search & filters
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [minPriceFilter, setMinPriceFilter] = useState("");
  const [maxPriceFilter, setMaxPriceFilter] = useState("");
  const [minOfferFilter, setMinOfferFilter] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editedItem, setEditedItem] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/menu/my-items");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch");
        setItems(data.items || []);
        setFilteredItems(data.items || []);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Toggle availability
  const handleToggleAvailable = async (itemId, newStatus) => {
    try {
      const res = await fetch(`/api/menu/toggle-availability/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isAvailable: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update availability");

      setItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, isAvailable: newStatus } : item
        )
      );

      toast.success("Availability updated successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Delete flow
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setDeletingId(itemToDelete._id);
    try {
      const res = await fetch(`/api/menu/delete-item/${itemToDelete._id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete item");
      }
      setItems((prev) => prev.filter((item) => item._id !== itemToDelete._id));
      toast.success("Item deleted successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // Edit flow
  const handleEditStart = (item) => {
    setEditingId(item._id);
    setEditedItem({ ...item, offer: item.offer || 0 });
    setEditDialogOpen(true);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditedItem(null);
    setEditDialogOpen(false);
  };

  const handleEditSave = async () => {
    if (!editedItem) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/menu/update-item/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedItem),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update item");
      }
      const updatedItem = await res.json();
      // If API returns updated item directly, use it; otherwise fallback to editedItem
      setItems((prev) =>
        prev.map((it) => (it._id === editingId ? updatedItem || editedItem : it))
      );
      toast.success("Item updated successfully");
      handleEditCancel();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    setEditedItem((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setEditedItem((prev) => ({ ...prev, [name]: value }));
  };

  // Unique lists for filters
  const uniqueTypes = [...new Set(items.map((i) => i.type).filter(Boolean))];
  const uniqueCategories = [
    ...new Set(items.map((i) => i.category).filter(Boolean)),
  ];

  // Apply filters + search
  useEffect(() => {
    let temp = [...items];

    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      temp = temp.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
      );
    }

    // Type
    if (typeFilter !== "all") {
      temp = temp.filter(
        (item) => item.type?.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    // Category
    if (categoryFilter !== "all") {
      temp = temp.filter(
        (item) => item.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Price min/max
    if (minPriceFilter !== "") {
      const min = Number(minPriceFilter);
      if (!isNaN(min)) temp = temp.filter((item) => item.price >= min);
    }
    if (maxPriceFilter !== "") {
      const max = Number(maxPriceFilter);
      if (!isNaN(max)) temp = temp.filter((item) => item.price <= max);
    }

    // Offer
    if (minOfferFilter !== "") {
      const mo = Number(minOfferFilter);
      if (!isNaN(mo)) temp = temp.filter((item) => (item.offer || 0) >= mo);
    }

    // Availability
    if (availabilityFilter === "available") {
      temp = temp.filter((item) => item.isAvailable);
    } else if (availabilityFilter === "unavailable") {
      temp = temp.filter((item) => !item.isAvailable);
    }

    setFilteredItems(temp);
  }, [
    searchTerm,
    typeFilter,
    categoryFilter,
    availabilityFilter,
    minPriceFilter,
    maxPriceFilter,
    minOfferFilter,
    items,
  ]);

  // Active filters count
  const activeFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (typeFilter !== "all") count++;
    if (categoryFilter !== "all") count++;
    if (availabilityFilter !== "all") count++;
    if (minPriceFilter !== "" || maxPriceFilter !== "") count++;
    if (minOfferFilter !== "") count++;
    return count;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setAvailabilityFilter("all");
    setMinPriceFilter("");
    setMaxPriceFilter("");
    setMinOfferFilter("");
  };

  // Helpers for UI
  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "drink":
      case "beverage":
        return <Coffee className="h-4 w-4" />;
      case "food":
      case "meal":
        return <Utensils className="h-4 w-4" />;
      case "snack":
        return <Pizza className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "drink":
      case "beverage":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300";
      case "food":
      case "meal":
        return "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300";
      case "snack":
        return "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-300";
      default:
        return "bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Menu Items
              </h1>
              <p className="text-muted-foreground mt-1 md:mt-2">
                Manage your cafe menu items
              </p>
            </div>
            <Button
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 w-full md:w-auto"
              onClick={() => router.push("/menu/add-item")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Item
            </Button>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6 border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4 md:p-6">
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items by name, description, category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Desktop Filters */}
              <div className="hidden md:block">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4 items-end">
                  {/* Type */}
                  <div className="min-w-0">
                    <Label className="text-xs sm:text-sm mb-1 sm:mb-2 block">
                      Type
                    </Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="h-10 min-h-10 w-full" aria-label="Filter by type">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2 shrink-0" />
                          <SelectValue placeholder="All Types" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {uniqueTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category */}
                  <div className="min-w-0">
                    <Label className="text-xs sm:text-sm mb-1 sm:mb-2 block">
                      Category
                    </Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="h-10 min-h-10 w-full" aria-label="Filter by category">
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-2 shrink-0" />
                          <SelectValue placeholder="All Categories" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {uniqueCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Availability */}
                  <div className="min-w-0">
                    <Label className="text-xs sm:text-sm mb-1 sm:mb-2 block">
                      Status
                    </Label>
                    <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                      <SelectTrigger className="h-10 min-h-10 w-full" aria-label="Filter by status">
                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-2 shrink-0" />
                          <SelectValue placeholder="All Status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="available">Available Only</SelectItem>
                        <SelectItem value="unavailable">Unavailable Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Advanced Toggle */}
                  <div className="flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="h-10 min-h-10 w-full sm:w-auto flex items-center justify-center gap-2 md:gap-3"
                      aria-expanded={showFilters}
                      aria-controls="advanced-filters"
                      title={showFilters ? "Hide advanced filters" : "Show advanced filters"}
                    >
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">{showFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}</span>
                      {showFilters ? (
                        <ChevronUp className="h-4 w-4 ml-1 hidden sm:inline" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1 hidden sm:inline" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Advanced */}
                {showFilters && (
                  <div id="advanced-filters" className="border-t pt-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Price Range (₹)</Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <IndianRupee className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="Min"
                              value={minPriceFilter}
                              onChange={(e) => setMinPriceFilter(e.target.value)}
                              className="pl-8"
                              min="0"
                            />
                          </div>
                          <div className="relative flex-1">
                            <IndianRupee className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="Max"
                              value={maxPriceFilter}
                              onChange={(e) => setMaxPriceFilter(e.target.value)}
                              className="pl-8"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm mb-2 block">Min Offer (%)</Label>
                        <div className="relative">
                          <Percent className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            placeholder="Minimum offer"
                            value={minOfferFilter}
                            onChange={(e) => setMinOfferFilter(e.target.value)}
                            className="pl-8"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>

                      <div className="flex items-end">
                        <Button variant="outline" onClick={clearFilters} className="w-full md:w-auto">
                          Clear All Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Filters */}
              <div className="md:hidden">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {activeFiltersCount() > 0 ? (
                      <span className="font-medium text-primary">{activeFiltersCount()} active filter(s)</span>
                    ) : (
                      "No filters applied"
                    )}
                  </div>
                  <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="relative">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                        {activeFiltersCount() > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                            {activeFiltersCount()}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[85vw] sm:w-[400px]">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                        <SheetDescription>Apply filters to find specific menu items</SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-6">
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Type</Label>
                          <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger>
                              <Package className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              {uniqueTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium mb-2 block">Category</Label>
                          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger>
                              <Tag className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              {uniqueCategories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium mb-2 block">Status</Label>
                          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                            <SelectTrigger>
                              <Filter className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="available">Available Only</SelectItem>
                              <SelectItem value="unavailable">Unavailable Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium mb-2 block">Price Range (₹)</Label>
                          <div className="space-y-3">
                            <div className="relative">
                              <IndianRupee className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input type="number" placeholder="Minimum price" value={minPriceFilter} onChange={(e) => setMinPriceFilter(e.target.value)} className="pl-8" min="0" />
                            </div>
                            <div className="relative">
                              <IndianRupee className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input type="number" placeholder="Maximum price" value={maxPriceFilter} onChange={(e) => setMaxPriceFilter(e.target.value)} className="pl-8" min="0" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium mb-2 block">Minimum Offer (%)</Label>
                          <div className="relative">
                            <Percent className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="number" placeholder="e.g., 10" value={minOfferFilter} onChange={(e) => setMinOfferFilter(e.target.value)} className="pl-8" min="0" max="100" />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                          <Button variant="outline" onClick={clearFilters} className="flex-1">Clear All</Button>
                          <Button onClick={() => setMobileFilterOpen(false)} className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">Apply Filters</Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <CardTitle>Menu Items</CardTitle>
                  <CardDescription>{filteredItems.length} items found</CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  {filteredItems.length === items.length ? "All items" : `${filteredItems.length} of ${items.length} items shown`}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No items found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || typeFilter !== "all" || categoryFilter !== "all" ? "Try adjusting your filters" : "Start by adding your first menu item"}
                  </p>
                  <Button onClick={() => router.push("/menu/add-item")} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Item
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800">
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead className="hidden md:table-cell">Category</TableHead>
                        <TableHead className="hidden lg:table-cell">Type</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="hidden sm:table-cell">Offer</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item, index) => (
                        <TableRow key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-12 md:h-12 md:w-16 overflow-hidden rounded-md">
                                {item.images?.length > 0 ? (
                                  <Image src={item.images[0]} alt={item.name} fill className="object-cover" unoptimized />
                                ) : (
                                  <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                                    <Package className="h-4 w-4 md:h-6 md:w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate">{item.name}</div>
                                <div className="text-xs md:text-sm text-muted-foreground truncate">{item.description || "No description"}</div>
                                <div className="md:hidden mt-1">
                                  <Badge variant="outline" className={`${getTypeBadgeColor(item.type)} text-xs`}>
                                    {getTypeIcon(item.type)}
                                    <span className="ml-1">{item.type}</span>
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{item.category || "Uncategorized"}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant="outline" className={getTypeBadgeColor(item.type)}>
                              {getTypeIcon(item.type)}
                              <span className="ml-1">{item.type}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-bold">₹{item.price}</div>
                            {item.offer > 0 && (
                              <div className="text-xs text-green-600 md:hidden">
                                Save ₹{((item.price * item.offer) / 100).toFixed(2)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {item.offer > 0 ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{item.offer}% OFF</Badge> : <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              <Switch id={`available-${item._id}`} checked={item.isAvailable} onCheckedChange={(checked) => handleToggleAvailable(item._id, checked)} className="data-[state=checked]:bg-green-500 h-5 w-9" />
                              <Label htmlFor={`available-${item._id}`} className="ml-2 hidden sm:block">
                                {item.isAvailable ? (
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Available</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-amber-600 border-amber-200"><XCircle className="h-3 w-3 mr-1" />Unavailable</Badge>
                                )}
                              </Label>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1 md:gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleEditStart(item)} className="h-7 w-7 md:h-8 md:w-8" title="Edit">
                                <Edit className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => handleDeleteClick(item)} disabled={deletingId === item._id} className="h-7 w-7 md:h-8 md:w-8" title="Delete">
                                {deletingId === item._id ? <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" /> : <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-red-600" />}
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="icon" className="h-7 w-7 md:h-8 md:w-8"><MoreVertical className="h-3 w-3 md:h-4 md:w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleEditStart(item)}><Edit className="mr-2 h-4 w-4" />Edit Details</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleToggleAvailable(item._id, !item.isAvailable)}>
                                    {item.isAvailable ? <><EyeOff className="mr-2 h-4 w-4" />Mark as Unavailable</> : <><Eye className="mr-2 h-4 w-4" />Mark as Available</>}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(item)}><Trash2 className="mr-2 h-4 w-4" />Delete Item</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t px-4 md:px-6 py-4">
              <div className="text-sm text-muted-foreground">Showing {filteredItems.length} of {items.length} items</div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Edit Item Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit className="h-5 w-5 text-blue-600" />Edit Menu Item</DialogTitle>
            <DialogDescription>Update the details for this menu item</DialogDescription>
          </DialogHeader>

          {editedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" value={editedItem.name || ""} onChange={handleEditChange} className="col-span-3" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" name="description" value={editedItem.description || ""} onChange={handleEditChange} className="col-span-3" rows={3} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Price (₹)</Label>
                <Input id="price" name="price" type="number" value={editedItem.price || ""} onChange={handleEditChange} className="col-span-3" min="0" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="offer" className="text-right">Offer (%)</Label>
                <Input id="offer" name="offer" type="number" value={editedItem.offer || ""} onChange={handleEditChange} className="col-span-3" min="0" max="100" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Input id="category" name="category" value={editedItem.category || ""} onChange={handleEditChange} className="col-span-3" placeholder="e.g., Beverages, Snacks" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type</Label>
                <Select value={editedItem.type || ""} onValueChange={(val) => handleSelectChange("type", val)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isAvailable" className="text-right">Available</Label>
                <div className="col-span-3 flex items-center">
                  <Switch id="isAvailable" checked={editedItem.isAvailable} onCheckedChange={(checked) => setEditedItem((p) => ({ ...p, isAvailable: checked }))} className="data-[state=checked]:bg-green-500" />
                  <Label htmlFor="isAvailable" className="ml-2 text-sm">{editedItem.isAvailable ? "Available" : "Unavailable"}</Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleEditCancel} disabled={savingEdit}><X className="h-4 w-4 mr-2" />Cancel</Button>
            <Button onClick={handleEditSave} disabled={savingEdit} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
              {savingEdit ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Trash2 className="h-5 w-5 text-red-500" /> Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete:</AlertDialogDescription>
            {itemToDelete && (
              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  {itemToDelete.images?.length > 0 ? (
                    <div className="relative h-16 w-20 overflow-hidden rounded-md">
                      <Image src={itemToDelete.images[0]} alt={itemToDelete.name} fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="h-16 w-20 bg-gray-100 rounded-md flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{itemToDelete.name}</p>
                    <p className="text-sm text-muted-foreground">₹{itemToDelete.price} • {itemToDelete.type}</p>
                  </div>
                </div>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={!!deletingId} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              {deletingId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />} Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
