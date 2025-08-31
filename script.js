// DOM Elements
const scanBtn = document.getElementById("scanBtn");
const messageInput = document.getElementById("messageInput");
const chatWindow = document.getElementById("chatWindow");
const progressBar = document.getElementById("progressBar");
const historyList = document.getElementById("historyList");
const totalScansEl = document.getElementById("totalScans");
const phishingScansEl = document.getElementById("phishingScans");
const safeScansEl = document.getElementById("safeScans");
const statusIndicator = document.getElementById("statusIndicator");
const statusText = document.getElementById("statusText");

// State variables
let totalScans = 0;
let phishingScans = 0;
let safeScans = 0;
let apiUrl = "https://adAStra144-Anti-Phishing-Scanner-0.hf.space";
let explainerUrl = "";
let isScanning = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    checkApiStatus();
    setupEventListeners();
    loadStats();
    setupAccessibility();
    addParticleEffect();
    loadTheme();
    setupMobileMenu();
    updateUserUI(); // Add this line to update UI on DOM ready
    setupImagePicker();
    // Initial padding adjustment
    adjustChatBottomPadding();

    // iOS/Android virtual keyboard handling: move input above keyboard
    try {
        if ('visualViewport' in window) {
            const onResize = () => {
                const vv = window.visualViewport;
                const offset = Math.max(0, (vv && vv.height ? (window.innerHeight - vv.height) : 0));
                document.documentElement.style.setProperty('--keyboard-offset', offset + 'px');
                adjustChatBottomPadding();
                try { chatWindow.scrollTop = chatWindow.scrollHeight; } catch (_) {}
            };
            window.visualViewport.addEventListener('resize', onResize);
            window.visualViewport.addEventListener('scroll', onResize);
        }
    } catch (e) { /* noop */ }
});

// === Smooth Scroll for Mouse Wheel (Chat Window only) ===
// Removed custom smooth scroll implementation - using natural browser scrolling for better performance

// === Scroll Performance Optimization ===
let scrollTimeout;

if (chatWindow) {
  chatWindow.addEventListener('scroll', () => {
    // Add performance class during scrolling
    chatWindow.classList.add('scrolling');
    
    // Pause particle animations during scroll for better performance
    const particles = document.querySelector('.particles');
    if (particles) {
      particles.style.animationPlayState = 'paused';
    }
    
    // Clear existing timeout
    clearTimeout(scrollTimeout);
    
    // Remove performance class after scrolling stops
    scrollTimeout = setTimeout(() => {
      chatWindow.classList.remove('scrolling');
      // Resume particle animations
      if (particles) {
        particles.style.animationPlayState = 'running';
      }
    }, 150);
  });
}

// Add subtle particle effect to background
function addParticleEffect() {
    const particles = document.createElement('div');
    particles.className = 'particles';
    // Reduced from 20 to 10 particles for better performance
    particles.innerHTML = Array.from({length: 10}, () => '<div class="particle"></div>').join('');
    document.body.appendChild(particles);
}

// Setup accessibility features
function setupAccessibility() {
    // Add keyboard navigation for example messages
    const exampleItems = document.querySelectorAll('.example-messages li');
    exampleItems.forEach((item, index) => {
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `Example ${index + 1}: ${item.textContent}`);
        
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                messageInput.value = item.textContent;
                messageInput.focus();
                addRippleEffect(e.target);
            }
        });
        
        item.addEventListener('click', (e) => {
            messageInput.value = item.textContent;
            messageInput.focus();
            addRippleEffect(e.target);
        });
    });
}

