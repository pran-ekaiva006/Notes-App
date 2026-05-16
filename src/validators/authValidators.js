import { body } from "express-validator";

export const registerValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email and password are required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Email and password are required.")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
];

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email and password are required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Email and password are required."),
];
