import { calculateExposureIndicators } from "./analyzeRisk.js";
// ============================================
// WATCHDOG - SINGLE PAGE APPLICATION
// Frontend Logic with Backend Integration
// ============================================

// Configuration
const API_URL = 'http://localhost:5000';

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🐕 WatchDog Frontend Loaded');
    
    // Get form elements
    const scanForm = document.getElementById('scanForm');
    
    // Attach event listeners
    if (scanForm) {
        scanForm.addEventListener('submit', handleEmailScan);
    }
    
    // Scan another buttons
    const scanAnotherBtn = document.getElementById('scanAnotherBtn');
    const scanAnotherBtnTop = document.getElementById('scanAnotherBtnTop');
    
    if (scanAnotherBtn) {
        scanAnotherBtn.addEventListener('click', resetToScanForm);
    }
    
    if (scanAnotherBtnTop) {
        scanAnotherBtnTop.addEventListener('click', resetToScanForm);
    }
    
    // Download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', handleDownloadReport);
    }
});

// ============================================
// SCAN HANDLER - EMAIL, PHONE, USERNAME
// ============================================

async function handleEmailScan(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('emailInput');
    const phoneInput = document.getElementById('phoneInput');
    const usernameInput = document.getElementById('usernameInput');
    const submitBtn = document.getElementById('submitBtn');
    const loadingContainer = document.getElementById('loadingContainer');

    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const username = usernameInput.value.trim();

    // Require at least one identifier
    if (!email && !phone && !username) {
        showError("Please enter at least one identifier");
        return;
    }

    // Optional: validate email
    if (email && !isValidEmail(email)) {
        showError("Please enter a valid email address");
        return;
    }

    // Optional: validate phone
    const phonePattern = /^[0-9]{10}$/;
    if (phone && !phonePattern.test(phone)) {
        showError("Phone number must be 10 digits");
        return;
    }

    // Optional: validate username (3-15 alphanumeric)
    const usernamePattern = /^[a-zA-Z0-9]{3,15}$/;
    if (username && !usernamePattern.test(username)) {
        showError("Username must be 3-15 alphanumeric characters");
        return;
    }

    // Show loading
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
    submitBtn.innerHTML = '⏳';
    loadingContainer.style.display = 'block';

    try {
        const response = await fetch(`${API_URL}/api/scan-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, phone, username })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Scan failed');

        // Hide loading
        loadingContainer.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.innerHTML = '→';

        // Display results
        displayResults(data);

        // Scroll to results
        setTimeout(() => {
            document.getElementById('resultsSection').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 300);

    } catch (err) {
        console.error(err);
        loadingContainer.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.innerHTML = '→';
        showError('⚠️ Scan failed. Make sure the backend server is running.');
    }
}


// ============================================
// DISPLAY RESULTS ON SAME PAGE
// ============================================

function displayResults(data) {
    // Show results section
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';
    
    // Display each component
    displayEmailInfo(data);
    displayRiskScore(data);
    displayAIExplanation(data);
    displayPlatforms(data);
    displayRecommendations(data);
}

// ============================================
// DISPLAY COMPONENTS
// ============================================

function displayEmailInfo(data) {
    const emailDisplay = document.getElementById('emailDisplay');
    const timeDisplay = document.getElementById('timeDisplay');
    
    if (emailDisplay) {
        emailDisplay.textContent = data.email;
    }
    
    if (timeDisplay && data.timestamp) {
        const time = new Date(data.timestamp);
        timeDisplay.textContent = time.toLocaleTimeString();
    }
}

function displayRiskScore(data) {
    const scoreNumber = document.getElementById('scoreNumber');
    const riskBadge = document.getElementById('riskBadge');
    const riskSection = document.getElementById('riskScoreSection');
    const warningIcon = document.getElementById('warningIcon');
    
    // Animate number
    if (scoreNumber) {
        animateNumber(scoreNumber, 0, data.riskScore, 1500);
    }
    
    // Update badge
    if (riskBadge) {
        riskBadge.textContent = `${data.riskLevel} RISK`;
        riskBadge.className = `risk-badge ${data.riskLevel.toLowerCase()}-risk`;
    }
    
    // Update border color and icon
    if (riskSection) {
        let borderColor;
        if (data.riskLevel === 'HIGH') {
            borderColor = '#ef4444';
            if (warningIcon) warningIcon.textContent = '🚨';
        } else if (data.riskLevel === 'MEDIUM') {
            borderColor = '#f59e0b';
            if (warningIcon) warningIcon.textContent = '⚠️';
        } else {
            borderColor = '#10b981';
            if (warningIcon) warningIcon.textContent = '✅';
        }
        riskSection.style.borderColor = borderColor;
    }
}

function displayAIExplanation(data) {
    const aiExplanation = document.getElementById('aiExplanation');
    const explanationText = document.getElementById('explanationText');
    const platformCountDisplay = document.getElementById('platformCountDisplay');
    const breachCountDisplay = document.getElementById('breachCountDisplay');
    const aiModelDisplay = document.getElementById('aiModelDisplay');
    
    if (aiExplanation) {
        aiExplanation.style.display = 'block';
    }
    
    if (explanationText) {
        explanationText.textContent = data.explanation || 'AI analysis complete.';
    }
    
    if (platformCountDisplay) {
        platformCountDisplay.textContent = data.platformCount || 0;
    }
    
    if (breachCountDisplay) {
        breachCountDisplay.textContent = data.breachCount || 0;
    }
    
    if (aiModelDisplay) {
        aiModelDisplay.textContent = `🤖 Analyzed by ${data.aiModel || 'AI System'}`;
    }
}

function displayPlatforms(data) {
    const platformsContainer = document.getElementById('platformsContainer');
    const platformCount = document.getElementById('platformCount');
    
    if (!platformsContainer) return;
    
    // Clear container
    platformsContainer.innerHTML = '';
    
    const platforms = data.platforms || [];
    
    // Update count
    if (platformCount) {
        platformCount.textContent = platforms.length;
    }
    
    // Show first 10 platforms
    const displayCount = Math.min(platforms.length, 10);
    
    for (let i = 0; i < displayCount; i++) {
        const platform = platforms[i];
        const card = document.createElement('div');
        card.className = 'breach-card';
        card.style.animationDelay = `${i * 0.1}s`;
        card.innerHTML = `
            <h3 class="breach-title">✓ ${platform}</h3>
            <p class="breach-accounts">Account registered on this platform</p>
            <p class="breach-data">Data: <span class="data-types">Email, Profile Information</span></p>
        `;
        platformsContainer.appendChild(card);
    }
    
    // Show "more platforms" if applicable
    if (platforms.length > 10) {
        const moreCard = document.createElement('div');
        moreCard.className = 'breach-more';
        moreCard.innerHTML = `
            <p class="more-text">+ ${platforms.length - 10} more platforms detected</p>
        `;
        platformsContainer.appendChild(moreCard);
    }
    
    // If no platforms found
    if (platforms.length === 0) {
        platformsContainer.innerHTML = `
            <div class="breach-card">
                <h3 class="breach-title">✅ No platforms detected</h3>
                <p class="breach-data">Your email has minimal exposure</p>
            </div>
        `;
    }
}

function displayRecommendations(data) {
    const recommendationsContainer = document.getElementById('recommendationsContainer');
    
    if (!recommendationsContainer) return;
    
    // Clear container
    recommendationsContainer.innerHTML = '';
    
    const recommendations = data.recommendations || [
        'Enable two-factor authentication on all accounts',
        'Use strong, unique passwords for each platform',
        'Monitor your accounts for suspicious activity'
    ];
    
    recommendations.forEach((rec, index) => {
        const recItem = document.createElement('div');
        recItem.className = 'ai-rec-item';
        recItem.style.animationDelay = `${index * 0.1}s`;
        recItem.innerHTML = `
            <span class="rec-number">${index + 1}</span>
            <span class="rec-text">${rec}</span>
        `;
        recommendationsContainer.appendChild(recItem);
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function animateNumber(element, start, end, duration) {
    let startTime = null;
    
    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        element.textContent = Math.floor(progress * (end - start) + start);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function showError(message) {
    const heroSection = document.querySelector('.hero');
    const existingError = document.querySelector('.error-message');
    
    // Remove existing error if any
    if (existingError) {
        existingError.remove();
    }
    
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Insert after loading container
    const loadingContainer = document.getElementById('loadingContainer');
    if (loadingContainer) {
        loadingContainer.after(errorDiv);
    } else {
        heroSection.appendChild(errorDiv);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function resetToScanForm() {
    // Hide results section
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.style.display = 'none';
    }
    
    // Clear email input
    const emailInput = document.getElementById('emailInput');
    if (emailInput) {
        emailInput.value = '';
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Focus on email input
    setTimeout(() => {
        if (emailInput) {
            emailInput.focus();
        }
    }, 500);
}

function handleDownloadReport() {
    alert('📄 PDF Download Feature Coming Soon!\n\nYour detailed security report will be available for download once this feature is implemented.');
    
    // TODO: Implement PDF generation
    // You can use libraries like jsPDF or html2pdf.js
}

// ============================================
// CONSOLE WELCOME MESSAGE
// ============================================

console.log(`
╔════════════════════════════════════════╗
║   🐕 WATCHDOG FRONTEND                ║
║   Status: Loaded ✅                   ║
║   API: ${API_URL}              ║
╚════════════════════════════════════════╝
`);
