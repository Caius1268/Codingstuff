// Simple gamified lesson SPA (no frameworks)
// Data persistence: localStorage

const EL = sel => document.querySelector(sel);
const CE = (tag, props = {}, children = []) => {
  const el = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null) el.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).filter(Boolean).forEach(c => el.appendChild(c));
  return el;
};

// Question bank
const QuestionBank = [
  {
    id: 'math_basics',
    title: 'Math Basics',
    description: 'Practice addition, subtraction, multiplication.',
    questions: [
      { id: 'q1', text: 'What is 7 + 5?', answers: ['10', '11', '12', '13'], correctIndex: 2, explanation: '7 + 5 = 12' },
      { id: 'q2', text: 'What is 9 - 6?', answers: ['1', '2', '3', '4'], correctIndex: 2, explanation: '9 - 6 = 3' },
      { id: 'q3', text: 'What is 4 × 3?', answers: ['7', '11', '12', '14'], correctIndex: 2, explanation: '4 × 3 = 12' },
    ]
  },
  {
    id: 'science_intro',
    title: 'Science Intro',
    description: 'Simple science facts.',
    questions: [
      { id: 'q1', text: 'Water freezes at what Celsius temperature?', answers: ['0°', '32°', '100°', '-10°'], correctIndex: 0, explanation: '0°C is the freezing point.' },
      { id: 'q2', text: 'Earth is the ___ planet from the Sun.', answers: ['1st', '2nd', '3rd', '4th'], correctIndex: 2, explanation: 'Mercury, Venus, Earth (third).' },
      { id: 'q3', text: 'Which gas do plants absorb?', answers: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctIndex: 2, explanation: 'Photosynthesis uses CO₂.' },
    ]
  }
];

// Shop catalog (cosmetics only)
const Shop = [
  { id: 'theme_neon', name: 'Theme: Neon', type: 'theme', price: 80, data: { accent: '#00f5d4' } },
  { id: 'theme_sunset', name: 'Theme: Sunset', type: 'theme', price: 80, data: { accent: '#ff8fab' } },
  { id: 'confetti', name: 'Confetti Celebrations', type: 'effect', price: 120, data: {} },
  { id: 'sfx_beep', name: 'Answer SFX (Beep)', type: 'sfx', price: 60, data: {} },
];

// Profile persistence
const STORAGE_KEY = 'gl_profile_v1';
const DEFAULT_PROFILE = {
  coins: 0,
  xp: 0,
  owned: {},
  daily: { lastClaim: 0, streak: 0 },
  lessons: {}, // { [lessonId]: { bestScore: number } }
};

let profile = loadProfile();

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...structuredClone(DEFAULT_PROFILE), ...JSON.parse(raw) };
    }
  } catch {}
  return structuredClone(DEFAULT_PROFILE);
}

function saveProfile() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  refreshStats();
}

function addXP(amount) {
  profile.xp = Math.max(0, (profile.xp || 0) + amount);
  saveProfile();
}
function addCoins(amount) {
  profile.coins = Math.max(0, (profile.coins || 0) + amount);
  saveProfile();
}

// Rewards config
const Rewards = {
  correctAnswerXP: 10,
  correctAnswerCoins: 5,
  lessonCompletionBonusXP: 25,
  lessonCompletionBonusCoins: 20,
  dailyBaseCoins: 30,
  dailyStreakBonusPerDay: 5,
  maxDailyStreak: 7,
};

function awardForAnswer(isCorrect) {
  if (isCorrect) {
    addXP(Rewards.correctAnswerXP);
    addCoins(Rewards.correctAnswerCoins);
  }
}
function awardForLessonCompletion() {
  addXP(Rewards.lessonCompletionBonusXP);
  addCoins(Rewards.lessonCompletionBonusCoins);
}