// Add ripple effect to buttons
function addRippleEffect(element) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Setup event listeners
function setupEventListeners() {
    // Scan button click
    scanBtn.addEventListener("click", (e) => {
        addRippleEffect(e.target);
        scanMessage();
    });
    
    // Enter key to scan (Ctrl+Enter or Cmd+Enter)
    messageInput.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            scanMessage();
        }
    });
    
    // Auto-resize textarea
    messageInput.addEventListener("input", () => {
        messageInput.style.height = "auto";
        messageInput.style.height = Math.min(messageInput.scrollHeight, 200) + "px";
        adjustChatBottomPadding();
        try { chatWindow.scrollTop = chatWindow.scrollHeight; } catch (_) {}
    });
    
    // Clear welcome message on first interaction
    messageInput.addEventListener("focus", () => {
        const welcomeMessage = chatWindow.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.style.opacity = '0.7';
        }
        adjustChatBottomPadding();
    });
}

// Ensure chat content isn't hidden under fixed input area
function adjustChatBottomPadding() {
    const inputArea = document.querySelector('.input-area');
    if (!inputArea) return;
    const style = window.getComputedStyle(inputArea);
    const height = inputArea.offsetHeight
      + parseFloat(style.marginTop || 0)
      + parseFloat(style.marginBottom || 0);
    const keyboardOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--keyboard-offset')) || 0;
    const pad = Math.max(160, height + 48 + keyboardOffset);
    chatWindow.style.paddingBottom = `${pad}px`;
}

// Recalculate on resize and orientation changes
window.addEventListener('resize', adjustChatBottomPadding);
window.addEventListener('orientationchange', adjustChatBottomPadding);

// Mobile drawer menu setup
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('backdrop');

    if (!menuToggle || !sidebar || !backdrop) return;

    const openMenu = () => {
        sidebar.classList.add('open');
        backdrop.hidden = false;
        backdrop.style.pointerEvents = 'auto';
        document.body.classList.add('no-scroll');
        menuToggle.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
        sidebar.classList.remove('open');
        backdrop.hidden = true;
        backdrop.style.pointerEvents = 'none';
        document.body.classList.remove('no-scroll');
        menuToggle.setAttribute('aria-expanded', 'false');
    };

    menuToggle.addEventListener('click', () => {
        if (window.matchMedia('(min-width: 1025px)').matches) {
            // Desktop: toggle collapsed state instead of drawer
            sidebar.classList.toggle('collapsed');
            return;
        }
        const willOpen = !sidebar.classList.contains('open');
        if (willOpen) openMenu(); else closeMenu();
    });

    backdrop.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target)) closeMenu();
    });

    sidebar.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    // Robust: directly wire navigation to data-section, prevent duplicate handlers
    const buttons = Array.from(document.querySelectorAll('.nav-btn'));
    buttons.forEach((btn) => {
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
    });
    document.querySelectorAll('.nav-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const section = btn.getAttribute('data-section') || btn.dataset.section;
            if (section) {
                showSection(section);
            }
            if (window.matchMedia('(max-width: 1024px)').matches) {
                setTimeout(closeMenu, 150);
            }
        }, { passive: true });
    });
}

// Show section function
function showSection(sectionName) {
    // Hide all content sections
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section (in main window)
    switch(sectionName) {
        case 'chat':
            document.getElementById('chatSection').classList.add('active');
            {
                const btn = document.querySelector('[onclick="showSection(\'chat\')"]') || document.querySelector('[onclick="showSection(\"chat\")"]');
                if (btn) btn.classList.add('active');
            }
            break;
        case 'history':
            document.getElementById('historyMainSection').classList.add('active');
            {
                const btn = document.querySelector('[onclick="showSection(\'history\')"]') || document.querySelector('[onclick="showSection(\"history\")"]');
                if (btn) btn.classList.add('active');
            }
            break;
        case 'stats':
            document.getElementById('statsMainSection').classList.add('active');
            {
                const btn = document.querySelector('[onclick="showSection(\'stats\')"]') || document.querySelector('[onclick="showSection(\"stats\")"]');
                if (btn) btn.classList.add('active');
            }
            break;
        case 'status':
            document.getElementById('statusMainSection').classList.add('active');
            {
                const btn = document.querySelector('[onclick="showSection(\'status\')"]') || document.querySelector('[onclick="showSection(\"status\")"]');
                if (btn) btn.classList.add('active');
            }
            break;
        case 'quiz':
            document.getElementById('quizMainSection').classList.add('active');
            {
                const btn = document.querySelector('[onclick="showSection(\'quiz\')"]') || document.querySelector('[onclick="showSection(\"quiz\")"]');
                if (btn) btn.classList.add('active');
            }
            if (!window.__quizInit) { initQuiz(); window.__quizInit = true; }
            break;
            case 'feedback':
    document.getElementById('feedbackMainSection').classList.add('active');
    {
        const btn = document.querySelector('[onclick="showSection(\'feedback\')"]') || 
                    document.querySelector('[onclick="showSection(\"feedback\")"]');
        if (btn) btn.classList.add('active');
    }
    break;
    }
    

    // Auto-close drawer on mobile after navigation to any section
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('backdrop');
    if (window.matchMedia('(max-width: 1024px)').matches && sidebar && sidebar.classList.contains('open')) {
        setTimeout(() => {
            sidebar.classList.remove('open');
            if (backdrop) backdrop.hidden = true;
            document.body.classList.remove('no-scroll');
            if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        }, 0);
    }
}

