import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
  searchNotes,
} from "../controllers/notesController.js";

const router = express.Router();

// All notes routes require authentication
router.use(protect);

router.get("/search", searchNotes);       // GET /search?q=keyword
router.get("/", getAllNotes);             // GET /notes
router.post("/", createNote);            // POST /notes
router.get("/:id", getNoteById);         // GET /notes/:id
router.put("/:id", updateNote);          // PUT /notes/:id
router.delete("/:id", deleteNote);       // DELETE /notes/:id
router.post("/:id/share", shareNote);    // POST /notes/:id/share

export default router;