function claimDaily() {
  const now = Math.floor(Date.now() / 1000);
  const dayOfYear = d => Number(new Date(d * 1000).toLocaleDateString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'numeric', year: 'numeric' }).split('/').reverse().join(''));
  const doy = d => Math.floor((d - Date.UTC(new Date(d).getUTCFullYear(),0,0)) / 86400000);

  const last = profile.daily.lastClaim || 0;
  const today = doy(Date.now());
  const lastDay = doy(last * 1000);
  if (today === lastDay) return { ok: false, message: 'Already claimed today' };

  const yesterday = today - 1;
  const continued = lastDay === yesterday;
  const newStreak = Math.min(Rewards.maxDailyStreak, continued ? (profile.daily.streak || 0) + 1 : 1);
  const reward = Rewards.dailyBaseCoins + (newStreak - 1) * Rewards.dailyStreakBonusPerDay;

  profile.daily.lastClaim = now;
  profile.daily.streak = newStreak;
  addCoins(reward);
  saveProfile();
  return { ok: true, message: `Claimed ${reward} coins! Streak: ${newStreak}`, data: { reward, streak: newStreak } };
}

// Effects
function toast(msg) {
  const t = EL('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1600);
}

function playBeep(good = true) {
  if (!profile.owned['sfx_beep']) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = good ? 880 : 220;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    o.start();
    o.stop(ctx.currentTime + 0.26);
  } catch {}
}

