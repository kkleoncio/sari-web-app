import mongoose from "mongoose";

const MealSchema = new mongoose.Schema({
  mealName: { type: String, required: true }, // ← this must exist
  price: { type: Number, required: true },
  tags: [String],
  type: String,
  category: String,
  establishmentId: { type: String, required: true }, // could also use ObjectId
});

export default mongoose.models.Meal || mongoose.model("Meal", MealSchema);