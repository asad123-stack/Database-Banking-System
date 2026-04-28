const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    accountNumber: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["savings", "checking", "business"],
      default: "checking",
    },
    currency: { type: String, default: "USD" },
    balance: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Account || mongoose.model("Account", accountSchema);

