import mongoose, { Schema, model, models } from "mongoose";

const SavedMealSchema = new Schema(
  {
    _id: { type: String },
    mealName: { type: String, required: true },
    price: { type: Number, required: true },
    establishmentName: { type: String, required: true },
    establishmentCategory: { type: String, default: "" },
    location: { type: String, default: "" },
    foodType: { type: String, default: "" },
    category: { type: String, default: "" },
    mealTime: { type: [String], default: [] },
    healthScore: { type: Number, default: 5 },
    isFried: { type: Boolean, default: false },
    isSoup: { type: Boolean, default: false },
    isVegetarian: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    allergens: { type: [String], default: [] },
  },
  { _id: false }
);

const MealPlanSchema = new Schema(
  {
    userId: { type: String, required: true },
    allowanceType: {
      type: String,
      enum: ["daily", "weekly"],
      default: "daily",
    },
    budget: { type: Number, required: true },
    mealsPerDay: { type: Number, default: 3 },
    totalCost: { type: Number, required: true },
    remainingBudget: { type: Number, required: true },
    score: { type: Number, default: 0 },
    label: { type: String, default: "" },
    selected: { type: Boolean, default: true },
    isCustomized: { type: Boolean, default: false },
    meals: { type: [SavedMealSchema], default: [] },
  },
  { timestamps: true }
);


MealPlanSchema.index({ userId: 1, createdAt: -1 });
MealPlanSchema.index({ userId: 1, selected: 1, createdAt: -1 });

const MealPlan = models.MealPlan || model("MealPlan", MealPlanSchema);

export default MealPlan;