function evaluateRules({ amount, recentTxnCount, country, deviceId, profile }) {
  let score = 0;
  const factors = [];

  if (profile.avgTxnAmount > 0 && amount > profile.avgTxnAmount * 3) {
    score += 25;
    factors.push("large_amount");
  }

  if (recentTxnCount >= 5) {
    score += 20;
    factors.push("high_frequency");
  }

  if (country && !profile.frequentCountries.includes(country)) {
    score += 20;
    factors.push("unusual_location");
  }

  if (deviceId && !profile.knownDeviceIds.includes(deviceId)) {
    score += 15;
    factors.push("new_device");
  }

  const utcHour = new Date().getUTCHours();
  if (utcHour >= 1 && utcHour <= 4) {
    score += 10;
    factors.push("off_hours");
  }

  if (amount >= 1000 && amount % 1000 === 0) {
    score += 10;
    factors.push("round_number");
  }

  if (profile.stdDevAmount > 0) {
    const zScore = Math.abs(amount - profile.avgTxnAmount) / profile.stdDevAmount;
    if (zScore > 2.5) {
      score += 15;
      factors.push("behavioral_anomaly");
    }
  }

  return { score: Math.min(score, 100), factors };
}

module.exports = { evaluateRules };

