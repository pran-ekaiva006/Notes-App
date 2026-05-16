import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { searchNotes } from "../controllers/notesController.js";

const router = express.Router();
router.get("/", protect, searchNotes);
export default router;
