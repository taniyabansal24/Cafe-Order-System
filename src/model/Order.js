import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: Number,
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

// Get the next token number
OrderSchema.statics.getNextTokenNumber = async function () {
  const lastOrder = await this.findOne().sort({ tokenNumber: -1 });
  return lastOrder ? lastOrder.tokenNumber + 1 : 1;
};

// Prevent model overwrite error in dev
const OrderModel = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default OrderModel;