// ---------- REPLACE initQuiz() WITH THIS ----------
function initQuiz() {
    const questions = [
        {
            q: 'Which of the following is a sign of a phishing email?',
            a: [
                { text: 'An email from a known contact asking for a file', correct: false },
                { text: 'Grammatical errors and suspicious links', correct: true },
                { text: 'A secure website address (https://)', correct: false },
                { text: 'A welcome email from a trusted service', correct: false }
            ]
        },
        {
            q: 'What should you do if a message asks for your password?',
            a: [
                { text: 'Reply immediately with your password', correct: false },
                { text: 'Verify the source before responding', correct: true },
                { text: 'Ignore all emails from your company', correct: false },
                { text: 'Click the link and change your password', correct: false }
            ]
        },
        {
            q: 'What is a phishing attack?',
            a: [
                { text: 'A fishing technique used in rivers', correct: false },
                { text: 'A way to steal personal information via fake messages', correct: true },
                { text: 'A password recovery method', correct: false },
                { text: 'An antivirus scanning process', correct: false }
            ]
        }
    ];

    const quizProgress = document.getElementById('quizProgress');
    const quizScoreEl = document.getElementById('quizScore');
    const quizQuestion = document.getElementById('quizQuestion');
    const quizAnswers = document.getElementById('quizAnswers');
    const quizFeedback = document.getElementById('quizFeedback');
    const quizNextBtn = document.getElementById('quizNextBtn');
    const quizRestartBtn = document.getElementById('quizRestartBtn');

    let idx = 0;
    let score = 0;
    let autoTimer = 0;
    const AUTO_NEXT_DELAY = 1200; // ms

    // load best score from localStorage
    let bestPercent = parseInt(localStorage.getItem('surLinkBestQuiz') || '0', 10);

    function render() {
        if (autoTimer) { clearTimeout(autoTimer); autoTimer = 0; }
        quizProgress.textContent = `Question ${idx + 1} of ${questions.length}`;
        quizScoreEl.textContent = `Score: ${score}`;
        quizQuestion.textContent = questions[idx].q;
        quizAnswers.innerHTML = '';
        quizFeedback.textContent = '';
        quizNextBtn.disabled = true;
        quizNextBtn.style.display = 'none';
        quizRestartBtn.style.display = 'none';

        questions[idx].a.forEach((ans) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-answer';
            btn.textContent = ans.text;
            btn.addEventListener('click', () => selectAnswer(btn, ans.correct));
            quizAnswers.appendChild(btn);
        });
    }

    function selectAnswer(btn, correct) {
        // disable all
        Array.from(quizAnswers.children).forEach(b => b.disabled = true);
        if (correct) {
            score += 1;
            btn.classList.add('correct');
            quizFeedback.textContent = '✅ Correct!';
        } else {
            btn.classList.add('incorrect');
            // show correct one
            const correctText = questions[idx].a.find(a => a.correct).text;
            quizFeedback.textContent = `❌ Not quite. Correct: ${correctText}`;
        }
        quizScoreEl.textContent = `Score: ${score}`;
        autoTimer = setTimeout(proceed, AUTO_NEXT_DELAY);
    }

    function proceed() {
        if (idx < questions.length - 1) {
            idx += 1;
            render();
        } else {
            finishQuiz();
        }
    }

    function finishQuiz() {
        const percent = Math.round((score / questions.length) * 100);
        quizQuestion.textContent = `You scored ${score} / ${questions.length} (${percent}%)!`;
        quizAnswers.innerHTML = '';
        quizFeedback.textContent = percent >= 70 ? '🎉 Nice — you passed!' : '🔎 Review the tips to improve.';
        quizNextBtn.style.display = 'none';
        quizRestartBtn.style.display = 'inline-flex';

        // save best percent
        if (percent > bestPercent) {
            bestPercent = percent;
            localStorage.setItem('surLinkBestQuiz', String(bestPercent));
            showBestQuizStat(bestPercent);
        }
    }

    // optional helper: show best quiz stat in the stats grid
    function showBestQuizStat(best) {
        const statsGrid = document.querySelector('.stats-grid');
        if (!statsGrid) return;
        let bestEl = document.getElementById('bestQuizStat');
        if (!bestEl) {
            const div = document.createElement('div');
            div.className = 'stat-item';
            div.innerHTML = `<span class="stat-number" id="bestQuizStat">${best}%</span><span class="stat-label">Best Quiz</span>`;
            statsGrid.appendChild(div);
        } else {
            bestEl.textContent = `${best}%`;
        }
    }

    quizNextBtn.addEventListener('click', () => {
        clearTimeout(autoTimer);
        proceed();
    });

    quizRestartBtn.addEventListener('click', () => {
        idx = 0;
        score = 0;
        quizNextBtn.style.display = 'inline-flex';
        quizRestartBtn.style.display = 'none';
        render();
    });

    // initial render + show best if present
    render();
    if (bestPercent > 0) showBestQuizStat(bestPercent);
}
// ---------- end of initQuiz replacement ----------

