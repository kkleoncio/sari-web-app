import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import Establishment from "@/models/Establishment";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const imageOverrides: Record<string, string> = {
  "Aldrin's Kitchen": "aldrins.jpg",
  "Chubby Habbi's": "chubby-habbis.jpg",
  "Dim Sum Panda": "dimsum-panda.jpg",
  "H2": "h2.jpg",
  "K-Go": "k-go.jpg",
  "Mr Grill": "mr-grill.jpg",
  "OiOi": "oioi.jpg",
  "Seoul Kitchen": "seoul-kitchen.jpg",
  "Sweet Keish": "sweet-keish.jpg",
};

async function main() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI not loaded from .env.local");
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const establishments = await Establishment.find({});

  for (const est of establishments) {
    let filename = imageOverrides[est.name];

    if (!filename) {
      filename = `${slugify(est.name)}.jpg`;
    }

    await Establishment.updateOne(
      { _id: est._id },
      {
        $set: {
          imageUrl: `/estab-imgs/${filename}`,
        },
      }
    );

    console.log(`✅ ${est.name} -> ${filename}`);
  }

  await mongoose.connection.close();
  console.log("Done updating images!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});