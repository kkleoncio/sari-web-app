import mongoose, { Schema, model, models } from "mongoose";

const MealSchema = new Schema(
  {
    mealName: {
      type: String,
      required: true,
      trim: true,
    },
    foodType: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    establishmentName: {
      type: String,
      required: true,
      trim: true,
    },
    establishmentCategory: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    mealTime: {
      type: [String],
      default: [],
    },
    healthScore: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },
    isFried: {
      type: Boolean,
      default: false,
    },
    isSoup: {
      type: Boolean,
      default: false,
    },
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    allergens: {
      type: [String],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Meal = models.Meal || model("Meal", MealSchema);

export default Meal;