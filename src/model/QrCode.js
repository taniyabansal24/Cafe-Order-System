import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
    },
    qrUrl: {
      type: String,
      required: true, // ✅ Important!
    },
  },
  { timestamps: true }
);

const QrCode = mongoose.models.QrCode || mongoose.model("QrCode", qrCodeSchema);

export default QrCode;
