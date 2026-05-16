import { body, param, query } from "express-validator";

export const createNoteValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title and content are required.")
    .isString()
    .withMessage("Title must be a string."),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Title and content are required.")
    .isString()
    .withMessage("Content must be a string."),
  body("tags").optional().isArray().withMessage("Tags must be an array of strings."),
  body("isPinned").optional().isBoolean().withMessage("isPinned must be a boolean."),
];

export const updateNoteValidation = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty.")
    .isString(),
  body("content")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Content cannot be empty.")
    .isString(),
  body("tags").optional().isArray().withMessage("Tags must be an array of strings."),
  body("isPinned").optional().isBoolean().withMessage("isPinned must be a boolean."),
];

export const shareNoteValidation = [
  body("share_with_email")
    .trim()
    .notEmpty()
    .withMessage("share_with_email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),
];

export const searchValidation = [
  query("q").trim().notEmpty().withMessage("Search query 'q' is required."),
];
