import mongoose from "mongoose";
import Note from "../models/Note.js";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const formatNote = (note) => ({
  id: note._id,
  title: note.title,
  content: note.content,
  owner: note.owner,
  isPinned: note.isPinned,
  sharedWith: note.sharedWith,
  tags: note.tags,
  created_at: note.createdAt,
  updated_at: note.updatedAt,
});

const hasAccess = (note, userId) => {
  const id = userId.toString();
  return note.owner.toString() === id || note.sharedWith.some((u) => u.toString() === id);
};

export const getAllNotes = async (req, res, next) => {
  try {
    const filter = { $or: [{ owner: req.user._id }, { sharedWith: req.user._id }] };

    // If pagination params provided, return paginated response (bonus feature)
    if (req.query.page || req.query.limit) {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
      const skip = (page - 1) * limit;

      const [notes, totalNotes] = await Promise.all([
        Note.find(filter).sort({ isPinned: -1, updatedAt: -1 }).skip(skip).limit(limit),
        Note.countDocuments(filter),
      ]);

      return res.status(200).json({
        currentPage: page,
        totalPages: Math.ceil(totalNotes / limit) || 1,
        totalNotes,
        notes: notes.map(formatNote),
      });
    }

    // Default: return flat array as per assignment spec
    const notes = await Note.find(filter).sort({ isPinned: -1, updatedAt: -1 });
    res.status(200).json(notes.map(formatNote));
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

    // 📸 Snapshot current state before overwriting (version history)
    if ((title !== undefined && title !== note.title) || (content !== undefined && content !== note.content)) {
      note.versions.push({ title: note.title, content: note.content, savedAt: new Date() });
      if (note.versions.length > 10) note.versions.shift(); // keep max 10 versions
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (isPinned !== undefined) note.isPinned = isPinned;

    const updated = await note.save();
    res.status(200).json(formatNote(updated));
  } catch (error) { next(error); }
};

// GET /notes/:id/history — list version history (owner only)
export const getNoteHistory = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return next(new AppError("Invalid note ID.", 400));
    const note = await Note.findById(req.params.id);
    if (!note) return next(new AppError("Note not found.", 404));
    if (note.owner.toString() !== req.user._id.toString()) return next(new AppError("Only the note owner can view history.", 403));

    const history = note.versions.map((v, index) => ({
      version: index + 1,
      title: v.title,
      content: v.content,
      saved_at: v.savedAt,
    })).reverse(); // newest first

    res.status(200).json({ note_id: req.params.id, total_versions: history.length, history });
  } catch (error) { next(error); }
};

// POST /notes/:id/restore/:version — restore a past version (owner only)
export const restoreNoteVersion = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return next(new AppError("Invalid note ID.", 400));
    const note = await Note.findById(req.params.id);
    if (!note) return next(new AppError("Note not found.", 404));
    if (note.owner.toString() !== req.user._id.toString()) return next(new AppError("Only the note owner can restore versions.", 403));

    const versionIndex = parseInt(req.params.version) - 1;
    if (isNaN(versionIndex) || versionIndex < 0 || versionIndex >= note.versions.length) {
      return next(new AppError(`Invalid version number. This note has ${note.versions.length} version(s).`, 400));
    }

    const target = note.versions[versionIndex];

    // Snapshot current state before restore
    note.versions.push({ title: note.title, content: note.content, savedAt: new Date() });
    if (note.versions.length > 10) note.versions.shift();

    note.title = target.title;
    note.content = target.content;

    const restored = await note.save();
    res.status(200).json({ message: `Restored to version ${req.params.version}`, note: formatNote(restored) });
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

export const togglePin = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return next(new AppError("Invalid note ID.", 400));
    const note = await Note.findById(req.params.id);
    if (!note) return next(new AppError("Note not found.", 404));
    if (note.owner.toString() !== req.user._id.toString()) return next(new AppError("Only the note owner can pin/unpin.", 403));

    note.isPinned = !note.isPinned;
    const updated = await note.save();
    res.status(200).json(formatNote(updated));
  } catch (error) { next(error); }
};


export const shareNote = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return next(new AppError("Invalid note ID.", 400));
    const { share_with_email } = req.body;

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
    res.status(200).json({ message: "Note shared successfully" });
  } catch (error) { next(error); }
};

export const searchNotes = async (req, res, next) => {
  try {
    const { q } = req.query;

    const notes = await Note.find({
      $and: [
        { $text: { $search: q } },
        { $or: [{ owner: req.user._id }, { sharedWith: req.user._id }] },
      ],
    }).sort({ score: { $meta: "textScore" } });

    res.status(200).json({ success: true, count: notes.length, data: notes.map(formatNote) });
  } catch (error) { next(error); }
};
