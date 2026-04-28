const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    txnId: { type: String, required: true, unique: true, index: true },
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, default: "USD" },
    status: {
      type: String,
      enum: ["pending", "completed", "flagged", "blocked"],
      default: "pending",
    },
    riskScore: { type: Number, min: 0, max: 100, default: 0 },
    riskFactors: { type: [String], default: [] },
    ipAddress: String,
    deviceId: String,
    locationCountry: String,
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);

