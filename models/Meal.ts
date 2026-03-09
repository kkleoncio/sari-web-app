import mongoose from "mongoose";

const MealSchema = new mongoose.Schema({
  mealName: { type: String, required: true }, // ← this must exist
  price: { type: Number, required: true },
  tags: [String],
  type: String,
  category: String,
  establishmentId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Establishment",
  required: true,
},
});

export default mongoose.models.Meal || mongoose.model("Meal", MealSchema);