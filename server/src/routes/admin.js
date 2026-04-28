const express = require("express");
const Transaction = require("../models/Transaction");
const FraudFlag = require("../models/FraudFlag");

const router = express.Router();

router.get("/analytics", async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [total, flaggedToday, blockedToday, avgRiskAgg] = await Promise.all([
    Transaction.countDocuments({}),
    Transaction.countDocuments({ createdAt: { $gte: today }, status: "flagged" }),
    Transaction.countDocuments({ createdAt: { $gte: today }, status: "blocked" }),
    Transaction.aggregate([{ $group: { _id: null, avgRisk: { $avg: "$riskScore" } } }]),
  ]);

  return res.json({
    totalTransactions: total,
    flaggedToday,
    blockedToday,
    avgRiskScore: Number((avgRiskAgg[0]?.avgRisk || 0).toFixed(2)),
  });
});

router.get("/review", async (req, res) => {
  const flags = await FraudFlag.find({})
    .sort({ riskScore: -1, createdAt: -1 })
    .limit(200)
    .populate("transactionId")
    .populate("userId", "fullName email");

  return res.json({ flags });
});

module.exports = router;

