import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAllNotes, getNoteById, createNote, updateNote, deleteNote, shareNote, togglePin } from "../controllers/notesController.js";

import { validateRequest } from "../middleware/validateRequest.js";
import { createNoteValidation, updateNoteValidation, shareNoteValidation } from "../validators/noteValidators.js";

const router = express.Router();
router.use(protect);

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Get all notes (paginated, pinned first)
 *     tags: [Notes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Notes per page (max 100)
 *     responses:
 *       200:
 *         description: Paginated notes list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedNotes'
 *       401:
 *         description: Unauthorized — no token provided
 */
router.get("/", getAllNotes);

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *                 example: My First Note
 *               content:
 *                 type: string
 *                 example: This is the note body.
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["work", "important"]
 *               isPinned:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", createNoteValidation, validateRequest, createNote);

/**
 * @swagger
 * /notes/{id}:
 *   get:
 *     summary: Get a note by ID
 *     tags: [Notes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the note
 *     responses:
 *       200:
 *         description: Note data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       400:
 *         description: Invalid note ID format
 *       403:
 *         description: You do not have access to this note
 *       404:
 *         description: Note not found
 */
router.get("/:id", getNoteById);

/**
 * @swagger
 * /notes/{id}:
 *   put:
 *     summary: Update a note (owner only)
 *     tags: [Notes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Title
 *               content:
 *                 type: string
 *                 example: Updated content here.
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPinned:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated note
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       400:
 *         description: Validation error or invalid ID
 *       403:
 *         description: Not authorized (not the owner)
 *       404:
 *         description: Note not found
 */
router.put("/:id", updateNoteValidation, validateRequest, updateNote);

/**
 * @swagger
 * /notes/{id}:
 *   delete:
 *     summary: Delete a note (owner only)
 *     tags: [Notes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Note deleted successfully (no content)
 *       400:
 *         description: Invalid note ID
 *       403:
 *         description: Not authorized (not the owner)
 *       404:
 *         description: Note not found
 */
router.delete("/:id", deleteNote);

/**
 * @swagger
 * /notes/{id}/share:
 *   post:
 *     summary: Share a note with another user (owner only)
 *     tags: [Sharing]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [share_with_email]
 *             properties:
 *               share_with_email:
 *                 type: string
 *                 format: email
 *                 example: friend@gmail.com
 *     responses:
 *       200:
 *         description: Note shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Note shared successfully
 *       400:
 *         description: Cannot share with self or missing email
 *       403:
 *         description: Only the owner can share
 *       404:
 *         description: Note or recipient not found
 *       409:
 *         description: Note already shared with this user
 */
router.post("/:id/share", shareNoteValidation, validateRequest, shareNote);

/**
 * @swagger
 * /notes/{id}/pin:
 *   patch:
 *     summary: Toggle pin/unpin a note (owner only)
 *     tags: [Notes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note pin toggled — returns updated note
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       400:
 *         description: Invalid note ID
 *       403:
 *         description: Only the note owner can pin/unpin
 *       404:
 *         description: Note not found
 */
router.patch("/:id/pin", togglePin);

export default router;