// Check API status
async function checkApiStatus() {
    try {
        statusIndicator.className = "status-indicator checking";
        statusText.textContent = "Checking...";
        
        // Check main classification API
        const response = await fetch(`${apiUrl}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // Check explainer API
        let explainerStatus = "Unknown";
        try {
            const expResponse = await fetch(`${explainerUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            explainerStatus = expResponse.ok ? "Available" : "Unavailable";
        } catch (error) {
            explainerStatus = "Unavailable";
        }
        
        if (response.ok) {
            statusIndicator.className = "status-indicator online";
            statusText.textContent = `Online (Explainer: ${explainerStatus})`;
        } else {
            throw new Error('API not responding');
        }
    } catch (error) {
        console.error('API Status Check Error:', error);
        statusIndicator.className = "status-indicator offline";
        statusText.textContent = "Offline";
    }
}

// Append message to chat
function appendMessage(content, sender = "user", isTyping = false) {
    const bubble = document.createElement("div");
    bubble.className = `message-bubble ${sender}`;
    
    const bubbleContent = document.createElement("div");
    bubbleContent.className = "bubble-content";
    
    if (isTyping) {
        bubbleContent.innerHTML = `
            <div class="typing-indicator">
                AI is analyzing...
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
    } else {
        bubbleContent.innerHTML = `
            <div class="bubble-text">${content}</div>
            <div class="timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        `;
    }
    
    bubble.appendChild(bubbleContent);
    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    adjustChatBottomPadding();
    
      // Remove welcome message after first user message
    const welcomeMessage = chatWindow.querySelector('.welcome-message');
    if (welcomeMessage && sender === "user") {
        welcomeMessage.style.display = 'none';
    }
}

// Show typing indicator
function showTypingIndicator() {
    appendMessage("", "ai", true);
    adjustChatBottomPadding();
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = chatWindow.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.closest('.message-bubble').remove();
    }
}

