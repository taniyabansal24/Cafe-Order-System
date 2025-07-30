import jwt from "jsonwebtoken";
import OwnerModel from "@/models/owner.model";

export const getOwnerFromToken = async (req) => {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const owner = await OwnerModel.findById(decoded.id);
    return owner;
  } catch (err) {
    return null;
  }
};