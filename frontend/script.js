// ============================================
// WATCHDOG - SINGLE PAGE APPLICATION
// Frontend Logic with Backend Integration
// ============================================

// Configuration
const API_URL = "http://localhost:5000";

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("🐕 WatchDog Frontend Loaded");

  const scanForm = document.getElementById("scanForm");
  if (scanForm) {
    scanForm.addEventListener("submit", handleEmailScan);
  }

  const scanAnotherBtn = document.getElementById("scanAnotherBtn");
  const scanAnotherBtnTop = document.getElementById("scanAnotherBtnTop");

  if (scanAnotherBtn) scanAnotherBtn.addEventListener("click", resetToScanForm);
  if (scanAnotherBtnTop) scanAnotherBtnTop.addEventListener("click", resetToScanForm);

  const downloadBtn = document.getElementById("downloadBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", handleDownloadReport);
  }
});

// ============================================
// SCAN HANDLER
// ============================================

async function handleEmailScan(e) {
  e.preventDefault();

  const emailInput = document.getElementById("emailInput");
  const phoneInput = document.getElementById("phoneInput");
  const usernameInput = document.getElementById("usernameInput");
  const submitBtn = document.getElementById("submitBtn");
  const loadingContainer = document.getElementById("loadingContainer");

  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const username = usernameInput.value.trim();

  if (!email && !phone && !username) {
    showError("Please enter at least one identifier");
    return;
  }

  if (email && !isValidEmail(email)) {
    showError("Please enter a valid email address");
    return;
  }

  // ============================================
  // NORMALIZE INPUT (BACKEND EXPECTS EMAIL ONLY)
  // ============================================

  let scanEmail = "";

  if (email) {
    scanEmail = email;
  } else if (phone) {
    scanEmail = phone + "@placeholder.watchdog";
  } else if (username) {
    scanEmail = username + "@placeholder.watchdog";
  }

  // ============================================
  // UI LOADING STATE
  // ============================================

  submitBtn.disabled = true;
  submitBtn.style.opacity = "0.5";
  submitBtn.innerHTML = "⏳";
  loadingContainer.style.display = "block";

  try {
    const response = await fetch(`${API_URL}/api/scan-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: scanEmail })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Scan failed");

    loadingContainer.style.display = "none";
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
    submitBtn.innerHTML = "→";

    displayResults(data);

    setTimeout(() => {
      document.getElementById("resultsSection").scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 300);

  } catch (err) {
    console.error(err);
    loadingContainer.style.display = "none";
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
    submitBtn.innerHTML = "→";
    showError("⚠️ Scan failed. Make sure backend is running.");
  }
}

// ============================================
// DISPLAY RESULTS
// ============================================

function displayResults(data) {
  document.getElementById("resultsSection").style.display = "block";
  displayEmailInfo(data);
  displayRiskScore(data);
  displayAIExplanation(data);
  displayPlatforms(data);
  displayRecommendations(data);
}

function displayEmailInfo(data) {
  const emailDisplay = document.getElementById("emailDisplay");
  const timeDisplay = document.getElementById("timeDisplay");

  if (emailDisplay) emailDisplay.textContent = data.email;
  if (timeDisplay) timeDisplay.textContent = new Date().toLocaleTimeString();
}

function displayRiskScore(data) {
  const scoreNumber = document.getElementById("scoreNumber");
  const riskBadge = document.getElementById("riskBadge");
  const warningIcon = document.getElementById("warningIcon");
  const riskSection = document.getElementById("riskScoreSection");

  animateNumber(scoreNumber, 0, data.riskScore, 1200);

  riskBadge.textContent = `${data.riskLevel} RISK`;
  riskBadge.className = `risk-badge ${data.riskLevel.toLowerCase()}-risk`;

  if (data.riskLevel === "HIGH") {
    warningIcon.textContent = "🚨";
    riskSection.style.borderColor = "#ef4444";
  } else if (data.riskLevel === "MEDIUM") {
    warningIcon.textContent = "⚠️";
    riskSection.style.borderColor = "#f59e0b";
  } else {
    warningIcon.textContent = "✅";
    riskSection.style.borderColor = "#10b981";
  }
}

function displayAIExplanation(data) {
  document.getElementById("aiExplanation").style.display = "block";
  document.getElementById("explanationText").textContent = data.explanation;
  document.getElementById("platformCountDisplay").textContent = data.platformCount;
  document.getElementById("breachCountDisplay").textContent = data.breachCount;
  document.getElementById("aiModelDisplay").textContent =
    `🤖 ${data.aiModel || "AI Analysis"}`;

  // Exposure Summary (derived values)
  document.getElementById("platformVisibility").textContent =
    data.platformCount >= 5 ? "High" :
    data.platformCount >= 1 ? "Medium" : "Low";

  document.getElementById("breachExposure").textContent =
    data.breachCount >= 1 ? "Detected" : "None";

  document.getElementById("publicIntel").textContent =
    data.platformCount >= 3 ? "Significant" : "Limited";

  document.getElementById("overallRisk").textContent = data.riskLevel;

  document.getElementById("exposureSummary").style.display = "block";
}

function displayPlatforms(data) {
  const container = document.getElementById("platformsContainer");
  const count = document.getElementById("platformCount");

  container.innerHTML = "";
  count.textContent = data.platforms.length;

  if (data.platforms.length === 0) {
    container.innerHTML = `
      <div class="breach-card">
        <h3 class="breach-title">✅ No platforms detected</h3>
        <p class="breach-data">Minimal public exposure</p>
      </div>
    `;
    return;
  }

  data.platforms.slice(0, 10).forEach((platform, i) => {
    const card = document.createElement("div");
    card.className = "breach-card";
    card.style.animationDelay = `${i * 0.1}s`;
    card.innerHTML = `
      <h3 class="breach-title">✓ ${platform}</h3>
      <p class="breach-accounts">Account detected</p>
    `;
    container.appendChild(card);
  });
}

function displayRecommendations(data) {
  const container = document.getElementById("recommendationsContainer");
  container.innerHTML = "";

  data.recommendations.forEach((rec, i) => {
    const item = document.createElement("div");
    item.className = "ai-rec-item";
    item.style.animationDelay = `${i * 0.1}s`;
    item.innerHTML = `
      <span class="rec-number">${i + 1}</span>
      <span class="rec-text">${rec}</span>
    `;
    container.appendChild(item);
  });
}

// ============================================
// UTILITIES
// ============================================

function animateNumber(el, start, end, duration) {
  let startTime = null;
  function animate(time) {
    if (!startTime) startTime = time;
    const progress = Math.min((time - startTime) / duration, 1);
    el.textContent = Math.floor(progress * (end - start) + start);
    if (progress < 1) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(message) {
  const old = document.querySelector(".error-message");
  if (old) old.remove();

  const div = document.createElement("div");
  div.className = "error-message";
  div.textContent = message;
  document.getElementById("loadingContainer").after(div);

  setTimeout(() => div.remove(), 5000);
}

function resetToScanForm() {
  document.getElementById("resultsSection").style.display = "none";
  document.getElementById("emailInput").value = "";
  document.getElementById("phoneInput").value = "";
  document.getElementById("usernameInput").value = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleDownloadReport() {
  alert("📄 PDF Download coming soon!");
}

// ============================================
// CONSOLE WELCOME MESSAGE (YOU MENTIONED THIS)
// ============================================

console.log(`
╔════════════════════════════════════════╗
║   🐕 WATCHDOG FRONTEND                ║
║   Status: Loaded ✅                   ║
║   API: ${API_URL}              ║
╚════════════════════════════════════════╝
`);