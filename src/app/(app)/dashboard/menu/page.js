"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
import { AppSidebar } from "@/components/app-sidebar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2 } from "lucide-react";
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

export default function AllItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deletedItems, setDeletedItems] = useState([]);

  // Add new state for editing
  const [editingId, setEditingId] = useState(null);
  const [editedItem, setEditedItem] = useState(null);

  // Add this function to handle edit start
  const handleEditStart = (item) => {
    setEditingId(item._id);
    setEditedItem({ ...item });
  };

  // Add this function to handle edit cancel
  const handleEditCancel = () => {
    setEditingId(null);
    setEditedItem(null);
  };

  // Add this function to handle saving edits
  const handleEditSave = async () => {
    if (!editedItem) return;

    try {
      const res = await fetch(`/api/menu/update-item/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedItem),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update item");
      }

      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item._id === editingId ? { ...item, ...editedItem } : item
        )
      );
      setFilteredItems((prev) =>
        prev.map((item) =>
          item._id === editingId ? { ...item, ...editedItem } : item
        )
      );

      toast.success("Item updated successfully");
      setEditingId(null);
      setEditedItem(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Add this function to handle input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedItem((prev) => ({
      ...prev,
      [name]: name === "price" || name === "offer" ? Number(value) : value,
    }));
  };

  // Filters
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [offerFilter, setOfferFilter] = useState("");
  const [minPriceFilter, setMinPriceFilter] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/menu/my-items");
        const data = await res.json();
        console.log("Full API response:", data);
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

      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, isAvailable: newStatus } : item
        )
      );
      setFilteredItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, isAvailable: newStatus } : item
        )
      );

      toast.success("Availability updated successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    setDeletingId(itemToDelete._id);
    try {
      // Store for possible undo
      setDeletedItems((prev) => [...prev, itemToDelete]);

      const res = await fetch(`/api/menu/delete-item/${itemToDelete._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete item");
      }

      setItems((prev) => prev.filter((item) => item._id !== itemToDelete._id));
      setFilteredItems((prev) =>
        prev.filter((item) => item._id !== itemToDelete._id)
      );

      toast.success("Item deleted successfully", {
        action: {
          label: "Undo",
          onClick: () => handleUndoDelete(itemToDelete),
        },
      });
    } catch (error) {
      // Remove from deleted items if failed
      setDeletedItems((prev) => prev.filter((i) => i._id !== itemToDelete._id));
      toast.error(error.message);
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleUndoDelete = async (item) => {
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

      if (item.imageUrl) {
        const imageResponse = await fetch(item.imageUrl);
        const imageBlob = await imageResponse.blob();
        formData.append("images", imageBlob, item.imageUrl.split("/").pop());
      }

      const res = await fetch("/api/menu/add-item", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to restore item");

      const data = await res.json();
      setItems((prev) => [...prev, data.item]);
      setFilteredItems((prev) => [...prev, data.item]);
      setDeletedItems((prev) => prev.filter((i) => i._id !== item._id));

      toast.success("Item restored successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Apply filters
  useEffect(() => {
    let temp = [...items];

    if (typeFilter) {
      temp = temp.filter(
        (item) => item.type.toLowerCase() === typeFilter.toLowerCase()
      );
    }
    if (categoryFilter) {
      temp = temp.filter(
        (item) => item.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    const min = minPriceFilter === "" ? null : Number(minPriceFilter);
    temp = temp.filter((item) => {
      if (min !== null) {
        return item.price >= min;
      }
      return true;
    });

    if (offerFilter) {
      const numeric = parseFloat(offerFilter);
      if (!isNaN(numeric)) {
        temp = temp.filter((item) => item.offer >= numeric);
      }
    }

    setFilteredItems(temp);
  }, [typeFilter, categoryFilter, minPriceFilter, offerFilter, items]);

  const uniqueTypes = [...new Set(items.map((i) => i.type))];
  const uniqueCategories = [
    ...new Set(items.map((i) => i.category).filter(Boolean)),
  ];

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 mx-2" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Menu Items</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="p-6">
          <h2 className="text-3xl font-bold mb-4">All Menu Items</h2>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <p>No items available.</p>
          ) : (
            <div className="overflow-x-auto">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium">Type</label>
                  <select
                    className="border rounded px-3 py-1"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    {uniqueTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Category</label>
                  <select
                    className="border rounded px-3 py-1"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Min Price</label>
                  <input
                    type="number"
                    className="border rounded px-3 py-1 w-20"
                    placeholder="Min ₹"
                    value={minPriceFilter}
                    onChange={(e) => setMinPriceFilter(e.target.value)}
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Offer ≥</label>
                  <input
                    type="number"
                    className="border rounded px-3 py-1"
                    placeholder="Min %"
                    value={offerFilter}
                    onChange={(e) => setOfferFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Table */}
              <div className="relative w-full overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 min-w-[350px] sm:min-w-[500px] md:min-w-[700px] lg:min-w-[900px]">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                      <th className="p-3">S.No</th>
                      <th className="p-3">Image</th>
                      <th className="p-3">Name</th>
                      <th className="p-3 hidden sm:table-cell">Description</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Offer</th>
                      <th className="p-3 hidden md:table-cell">Category</th>
                      <th className="p-3 hidden md:table-cell">Type</th>
                      <th className="p-3">Available</th>
                      <th className="p-3 text-center">Edit</th>
                      <th className="p-3 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, index) => (
                      <tr
                        key={item._id}
                        className="border-t border-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 dark:hover:text-white"
                      >
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 w-[70px]">
                          {item.images?.length > 0 ? (
                            <Image
                              src={item.images[0]}
                              alt={item.name}
                              width={60}
                              height={40}
                              className="rounded object-cover h-[40px]"
                              unoptimized
                            />
                          ) : (
                            <span className="text-gray-400">No image</span>
                          )}
                        </td>
                        <td className="p-3">
                          {editingId === item._id ? (
                            <Input
                              name="name"
                              value={editedItem.name}
                              onChange={handleEditChange}
                              className="h-8"
                            />
                          ) : (
                            item.name
                          )}
                        </td>
                        <td className="p-3 hidden sm:table-cell">
                          {editingId === item._id ? (
                            <Input
                              name="description"
                              value={editedItem.description}
                              onChange={handleEditChange}
                              className="h-8"
                            />
                          ) : (
                            item.description
                          )}
                        </td>
                        <td className="p-3">
                          {editingId === item._id ? (
                            <Input
                              name="price"
                              type="number"
                              value={editedItem.price}
                              onChange={handleEditChange}
                              className="h-8 w-20"
                            />
                          ) : (
                            `₹${item.price}`
                          )}
                        </td>
                        <td className="p-3">
                          {editingId === item._id ? (
                            <Input
                              name="offer"
                              type="number"
                              value={editedItem.offer}
                              onChange={handleEditChange}
                              className="h-8 w-16"
                            />
                          ) : item.offer ? (
                            `${item.offer}%`
                          ) : (
                            "None"
                          )}
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          {editingId === item._id ? (
                            <Input
                              name="category"
                              value={editedItem.category}
                              onChange={handleEditChange}
                              className="h-8"
                            />
                          ) : (
                            item.category || "-"
                          )}
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          {editingId === item._id ? (
                            <select
                              name="type"
                              value={editedItem.type}
                              onChange={handleEditChange}
                              className="border rounded px-2 py-1 h-8 text-sm"
                            >
                              {uniqueTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          ) : (
                            item.type
                          )}
                        </td>
                        <td className="p-3">
                          <Switch
                            id={`available-${item._id}`}
                            checked={item.isAvailable}
                            onCheckedChange={(checked) =>
                              handleToggleAvailable(item._id, checked)
                            }
                          />
                        </td>
                        <td className="p-3 text-center">
                          {editingId === item._id ? (
                            <div className="flex gap-2 justify-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEditSave}
                                className="h-8"
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEditCancel}
                                className="h-8"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditStart(item)}
                            >
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(item)}
                            disabled={
                              deletingId === item._id || editingId === item._id
                            }
                          >
                            {deletingId === item._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-600" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete:
                <div className="mt-2 p-2 bg-red-50 rounded">
                  <p className="font-medium">{itemToDelete?.name}</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={!!deletingId}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={!!deletingId}
                className="bg-red-600 hover:bg-red-700"
              >
                {deletingId ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