// Animate progress bar
function animateProgressBar() {
    progressBar.classList.remove("hidden");
    const progressFill = progressBar.querySelector('.progress-fill');
    progressFill.style.width = "0%";
    
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
        } else {
            width += 10;
            progressFill.style.width = width + "%";
        }
    }, 100);
}

// Hide progress bar
function hideProgressBar() {
    progressBar.classList.add("hidden");
    adjustChatBottomPadding();
}

// Scan message function
async function scanMessage() {
    const message = messageInput.value.trim();
    if (!message || isScanning) return;

    isScanning = true;
    scanBtn.disabled = true;
    scanBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Scanning...</span>';

    // Clear input and add user message
    messageInput.value = "";
    messageInput.style.height = "auto";
    appendMessage(message, "user");
    
    // Show loading states
    showTypingIndicator();
    animateProgressBar();
    
    try {
        const response = await fetch(`${apiUrl}/analyze`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Get explanation from the explainer AI model
        try {
            const expResp = await fetch(`${explainerUrl}/explain`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: message,
                    label: data.result // "Safe" or "Phishing"
                })
            });
            
            if (expResp.ok) {
                const expData = await expResp.json();
                data.explanation = expData.explanation || "";
            }
        } catch (error) {
            console.log("Explanation service unavailable:", error);
            // Continue without explanation
        }
        
        // Remove loading states
        removeTypingIndicator();
        hideProgressBar();
        
        // Format the response
        const resultText = formatResult(data);
        appendMessage(resultText, "ai");
        
        // Update stats and history
        saveToHistory(message, data.result);
        updateStats(data.result);
        
    } catch (error) {
        console.error("Scan Error:", error);
        removeTypingIndicator();
        hideProgressBar();
        
        const errorMessage = `
            ❌ Connection Error<br>
            <small>Unable to connect to the AI service. Please check your internet connection and try again.</small>
        `;
        appendMessage(errorMessage, "ai");
    } finally {
        isScanning = false;
        scanBtn.disabled = false;
        scanBtn.innerHTML = '<span class="btn-icon">🔍</span><span class="btn-text">Scan</span>';
    }
}

