/**
 * analyzeRisk.js
 * --------------
 * Main orchestrator for WatchDog risk analysis
 *
 * Flow:
 * OSINT data → Rule-based risk calculation → AI explanation → Final response
 */

const { calculateRisk } = require("./riskCalculator");
const { aiExplain } = require("./aiExplain");

async function analyzeRisk({ email, platforms = [], breaches = [] }) {
  // 1️⃣ Rule-based risk calculation
  const { riskScore, riskLevel } = calculateRisk({
    platforms,
    breaches
  });

  // 2️⃣ AI explanation & recommendations
  const aiResult = await aiExplain({
    email,
    platforms,
    breaches,
    riskScore,
    riskLevel
  });

  // 3️⃣ Final frontend-ready response
  return {
    email,
    platformsFound: platforms.length,
    platforms,
    riskScore,
    riskLevel,
    explanation: aiResult.explanation,
    recommendations: aiResult.recommendations
  };
}

module.exports = { analyzeRisk };