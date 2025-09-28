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
        const btn = document.querySelector('[onclick="showSection(\'quiz\')"]') 
                 || document.querySelector('[onclick="showSection(\"quiz\")"]');
        if (btn) btn.classList.add('active');
    }
    // Always (re)init quiz when you enter the section
    initQuiz();
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
// Robust quiz initializer — safe to paste into script.js
let activeIntervals = [];

function initQuiz() {
  // idempotent init
  if (window.__surlinkQuizInit) return;
  window.__surlinkQuizInit = true;

function getNextQuestion() {
  if (endlessMode) {
    const pools = [
      ...questionBank.easy,
      ...questionBank.medium,
      ...questionBank.hard
    ];
    return pools[Math.floor(Math.random() * pools.length)];
  }
  const pool = questionBank[difficulty] || questionBank.medium;
  return pool[Math.floor(Math.random() * pool.length)];
}
 
 

  // --- Elements (grab once; later code checks exist) ---
  const quizWelcome = document.getElementById('quizWelcome');
  const quizDifficulty = document.getElementById('quizDifficulty');
  const quizContainer = document.getElementById('quizContainer');

  const quizProgress = document.getElementById('quizProgress');
  const quizProgressFill = document.getElementById('quizProgressFill');
  const quizScoreEl = document.getElementById('quizScore');
  const quizQuestion = document.getElementById('quizQuestion');
  const quizAnswers = document.getElementById('quizAnswers');
  const quizFeedback = document.getElementById('quizFeedback');
  const quizNextBtn = document.getElementById('quizNextBtn');
  const quizRestartBtn = document.getElementById('quizRestartBtn');
  const quizLivesEl = document.getElementById('quizLives');
  const quizLevelEl = document.getElementById('quizLevel');
const quizXPEl = document.getElementById('quizXP');

// If you have a separate stats panel somewhere:
const statsLevelEl = document.getElementById('statsLevel');
const statsBadgeEl = document.getElementById('statsBadge');
  const quizBadge = document.getElementById('quizBadge');
  const quizTimerEl = document.getElementById('quizTimer');
  const quizStreakEl = document.getElementById('quizStreak');

  // Defensive: warn if important pieces are missing
  if (!quizQuestion || !quizAnswers) {
    console.warn("Quiz init: essential elements missing. Check IDs: quizQuestion, quizAnswers.");
  }
  if (!quizWelcome) console.warn("Quiz init: 'quizWelcome' missing.");
  if (!quizStartBtnExists() && !document.querySelector('#quizStartBtn')) {
    // if there is not an actual start button element yet - delegation still handles clicks.
    // no hard failure — just warning
    console.warn("Quiz init: '#quizStartBtn' not found. Make sure there is a button with id='quizStartBtn'.");
  }

  // --- Config & state ---
  const AUTO_NEXT_DELAY = 1200;
  const LOW_TIME_THRESHOLD = 6;

// --- State ---
let idx = 0, score = 0, lives = 3;
// keep track of previous lives so we can animate differences
let prevLives = lives;

// keep ref to a pulse animation so we can cancel it when needed
let livesPulseAnim = null;
let xp = 0, level = 1, xpToNext = 50; // base threshold
let answered = false;
let autoNextTimeout = null;
let streak = 0, bestStreak = 0;
let difficulty = null;
let endlessMode = false;
let currentQuestion = null;




// --- XP & Level handling ---
function addXP(amount) {
  xp += amount;

  if (quizXPEl) {
    quizXPEl.classList.add("xp-glow");
    setTimeout(() => quizXPEl.classList.remove("xp-glow"), 800);
  }

  while (xp >= xpToNext) {
    xp -= xpToNext;
    level++;
    xpToNext = Math.floor(xpToNext * 1.3);

    if (quizLevelEl) {
      quizLevelEl.classList.add("level-up");
      setTimeout(() => quizLevelEl.classList.remove("level-up"), 800);
    }

    triggerConfetti();
    playSound("levelUp");
  }

  updateScoreUI(true); 
  
}

  // --- Helpers ---
  function quizStartBtnExists(){ return !!document.getElementById('quizStartBtn'); }

  function clearTimers() {
    activeIntervals.forEach(id => clearInterval(id));
    activeIntervals = [];
    if (autoNextTimeout !== null) {
      clearTimeout(autoNextTimeout);
      autoNextTimeout = null;
    }
  }

  function getTimerForDifficulty() {
    if (difficulty === "easy") return 25;
    if (difficulty === "medium") return 20;
    if (difficulty === "hard") return 15;
    if (endlessMode) return 18;
    return 20;
  }

  function getNextQuestion() {
    if (endlessMode) {
      const pools = [...questionBank.easy, ...questionBank.medium, ...questionBank.hard];
      return pools[Math.floor(Math.random() * pools.length)];
    }
    const pool = questionBank[difficulty] || questionBank.medium;
    return pool[Math.floor(Math.random() * pool.length)];
  }

 // --- UI updates (guarded) ---
function updateProgressUI() {
  if (!quizProgress || !quizProgressFill) return;

  if (endlessMode) {
    quizProgress.textContent = `Question ${idx + 1} (Endless)`;
    quizProgressFill.style.width = "100%"; // fixed bar for endless
  } else {
    const total = questionBank[difficulty] ? questionBank[difficulty].length : 1;
    quizProgress.textContent = `Question ${idx + 1} / ${total}`;
    const percent = Math.round(((idx + 1) / total) * 100);
    quizProgressFill.style.width = `${percent}%`;
  }
}

// --- Update UI ---
function updateScoreUI(bump = false) {
  if (quizScoreEl) quizScoreEl.textContent = `Score: ${score}`;
  if (quizLevelEl) quizLevelEl.textContent = `Lvl ${level}`;
  if (quizXPEl) quizXPEl.textContent = `XP: ${xp} / ${xpToNext}`;

  if (bump) {
    [quizScoreEl, quizLevelEl, quizXPEl].forEach(el => {
      if (!el) return;
      el.classList.remove('bump');
      void el.offsetWidth;
      el.classList.add('bump');
    });
  }
}

  function updateLivesUI() {
  if (!quizLivesEl) return;

  const maxLives = 3; // or make configurable
  quizLivesEl.innerHTML = '';

  for (let i = 0; i < maxLives; i++) {
    const span = document.createElement('span');
    span.className = 'heart ' + (i < lives ? 'full' : 'empty');
    quizLivesEl.appendChild(span);
  }

  // Animate life lost
  if (prevLives > lives) {
    const lostHeart = quizLivesEl.querySelectorAll('.heart')[lives];
    if (lostHeart) {
      lostHeart.animate([
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(0.2)', opacity: 0 }
      ], { duration: 500, easing: 'ease-out' });
      playSound('lifeLost');
    }
  }

  // Animate life gained
  if (prevLives < lives) {
    const newHeart = quizLivesEl.querySelectorAll('.heart')[lives - 1];
    if (newHeart) {
      newHeart.animate([
        { transform: 'scale(0.2)', opacity: 0 },
        { transform: 'scale(1.3)', opacity: 1 },
        { transform: 'scale(1)', opacity: 1 }
      ], { duration: 500, easing: 'cubic-bezier(.2,.9,.3,1)' });
      playSound('correct'); // or a dedicated heal sound
    }
  }

  // Pulse when in danger (only 1 life left)
  quizLivesEl.querySelectorAll('.heart').forEach((h, i) => {
    h.classList.remove('danger');
    if (lives === 1 && i === 0) h.classList.add('danger');
  });

  prevLives = lives;
}

  function updateStreakUI(bump = false) {
    if (!quizStreakEl) return;
    quizStreakEl.textContent = `🔥 ${streak} | 🏆 Best: ${bestStreak} ${endlessMode ? "| ♾️ Endless" : ""}`;
    if (bump) {
      quizStreakEl.classList.remove('bump');
      void quizStreakEl.offsetWidth;
      quizStreakEl.classList.add('bump');
    }
  }

  function setTimerDisplay(s) {
    if (!quizTimerEl) return;
    quizTimerEl.textContent = `${s}s`;
    quizTimerEl.classList.remove('warn','zero');
    if (s <= 0) quizTimerEl.classList.add('zero');
    else if (s <= LOW_TIME_THRESHOLD) quizTimerEl.classList.add('warn');
  }

  // --- Timer (uses activeIntervals[]) ---
  function startTimer(currentIdx) {
    clearTimers();
    let timeLeft = getTimerForDifficulty();
    setTimerDisplay(timeLeft);

    const myIdx = currentIdx;
    const intervalId = setInterval(() => {
      // if we've moved to another question, stop this interval
      if (idx !== myIdx) {
        clearTimers();
        return;
      }
      timeLeft -= 1;
      setTimerDisplay(timeLeft);
      if (timeLeft <= 0) {
        clearTimers();
        onTimeUp();
      }
    }, 1000);

    activeIntervals.push(intervalId);
  }

  // --- Quiz flow ---
  function revealCorrectAnswer() {
    if (!currentQuestion || !quizAnswers) return;
    Array.from(quizAnswers.children).forEach(btn => {
      const txt = (btn.textContent || '').trim();
      const matching = currentQuestion.a.find(a => a.text === txt);
      if (matching && matching.correct) btn.classList.add('correct');
    });
  }

  function onTimeUp() {
    if (answered) return;
    answered = true;
    clearTimers();
    if (quizAnswers) Array.from(quizAnswers.children).forEach(b => b.disabled = true);
    revealCorrectAnswer();
    lives = Math.max(0, lives - 1);
    streak = 0;
    if (quizFeedback) quizFeedback.textContent = `⏱️ Time's up! You lost a life.`;
    updateLivesUI();
    updateStreakUI();

    autoNextTimeout = setTimeout(() => {
      if (lives <= 0) finishQuiz(false);
      else { idx++; render(); }
    }, AUTO_NEXT_DELAY);
  }

  function selectAnswer(btn, correct) {
    if (answered) return;
    answered = true;
    clearTimers();
    if (quizAnswers) Array.from(quizAnswers.children).forEach(b => b.disabled = true);

    if (correct) {
      score++;
      addXP(10);
      streak++;
      if (streak > bestStreak) bestStreak = streak;
      btn.classList.add('correct');
      if (quizFeedback) quizFeedback.textContent = '✅ Correct!';
      updateStreakUI(true);
    } else {
      streak = 0;
      btn.classList.add('incorrect');
      revealCorrectAnswer();
      lives = Math.max(0, lives - 1);
      if (quizFeedback) quizFeedback.textContent = '❌ Wrong!';
      updateStreakUI();
    }

    updateLivesUI();
    updateScoreUI(true);

    autoNextTimeout = setTimeout(() => {
      if (lives <= 0) finishQuiz(false);
      else { idx++; render(); }
    }, AUTO_NEXT_DELAY);
  }

const badgeLevels = [
  { minLevel: 1, name: "Novice Learner 🐣" },
  { minLevel: 3, name: "Phishing Hunter 🕵️" },
  { minLevel: 5, name: "Cyber Guardian 🛡️" },
  { minLevel: 8, name: "Security Master 🔒" },
  { minLevel: 10, name: "Cyber Sentinel 👑" }
];

function triggerConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 }
  });
}

