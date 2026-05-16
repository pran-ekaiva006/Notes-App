import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { searchNotes } from "../controllers/notesController.js";

import { validateRequest } from "../middleware/validateRequest.js";
import { searchValidation } from "../validators/noteValidators.js";

const router = express.Router();
router.get("/", protect, searchValidation, validateRequest, searchNotes);
export default router;
