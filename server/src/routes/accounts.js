const express = require("express");
const { randomUUID } = require("node:crypto");
const Account = require("../models/Account");

const router = express.Router();

router.get("/", async (req, res) => {
  const accounts = await Account.find({ userId: req.user._id }).sort({ createdAt: -1 });
  return res.json({ accounts });
});

router.post("/", async (req, res) => {
  const { type = "checking", initialBalance = 0 } = req.body;

  const account = await Account.create({
    userId: req.user._id,
    accountNumber: `ACC-${randomUUID().slice(0, 8).toUpperCase()}`,
    type,
    balance: Number(initialBalance) || 0,
  });

  return res.status(201).json({ account });
});

module.exports = router;

