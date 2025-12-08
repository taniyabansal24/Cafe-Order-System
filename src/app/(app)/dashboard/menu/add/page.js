"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Loader2, Plus, Upload } from "lucide-react";

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

    const newPreviews = validImages.map((file) => URL.createObjectURL(file));
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Add New Menu Item
              </h1>
              <p className="text-muted-foreground mt-1 md:mt-2">
                Add a new item to your cafe menu
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/menu")}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 w-full sm:w-auto text-white"
            >
              View All Items
            </Button>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Add Menu Item</CardTitle>
            <CardDescription>
              Fill in the details below to add a new item to your menu
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Item Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Item Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. Veg Burger"
                      value={item.name}
                      onChange={(e) =>
                        setItem({ ...item, name: e.target.value })
                      }
                      className="bg-white dark:bg-gray-900"
                      required
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
                      className="bg-white dark:bg-gray-900"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item..."
                    value={item.description}
                    onChange={(e) =>
                      setItem({ ...item, description: e.target.value })
                    }
                    className="min-h-[100px] bg-white dark:bg-gray-900"
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Pricing */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Price (₹) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ₹
                      </span>
                      <Input
                        id="price"
                        type="number"
                        placeholder="149"
                        value={item.price}
                        onChange={(e) =>
                          setItem({ ...item, price: e.target.value })
                        }
                        className="pl-8 bg-white dark:bg-gray-900"
                        required
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Offer */}
                  <div className="space-y-2">
                    <Label htmlFor="offer">Discount (%)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        %
                      </span>
                      <Input
                        id="offer"
                        type="number"
                        placeholder="10"
                        value={item.offer}
                        onChange={(e) =>
                          setItem({ ...item, offer: e.target.value })
                        }
                        className="pl-8 bg-white dark:bg-gray-900"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  {/* Type */}
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={item.type}
                      onValueChange={(value) =>
                        setItem({ ...item, type: value })
                      }
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-900">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Veg">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            Veg
                          </span>
                        </SelectItem>
                        <SelectItem value="Non-Veg">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                            Non-Veg
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Image Upload */}
              <div className="space-y-4">
                <div>
                  <Label>Images (Optional)</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload up to 5 images
                  </p>
                </div>

                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium">Click to upload</p>
                      <p className="text-sm text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
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
                  </div>
                </div>

                {/* Image Previews */}
                {previewImages.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Selected ({previewImages.length}/5)</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
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
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {previewImages.map((preview, index) => (
                        <div
                          key={index}
                          className="relative group rounded-lg overflow-hidden border"
                        >
                          <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
                            <Image
                              src={preview}
                              alt={`Preview ${index}`}
                              width={500} // required — set any approximate width
                              height={500} // required — set any approximate height
                              className="h-full w-full object-cover"
                              unoptimized // add this ONLY if preview is a blob URL (File object)
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Settings */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Availability */}
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <Label htmlFor="available" className="font-medium">
                        Available
                      </Label>
                      <p className="text-sm text-gray-500">Show in menu</p>
                    </div>
                    <Switch
                      id="available"
                      checked={item.isAvailable}
                      onCheckedChange={(checked) =>
                        setItem({ ...item, isAvailable: checked })
                      }
                    />
                  </div>

                  {/* Featured */}
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <Label htmlFor="featured" className="font-medium">
                        Featured
                      </Label>
                      <p className="text-sm text-gray-500">Highlight item</p>
                    </div>
                    <Switch
                      id="featured"
                      checked={item.featured}
                      onCheckedChange={(checked) =>
                        setItem({ ...item, featured: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding Item...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Menu Item
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
            Quick Tips
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>• Use clear, descriptive names</li>
            <li>• Add good quality images</li>
            <li>• Set appropriate categories</li>
            <li>• Update prices regularly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