function confettiBurst() {
  if (!profile.owned['confetti']) return;
  const container = CE('div', { class: 'confetti' });
  const colors = ['#ffd166', '#06d6a0', '#118ab2', '#ef476f', '#8338ec'];
  const pieces = 60;
  for (let i = 0; i < pieces; i++) {
    const d = CE('div', { class: 'confetti-piece' });
    const c = colors[i % colors.length];
    d.style.background = c;
    d.style.left = Math.random() * 100 + 'vw';
    d.style.top = '-20px';
    const rot = (Math.random() * 360) | 0;
    d.style.transform = `rotate(${rot}deg)`;
    container.appendChild(d);
    const dx = (Math.random() - 0.5) * 120; // drift
    const dy = 110 + Math.random() * 60;
    const duration = 900 + Math.random() * 700;
    requestAnimationFrame(() => {
      d.animate([
        { transform: `translate(0,0) rotate(${rot}deg)`, opacity: 1 },
        { transform: `translate(${dx}px, ${dy}vh) rotate(${rot + 360}deg)`, opacity: 0 }
      ], { duration, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
    });
  }
  document.body.appendChild(container);
  setTimeout(() => container.remove(), 1800);
}

// UI state
const view = EL('#view');
const tabs = {
  lessons: EL('#tab-lessons'),
  shop: EL('#tab-shop'),
  daily: EL('#tab-daily'),
};

function refreshStats() {
  EL('#stat-coins').textContent = `Coins: ${profile.coins|0}`;
  EL('#stat-xp').textContent = `XP: ${profile.xp|0}`;
}
refreshStats();

function setActiveTab(id) {
  Object.values(tabs).forEach(b => b.classList.remove('active'));
  tabs[id].classList.add('active');
}

// Lessons UI
function renderLessons() {
  setActiveTab('lessons');
  view.innerHTML = '';
  const header = CE('div', { class: 'row' }, [
    CE('h2', { text: 'Pick a Lesson' }),
    CE('div', { class: 'space' }),
    CE('span', { class: 'badge', text: 'XP + Coins for correct answers' })
  ]);
  view.appendChild(header);

  QuestionBank.forEach(lesson => {
    const best = profile.lessons?.[lesson.id]?.bestScore || 0;
    const card = CE('div', { class: 'card' }, [
      CE('div', { class: 'row' }, [
        CE('h3', { text: `${lesson.title} (${lesson.questions.length} Qs)` }),
        CE('div', { class: 'space' }),
        CE('span', { class: 'badge', text: `Best: ${best}/${lesson.questions.length}` })
      ]),
      CE('p', { text: lesson.description }),
      CE('div', { class: 'row' }, [
        CE('button', { class: 'btn primary', text: 'Start', onclick: () => startLesson(lesson) }),
        CE('button', { class: 'btn ghost', text: 'Play Mode', onclick: () => startGameMode(lesson) })
      ])
    ]);
    view.appendChild(card);
  });
}

function startLesson(lesson) {
  const prog = {
    lessonId: lesson.id,
    index: 0,
    correct: 0,
    total: lesson.questions.length,
    startedAt: performance.now(),
  };
  nextQuestion(lesson, prog);
}

function nextQuestion(lesson, prog) {
  prog.index += 1;
  const q = lesson.questions[prog.index - 1];
  view.innerHTML = '';

  const card = CE('div', { class: 'card' });
  card.append(
    CE('div', { class: 'row' }, [
      CE('h3', { text: `${lesson.title} (${prog.index}/${prog.total})` }),
      CE('div', { class: 'space' }),
      CE('span', { class: 'badge', text: `Correct: ${prog.correct}` })
    ]),
    CE('p', { text: q.text })
  );

  const answers = CE('div', { class: 'answers' });
  q.answers.forEach((ans, i) => {
    const b = CE('button', { class: 'answer', text: ans });
    b.addEventListener('click', () => {
      const isCorrect = i === q.correctIndex;
      b.classList.add(isCorrect ? 'correct' : 'incorrect');
      playBeep(isCorrect);
      awardForAnswer(isCorrect);
      if (isCorrect) prog.correct += 1;

      const explanation = q.explanation ? CE('p', { text: q.explanation }) : null;
      explanation && card.appendChild(explanation);

      const next = CE('div', { class: 'row' }, [
        CE('div', { class: 'space' }),
        CE('button', { class: 'btn', text: prog.index === prog.total ? 'Finish' : 'Next', onclick: () => {
          if (prog.index === prog.total) {
            // finish
            awardForLessonCompletion();
            profile.lessons[lesson.id] = profile.lessons[lesson.id] || { bestScore: 0 };
            profile.lessons[lesson.id].bestScore = Math.max(profile.lessons[lesson.id].bestScore, prog.correct);
            saveProfile();
            if (profile.owned['confetti']) confettiBurst();
            renderLessonSummary(lesson, prog);
          } else {
            nextQuestion(lesson, prog);
          }
        } })
      ]);
      card.appendChild(next);
      // disable all
      [...answers.children].forEach(x => x.disabled = true);
    }, { once: true });
    answers.appendChild(b);
  });
  card.appendChild(answers);
  view.appendChild(card);
}

function renderLessonSummary(lesson, prog) {
  view.innerHTML = '';
  const card = CE('div', { class: 'card' });
  card.append(
    CE('h3', { text: 'Lesson complete!' }),
    CE('p', { text: `Correct: ${prog.correct}/${prog.total}` }),
    CE('div', { class: 'row' }, [
      CE('button', { class: 'btn', text: 'Back to Lessons', onclick: renderLessons }),
    ])
  );
  view.appendChild(card);
}

// Shop UI
function renderShop() {
  setActiveTab('shop');
  view.innerHTML = '';
  const header = CE('div', { class: 'row' }, [
    CE('h2', { text: 'Shop' }),
    CE('div', { class: 'space' }),
    CE('span', { class: 'badge', text: 'Cosmetics only' })
  ]);
  view.appendChild(header);

  Shop.forEach(item => {
    const owned = !!profile.owned[item.id];
    const card = CE('div', { class: 'card' }, [
      CE('div', { class: 'row' }, [
        CE('h3', { text: item.name }),
        CE('div', { class: 'space' }),
        owned ? CE('span', { class: 'badge', text: 'Owned' }) : CE('span', { class: 'price', text: `${item.price} coins` })
      ]),
      CE('div', { class: 'row' }, [
        CE('button', { class: 'btn primary', text: owned ? 'Use' : 'Purchase', onclick: () => purchaseOrUse(item), disabled: owned && item.type !== 'theme' && item.type !== 'sfx' })
      ])
    ]);
    view.appendChild(card);
  });
}

function purchaseOrUse(item) {
  const owned = !!profile.owned[item.id];
  if (!owned) {
    if ((profile.coins|0) < item.price) { toast('Not enough coins'); return; }
    profile.coins -= item.price;
    profile.owned[item.id] = true;
    saveProfile();
    toast(`Purchased ${item.name}`);
  }
  applyItem(item);
}

function applyItem(item) {
  if (item.type === 'theme') {
    document.documentElement.style.setProperty('--accent', item.data.accent);
    toast(`${item.name} applied`);
  }
  if (item.type === 'sfx') {
    toast('Answer SFX active');
  }
}

// Daily UI
function renderDaily() {
  setActiveTab('daily');
  view.innerHTML = '';

  const streak = profile.daily.streak || 0;
  const card = CE('div', { class: 'card' }, [
    CE('h3', { text: 'Daily Reward' }),
    CE('p', { text: `Current streak: ${streak} day${streak === 1 ? '' : 's'}` }),
  ]);

  const row = CE('div', { class: 'row' });
  const btn = CE('button', { class: 'btn success', text: 'Claim Today' });
  btn.addEventListener('click', () => {
    const res = claimDaily();
    toast(res.message);
    renderDaily();
  });
  row.appendChild(btn);
  card.appendChild(row);

  view.appendChild(card);
}

// Game Mode
function startGameMode(lesson) {
  view.innerHTML = '';
  const wrap = CE('div', { class: 'game-wrap card' });
  const canvas = CE('canvas', { class: 'game-canvas' });
  const hud = CE('div', { class: 'hud-float' });
  const livesEl = CE('div', { class: 'row' });
  let lives = 3;
  for (let i = 0; i < lives; i++) livesEl.appendChild(CE('div', { class: 'heart' }));
  const timerEl = CE('div', { class: 'timer', text: 'Time: 60' });
  hud.append(livesEl, timerEl);

  const overlay = CE('div', { class: 'game-overlay' });
  const panel = CE('div', { class: 'panel' });
  overlay.appendChild(panel);

  wrap.append(canvas, hud, overlay);
  view.appendChild(wrap);

  const ctx = canvas.getContext('2d');
  let width, height, dpi;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpi = window.devicePixelRatio || 1;
    width = Math.floor(rect.width * dpi);
    height = Math.floor(rect.height * dpi);
    canvas.width = width;
    canvas.height = height;
  }
  resize();
  window.addEventListener('resize', resize);

  // Game state
  let timeLeft = 60; // seconds
  let running = true;
  let last = performance.now();
  let questionIndex = 0;
  let currentQ = lesson.questions[questionIndex];
  let pickups = []; // answers placed in world
  let enemies = [];
  let scoreCorrect = 0;

  const player = { x: width * 0.5, y: height * 0.5, r: 14, speed: 220 * (dpi), vx: 0, vy: 0 };
  const keys = new Set();
  window.addEventListener('keydown', e => keys.add(e.key.toLowerCase()));
  window.addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));

  function spawnQuestionPickups() {
    pickups = [];
    const indices = currentQ.answers.map((_, i) => i);
    // place answers in corners-ish
    const spots = [
      { x: width * 0.2, y: height * 0.2 },
      { x: width * 0.8, y: height * 0.2 },
      { x: width * 0.2, y: height * 0.8 },
      { x: width * 0.8, y: height * 0.8 },
    ];
    indices.forEach((i, idx) => {
      pickups.push({ x: spots[idx].x, y: spots[idx].y, r: 16, i, text: currentQ.answers[i] });
    });
  }

  function spawnEnemies(n = 3) {
    enemies = [];
    for (let i = 0; i < n; i++) {
      enemies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 12,
        vx: (Math.random() * 2 - 1) * 100 * dpi,
        vy: (Math.random() * 2 - 1) * 100 * dpi,
      });
    }
  }

  function resetLevel() {
    currentQ = lesson.questions[questionIndex];
    player.x = width * 0.5; player.y = height * 0.5; player.vx = 0; player.vy = 0;
    spawnQuestionPickups();
    spawnEnemies(3 + Math.min(questionIndex, 3));
  }

  function circleHit(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    const rr = (a.r + b.r);
    return dx * dx + dy * dy <= rr * rr;
  }

  function update(dt) {
    // Timer
    timeLeft -= dt;
    if (timeLeft <= 0) {
      timeLeft = 0; running = false; endGame('Time up!');
    }
    timerEl.textContent = 'Time: ' + Math.ceil(timeLeft);

    // Input
    const accel = player.speed * dt;
    const up = keys.has('w') || keys.has('arrowup');
    const down = keys.has('s') || keys.has('arrowdown');
    const left = keys.has('a') || keys.has('arrowleft');
    const right = keys.has('d') || keys.has('arrowright');
    let ax = (right ? 1 : 0) - (left ? 1 : 0);
    let ay = (down ? 1 : 0) - (up ? 1 : 0);
    const len = Math.hypot(ax, ay) || 1;
    ax /= len; ay /= len;
    player.vx = ax * player.speed; player.vy = ay * player.speed;

    player.x += player.vx * dt; player.y += player.vy * dt;
    player.x = Math.max(player.r, Math.min(width - player.r, player.x));
    player.y = Math.max(player.r, Math.min(height - player.r, player.y));

    // Enemies bounce
    enemies.forEach(e => {
      e.x += e.vx * dt; e.y += e.vy * dt;
      if (e.x < e.r || e.x > width - e.r) e.vx *= -1;
      if (e.y < e.r || e.y > height - e.r) e.vy *= -1;
      if (circleHit(player, e)) damage();
    });

    // Pickup
    for (let i = pickups.length - 1; i >= 0; i--) {
      if (circleHit(player, pickups[i])) {
        const correct = pickups[i].i === currentQ.correctIndex;
        pickups.splice(i, 1);
        handleAnswer(correct);
        break;
      }
    }
  }

  function damage() {
    // debounce small invuln
    if (damage._inv) return; damage._inv = true; setTimeout(() => damage._inv = false, 800);
    lives = Math.max(0, lives - 1);
    while (livesEl.firstChild) livesEl.removeChild(livesEl.firstChild);
    for (let i = 0; i < lives; i++) livesEl.appendChild(CE('div', { class: 'heart' }));
    if (lives <= 0) { running = false; endGame('Out of lives!'); }
  }

  function handleAnswer(isCorrect) {
    playBeep(isCorrect);
    awardForAnswer(isCorrect);
    if (isCorrect) {
      scoreCorrect += 1;
      if (questionIndex === lesson.questions.length - 1) {
        // finish
        awardForLessonCompletion();
        profile.lessons[lesson.id] = profile.lessons[lesson.id] || { bestScore: 0 };
        profile.lessons[lesson.id].bestScore = Math.max(profile.lessons[lesson.id].bestScore, scoreCorrect);
        saveProfile();
        if (profile.owned['confetti']) confettiBurst();
        running = false; endGame('Lesson complete!');
      } else {
        questionIndex += 1;
        resetLevel();
      }
    } else {
      // wrong answer: small penalty
      damage();
      toast('Wrong answer');
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Background grid
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = 'rgba(255,255,255,.05)';
    const step = 40 * dpi;
    for (let x = 0; x < width; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = 0; y < height; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    ctx.restore();

    // Player
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#7c5cff';
    ctx.beginPath(); ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2); ctx.fill();

    // Enemies
    enemies.forEach(e => {
      ctx.fillStyle = 'rgba(255,107,107,.9)';
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
    });

    // Pickups (answers)
    ctx.font = `${14 * dpi}px Inter, system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    pickups.forEach(p => {
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = 'white';
      const t = currentQ.answers[p.i];
      const txt = t.length > 12 ? t.slice(0, 12) + '…' : t;
      ctx.fillText(txt, p.x, p.y);
    });
  }

  function loop(now) {
    if (!running) return;
    const dt = Math.max(0, Math.min(0.033, (now - last) / 1000));
    last = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  function endGame(message) {
    overlay.innerHTML = '';
    const btns = CE('div', { class: 'row' }, [
      CE('button', { class: 'btn', text: 'Back to Lessons', onclick: renderLessons }),
      CE('div', { class: 'space' }),
      CE('button', { class: 'btn primary', text: 'Play Again', onclick: () => startGameMode(lesson) }),
    ]);
    panel.innerHTML = '';
    panel.append(
      CE('h3', { text: message }),
      CE('p', { text: `Correct: ${scoreCorrect}/${lesson.questions.length}` }),
      btns
    );
    overlay.style.display = 'grid';
  }

  // init
  overlay.style.display = 'none';
  resetLevel();
  (function tick() {
    requestAnimationFrame(tick);
  })();
  requestAnimationFrame(t => { last = t; loop(t); });
}

// Initial theme if owned
(function initTheme() {
  if (profile.owned['theme_neon']) document.documentElement.style.setProperty('--accent', '#00f5d4');
  if (profile.owned['theme_sunset']) document.documentElement.style.setProperty('--accent', '#ff8fab');
})();

// Tab handlers
EL('#tab-lessons').addEventListener('click', renderLessons);
EL('#tab-shop').addEventListener('click', renderShop);
EL('#tab-daily').addEventListener('click', renderDaily);

// Initial view
renderLessons();