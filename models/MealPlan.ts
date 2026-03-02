import mongoose from "mongoose";

// Subdocument schema for each meal in a plan
const MealSchema = new mongoose.Schema({
  mealName: { type: String, required: true },
  price: { type: Number, required: true },
  establishment: { type: String, required: true }, // store establishment name
});

// Main MealPlan schema
const MealPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // link to the logged-in user
  dateGenerated: { type: Date, default: Date.now },
  allowanceType: { type: String, enum: ["daily", "weekly"], required: true },
  totalCost: { type: Number, required: true },
  remainingBudget: { type: Number, required: true },
  meals: { type: [MealSchema], required: true },
});

export default mongoose.models.MealPlan || mongoose.model("MealPlan", MealPlanSchema);