const sounds = {
  correct: new Audio("sounds/correct.mp3"),
  wrong: new Audio("sounds/wrong.mp3"),
  lifeLost: new Audio("sounds/life-lost.mp3"),
  levelUp: new Audio("sounds/level-up.mp3"),
};

function playSound(name) {
  if (sounds[name]) {
    sounds[name].currentTime = 0;
    sounds[name].play().catch(() => {}); // prevent autoplay issues
  }
}

function getBadgeForLevel(level) {
  let earned = badgeLevels[0].name;
  for (const b of badgeLevels) {
    if (level >= b.minLevel) earned = b.name;
  }
  return earned;
}

// Quit button
document.addEventListener('click', function (ev) {
  const btn = ev.target.closest('button');
  if (!btn) return;

  if (btn.matches('#quizQuitBtn')) {
    ev.preventDefault();
    clearTimers();
    finishQuiz(false, true); // treat as quit
  }
});

function finishQuiz(won = true, quit = false) {
  clearTimers();
  if (quizAnswers) quizAnswers.innerHTML = '';
  if (quizNextBtn) quizNextBtn.style.display = 'none';
  if (quizRestartBtn) quizRestartBtn.style.display = 'none'; // handled below
  if (quizQuitBtn) quizQuitBtn.style.display = 'none';

  const badge = getBadgeForLevel(level);

  // Title logic
  let title = won ? "🏆 Mission Complete!" : "💀 Game Over";
  if (quit) title = "🚪 You quit the game";

  // Build results card
  let resultHTML = `
    <div class="quiz-result-card">
      <h2 class="result-title">${title}</h2>
      <div class="result-stats">
        <div><strong>📊 Score:</strong> ${score}</div>
        <div><strong>⭐ XP:</strong> ${xp}</div>
        <div><strong>🏅 Badge:</strong> ${badge}</div>
        <div><strong>🔥 Best Streak:</strong> ${bestStreak}</div>
      </div>
      <div class="quiz-actions" style="margin-top:16px;display:flex;gap:10px;justify-content:center;">
        <button id="resultsRestartBtn" class="scan-btn">🔄 Play Again</button>
        <button id="resultsMenuBtn" class="scan-btn outline">🏠 Main Menu</button>
      </div>
    </div>
  `;

  if (quizQuestion) quizQuestion.innerHTML = resultHTML;
  if (quizFeedback) quizFeedback.textContent = '';
  if (quizBadge) quizBadge.style.display = 'none';

  // Button handlers
  const restartBtn = document.getElementById('resultsRestartBtn');
  const menuBtn = document.getElementById('resultsMenuBtn');


  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      idx = 0; score = 0; xp = 0; lives = 3; streak = 0; bestStreak = 0;
      render();
    });
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      if (quizContainer) quizContainer.style.display = 'none';
      if (quizWelcome) quizWelcome.style.display = 'block';      
    });
  }
}

