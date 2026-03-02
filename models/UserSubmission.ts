import mongoose from "mongoose";

const UserSubmissionSchema = new mongoose.Schema(
  {
    mealName: String,

    type: String,

    price: Number,

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    dateSubmitted: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.models.UserSubmission ||
  mongoose.model("UserSubmission", UserSubmissionSchema);