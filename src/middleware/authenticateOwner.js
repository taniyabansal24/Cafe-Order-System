import jwt from "jsonwebtoken";
import OwnerModel from "../models/owner.model.js";

export const authenticateOwner = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Unauthorized: No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const owner = await OwnerModel.findById(decoded.id);

    if (!owner) return res.status(401).json({ message: "Owner not found" });

    req.owner = owner; // Attach to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