function render() {
  clearTimers();
  answered = false;

  if (quizQuitBtn) quizQuitBtn.style.display = 'inline-flex'; // <— restore Quit here

  if (quizAnswers) quizAnswers.innerHTML = '';
  if (quizFeedback) quizFeedback.textContent = '';
  if (quizNextBtn) { quizNextBtn.disabled = true; quizNextBtn.style.display = 'inline-flex'; }
  if (quizRestartBtn) quizRestartBtn.style.display = 'none';
  if (quizBadge) quizBadge.style.display = 'none';

  updateProgressUI();
  updateLivesUI();
  updateScoreUI(false);
  updateStreakUI(false);

  currentQuestion = getNextQuestion();
  if (quizQuestion) quizQuestion.textContent = currentQuestion.q;

  currentQuestion.a.forEach((ans) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-answer';
    btn.type = 'button';
    btn.textContent = ans.text;
    btn.addEventListener('click', () => selectAnswer(btn, ans.correct));
    if (quizAnswers) quizAnswers.appendChild(btn);
  });

  startTimer(idx);
}

  // --- Global event delegation so element timing doesn't break click handlers ---
  document.addEventListener('click', function (ev) {
    const btn = ev.target.closest('button, .quiz-difficulty');
    if (!btn) return;

    // Start -> show difficulty selection
    if (btn.matches('#quizStartBtn')) {
      ev.preventDefault();
      if (quizWelcome) quizWelcome.style.display = 'none';
      if (quizDifficulty) quizDifficulty.style.display = 'block';
      if (quizContainer) quizContainer.style.display = 'none';
      return;
    }

    // Difficulty selection buttons (class .quiz-difficulty, data-mode attribute)
    if (btn.classList && btn.classList.contains('quiz-difficulty')) {
      ev.preventDefault();
      const mode = btn.dataset.mode || btn.getAttribute('data-mode');
      endlessMode = (mode === 'endless');
      difficulty = endlessMode ? null : mode;
      if (quizDifficulty) quizDifficulty.style.display = 'none';
      if (quizContainer) quizContainer.style.display = 'block';
      idx = 0; score = 0; xp = 0; lives = 3; streak = 0; bestStreak = 0;
      render();
      return;
    }

    // Next button manual (if you allow manual next)
    if (btn.matches('#quizNextBtn')) {
      ev.preventDefault();
      clearTimers();
      idx++;
      if (!currentQuestion || idx >= 10000) { /* safety */ }
      if (!questionBank) return;
      if (!endlessMode && idx >= (questionBank[difficulty] ? questionBank[difficulty].length : 0)) {
        finishQuiz(true);
      } else {
        render();
      }
      return;
    }

// --- Restart handling ---
if (btn.matches('#quizRestartBtn')) {
  ev.preventDefault();
  clearTimers();
  idx = 0; score = 0; lives = 3;
  xp = 0; level = 1; xpToNext = 50; // reset XP & Level
  streak = 0; bestStreak = 0;
  if (quizContainer) quizContainer.style.display = 'none';
  if (quizWelcome) quizWelcome.style.display = 'block';
  return;
}
  });

  // Ensure initial UI state if elements exist
  if (quizWelcome) quizWelcome.style.display = (quizWelcome.style.display === 'none') ? 'none' : 'block';
  if (quizDifficulty) quizDifficulty.style.display = 'none';
  if (quizContainer) quizContainer.style.display = 'none';
}

