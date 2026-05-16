import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { searchNotes } from "../controllers/notesController.js";

import { validateRequest } from "../middleware/validateRequest.js";
import { searchValidation } from "../validators/noteValidators.js";

const router = express.Router();

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Full-text search across your notes
 *     tags: [Search]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword (searches title and content)
 *         example: javascript
 *     responses:
 *       200:
 *         description: Search results (only your own notes)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResults'
 *       400:
 *         description: Missing or empty search query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized — no token provided
 */
router.get("/", protect, searchValidation, validateRequest, searchNotes);

export default router;
