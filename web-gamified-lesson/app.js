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
  { id: 'trail_neon', name: 'Player Trail', type: 'trail', price: 140, data: { color: '#00f5d4' } },
  { id: 'boost_xp', name: '2x XP (15m)', type: 'boost', price: 200, data: { kind: 'xp', durationMs: 15*60*1000 } },
  { id: 'map_skin_grid', name: 'Map Skin: Grid', type: 'map_skin', price: 90, data: { skin: 'grid' } },
];

// Profile persistence
const STORAGE_KEY = 'gl_profile_v1';
const DEFAULT_PROFILE = {
  name: 'Player',
  coins: 0,
  xp: 0,
  owned: {},
  daily: { lastClaim: 0, streak: 0 },
  lessons: {}, // { [lessonId]: { bestScore: number } }
  settings: { sfxEnabled: true, confettiEnabled: true, difficulty: 'normal', hapticsEnabled: true, highContrast: false, controlMode: 'touch' },
  achievements: {}, // { id: true }
  leaderboard: [], // [{ ts, lessonId, correct }]
  boosts: { xpUntil: 0, mapSkin: '' },
  spentCoins: 0,
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
  const now = Date.now();
  const boosted = (profile.boosts?.xpUntil||0) > now ? amount*2 : amount;
  profile.xp = Math.max(0, (profile.xp || 0) + boosted);
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
  if (!profile.settings.sfxEnabled) return;
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
  if (!profile.settings.confettiEnabled && !profile.owned['confetti']) return;
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
  stats: EL('#tab-stats'),
  settings: EL('#tab-settings'),
};

