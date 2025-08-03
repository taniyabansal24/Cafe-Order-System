"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2 } from "lucide-react";

export default function AddItemPage() {
  const router = useRouter();
  const [item, setItem] = useState({
    name: "",
    description: "",
    price: "",
    offer: "",
    category: "",
    type: "Veg",
    isAvailable: true,
    featured: false,
    images: [],
  });

  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!item.name || !item.price) {
      return toast.error("Name and price are required");
    }
    if (isNaN(item.price) || item.price <= 0) {
      return toast.error("Please enter a valid price");
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", item.name);
      formData.append("description", item.description);
      formData.append("price", item.price);
      formData.append("offer", item.offer || "0");
      formData.append("category", item.category);
      formData.append("type", item.type);
      formData.append("isAvailable", item.isAvailable.toString());
      formData.append("featured", item.featured.toString());

      item.images.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch("/api/menu/add-item", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add item");
      }

      const data = await response.json();
      toast.success("Item added successfully!", {
        action: {
          label: "View Items",
          onClick: () => router.push("/dashboard/menu"),
        },
      });

      // Reset form
      setItem({
        name: "",
        description: "",
        price: "",
        offer: "",
        category: "",
        type: "Veg",
        isAvailable: true,
        featured: false,
        images: [],
      });
      setPreviewImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error(error.message);
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const maxFiles = 5;
    if (files.length + item.images.length > maxFiles) {
      return toast.error(`Maximum ${maxFiles} images allowed`);
    }

    const validImages = files.filter((file) => file.type.startsWith("image/"));
    if (validImages.length !== files.length) {
      toast.warning("Some files were not images and were skipped");
    }

    const newImages = [...item.images, ...validImages];
    setItem((prev) => ({ ...prev, images: newImages }));

    const newPreviews = validImages.map((file) =>
      URL.createObjectURL(file)
    );
    setPreviewImages((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setItem((prev) => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });

    setPreviewImages((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      return newPreviews;
    });

    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      const remainingFiles = [...item.images];
      remainingFiles.splice(index, 1);
      remainingFiles.forEach((file) => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;
    }
  };

  const getFileInputDisplay = () => {
    if (!item.images.length) return "No image chosen";
    if (item.images.length === 1) return item.images[0].name;
    return `${item.images.length} files selected`;
  };

  return (
    <SidebarProvider
      className="min-h-screen bg-background text-foreground"
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Menu Items</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Add Item</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex justify-center md:p-6">
          <div className="w-full max-w-2xl bg-card text-card-foreground shadow-lg rounded-2xl p-8 space-y-6 border border-border">
            <h2 className="text-3xl font-bold">Add New Menu Item</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Item Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Veg Burger"
                  value={item.name}
                  onChange={(e) => setItem({ ...item, name: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="e.g. Crispy patty with veggies"
                  value={item.description}
                  onChange={(e) =>
                    setItem({ ...item, description: e.target.value })
                  }
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g. Snacks"
                  value={item.category}
                  onChange={(e) =>
                    setItem({ ...item, category: e.target.value })
                  }
                />
              </div>

              {/* Price & Offer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g. 149"
                    value={item.price}
                    onChange={(e) =>
                      setItem({ ...item, price: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offer">Offer (%)</Label>
                  <Input
                    id="offer"
                    type="number"
                    placeholder="e.g. 10"
                    value={item.offer}
                    onChange={(e) =>
                      setItem({ ...item, offer: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={item.type}
                  onChange={(e) => setItem({ ...item, type: e.target.value })}
                >
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                </select>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="images">Images (you can select multiple)</Label>
                <div className="flex items-center gap-2">
                  <label className="flex-1">
                    <div className="flex items-center gap-2 border border-input rounded-md px-3 py-2 bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer">
                      <span>Choose file:</span>
                      <span className="text-sm truncate">{getFileInputDisplay()}</span>
                    </div>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      ref={fileInputRef}
                      className="hidden"
                    />
                  </label>
                  {item.images.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setItem({ ...item, images: [] });
                        setPreviewImages([]);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Image Previews */}
                {previewImages.length > 0 && (
                  <div className="mt-4">
                    <Label>Selected Images:</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {previewImages.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index}`}
                            className="h-24 w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                            {item.images[index].name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Switch
                    id="available"
                    checked={item.isAvailable}
                    onCheckedChange={(checked) =>
                      setItem({ ...item, isAvailable: checked })
                    }
                  />
                  <Label htmlFor="available">Available</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    id="featured"
                    checked={item.featured}
                    onCheckedChange={(checked) =>
                      setItem({ ...item, featured: checked })
                    }
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full text-base gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding Item...
                  </>
                ) : (
                  "Add Item"
                )}
              </Button>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
