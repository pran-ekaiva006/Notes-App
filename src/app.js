import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

import authRoutes from "./routes/authRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import metaRoutes from "./routes/metaRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

// Security Middlewares
app.use(helmet());
app.use(mongoSanitize());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" },
});

app.use(apiLimiter);
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => res.status(200).json({ message: "Notes API running" }));

app.use("/", metaRoutes);
app.use("/", authRoutes);
app.use("/notes", notesRoutes);
app.use("/search", searchRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` }));
app.use(errorMiddleware);

export default app;
