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
      enum: ["Carinderia", "Cafeteria", "Restaurant", "Food Stall", "Bakery", "Milk Tea Shop", "Snack House"],
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
  },
  {
    timestamps: true,
  }
);

const Establishment =
  models.Establishment || model("Establishment", EstablishmentSchema);

export default Establishment;