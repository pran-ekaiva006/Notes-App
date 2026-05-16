import mongoose from "mongoose";
import Note from "../models/Note.js";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const formatNote = (note) => ({
  _id: note._id,
  title: note.title,
  content: note.content,
  owner: note.owner,
  isPinned: note.isPinned,
  sharedWith: note.sharedWith,
  tags: note.tags,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
});

const hasAccess = (note, userId) => {
  const id = userId.toString();
  return note.owner.toString() === id || note.sharedWith.some((u) => u.toString() === id);
};

export const getAllNotes = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const filter = { $or: [{ owner: req.user._id }, { sharedWith: req.user._id }] };

    const [notes, totalNotes] = await Promise.all([
      Note.find(filter).sort({ isPinned: -1, updatedAt: -1 }).skip(skip).limit(limit),
      Note.countDocuments(filter),
    ]);

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(totalNotes / limit) || 1,
      totalNotes,
      notes: notes.map(formatNote),
    });
  } catch (error) { next(error); }
};

export const getNoteById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return next(new AppError("Invalid note ID.", 400));
    const note = await Note.findById(req.params.id);
    if (!note) return next(new AppError("Note not found.", 404));
    if (!hasAccess(note, req.user._id)) return next(new AppError("You do not have access to this note.", 403));
    res.status(200).json(formatNote(note));
  } catch (error) { next(error); }
};

export const createNote = async (req, res, next) => {
  try {
    const { title, content, tags, isPinned } = req.body;
    if (!title || !content || (typeof title === "string" && !title.trim()) || (typeof content === "string" && !content.trim())) {
      return next(new AppError("Title and content are required.", 400));
    }
    const note = await Note.create({ title, content, tags: tags || [], isPinned: isPinned || false, owner: req.user._id });
    res.status(201).json(formatNote(note));
  } catch (error) { next(error); }
};

export const updateNote = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return next(new AppError("Invalid note ID.", 400));
    const note = await Note.findById(req.params.id);
    if (!note) return next(new AppError("Note not found.", 404));
    if (note.owner.toString() !== req.user._id.toString()) return next(new AppError("You are not authorized to update this note.", 403));

    const { title, content, tags, isPinned } = req.body;
    if (title !== undefined && (typeof title !== "string" || !title.trim())) return next(new AppError("Title cannot be empty.", 400));
    if (content !== undefined && (typeof content !== "string" || !content.trim())) return next(new AppError("Content cannot be empty.", 400));

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (isPinned !== undefined) note.isPinned = isPinned;

    const updated = await note.save();
    res.status(200).json(formatNote(updated));
  } catch (error) { next(error); }
};

export const deleteNote = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return next(new AppError("Invalid note ID.", 400));
    const note = await Note.findById(req.params.id);
    if (!note) return next(new AppError("Note not found.", 404));
    if (note.owner.toString() !== req.user._id.toString()) return next(new AppError("You are not authorized to delete this note.", 403));
    await note.deleteOne();
    res.status(204).send();
  } catch (error) { next(error); }
};

export const shareNote = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return next(new AppError("Invalid note ID.", 400));
    const { share_with_email } = req.body;
    if (!share_with_email) return next(new AppError("share_with_email is required.", 400));

    const note = await Note.findById(req.params.id);
    if (!note) return next(new AppError("Note not found.", 404));
    if (note.owner.toString() !== req.user._id.toString()) return next(new AppError("Only the note owner can share it.", 403));
    if (share_with_email.toLowerCase() === req.user.email.toLowerCase()) return next(new AppError("You cannot share a note with yourself.", 400));

    const targetUser = await User.findOne({ email: share_with_email.toLowerCase() });
    if (!targetUser) return next(new AppError("No user found with that email address.", 404));

    const alreadyShared = note.sharedWith.some((id) => id.toString() === targetUser._id.toString());
    if (alreadyShared) return next(new AppError("Note is already shared with this user.", 409));

    note.sharedWith.push(targetUser._id);
    await note.save();
    res.status(200).json({ success: true, message: `Note successfully shared with ${share_with_email}.` });
  } catch (error) { next(error); }
};

export const searchNotes = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) return next(new AppError("Search query 'q' is required.", 400));

    const notes = await Note.find({
      $and: [
        { $text: { $search: q } },
        { $or: [{ owner: req.user._id }, { sharedWith: req.user._id }] },
      ],
    }).sort({ score: { $meta: "textScore" } });

    res.status(200).json({ success: true, count: notes.length, data: notes.map(formatNote) });
  } catch (error) { next(error); }
};
