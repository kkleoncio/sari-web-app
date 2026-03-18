import mongoose, { Schema, models, model } from "mongoose";

const CommentSchema = new Schema(
  {
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorHandle: {
      type: String,
      default: "@student",
      trim: true,
    },
    userId: {
      type: String,
      default: "",
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

const CommunityPostSchema = new Schema(
  {
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorHandle: {
      type: String,
      default: "@student",
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    tag: {
      type: String,
      required: true,
      enum: ["Tipid", "Snacks", "Budgeting", "Breakfast"],
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    likedBy: {
      type: [String],
      default: [],
    },
    savedBy: {
      type: [String],
      default: [],
    },
    comments: {
      type: [CommentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const CommunityPost =
  models.CommunityPost || model("CommunityPost", CommunityPostSchema);

export default CommunityPost;