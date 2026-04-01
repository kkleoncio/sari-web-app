import mongoose, { Schema, models, model } from "mongoose";

const CommunityCommentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorHandle: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    _id: true,
  }
);

const CommunityPostSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    authorName: {
      type: String,
      required: true,
      trim: true,
    },

    authorHandle: {
      type: String,
      required: true,
      trim: true,
    },

    tag: {
      type: String,
      required: true,
      trim: true,
      default: "Tipid",
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
      maxlength: 1200,
    },

    postType: {
      type: String,
      enum: ["tip", "combo"],
      default: "tip",
    },

    mealIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Meal",
      },
    ],

    totalCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    allowanceType: {
      type: String,
      enum: ["daily", "weekly"],
      default: "daily",
    },

    verificationStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    likedBy: [
      {
        type: String,
      },
    ],

    savedBy: [
      {
        type: String,
      },
    ],

    comments: [CommunityCommentSchema],
  },
  {
    timestamps: true,
  }
);

CommunityPostSchema.index({ createdAt: -1 });
CommunityPostSchema.index({ postType: 1, verificationStatus: 1 });
CommunityPostSchema.index({ userId: 1 });
CommunityPostSchema.index({ savedBy: 1 });

const CommunityPost =
  models.CommunityPost || model("CommunityPost", CommunityPostSchema);

export default CommunityPost;