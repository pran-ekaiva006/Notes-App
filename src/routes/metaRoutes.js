import express from "express";
import swaggerSpec from "../docs/swaggerConfig.js";

const router = express.Router();

/**
 * @swagger
 * /openapi.json:
 *   get:
 *     summary: Get the OpenAPI 3.0 specification
 *     tags: [Meta]
 *     responses:
 *       200:
 *         description: The full OpenAPI JSON specification
 */
router.get("/openapi.json", (req, res) => {
  res.status(200).json(swaggerSpec);
});

/**
 * @swagger
 * /about:
 *   get:
 *     summary: About this API and its developer
 *     tags: [Meta]
 *     responses:
 *       200:
 *         description: API information and feature list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: Pranjal Kumar Verma
 *                 email:
 *                   type: string
 *                   example: pranjalkumarverma18@gmail.com
 *                 my features:
 *                   type: object
 */
router.get("/about", (req, res) => {
  res.status(200).json({
    name: "Pranjal Kumar Verma",
    email: "pranjalkumarverma18@gmail.com",
    "my features": {
      "Note Version History": "Every PUT /notes/:id automatically snapshots the previous title and content. GET /notes/:id/history returns a full chronological history (newest first, max 10 versions). POST /notes/:id/restore/:version rolls back to any past state — and saves the current state first, so no work is ever truly lost. Chose this because it solves a real, painful user problem: accidentally overwriting or deleting important content with no way to recover it.",
      "Note Pinning": "PATCH /notes/:id/pin toggles isPinned. Pinned notes always appear first in GET /notes. Chose this because users need a fast way to keep critical notes visible without reorganizing their entire list.",
      "Full-text Search": "GET /search?q=keyword uses MongoDB $text indexes on title and content, scoped to the authenticated user's own notes. Results are ranked by relevance score. Chose this because search is essential UX for any notes app with growing data.",
      "Pagination": "GET /notes?page=1&limit=10 returns paginated results with currentPage, totalPages, and totalNotes metadata. Chose this to ensure the API stays performant at scale rather than returning unbounded arrays."
    }
  });
});

export default router;
