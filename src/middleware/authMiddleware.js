import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Access denied. No token provided.", 401));
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(new AppError("Token has expired. Please log in again.", 401));
      }
      return next(new AppError("Invalid token. Please log in again.", 401));
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError("User belonging to this token no longer exists.", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
