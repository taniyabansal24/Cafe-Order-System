import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: Number,
      required: true,
    },

    // 🔥 Multi-tenant: every order belongs to exactly one owner
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
    },

    items: [
      {
        _id: false,
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "completed", "cancelled"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "cash"],
      default: "razorpay",
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    customerName: String,
    customerPhone: String,
    customerEmail: String,
  },
  { timestamps: true }
);

// 📌 Get next token number (daily reset) for a specific owner - FIXED VERSION
OrderSchema.statics.getNextTokenNumber = async function (ownerId) {
  if (!ownerId) {
    throw new Error("Owner ID is required to generate token number");
  }

  console.log("🔄 getNextTokenNumber called for owner:", ownerId);

  // Get current date in UTC
  const now = new Date();
  const nowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  
  console.log("📅 Date info:");
  console.log("  Local now:", now);
  console.log("  UTC now:", nowUTC);
  console.log("  UTC date (ISO):", nowUTC.toISOString());

  // Start of today in UTC
  const startOfDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  
  // End of today in UTC (start of tomorrow)
  const endOfDayUTC = new Date(startOfDayUTC);
  endOfDayUTC.setUTCDate(endOfDayUTC.getUTCDate() + 1);

  console.log("📅 Date range for query:");
  console.log("  Start (UTC):", startOfDayUTC.toISOString());
  console.log("  End (UTC):", endOfDayUTC.toISOString());

  try {
    // Convert ownerId to ObjectId
    const ownerObjectId = mongoose.Types.ObjectId(ownerId);
    
    // Query with date range in UTC
    const lastOrderToday = await this.findOne({
      owner: ownerObjectId,
      createdAt: {
        $gte: startOfDayUTC,
        $lt: endOfDayUTC
      }
    }).sort({ tokenNumber: -1 });

    if (lastOrderToday) {
      console.log("🔍 Found last order today:", {
        token: lastOrderToday.tokenNumber,
        createdAt: lastOrderToday.createdAt,
        createdAtISO: lastOrderToday.createdAt.toISOString()
      });
    } else {
      console.log("🔍 No orders found for today");
    }

    const nextToken = lastOrderToday ? lastOrderToday.tokenNumber + 1 : 1;
    console.log("✅ Next token number will be:", nextToken);
    
    return nextToken;
  } catch (error) {
    console.error("❌ Error in getNextTokenNumber:", error);
    
    // Fallback: get max token number for owner (without date filter)
    try {
      const fallbackOrder = await this.findOne({ owner: ownerId })
        .sort({ tokenNumber: -1 });
      
      const fallbackToken = fallbackOrder ? fallbackOrder.tokenNumber + 1 : 1;
      console.log("🔄 Using fallback token:", fallbackToken);
      return fallbackToken;
    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError);
      return 1;
    }
  }
};

// Alternative: Simple version without date filtering (continuous)
OrderSchema.statics.getNextContinuousTokenNumber = async function (ownerId) {
  if (!ownerId) {
    throw new Error("Owner ID is required");
  }

  const ownerObjectId = mongoose.Types.ObjectId(ownerId);
  
  const lastOrder = await this.findOne({ owner: ownerObjectId })
    .sort({ tokenNumber: -1 });
  
  return lastOrder ? lastOrder.tokenNumber + 1 : 1;
};

// ⚡ Indexes for fast queries by owner & status
OrderSchema.index({ owner: 1, createdAt: -1 });
OrderSchema.index({ owner: 1, status: 1 });
OrderSchema.index({ owner: 1, tokenNumber: -1 });

// Prevent model overwrite error
const OrderModel =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default OrderModel;