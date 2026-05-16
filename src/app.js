import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import metaRoutes from "./routes/metaRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.status(200).json({ message: "Notes API running" }));

app.use("/", metaRoutes);
app.use("/", authRoutes);
app.use("/notes", notesRoutes);
app.use("/search", searchRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` }));
app.use(errorMiddleware);

export default app;