// Format the result for display
function formatResult(data) {
    const { result, confidence } = data;
    const isPhishing = result.toLowerCase().includes("phishing");
    const explanation = (data && typeof data.explanation === 'string' && data.explanation.trim()) ? data.explanation.trim() : '';
    
    const icon = isPhishing ? "🚨" : "✅";
    const color = isPhishing ? "#ef4444" : "#10b981";
    
    return `
        <div style="color: ${color}; font-weight: 600;">
            ${icon} <strong>${result}</strong>
        </div>
        <div style="margin-top: 8px; font-size: 0.9rem; opacity: 0.8;">
            Confidence: <strong>${confidence}</strong>
        </div>
        <div style="margin-top: 12px; font-size: 0.85rem; color: #cbd5e1;">
            ${isPhishing ? 
                "⚠️ This message appears to be a phishing attempt. Be cautious and do not click on suspicious links." :
                "✅ This message appears to be safe. However, always remain vigilant with personal information."
            }
        </div>
        ${explanation ? `
        <div style="margin-top: 12px; padding: 12px; border: 1px solid rgba(99,102,241,0.3); border-radius: 10px; background: rgba(30,41,59,0.6); color: #e2e8f0;">
            <div style="font-weight:600; margin-bottom:6px; color:#a5b4fc;">Why this decision</div>
            <div style="white-space: pre-wrap; line-height:1.5;">${explanation.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </div>` : ''}
    `;
}

// Save to history
function saveToHistory(message, result) {
    const isPhishing = result.toLowerCase().includes("phishing");
    const historyItem = document.createElement("div");
    historyItem.className = `history-item ${isPhishing ? 'phishing' : 'safe'}`;
    historyItem.setAttribute('role', 'listitem');
    
    const truncatedMessage = message.length > 50 ? message.substring(0, 50) + "..." : message;
    historyItem.innerHTML = `
        <div style="font-weight: 500; margin-bottom: 4px;">
            ${isPhishing ? "🚨 Phishing" : "✅ Safe"}
        </div>
        <div style="font-size: 0.85rem; color: #cbd5e1;">
            ${truncatedMessage}
        </div>
        <div style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">
            ${new Date().toLocaleTimeString()}
        </div>
    `;
    
    // Remove empty history message if it exists
    const emptyHistory = historyList.querySelector('.empty-history');
    if (emptyHistory) {
        emptyHistory.remove();
    }
    
    // Add to top of history
    historyList.insertBefore(historyItem, historyList.firstChild);
    
    // Keep only last 10 items
    const items = historyList.querySelectorAll('.history-item');
    if (items.length > 10) {
        items[items.length - 1].remove();
    }
}

// Update statistics
function updateStats(result) {
    totalScans++;
    
    if (result.toLowerCase().includes("phishing")) {
        phishingScans++;
    } else {
        safeScans++;
    }
    
    totalScansEl.textContent = totalScans;
    phishingScansEl.textContent = phishingScans;
    safeScansEl.textContent = safeScans;
    
    // Save to localStorage
    saveStats();
}

// Save stats to localStorage
function saveStats() {
    const stats = {
        totalScans,
        phishingScans,
        safeScans
    };
    localStorage.setItem('surLinkStats', JSON.stringify(stats));
}

// Load stats from localStorage
function loadStats() {
    const savedStats = localStorage.getItem('surLinkStats');
    if (savedStats) {
        const stats = JSON.parse(savedStats);
        totalScans = stats.totalScans || 0;
        phishingScans = stats.phishingScans || 0;
        safeScans = stats.safeScans || 0;
        
        totalScansEl.textContent = totalScans;
        phishingScansEl.textContent = phishingScans;
        safeScansEl.textContent = safeScans;
    }
}

// Update API URL (this will be set when you deploy to Hugging Face Spaces)
function updateApiUrl(url) {
    apiUrl = url;
    checkApiStatus();
}

// Update explainer URL
function updateExplainerUrl(url) {
    explainerUrl = url;
    checkApiStatus();
}

// Auto-check API status every 30 seconds
setInterval(checkApiStatus, 30000); 

// Theme toggle functionality
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    const isDark = body.classList.contains('light-theme');
    
    if (isDark) {
        // Switch to dark theme
        body.classList.remove('light-theme');
        localStorage.setItem('surLinkTheme', 'dark');
        themeToggle.checked = false;
    } else {
        // Switch to light theme
        body.classList.add('light-theme');
        localStorage.setItem('surLinkTheme', 'light');
        themeToggle.checked = true;
    }
}

// Load saved theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('surLinkTheme');
    const themeToggle = document.getElementById('themeToggle');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeToggle) {
            themeToggle.checked = true;
        }
    }
}
document.getElementById("submitFeedback").addEventListener("click", () => {
  const type = document.getElementById("feedbackType").value;
  const message = document.getElementById("feedbackMessage").value.trim();
  const status = document.getElementById("feedbackStatus");

  if (!message) {
    status.textContent = "⚠️ Please enter your feedback before submitting.";
    status.style.color = "orange";
    status.classList.add("show");
    return;
  }

  console.log("📩 Feedback submitted:", { type, message });

  status.textContent = "✅ Thank you! Your feedback has been sent.";
  status.style.color = "green";
  status.classList.add("show");

  // Clear form after submission
  document.getElementById("feedbackMessage").value = "";
  setTimeout(() => status.classList.remove("show"), 3000);
});

document.getElementById("clearFeedback").addEventListener("click", () => {
  document.getElementById("feedbackMessage").value = "";
  document.getElementById("feedbackStatus").classList.remove("show");
});

