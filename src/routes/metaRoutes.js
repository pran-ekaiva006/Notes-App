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
    my_features: {
      "Note Tagging": "Each note supports up to 10 custom tags for lightweight categorization.",
      "Note Pinning": "Notes can be pinned and always appear first in GET /notes.",
      "Full-text Search": "GET /search?q= performs MongoDB text search across title, content and tags.",
      "Pagination": "GET /notes supports ?page and ?limit with total/totalPages metadata.",
      "Shared Note Access Control": "Shared users can read but only the owner can update, delete or share."
    }
  });
});

export default router;
