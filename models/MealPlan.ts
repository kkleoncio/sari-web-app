import mongoose from "mongoose";

// Subdocument schema for each meal in a plan
const MealSchema = new mongoose.Schema(
  {
    mealName: { type: String, required: true },
    price: { type: Number, required: true },
    establishment: { type: String, required: true },
  },
  { _id: false }
);

// Main MealPlan schema
const MealPlanSchema = new mongoose.Schema(
  {
    // link to logged-in user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // NEW: store the original budget
    budget: {
      type: Number,
      required: true,
    },

    allowanceType: {
      type: String,
      enum: ["daily", "weekly"],
      required: true,
    },

    // NEW: number of meals per day (from modal)
    mealsPerDay: {
      type: Number,
      default: 3,
    },

    // NEW: number of days (1 for daily, 7 for weekly)
    days: {
      type: Number,
      default: 1,
    },

    totalCost: {
      type: Number,
      required: true,
    },

    remainingBudget: {
      type: Number,
      required: true,
    },

    meals: {
      type: [MealSchema],
      required: true,
    },

    // NEW: mark current vs old plans
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },

    dateGenerated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.MealPlan ||
  mongoose.model("MealPlan", MealPlanSchema);