// === Image picker OCR ===
function setupImagePicker() {
  const fileInput = document.getElementById('imagePicker');
  if (!fileInput) return;
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    
    // Show loading state
    const originalBtnText = scanBtn.innerHTML;
    scanBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Extracting...</span>';
    scanBtn.disabled = true;
    
    try {
      const img = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
      const extracted = (text || '').trim();
      if (extracted) {
        messageInput.value = extracted;
        messageInput.dispatchEvent(new Event('input'));
      }
    } catch (e) {
      console.error('Image OCR failed', e);
      alert('Failed to extract text from image. Please try again.');
    } finally {
      // Restore button state
      scanBtn.innerHTML = originalBtnText;
      scanBtn.disabled = false;
      fileInput.value = '';
    }
  });
}
let authMode = "login"; // "login" or "register"

function openLoginModal() {
  document.getElementById("authModal").classList.remove("hidden");
  document.getElementById("sidebar").classList.remove("open"); // If mobile menu is open, close it
}

function closeLoginModal() {
  document.getElementById("authModal").classList.add("hidden");
}

function switchAuthMode(e) {
  e.preventDefault();
  authMode = (authMode === "login") ? "register" : "login";
  document.getElementById("authTitle").innerText = authMode === "login" ? "Login" : "Register";
  document.querySelector("#authModal button.scan-btn").innerText = authMode === "login" ? "Login" : "Register";
  document.getElementById("authSwitch").innerHTML = authMode === "login" 
    ? `Don't have an account? <a href="#" onclick="switchAuthMode(event)">Register here</a>` 
    : `Already have an account? <a href="#" onclick="switchAuthMode(event)">Login here</a>`;
}

function handleAuthAction() {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value.trim();
  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }

  if (authMode === "register") {
    localStorage.setItem("surlinkUser", JSON.stringify({ email, password }));
    alert("✅ Registration successful! You can now log in.");
    switchAuthMode(new Event("click"));
  } else {
    const storedUser = JSON.parse(localStorage.getItem("surlinkUser"));
    if (storedUser && storedUser.email === email && storedUser.password === password) {
      localStorage.setItem("surlinkLoggedIn", "true");
      localStorage.setItem("surlinkLoggedUser", email);
      updateUserUI();
      closeLoginModal();
    } else {
      alert("❌ Invalid email or password");
    }
  }
}

function logout() {
  localStorage.removeItem("surlinkLoggedIn");
  localStorage.removeItem("surlinkLoggedUser");
  updateUserUI();
}

function updateUserUI() {
  const loggedIn = localStorage.getItem("surlinkLoggedIn") === "true";
  const email = localStorage.getItem("surlinkLoggedUser");
}
// === Variables ===
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userEmail = document.getElementById("userEmail");
const authModal = document.getElementById("authModal");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");

// Login state
let loggedIn = false;
let email = "";

// === Update UI based on login state ===
function updateAuthUI() {
  if (loggedIn) {
    logoutBtn.classList.remove("hidden");
    loginBtn.classList.add("hidden");
    userEmail.innerText = email;
    authModal.classList.add("hidden"); // hide modal if open
  } else {
    logoutBtn.classList.add("hidden");
    loginBtn.classList.remove("hidden");
    userEmail.innerText = "Not logged in";
  }
}

// === Open login modal ===
loginBtn.addEventListener("click", () => {
  authModal.classList.remove("hidden");
});

// === Close modal function ===
function closeLoginModal() {
  authModal.classList.add("hidden");
}

// === Login / Register handler (simple simulation) ===
function handleAuthAction() {
  // Normally you would validate user here
  if (authEmail.value && authPassword.value) {
    loggedIn = true;
    email = authEmail.value;
    updateAuthUI();
    // Clear inputs
    authEmail.value = "";
    authPassword.value = "";
  } else {
    alert("Please enter email and password");
  }
}

// === Logout handler ===
logoutBtn.addEventListener("click", () => {
  loggedIn = false;
  email = "";
  updateAuthUI();
});

// Initial UI setup
updateAuthUI();





// Call on page load
window.addEventListener("load", () => {
  updateUserUI();
});