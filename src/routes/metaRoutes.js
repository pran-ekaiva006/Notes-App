import express from "express";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const router = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

router.get("/openapi.json", (req, res) => {
  try {
    const spec = JSON.parse(readFileSync(join(__dirname, "../docs/openapi.json"), "utf-8"));
    res.status(200).json(spec);
  } catch {
    res.status(500).json({ message: "Could not load API spec." });
  }
});

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
