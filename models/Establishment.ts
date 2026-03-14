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
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    priceRange: {
      type: String,
      required: true,
      trim: true,
    },
    openingHours: {
      type: String,
      required: true,
      trim: true,
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