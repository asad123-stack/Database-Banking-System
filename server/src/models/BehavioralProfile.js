const mongoose = require("mongoose");

const behavioralProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      index: true,
    },
    avgTxnAmount: { type: Number, default: 0 },
    stdDevAmount: { type: Number, default: 0 },
    frequentCountries: { type: [String], default: [] },
    knownDeviceIds: { type: [String], default: [] },
    avgDailyTxnCount: { type: Number, default: 0 },
    txnCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.BehavioralProfile ||
  mongoose.model("BehavioralProfile", behavioralProfileSchema);

