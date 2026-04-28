const express = require("express");
const { randomUUID } = require("node:crypto");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const FraudFlag = require("../models/FraudFlag");
const { evaluateRules } = require("../lib/fraud-engine/rules");
const {
  ensureProfile,
  recentTxnCount,
  refreshProfileStats,
} = require("../lib/fraud-engine/behavioral");

const router = express.Router();

router.get("/history", async (req, res) => {
  const accounts = await Account.find({ userId: req.user._id }).select("_id");
  const accountIds = accounts.map((a) => a._id);

  const transactions = await Transaction.find({
    $or: [{ fromAccount: { $in: accountIds } }, { toAccount: { $in: accountIds } }],
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("fromAccount", "accountNumber")
    .populate("toAccount", "accountNumber");

  return res.json({ transactions });
});

router.post("/transfer", async (req, res) => {
  const { fromAccountId, toAccountId, amount, deviceId, locationCountry } = req.body;

  if (!fromAccountId || !toAccountId || !amount) {
    return res
      .status(400)
      .json({ error: "fromAccountId, toAccountId and amount are required" });
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  const fromAccount = await Account.findOne({ _id: fromAccountId, userId: req.user._id });
  if (!fromAccount) {
    return res.status(404).json({ error: "Source account not found" });
  }

  const toAccount = await Account.findById(toAccountId);
  if (!toAccount) {
    return res.status(404).json({ error: "Destination account not found" });
  }

  if (fromAccount.balance < numericAmount) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  const profile = await ensureProfile(req.user._id);
  const count = await recentTxnCount(fromAccount._id);

  const { score, factors } = evaluateRules({
    amount: numericAmount,
    recentTxnCount: count,
    country: locationCountry,
    deviceId,
    profile,
  });

  let status = "completed";
  if (score >= 80) {
    status = "blocked";
  } else if (score >= 60) {
    status = "flagged";
  }

  if (status !== "blocked") {
    fromAccount.balance -= numericAmount;
    toAccount.balance += numericAmount;
    await Promise.all([fromAccount.save(), toAccount.save()]);
  }

  const transaction = await Transaction.create({
    txnId: randomUUID(),
    fromAccount: fromAccount._id,
    toAccount: toAccount._id,
    initiatedBy: req.user._id,
    amount: numericAmount,
    status,
    riskScore: score,
    riskFactors: factors,
    deviceId,
    locationCountry,
    ipAddress: req.ip,
  });

  if (score >= 60) {
    await FraudFlag.create({
      transactionId: transaction._id,
      userId: req.user._id,
      riskScore: score,
      riskFactors: factors,
    });
  }

  await refreshProfileStats(profile, numericAmount, locationCountry, deviceId);

  return res.status(201).json({ transaction });
});

module.exports = router;

