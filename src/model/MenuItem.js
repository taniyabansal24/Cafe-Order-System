import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },
    offer: { type: Number, default: 0 },
    category: {
      type: String,
    },
    type: { type: String, enum: ["Veg", "Non-Veg"], default: "Veg" },
    isAvailable: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    images: [String], // Array of image URLs
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner", // 👈 Must match the model name exported from OwnerModel
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent model overwrite error in dev
const MenuItemModel =
  mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);

export default MenuItemModel;
