import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAllNotes, getNoteById, createNote, updateNote, deleteNote, shareNote, togglePin } from "../controllers/notesController.js";

import { validateRequest } from "../middleware/validateRequest.js";
import { createNoteValidation, updateNoteValidation, shareNoteValidation } from "../validators/noteValidators.js";

const router = express.Router();
router.use(protect);

router.get("/", getAllNotes);
router.post("/", createNoteValidation, validateRequest, createNote);
router.get("/:id", getNoteById);
router.put("/:id", updateNoteValidation, validateRequest, updateNote);
router.delete("/:id", deleteNote);
router.post("/:id/share", shareNoteValidation, validateRequest, shareNote);
router.patch("/:id/pin", togglePin);

export default router;
