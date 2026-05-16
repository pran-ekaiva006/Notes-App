import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags) => tags.length <= 10,
        message: "A note can have at most 10 tags",
      },
    },
    isPinned: { type: Boolean, default: false },
    versions: [
      {
        title: { type: String },
        content: { type: String },
        savedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

noteSchema.index({ title: "text", content: "text", tags: "text" });

const Note = mongoose.model("Note", noteSchema);
export default Note;
