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
      "JWT auth": "Secure endpoints with JSON Web Tokens",
      "Note sharing": "Share notes with other users securely",
      "Pinned notes": "Pin important notes to keep them at the top",
      "Search functionality": "MongoDB full-text search across all notes"
    }
  });
});

export default router;
