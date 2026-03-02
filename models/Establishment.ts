import mongoose from "mongoose";

const EstablishmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    location: String,          // renamed from location
    contactInfo: String,          // renamed from contactInfo
    openingHours: String      // format: "07:00-20:00"
  },
  { timestamps: true }
);

export default mongoose.models.Establishment ||
  mongoose.model("Establishment", EstablishmentSchema);