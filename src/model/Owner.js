import mongoose from "mongoose";

const OwnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    verifyCode: {
      type: String,
      required: function () {
        return !this.isVerified;
      }, // Only required if not verified
    },
    verifyCodeExpiry: {
      type: Date,
      required: function () {
        return !this.isVerified;
      }, // Only required if not verified
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    cafeName: {
      type: String,
      required: [true, "Cafe name is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^\+91[6-9]\d{9}$/,
        "Please enter a valid Indian phone number with +91",
      ],
    },

    phoneVerifyCode: {
      type: String,
    },
    phoneVerifyExpiry: {
      type: Date,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      match: [/^\d{6}$/, "Pincode must be a 6-digit number"],
    },
  },
  { timestamps: true }
);

const OwnerModel =
  mongoose.models.Owner || mongoose.model("Owner", OwnerSchema);

export default OwnerModel;
