const BehavioralProfile = require("../../models/BehavioralProfile");
const Transaction = require("../../models/Transaction");

async function ensureProfile(userId) {
  let profile = await BehavioralProfile.findOne({ userId });
  if (!profile) {
    profile = await BehavioralProfile.create({ userId });
  }
  return profile;
}

async function recentTxnCount(fromAccount) {
  return Transaction.countDocuments({
    fromAccount,
    createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
  });
}

async function refreshProfileStats(profile, amount, country, deviceId) {
  const nextCount = profile.txnCount + 1;
  const nextAverage = (profile.avgTxnAmount * profile.txnCount + amount) / nextCount;

  const variancePart =
    ((profile.stdDevAmount ** 2) * profile.txnCount +
      (amount - profile.avgTxnAmount) * (amount - nextAverage)) /
    nextCount;

  profile.avgTxnAmount = nextAverage;
  profile.stdDevAmount = Math.sqrt(Math.max(variancePart, 0));
  profile.txnCount = nextCount;

  if (country && !profile.frequentCountries.includes(country)) {
    profile.frequentCountries.push(country);
  }

  if (deviceId && !profile.knownDeviceIds.includes(deviceId)) {
    profile.knownDeviceIds.push(deviceId);
  }

  await profile.save();
}

module.exports = { ensureProfile, recentTxnCount, refreshProfileStats };

