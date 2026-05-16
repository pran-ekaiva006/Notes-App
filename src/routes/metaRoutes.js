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
      "Note Pinning": "Toggle pin/unpin via PATCH /notes/:id/pin. Pinned notes always appear first in GET /notes. Chose this because it mirrors real-world note apps like Google Keep where users need to prioritize important notes.",
      "Note Tagging": "Each note supports a tags array for lightweight categorization without requiring folders. Chose this because tags offer flexible, non-hierarchical organization that scales better than rigid folder structures.",
      "Full-text Search": "GET /search?q=keyword performs MongoDB text-indexed search across title and content, scoped to the authenticated user's notes. Chose this because fast search is essential for any notes app with growing data.",
      "Pagination": "GET /notes?page=1&limit=10 returns paginated results with totalPages metadata. Chose this to ensure the API scales gracefully as users accumulate hundreds of notes."
    }
  });
});

export default router;
