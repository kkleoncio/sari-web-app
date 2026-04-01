import mongoose, { Schema, model, models } from "mongoose";

const EstablishmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
      "carinderia",
      "cafeteria",
      "restaurant",
      "food_stall",
      "bakery",
      "milk_tea_shop",
      "snack_house",
    ],
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    priceRange: {
      type: String,
      trim: true,
      default: "",
    },
    openingHours: {
      type: String,
      trim: true,
      default: "",
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Establishment =
  models.Establishment || model("Establishment", EstablishmentSchema);

export default Establishment;