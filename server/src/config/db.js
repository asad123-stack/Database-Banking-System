const mongoose = require("mongoose");

async function connectDb() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGODB_DB || "fraud_detection",
  });
}

module.exports = { connectDb };
