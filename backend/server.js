// ============================================
// WATCHDOG BACKEND SERVER
// AI-Powered Email Exposure & Risk Analysis
// ============================================

// Load environment variables
require("dotenv").config();

// Imports
const express = require("express");
const cors = require("cors");
const axios = require("axios");

// AI logic
const { analyzeRisk } = require("./ai/analyzeRisk");

// ============================================
// SERVER CONFIGURATION
// ============================================

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// HELPER FUNCTIONS
// ============================================

// Validate email format
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Simulated breach data (internal only – replace later)
async function getBreaches(email) {
  return [
    { name: "LinkedIn", year: "2021" },
    { name: "Adobe", year: "2013" }
  ];
}

// ============================================
// API ENDPOINTS
// ============================================

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "🐕 WatchDog Backend is running",
    aiEnabled: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// MAIN ENDPOINT: Scan Email
// ============================================

app.post("/api/scan-email", async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    console.log(`\n📧 Scanning email: ${email}`);

    // --------------------------------------------
    // STEP 1: OSINT via Holehe (Python service)
    // --------------------------------------------
    let platforms = [];

    try {
      const holeheResponse = await axios.post(
        "http://localhost:7000/holehe/check",
        { email }
      );

      platforms = holeheResponse.data.platforms || [];
      console.log(`📱 Platforms found: ${platforms.length}`);
    } catch (err) {
      console.warn("⚠️ Holehe service unavailable. Continuing without platforms.");
    }

    // --------------------------------------------
    // STEP 2: Breach intelligence (internal only)
    // --------------------------------------------
    const breaches = await getBreaches(email);
    console.log(`🚨 Breach signals detected: ${breaches.length}`);

    // --------------------------------------------
    // STEP 3: AI Risk Analysis
    // --------------------------------------------
    const aiAnalysis = await analyzeRisk({
      email,
      platforms,
      breaches
    });

    console.log(
      `🤖 AI Risk: ${aiAnalysis.riskScore}/100 (${aiAnalysis.riskLevel})`
    );

    // --------------------------------------------
    // RESPONSE TO FRONTEND
    // --------------------------------------------
    res.json({
      success: true,
      email,
      timestamp: new Date().toISOString(),

      platforms,
      platformCount: platforms.length,

      breachCount: breaches.length,

      riskScore: aiAnalysis.riskScore,
      riskLevel: aiAnalysis.riskLevel,
      explanation: aiAnalysis.explanation,
      recommendations: aiAnalysis.recommendations,

      aiPowered: true
    });

    console.log("✅ Scan completed\n");

  } catch (error) {
    console.error("❌ Scan failed:", error.message);

    res.status(500).json({
      error: "Scan failed",
      message: "Internal server error"
    });
  }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.clear();
  console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║   🐕 WATCHDOG BACKEND SERVER               ║
║                                            ║
║   🚀 Status: RUNNING                       ║
║   🌐 URL: http://localhost:${PORT}         ║
║   🤖 AI: ${process.env.OPENAI_API_KEY ? "ENABLED ✅" : "DISABLED ❌"}          ║
║                                            ║
║   Endpoints:                               ║
║   GET  /api/health                         ║
║   POST /api/scan-email                    ║
║                                            ║
╚════════════════════════════════════════════╝
  `);

  if (!process.env.OPENAI_API_KEY) {
    console.log("❌ OPENAI_API_KEY NOT FOUND");
    console.log("   AI WILL NOT WORK UNTIL KEY IS SET\n");
  }
});