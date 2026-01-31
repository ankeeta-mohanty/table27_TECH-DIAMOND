/**
 * riskCalculator.js
 * -----------------
 * Rule-based risk scoring engine for WatchDog
 *
 * - Deterministic (no AI)
 * - Platform sensitivity based
 * - Breach-aware (internal use only)
 */

/* -------------------- Platform Categories -------------------- */

// High-risk platforms: identity-rich & commonly targeted
const HIGH_RISK_PLATFORMS = [
  "google",
  "gmail",
  "facebook",
  "instagram",
  "linkedin",
  "twitter",
  "github",
  "microsoft",
  "outlook",
  "yahoo"
];

// Medium-risk platforms: moderate data exposure
const MEDIUM_RISK_PLATFORMS = [
  "amazon",
  "flipkart",
  "netflix",
  "udemy",
  "coursera",
  "spotify",
  "discord"
];

/* -------------------- Helpers -------------------- */

function normalizePlatform(platform) {
  return platform.toLowerCase().trim();
}

/* -------------------- Main Risk Calculator -------------------- */

function calculateRisk({ platforms = [], breaches = [] }) {
  let score = 0;

  // Platform-based scoring
  platforms.forEach(platform => {
    const p = normalizePlatform(platform);

    if (HIGH_RISK_PLATFORMS.includes(p)) {
      score += 15;
    } else if (MEDIUM_RISK_PLATFORMS.includes(p)) {
      score += 8;
    } else {
      score += 5; // Low / unknown platform
    }
  });

  // Breach-based scoring (internal only)
  if (breaches.length > 0) {
    score += 25;
    if (breaches.length >= 3) score += 10;
  }

  // Cap score
  score = Math.min(score, 100);

  // Risk level mapping
  let riskLevel = "LOW";
  if (score >= 70) riskLevel = "HIGH";
  else if (score >= 40) riskLevel = "MEDIUM";

  return {
    riskScore: score,
    riskLevel
  };
}

module.exports = { calculateRisk };