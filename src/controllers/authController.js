import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { AppError } from "../utils/AppError.js";

export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(new AppError("Email and password are required.", 400));
    if (password.length < 6) return next(new AppError("Password must be at least 6 characters.", 400));

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return next(new AppError("An account with this email already exists.", 400));

    const user = await User.create({ email, password });
    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) { next(error); }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(new AppError("Email and password are required.", 400));

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({ access_token: generateToken(user._id) });
  } catch (error) { next(error); }
};
