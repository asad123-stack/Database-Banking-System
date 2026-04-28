const mongoose = require("mongoose");

const fraudFlagSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    riskScore: { type: Number, required: true },
    riskFactors: { type: [String], default: [] },
    reviewStatus: {
      type: String,
      enum: ["pending", "confirmed_fraud", "false_positive"],
      default: "pending",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.FraudFlag || mongoose.model("FraudFlag", fraudFlagSchema);