// Auto-initialize when DOM ready if showSection('quiz') won't call it
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initQuiz);
} else {
  initQuiz();
}


// ---------- end of initQuiz replacement ----------//






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
        <div style="margin-top: 12px; font-size: 0.85rem; color: #000000;">
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

  // Save numeric counters
  saveStats();

  // Add a small event to scan history (useful for trend charts later)
  try {
    const events = JSON.parse(localStorage.getItem('surlinkScanEvents') || '[]');
    events.push({ ts: Date.now(), result: result.toLowerCase() });
    // keep only last 200 events to avoid bloat
    localStorage.setItem('surlinkScanEvents', JSON.stringify(events.slice(-200)));
  } catch (e) {}

  // Update UI + chart
  updateStatsDisplay();
}
/* ---------------------------
   STATS UI / Chart Integration
   --------------------------- */

let statsChart = null;

function initStatsSection() {
  // update DOM references quickly (in case elements were added after initial load)
  const doughnutCanvas = document.getElementById('statsDoughnut');
  const resetBtn = document.getElementById('resetStatsBtn');
  const editProfileBtn = document.getElementById('editProfileBtn');

  // Create Chart if Chart.js is present
  if (doughnutCanvas && typeof Chart !== 'undefined') {
    const ctx = doughnutCanvas.getContext('2d');

    statsChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Phishing', 'Safe'],
        datasets: [{
          data: [phishingScans || 0, safeScans || 0],
          backgroundColor: ['#ef4444', '#10b981'],
          hoverOffset: 8,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                const v = ctx.raw || 0;
                const total = (ctx.dataset.data || []).reduce((a,b)=>a+(b||0),0) || 1;
                const pct = Math.round((v / total) * 100);
                return `${ctx.label}: ${v} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  // hook reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (!confirm('Reset scan statistics? This cannot be undone.')) return;
      totalScans = phishingScans = safeScans = 0;
      saveStats();
      updateStatsDisplay();
    });
  }

  // edit profile button (simple inline edit for name)
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      const current = getPlayerProfile();
      const name = prompt('Display name:', current.name || '');
      if (name !== null) {
        const profile = Object.assign({}, current, { name: name || 'Guest' });
        savePlayerProfile(profile);
      }
    });
  }

  // initial render
  updateStatsDisplay();
  updateProfileUI();
}

/* update DOM numbers + chart */
function updateStatsDisplay() {
  if (totalScansEl) totalScansEl.textContent = totalScans;
  if (phishingScansEl) phishingScansEl.textContent = phishingScans;
  if (safeScansEl) safeScansEl.textContent = safeScans;

  // Chart update
  if (statsChart) {
    statsChart.data.datasets[0].data = [phishingScans, safeScans];
    statsChart.update('active');
  }

  // update legend text (small textual summary)
  const legend = document.getElementById('chartLegend');
  if (legend) {
    const total = Math.max(1, (phishingScans + safeScans));
    const pctPhishing = Math.round((phishingScans / total) * 100);
    const pctSafe = Math.round((safeScans / total) * 100);
    legend.innerHTML = `<strong>${total}</strong> total • <span style="color:#ef4444">Phishing ${pctPhishing}%</span> • <span style="color:#10b981">Safe ${pctSafe}%</span>`;
  }

  // update player summary counts if present
  const games = document.getElementById('playerGames');
  if (games) {
    const s = getPlayerProfile() || {};
    // try to surface a simple gamesPlayed value stored in localStorage
    const gp = parseInt(s.gamesPlayed || 0, 10) || 0;
    games.textContent = gp;
  }
}

/* -----------------------
   Player Profile helpers
   ----------------------- */
function getPlayerProfile() {
  try {
    return JSON.parse(localStorage.getItem('surlinkPlayer') || '{}');
  } catch (e) { return {}; }
}
function savePlayerProfile(profile) {
  localStorage.setItem('surlinkPlayer', JSON.stringify(profile || {}));
  updateProfileUI();
}
function updateProfileUI() {
  const p = getPlayerProfile();
  const nameEl = document.getElementById('playerName');
  const avatarEl = document.getElementById('playerAvatar');
  const badgeEl = document.getElementById('playerBadge');
  const levelEl = document.getElementById('profileLevel');
  const xpEl = document.getElementById('profileXP');
  const xpFill = document.getElementById('profileXPbarFill');
  const best = document.getElementById('playerBestStreak');

  if (nameEl) nameEl.textContent = p.name || 'Guest';
  if (avatarEl) avatarEl.textContent = (p.name && p.name.length ? p.name[0].toUpperCase() : 'G');

  // Show level/xp if present in profile, else fallback to defaults
  const level = p.level || 1;
  const xp = p.xp || 0;
  const xpTo = p.xpToNext || 50;

  if (badgeEl) badgeEl.textContent = p.badge || getBadgeForLevel(level);
  if (levelEl) levelEl.textContent = `Lvl ${level}`;
  if (xpEl) xpEl.textContent = `XP: ${xp} / ${xpTo}`;
  if (xpFill) xpFill.style.width = `${Math.min(100, Math.round((xp / xpTo) * 100))}%`;

  if (best) best.textContent = p.bestStreak || 0;
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
  }
  updateStatsDisplay ();
  }
document.addEventListener('DOMContentLoaded', function() {
    checkApiStatus();
    setupEventListeners();
    loadStats();
    initStatsSection();    // <-- add this
    setupAccessibility();
    addParticleEffect();
        
});    

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

/* ---- LOGIN ------ */
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
      localStorage.removeItem("surlinkGoogleName");
      localStorage.removeItem("surlinkGooglePic");
      updateUserUI();
      closeLoginModal();
    } else {
      alert("❌ Invalid email or password");
    }
  }
}


// Unified Google & Local login/profile logic
window.setGoogleUser = function(data) {
  localStorage.setItem("surlinkLoggedIn", "true");
  localStorage.setItem("surlinkLoggedUser", data.email);
  localStorage.setItem("surlinkGoogleName", data.name);
  localStorage.setItem("surlinkGooglePic", data.picture);
  updateUserUI();
  closeLoginModal();
};

function updateUserUI() {
  const loggedIn = localStorage.getItem("surlinkLoggedIn") === "true";
  const email = localStorage.getItem("surlinkLoggedUser") || "";
  const name = localStorage.getItem("surlinkGoogleName") || "";
  const pic = localStorage.getItem("surlinkGooglePic") || "";

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userEmail = document.getElementById("userEmail");
  const userName = document.getElementById("userName");
  const userPic = document.getElementById("userPic");

  if (loggedIn) {
    logoutBtn.classList.remove("hidden");
    loginBtn.classList.add("hidden");
    userEmail.innerText = email || "";
    userName.innerText = name || "";
    if (pic) {
      userPic.src = pic;
      userPic.style.display = "block";
    } else {
      userPic.style.display = "none";
    }
  } else {
    logoutBtn.classList.add("hidden");
    loginBtn.classList.remove("hidden");
    userEmail.innerText = "Not logged in";
    if (userName) userName.innerText = "";
    if (userPic) userPic.style.display = "none";
  }
}

function logout() {
  localStorage.removeItem("surlinkLoggedIn");
  localStorage.removeItem("surlinkLoggedUser");
  localStorage.removeItem("surlinkGoogleName");
  localStorage.removeItem("surlinkGooglePic");
  updateUserUI();
}

// Call on page load
window.addEventListener("load", () => {
  updateUserUI();
});

// === Image Options Dropdown Functions ===
function isSmallScreen() {
  return window.innerWidth <= 1024; // Mobile and tablet breakpoint
}

function updateCameraOptionVisibility() {
  const dropdown = document.getElementById('imageOptionsDropdown');
  const cameraOption = dropdown?.querySelector('.dropdown-option:first-child');
  
  if (cameraOption) {
    if (isSmallScreen()) {
      cameraOption.style.display = 'flex';
    } else {
      cameraOption.style.display = 'none';
    }
  }
}

function toggleImageOptions() {
  const dropdown = document.getElementById('imageOptionsDropdown');
  
  if (dropdown) {
    // Update camera option visibility before showing dropdown
    updateCameraOptionVisibility();
    dropdown.classList.toggle('hidden');
  }
}

function selectImage() {
  const fileInput = document.getElementById('imagePicker');
  if (fileInput) {
    fileInput.click();
  }
  // Hide dropdown after selection
  const dropdown = document.getElementById('imageOptionsDropdown');
  if (dropdown) {
    dropdown.classList.add('hidden');
  }
}

function openCamera() {
  // For now, we'll use the file input with camera capture
  const fileInput = document.getElementById('imagePicker');
  if (fileInput) {
    fileInput.setAttribute('capture', 'environment');
    fileInput.click();
    // Reset capture attribute after use
    setTimeout(() => {
      fileInput.removeAttribute('capture');
    }, 100);
  }
  // Hide dropdown after selection
  const dropdown = document.getElementById('imageOptionsDropdown');
  if (dropdown) {
    dropdown.classList.add('hidden');
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const dropdown = document.getElementById('imageOptionsDropdown');
  const imageBtn = document.getElementById('imageOptionsBtn');
  
  if (dropdown && !dropdown.classList.contains('hidden') && 
      !imageBtn.contains(event.target) && 
      !dropdown.contains(event.target)) {
    dropdown.classList.add('hidden');
  }
});
/* splash screen */
window.addEventListener("load", () => {
  const splash = document.getElementById("splashScreen");

  // Keep splash visible for a bit, then fade out
  setTimeout(() => {
    splash.classList.add("hide");

    // Wait until splash animation finishes
    setTimeout(() => {
      if (typeof window.startOnboarding === "function") {
        window.startOnboarding(); // ✅ start onboarding
      }
    }, 300); // match your splash fade-out transition
  }, 1900); // how long splash stays visible
});

// === Sidebar swipe (mobile) ===
(function () {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("backdrop");
  const menuToggle = document.getElementById("menuToggle");

  let startX = 0, startY = 0;
  let isSwiping = false;

  function isMobile() {
    return window.matchMedia("(max-width:1024px)").matches;
  }

  // Start swipe detection
  document.addEventListener("touchstart", (e) => {
    if (!isMobile()) return;

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;

    // Open if starting from left edge (within 150px)
    if (startX <= 150 && !sidebar.classList.contains("open")) {
      isSwiping = "open";
    }

    // Close if starting inside the sidebar (within 50px from its right edge)
    if (
      sidebar.classList.contains("open") &&
      startX >= sidebar.offsetWidth - 50
    ) {
      isSwiping = "close";
    }
  });

  document.addEventListener("touchmove", (e) => {
    if (!isSwiping) return;

    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;

    // cancel if vertical movement > horizontal
    if (Math.abs(dy) > Math.abs(dx)) {
      isSwiping = false;
      return;
    }

    if (isSwiping === "open" && dx > 80) {
      // Open sidebar
      sidebar.classList.add("open");
      if (backdrop) {
        backdrop.hidden = false;
        backdrop.style.pointerEvents = "auto";
        backdrop.style.opacity = "0.4";
      }
      if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("no-scroll");
      isSwiping = false;
    }

    if (isSwiping === "close" && dx < -80) {
      // Close sidebar
      sidebar.classList.remove("open");
      if (backdrop) {
        backdrop.hidden = true;
        backdrop.style.pointerEvents = "none";
      }
      if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("no-scroll");
      isSwiping = false;
    }
  });

  document.addEventListener("touchend", () => {
    isSwiping = false;
  });
})();

function setLanguage(lang) {
  localStorage.setItem("appLang", lang);

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");

    if (el.tagName.toLowerCase() === "input" || el.tagName.toLowerCase() === "textarea") {
      el.placeholder = translations[lang][key] || el.placeholder;
    } else {
      el.textContent = translations[lang][key] || el.textContent;
    }
  });
}

// Initialize language on load
document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("appLang") || "en";
  setLanguage(savedLang);
});