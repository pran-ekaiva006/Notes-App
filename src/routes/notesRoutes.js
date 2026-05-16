import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAllNotes, getNoteById, createNote, updateNote, deleteNote, shareNote } from "../controllers/notesController.js";

const router = express.Router();
router.use(protect);

router.get("/", getAllNotes);
router.post("/", createNote);
router.get("/:id", getNoteById);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.post("/:id/share", shareNote);

export default router;