function levelFromXP(xp){ return Math.max(1, Math.floor(Math.sqrt(xp/50))+1); }
function levelProgress(xp){ const lvl = levelFromXP(xp); const prev = (lvl-1)*(lvl-1)*50; const next = (lvl)*(lvl)*50; return { lvl, pct: Math.max(0, Math.min(1, (xp - prev) / (next - prev))) } }
function refreshStats() {
  const { lvl, pct } = levelProgress(profile.xp|0);
  EL('#stat-level').textContent = `Lv ${lvl}`;
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
    CE('span', { class: 'badge', text: 'Cosmetics, boosts & effects' })
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
    const before = profile.coins|0;
    profile.coins -= item.price;
    profile.spentCoins = (profile.spentCoins||0) + item.price;
    profile.owned[item.id] = true;
    saveProfile();
    const spent = profile.spentCoins|0;
    if (spent >= 200) unlockAchievement('spender');
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
  if (item.type === 'boost' && item.data.kind === 'xp') {
    profile.boosts = profile.boosts || {}; profile.boosts.xpUntil = Date.now() + (item.data.durationMs||0);
    saveProfile(); toast('2x XP active!');
  }
  if (item.type === 'map_skin') {
    profile.boosts = profile.boosts || {}; profile.boosts.mapSkin = item.data.skin;
    document.body.dataset.mapSkin = item.data.skin;
    saveProfile(); toast(`${item.name} applied`);
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

// Achievements
const ACHIEVEMENTS = [
  { id: 'first_win', name: 'First Steps', desc: 'Complete any lesson once.' },
  { id: 'perfect_10', name: 'Perfectionist', desc: 'Finish a lesson with all answers correct.' },
  { id: 'streak_3', name: 'Daily Devotee', desc: 'Reach a daily streak of 3.' },
  { id: 'spender', name: 'Big Spender', desc: 'Spend 200 coins in the shop.' },
];
function unlockAchievement(id) {
  if (profile.achievements[id]) return;
  profile.achievements[id] = true;
  saveProfile();
  toast('Achievement unlocked: ' + (ACHIEVEMENTS.find(a=>a.id===id)?.name || id));
}

// Stats view
function renderStats() {
  setActiveTab('stats');
  view.innerHTML = '';

  // XP / Level card
  const { lvl, pct } = levelProgress(profile.xp|0);
  const xpCard = CE('div', { class: 'card' }, [
    CE('h3', { text: 'Profile' }),
    CE('div', { class: 'kv' }, [
      CE('div', { text: 'Name' }), CE('div', { text: profile.name }),
      CE('div', { text: 'Level' }), CE('div', { text: String(lvl) }),
      CE('div', { text: 'XP' }), CE('div', { text: String(profile.xp|0) }),
      CE('div', { text: 'Coins' }), CE('div', { text: String(profile.coins|0) }),
    ]),
    CE('div', { class: 'xpbar' }, [ CE('div', { class: 'fill', style: `width:${(pct*100)|0}%` }) ])
  ]);
  view.appendChild(xpCard);

  // Lessons best
  const bestCard = CE('div', { class: 'card' }, [ CE('h3', { text: 'Best Scores' }) ]);
  const grid = CE('div', { class: 'grid' });
  QuestionBank.forEach(lesson => {
    const best = profile.lessons?.[lesson.id]?.bestScore || 0;
    grid.appendChild(CE('div', { class: 'stat' }, [
      CE('div', { class: 'row' }, [ CE('strong', { text: lesson.title }), CE('div', { class: 'space' }), CE('span', { class: 'badge', text: `${best}/${lesson.questions.length}` }) ])
    ]));
  });
  bestCard.appendChild(grid);
  view.appendChild(bestCard);

  // Achievements
  const achCard = CE('div', { class: 'card' }, [ CE('h3', { text: 'Achievements' }) ]);
  const agr = CE('div', { class: 'grid' });
  ACHIEVEMENTS.forEach(a => {
    const unlocked = !!profile.achievements[a.id];
    agr.appendChild(CE('div', { class: 'stat' }, [
      CE('div', { class: 'row' }, [ CE('strong', { text: a.name }), CE('div', { class: 'space' }), CE('span', { class: 'badge', text: unlocked ? 'Unlocked' : 'Locked' }) ]),
      CE('p', { text: a.desc })
    ]));
  });
  achCard.appendChild(agr);
  view.appendChild(achCard);

  // Leaderboard
  const lbCard = CE('div', { class: 'card' }, [ CE('h3', { text: 'Local Leaderboard' }) ]);
  const list = CE('div', { class: 'grid' });
  (profile.leaderboard || []).slice(0, 10).forEach(row => {
    const title = QuestionBank.find(l=>l.id===row.lessonId)?.title || row.lessonId;
    list.appendChild(CE('div', { class: 'stat' }, [
      CE('div', { text: `${title}` }),
      CE('div', { class: 'row' }, [ CE('span', { class: 'badge', text: new Date(row.ts).toLocaleString() }), CE('div', { class: 'space' }), CE('span', { class: 'badge', text: `${row.correct} correct` }) ])
    ]));
  });
  lbCard.appendChild(list);
  view.appendChild(lbCard);
}

// Settings view
function renderSettings() {
  setActiveTab('settings');
  view.innerHTML = '';

  const card = CE('div', { class: 'card' }, [ CE('h3', { text: 'Settings' }) ]);

  const form = CE('div', { class: 'form' });
  const nameField = CE('div', { class: 'field' }, [ CE('label', { text: 'Display Name' }), CE('input', { type: 'text', value: profile.name }) ]);
  const diffField = CE('div', { class: 'field' }, [ CE('label', { text: 'Difficulty' }), (function(){
    const sel = CE('select');
    ['easy','normal','hard'].forEach(v=> sel.appendChild(CE('option', { value: v, text: v, ...(v===profile.settings.difficulty?{selected:''}:{}) })));
    return sel;
  })() ]);
  const sfxField = CE('div', { class: 'field' }, [ CE('label', { text: 'Sound Effects' }), CE('label', { class: 'switch' }, [ CE('input', { type: 'checkbox', ...(profile.settings.sfxEnabled?{checked:''}:{}) }), CE('span', { text: profile.settings.sfxEnabled? 'On':'Off' }) ]) ]);
  const confField = CE('div', { class: 'field' }, [ CE('label', { text: 'Confetti' }), CE('label', { class: 'switch' }, [ CE('input', { type: 'checkbox', ...(profile.settings.confettiEnabled?{checked:''}:{}) }), CE('span', { text: profile.settings.confettiEnabled? 'On':'Off' }) ]) ]);
  const hapField = CE('div', { class: 'field' }, [ CE('label', { text: 'Haptics (vibration)' }), CE('label', { class: 'switch' }, [ CE('input', { type: 'checkbox', ...(profile.settings.hapticsEnabled?{checked:''}:{}) }), CE('span', { text: profile.settings.hapticsEnabled? 'On':'Off' }) ]) ]);
  const hcField = CE('div', { class: 'field' }, [ CE('label', { text: 'High Contrast' }), CE('label', { class: 'switch' }, [ CE('input', { type: 'checkbox', ...(profile.settings.highContrast?{checked:''}:{}) }), CE('span', { text: profile.settings.highContrast? 'On':'Off' }) ]) ]);
  const ctrlField = CE('div', { class: 'field' }, [ CE('label', { text: 'Control Mode (game)' }), (function(){ const sel=CE('select'); ['touch','joystick'].forEach(v=> sel.appendChild(CE('option', { value: v, text: v, ...(v===profile.settings.controlMode?{selected:''}:{}) }))); return sel; })() ]);

  const exportBtn = CE('button', { class: 'btn', text: 'Export Data' });
  exportBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(profile,null,2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='gamified-lesson-profile.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(url), 500);
  });
  const importBtn = CE('button', { class: 'btn', text: 'Import Data' });
  importBtn.addEventListener('click', () => {
    const input = document.createElement('input'); input.type='file'; input.accept='application/json'; input.onchange = async () => {
      const file = input.files[0]; if (!file) return; try { const text = await file.text(); const data = JSON.parse(text); profile = { ...structuredClone(DEFAULT_PROFILE), ...data }; saveProfile(); toast('Imported'); } catch { toast('Import failed'); }
    }; input.click();
  });

  const row = CE('div', { class: 'row' }, [ CE('button', { class: 'btn primary', text: 'Save', onclick: () => {
    profile.name = nameField.querySelector('input').value.slice(0, 20) || 'Player';
    profile.settings.difficulty = diffField.querySelector('select').value;
    profile.settings.sfxEnabled = sfxField.querySelector('input').checked;
    profile.settings.confettiEnabled = confField.querySelector('input').checked;
    profile.settings.hapticsEnabled = hapField.querySelector('input').checked;
    profile.settings.highContrast = hcField.querySelector('input').checked;
    profile.settings.controlMode = ctrlField.querySelector('select').value;
    document.body.classList.toggle('high-contrast', !!profile.settings.highContrast);
    saveProfile(); toast('Settings saved');
  }}), CE('div', { class: 'space' }), exportBtn, importBtn, CE('div', { class: 'space' }), CE('button', { class: 'btn danger', text: 'Reset Data', onclick: () => {
    if (confirm('Reset all local data?')) { localStorage.clear(); profile = structuredClone(DEFAULT_PROFILE); saveProfile(); renderLessons(); }
  }}) ]);

  form.append(nameField, diffField, sfxField, confField, hapField, hcField, ctrlField, row);
  card.appendChild(form);
  view.appendChild(card);
}

// Apply theme at load
if (profile.settings?.highContrast) document.body.classList.add('high-contrast');
if (profile.boosts?.mapSkin) document.body.dataset.mapSkin = profile.boosts.mapSkin;

// Game Mode
const _origStartGameMode = startGameMode;
startGameMode = function(lesson){
  view.innerHTML = '';
  const wrap = CE('div', { class: 'game-wrap card' });
  const canvas = CE('canvas', { class: 'game-canvas' });
  const hud = CE('div', { class: 'hud-float' });
  const livesEl = CE('div', { class: 'row' });
  let lives = 3;
  for (let i = 0; i < lives; i++) livesEl.appendChild(CE('div', { class: 'heart' }));
  const timerEl = CE('div', { class: 'timer', text: 'Time: 60' });
  hud.append(livesEl, timerEl);
  const pauseBtn = CE('button', { class: 'btn game-pause', text: 'Pause' });
  const boostBadge = CE('div', { class: 'boost-pill', text: '2x XP' });

  const overlay = CE('div', { class: 'game-overlay' });
  const panel = CE('div', { class: 'panel' });
  overlay.appendChild(panel);

  const joystick = CE('div', { class: 'joystick' }, [ CE('div', { class: 'joystick-base' }), CE('div', { class: 'joystick-knob' }) ]);
  const showJoystick = profile.settings.controlMode === 'joystick';

  wrap.append(canvas, hud, pauseBtn, overlay);
  if (showJoystick) wrap.appendChild(joystick);
  if ((profile.boosts?.xpUntil||0) > Date.now()) wrap.appendChild(boostBadge);
  view.appendChild(wrap);

  const ctx = canvas.getContext('2d');
  let width, height, dpi;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpi = window.devicePixelRatio || 1;
    width = Math.floor(rect.width * dpi);
    height = Math.floor(rect.height * dpi);
    canvas.width = width; canvas.height = height;
  }
  resize(); window.addEventListener('resize', resize);

  // Difficulty
  const diff = profile.settings.difficulty || 'normal';
  const DIFF = {
    easy:   { time: 70, enemies: 3, enemySpeed: 90, playerSpeed: 240 },
    normal: { time: 60, enemies: 4, enemySpeed: 115, playerSpeed: 220 },
    hard:   { time: 50, enemies: 5, enemySpeed: 140, playerSpeed: 220 },
  }[diff];

  // Game state
  let timeLeft = DIFF.time;
  let running = true, paused = false;
  let last = performance.now();
  let questionIndex = 0;
  let currentQ = lesson.questions[questionIndex];
  let pickups = []; // answers
  let enemies = []; // mix of bouncers and chasers
  let obstacles = [];
  let powerups = [];
  let scoreCorrect = 0;
  let shieldUntil = 0; let slowUntil = 0;
  const posTrail = [];

  const player = { x: width*0.5, y: height*0.5, r: 14, speed: DIFF.playerSpeed * dpi, vx: 0, vy: 0 };
  const keys = new Set();
  window.addEventListener('keydown', e => { const k = e.key.toLowerCase(); keys.add(k); if (k==='escape'){ togglePause(); }});
  window.addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));

  // Touch / pointer movement toward pointer
  let pointerActive = false, pointer = { x: 0, y: 0 };
  canvas.addEventListener('pointerdown', e => { pointerActive = true; const r = canvas.getBoundingClientRect(); pointer.x = (e.clientX - r.left) * (window.devicePixelRatio||1); pointer.y = (e.clientY - r.top) * (window.devicePixelRatio||1); });
  canvas.addEventListener('pointermove', e => { if (!pointerActive) return; const r = canvas.getBoundingClientRect(); pointer.x = (e.clientX - r.left) * (window.devicePixelRatio||1); pointer.y = (e.clientY - r.top) * (window.devicePixelRatio||1); });
  window.addEventListener('pointerup', ()=> pointerActive = false);

  function togglePause(){ paused = !paused; overlay.style.display = paused? 'grid':'none'; panel.innerHTML = ''; panel.append(
    CE('h3', { text: paused? 'Paused':'Resumed' }),
    CE('div', { class: 'row' }, [
      CE('button', { class: 'btn', text: 'Back to Lessons', onclick: renderLessons }),
      CE('div', { class: 'space' }),
      CE('button', { class: 'btn primary', text: 'Resume', onclick: togglePause })
    ])
  ); }
  pauseBtn.addEventListener('click', togglePause);

  function placeObstacles(n=4){
    obstacles = [];
    for (let i=0;i<n;i++){
      const w = 120*dpi + Math.random()*100*dpi;
      const h = 20*dpi + Math.random()*100*dpi;
      const x = 40*dpi + Math.random()*(width - w - 80*dpi);
      const y = 40*dpi + Math.random()*(height - h - 80*dpi);
      obstacles.push({x,y,w,h});
    }
  }

  function spawnQuestionPickups() {
    pickups = [];
    const spots = [
      { x: width * 0.2, y: height * 0.2 },
      { x: width * 0.8, y: height * 0.2 },
      { x: width * 0.2, y: height * 0.8 },
      { x: width * 0.8, y: height * 0.8 },
    ];
    currentQ.answers.forEach((_, idx) => {
      pickups.push({ x: spots[idx].x, y: spots[idx].y, r: 16, i: idx });
    });
  }

  function spawnEnemies(base = DIFF.enemies) {
    enemies = [];
    for (let i = 0; i < base; i++) {
      const chaser = Math.random() < 0.35;
      enemies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 12,
        vx: (Math.random() * 2 - 1) * DIFF.enemySpeed * dpi,
        vy: (Math.random() * 2 - 1) * DIFF.enemySpeed * dpi,
        chaser,
      });
    }
  }

  function spawnPowerup(){
    const types = ['shield','slow','time','coins'];
    const type = types[(Math.random()*types.length)|0];
    powerups.push({ type, x: 30*dpi + Math.random()*(width-60*dpi), y: 30*dpi + Math.random()*(height-60*dpi), r: 12 });
  }

  function resetLevel(){
    currentQ = lesson.questions[questionIndex];
    player.x = width*0.5; player.y = height*0.5; player.vx=player.vy=0;
    placeObstacles(4);
    spawnQuestionPickups();
    spawnEnemies(DIFF.enemies + Math.min(questionIndex, 3));
    powerups = [];
  }

  function circleHit(a, b){ const dx=a.x-b.x, dy=a.y-b.y; const rr=a.r+b.r; return dx*dx+dy*dy <= rr*rr; }
  function rectHitCircle(rect, c){
    const cx = Math.max(rect.x, Math.min(c.x, rect.x+rect.w));
    const cy = Math.max(rect.y, Math.min(c.y, rect.y+rect.h));
    const dx = c.x - cx, dy = c.y - cy; return dx*dx + dy*dy <= c.r*c.r;
  }

  let powerupTimer = 0;
  function update(dt){
    if (!running || paused) return;
    timeLeft -= dt;
    if (timeLeft <= 0){ timeLeft=0; running=false; return endGame('Time up!'); }
    timerEl.textContent = 'Time: ' + Math.ceil(timeLeft);

    // Input selection
    let ax=0, ay=0;
    const up = keys.has('w')||keys.has('arrowup');
    const down = keys.has('s')||keys.has('arrowdown');
    const left = keys.has('a')||keys.has('arrowleft');
    const right = keys.has('d')||keys.has('arrowright');
    if (showJoystick && (joyActive || true)) { ax = joyDX; ay = joyDY; }
    else if (up||down||left||right){ ax = (right?1:0)-(left?1:0); ay = (down?1:0)-(up?1:0); const len=Math.hypot(ax,ay)||1; ax/=len; ay/=len; }
    else if (pointerActive){ const dx=pointer.x-player.x, dy=pointer.y-player.y; const len=Math.hypot(dx,dy)||1; ax=dx/len; ay=dy/len; }

    // Combo speed buff
    const speedBuff = (update._speedUntil||0) > performance.now() ? 1.2 : 1;
    const speed = player.speed * (slowUntil>performance.now()?0.6:1) * speedBuff;
    player.vx = ax*speed; player.vy=ay*speed;

    // Move with obstacle collision (simple push out)
    player.x += player.vx*dt; player.y += player.vy*dt;
    player.x = Math.max(player.r, Math.min(width-player.r, player.x));
    player.y = Math.max(player.r, Math.min(height-player.r, player.y));
    obstacles.forEach(o=>{ if (rectHitCircle(o, player)){ // push out along smallest axis
      const leftPen = Math.abs(player.x - o.x) + player.r;
      const rightPen = Math.abs((o.x+o.w) - player.x) + player.r;
      const topPen = Math.abs(player.y - o.y) + player.r;
      const botPen = Math.abs((o.y+o.h) - player.y) + player.r;
      const minPen = Math.min(leftPen,rightPen,topPen,botPen);
      if (minPen===leftPen) player.x = o.x - player.r; else if (minPen===rightPen) player.x = o.x+o.w + player.r; else if (minPen===topPen) player.y = o.y - player.r; else player.y = o.y+o.h + player.r;
    }});

    // Enemies
    enemies.forEach(e=>{
      if (e.chaser){ const dx = player.x-e.x, dy=player.y-e.y; const len=Math.hypot(dx,dy)||1; const s=DIFF.enemySpeed*dpi*0.9; e.vx = dx/len*s; e.vy = dy/len*s; }
      e.x += e.vx*dt; e.y += e.vy*dt;
      if (e.x<e.r||e.x>width-e.r) e.vx*=-1; if (e.y<e.r||e.y>height-e.r) e.vy*=-1;
      obstacles.forEach(o=>{ if (rectHitCircle(o, e)){ e.vx*=-1; e.vy*=-1; }});
      if (circleHit(player, e)) damage();
    });

    // Powerups spawn
    powerupTimer += dt; if (powerupTimer > 7){ powerupTimer = 0; if (powerups.length<3) spawnPowerup(); }

    // Pickups
    for (let i=pickups.length-1;i>=0;i--){ if (circleHit(player, pickups[i])){ const correct = pickups[i].i===currentQ.correctIndex; pickups.splice(i,1); handleAnswer(correct); break; }}

    // Powerups collect
    for (let i=powerups.length-1;i>=0;i--){ if (circleHit(player, powerups[i])){
      const p = powerups.splice(i,1)[0];
      if (p.type==='shield'){ shieldUntil = performance.now()+4000; toast('Shield!'); }
      if (p.type==='slow'){ slowUntil = performance.now()+4000; toast('Slow-mo!'); }
      if (p.type==='time'){ timeLeft += 8; toast('+Time'); }
      if (p.type==='coins'){ addCoins(20); toast('+20 coins'); }
    }}

    // Trail
    if (profile.owned['trail_neon']){
      posTrail.push({ x: player.x, y: player.y, t: performance.now() });
      while (posTrail.length>60) posTrail.shift();
    }
  }

  function damage(){
    if (performance.now() < shieldUntil) return;
    if (damage._inv) return; damage._inv=true; setTimeout(()=>damage._inv=false, 800);
    lives = Math.max(0, lives-1);
    while (livesEl.firstChild) livesEl.removeChild(livesEl.firstChild);
    for (let i=0;i<lives;i++) livesEl.appendChild(CE('div', { class: 'heart' }));
    if (lives<=0){ running=false; endGame('Out of lives!'); }
  }

  function handleAnswer(isCorrect){
    playBeep(isCorrect);
    awardForAnswer(isCorrect);
    if (isCorrect){
      scoreCorrect += 1;
      if (questionIndex === lesson.questions.length-1){
        awardForLessonCompletion();
        profile.lessons[lesson.id] = profile.lessons[lesson.id] || { bestScore: 0 };
        profile.lessons[lesson.id].bestScore = Math.max(profile.lessons[lesson.id].bestScore, scoreCorrect);
        saveProfile();
        if (profile.owned['confetti'] || profile.settings.confettiEnabled) confettiBurst();
        unlockAchievement('first_win');
        if (scoreCorrect === lesson.questions.length) unlockAchievement('perfect_10');
        running=false; endGame('Lesson complete!');
      } else { questionIndex += 1; resetLevel(); }
    } else { damage(); toast('Wrong answer'); }
  }

  function render(){
    ctx.clearRect(0,0,width,height);

    // Background grid
    ctx.save(); ctx.globalAlpha=.2; ctx.strokeStyle='rgba(255,255,255,.05)'; const step=40*dpi;
    for (let x=0;x<width;x+=step){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,height); ctx.stroke(); }
    for (let y=0;y<height;y+=step){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(width,y); ctx.stroke(); }
    ctx.restore();

    // Obstacles
    obstacles.forEach(o=>{ ctx.fillStyle='rgba(255,255,255,.06)'; ctx.fillRect(o.x,o.y,o.w,o.h); ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.strokeRect(o.x,o.y,o.w,o.h); });

    // Trail
    if (profile.owned['trail_neon']){
      ctx.save(); ctx.globalAlpha = .6; ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#00f5d4';
      for (let i=0;i<posTrail.length;i+=3){ const p=posTrail[i]; ctx.beginPath(); ctx.arc(p.x,p.y,6,0,Math.PI*2); ctx.fill(); }
      ctx.restore();
    }

    // Player
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#7c5cff';
    ctx.beginPath(); ctx.arc(player.x, player.y, player.r, 0, Math.PI*2); ctx.fill();
    if (performance.now() < shieldUntil){ ctx.strokeStyle = '#1dd1a1'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(player.x, player.y, player.r+4, 0, Math.PI*2); ctx.stroke(); }

    // Enemies
    enemies.forEach(e=>{ ctx.fillStyle='rgba(255,107,107,.9)'; ctx.beginPath(); ctx.arc(e.x,e.y,e.r,0,Math.PI*2); ctx.fill(); });

    // Pickups
    ctx.font = `${14*dpi}px Inter, system-ui`; ctx.textAlign='center'; ctx.textBaseline='middle';
    pickups.forEach(p=>{ ctx.fillStyle='rgba(0,0,0,.35)'; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='rgba(255,255,255,.15)'; ctx.lineWidth=2; ctx.stroke();
      const t = currentQ.answers[p.i]; const txt = t.length>12? t.slice(0,12)+'…': t; ctx.fillStyle='white'; ctx.fillText(txt,p.x,p.y);
    });

    // Powerups
    powerups.forEach(p=>{ ctx.fillStyle = ({shield:'#1dd1a1',slow:'#74b9ff',time:'#ffeaa7',coins:'#ffd166'})[p.type]; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); });
  }

  function loop(now){
    const dt = Math.max(0, Math.min(0.033, (now - last)/1000)); last = now;
    update(dt); render();
    if (running) requestAnimationFrame(loop);
  }

  function endGame(message){
    overlay.innerHTML='';
    profile.leaderboard.unshift({ ts: Date.now(), lessonId: lesson.id, correct: scoreCorrect });
    profile.leaderboard = profile.leaderboard.slice(0, 20);
    saveProfile();
    const btns = CE('div', { class: 'row' }, [
      CE('button', { class: 'btn', text: 'Back to Lessons', onclick: renderLessons }),
      CE('div', { class: 'space' }),
      CE('button', { class: 'btn primary', text: 'Play Again', onclick: () => startGameMode(lesson) }),
    ]);
    panel.innerHTML=''; panel.append(CE('h3', { text: message }), CE('p', { text: `Correct: ${scoreCorrect}/${lesson.questions.length}` }), btns);
    overlay.style.display='grid';
  }

  // init
  overlay.style.display='none';
  resetLevel();
  requestAnimationFrame(t=>{ last=t; loop(t); });
  // Daily achievement check
  if ((profile.daily.streak||0) >= 3) unlockAchievement('streak_3');
};

// Initial theme if owned
(function initTheme() {
  if (profile.owned['theme_neon']) document.documentElement.style.setProperty('--accent', '#00f5d4');
  if (profile.owned['theme_sunset']) document.documentElement.style.setProperty('--accent', '#ff8fab');
})();

// Tab handlers
EL('#tab-lessons').addEventListener('click', renderLessons);
EL('#tab-shop').addEventListener('click', renderShop);
EL('#tab-daily').addEventListener('click', renderDaily);
EL('#tab-stats').addEventListener('click', renderStats);
EL('#tab-settings').addEventListener('click', renderSettings);

// Initial view
renderLessons();