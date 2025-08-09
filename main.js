/* CS Servicing Simulator - main.js */

const AppState = {
  route: 'home',
  teacherMode: false,
  scores: JSON.parse(localStorage.getItem('csserv-scores') || '{}'),
  saveScores() { localStorage.setItem('csserv-scores', JSON.stringify(this.scores)); },
};

const Data = {
  labComponents: [
    { id: 'mb-am4', name: 'Motherboard (AM4)', type: 'motherboard', socket: 'AM4', power: 65, tags: ['ATX'] },
    { id: 'cpu-ryzen5', name: 'CPU (Ryzen 5, AM4)', type: 'cpu', socket: 'AM4', power: 65, tags: ['6-core'] },
    { id: 'ram-8gb', name: 'RAM 8GB DDR4', type: 'ram', gen: 'DDR4', size: 8, tags: ['3200MHz'] },
    { id: 'ram-8gb-2', name: 'RAM 8GB DDR4', type: 'ram', gen: 'DDR4', size: 8, tags: ['3200MHz'] },
    { id: 'gpu-gtx1660', name: 'GPU (GTX 1660)', type: 'gpu', slot: 'PCIe x16', power: 120 },
    { id: 'ssd-500', name: 'SSD 500GB (SATA)', type: 'storage', iface: 'SATA' },
    { id: 'psu-500', name: 'PSU 500W 80+', type: 'psu', watt: 500 },
  ],
  troubleScenarios: [
    {
      id: 'no-power', name: 'PC does not power on',
      steps: [
        { id: 'start', prompt: 'PC has no lights or fans. First step?', options: [
          { label: 'Check power cable and switch on PSU', next: 'psu-switch', good: true },
          { label: 'Replace motherboard', next: 'end-bad', good: false },
          { label: 'Reinstall Windows', next: 'end-bad', good: false },
        ]},
        { id: 'psu-switch', prompt: 'PSU switch was off. After turning it on, still no power. Next?', options: [
          { label: 'Test with known-good power outlet', next: 'outlet', good: true },
          { label: 'Add more RAM', next: 'end-bad', good: false },
        ]},
        { id: 'outlet', prompt: 'Outlet is fine. Next?', options: [
          { label: 'Short PWR_SW pins on motherboard', next: 'pwr_sw', good: true },
          { label: 'Replace GPU', next: 'end-bad', good: false },
        ]},
        { id: 'pwr_sw', prompt: 'Fans spin briefly then stop. Next?', options: [
          { label: 'Check 24-pin and 8-pin power connectors', next: 'connectors', good: true },
          { label: 'Format the SSD', next: 'end-bad', good: false },
        ]},
        { id: 'connectors', prompt: '8-pin CPU cable was loose. After reconnecting, system powers on. Outcome?', options: [
          { label: 'Issue resolved', next: 'end-good', good: true },
          { label: 'RMA CPU', next: 'end-bad', good: false },
        ]},
      ]
    },
    {
      id: 'no-display', name: 'PC powers on but no display',
      steps: [
        { id: 'start', prompt: 'No video output. First step?', options: [
          { label: 'Check monitor input and cable', next: 'cable', good: true },
          { label: 'Install Windows display driver', next: 'end-bad', good: false },
        ]},
        { id: 'cable', prompt: 'Cable OK. Next?', options: [
          { label: 'Reseat GPU and check power leads', next: 'gpu', good: true },
          { label: 'Replace PSU', next: 'end-bad', good: false },
        ]},
        { id: 'gpu', prompt: 'GPU was not fully seated. After reseating, display works. Outcome?', options: [
          { label: 'Issue resolved', next: 'end-good', good: true },
          { label: 'Replace motherboard', next: 'end-bad', good: false },
        ]},
      ]
    },
    {
      id: 'overheat', name: 'System overheating and shutting down',
      steps: [
        { id: 'start', prompt: 'High temps. First step?', options: [
          { label: 'Check CPU cooler mounting and paste', next: 'cooler', good: true },
          { label: 'Replace SSD', next: 'end-bad', good: false },
        ]},
        { id: 'cooler', prompt: 'Cooler loose and dried paste. After remount with fresh paste, temps normal. Outcome?', options: [
          { label: 'Issue resolved', next: 'end-good', good: true },
          { label: 'Change GPU brand', next: 'end-bad', good: false },
        ]},
      ]
    },
  ],
  osSteps: [
    { id: 'bios', title: 'BIOS Setup', type: 'radio', prompt: 'Set correct boot order to install OS from USB.', options: [
      { id: 'usb-first', label: 'USB > SSD > Network', correct: true },
      { id: 'ssd-first', label: 'SSD > USB > Network', correct: false },
      { id: 'net-first', label: 'Network > USB > SSD', correct: false },
    ]},
    { id: 'disk', title: 'Disk Partitioning', type: 'radio', prompt: 'Choose partition style and filesystem.', options: [
      { id: 'gpt-ntfs', label: 'GPT + NTFS', correct: true },
      { id: 'mbr-fat32', label: 'MBR + FAT32', correct: false },
      { id: 'gpt-ext4', label: 'GPT + ext4', correct: false },
    ]},
    { id: 'user', title: 'Create User', type: 'form', prompt: 'Create the first local user account.', fields: [
      { id: 'username', label: 'Username', type: 'text', required: true },
      { id: 'password', label: 'Password', type: 'password', required: true },
    ], validator: (vals) => vals.username?.length >= 3 && vals.password?.length >= 4 },
    { id: 'finish', title: 'First Boot', type: 'info', prompt: 'Installation summary. Click Next to complete.' },
  ],
  networking: {
    t568bOrder: [
      '1: White-Orange', '2: Orange', '3: White-Green', '4: Blue',
      '5: White-Blue', '6: Green', '7: White-Brown', '8: Brown'
    ],
  },
  safety: {
    tools: {
      prompt: 'Select all that apply:',
      options: [
        { id: 'philips', label: 'Phillips screwdriver', correct: true },
        { id: 'flat', label: 'Flat-head screwdriver', correct: false },
        { id: 'esd-strap', label: 'Anti-static wrist strap', correct: true },
        { id: 'hammer', label: 'Hammer', correct: false },
        { id: 'sata-cable', label: 'SATA data cable', correct: true },
        { id: 'gloves', label: 'Insulated gloves (optional)', correct: false },
        { id: 'zip-ties', label: 'Zip ties', correct: true },
      ]
    },
    ppe: {
      prompt: 'Select appropriate PPE for PC assembly:',
      options: [
        { id: 'safety-glasses', label: 'Safety glasses', correct: true },
        { id: 'steel-toe', label: 'Steel-toe boots', correct: false },
        { id: 'antistatic-mat', label: 'Anti-static mat', correct: true },
        { id: 'earmuffs', label: 'Hearing protection', correct: false },
      ]
    },
    multimeter: {
      prompt: 'Best setting to measure 12V on a Molex connector?',
      options: [
        { id: 'vdc-20', label: 'VDC 20', correct: true },
        { id: 'vac-200', label: 'VAC 200', correct: false },
        { id: 'continuity', label: 'Continuity', correct: false },
        { id: 'ohms-2k', label: 'Ohms 2k', correct: false },
      ]
    }
  },
  quiz: [
    { q: 'Which component stores the operating system and files?', options: ['CPU', 'RAM', 'GPU', 'Storage drive'], answer: 3 },
    { q: 'Before touching components, you should...', options: ['Wear an ESD strap', 'Heat the CPU', 'Shake the PSU', 'Crack the GPU'], answer: 0 },
    { q: 'What does RAM stand for?', options: ['Readily Available Memory', 'Random Access Memory', 'Rapid Action Module', 'Runtime Allocation Memory'], answer: 1 },
    { q: 'Which cable connects storage to motherboard (SATA SSD)?', options: ['PCIe power', 'SATA data', 'HDMI', 'VGA'], answer: 1 },
    { q: 'Default gateway is used to...', options: ['Access local files', 'Connect to devices outside local network', 'Install drivers', 'Power the CPU'], answer: 1 },
  ],
};

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.hidden = false;
  toast.style.borderColor = type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--border)';
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.hidden = true; }, 2200);
}

function setRoute(route) {
  AppState.route = route;
  document.querySelectorAll('.nav-link').forEach(btn => btn.classList.toggle('active', btn.dataset.route === route));
  document.querySelectorAll('main .view').forEach(v => v.classList.toggle('active', v.dataset.view === route));
  window.location.hash = route;
  document.getElementById('app').focus({ preventScroll: true });
}

function initRouter() {
  document.querySelectorAll('[data-route]').forEach(el => {
    el.addEventListener('click', () => setRoute(el.dataset.route));
  });
  const initial = window.location.hash.replace('#', '') || 'home';
  setRoute(initial);
}

function initHeader() {
  document.getElementById('year').textContent = new Date().getFullYear();
  const teacherToggle = document.getElementById('teacherModeToggle');
  teacherToggle.checked = !!JSON.parse(localStorage.getItem('csserv-teacher') || 'false');
  AppState.teacherMode = teacherToggle.checked;
  teacherToggle.addEventListener('change', () => {
    AppState.teacherMode = teacherToggle.checked;
    localStorage.setItem('csserv-teacher', JSON.stringify(AppState.teacherMode));
    showToast(AppState.teacherMode ? 'Teacher mode ON' : 'Teacher mode OFF');
    renderTeacherMode();
  });
  document.getElementById('exportProgressBtn').addEventListener('click', exportProgress);
  document.getElementById('resetProgressBtn').addEventListener('click', () => {
    if (!confirm('Reset all progress?')) return;
    AppState.scores = {};
    AppState.saveScores();
    localStorage.removeItem('csserv-lab');
    showToast('Progress cleared', 'success');
    updateAllScores();
  });
}

function updateScore(key, deltaOrValue, absolute = false) {
  const old = AppState.scores[key] || 0;
  AppState.scores[key] = absolute ? deltaOrValue : Math.max(0, old + deltaOrValue);
  AppState.saveScores();
  updateAllScores();
}

function updateAllScores() {
  const lab = AppState.scores['lab'] || 0;
  document.getElementById('labScore').textContent = `Score: ${lab}`;
  const tr = AppState.scores['troubleshoot'] || 0;
  document.getElementById('troubleScore').textContent = `Score: ${tr}`;
  const os = AppState.scores['os'] || 0;
  document.getElementById('osScore').textContent = `Score: ${os}`;
  const net = AppState.scores['network'] || 0;
  document.getElementById('netScore').textContent = `Score: ${net}`;
  const sf = AppState.scores['safety'] || 0;
  document.getElementById('safetyScore').textContent = `Score: ${sf}`;
  const quiz = AppState.scores['quiz'] || 0;
  document.getElementById('quizScore').textContent = `Score: ${quiz}`;
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ scores: AppState.scores, date: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'csserv-progress.json'; a.click();
  URL.revokeObjectURL(url);
}

/* Virtual Lab */
function initLab() {
  const palette = document.getElementById('labPalette');
  const caseEl = document.getElementById('labCase');

  function renderPalette() {
    palette.innerHTML = '';
    Data.labComponents.forEach(comp => {
      const pill = document.createElement('div');
      pill.className = 'component-pill';
      pill.draggable = true;
      pill.dataset.compId = comp.id;
      pill.innerHTML = `<span>${comp.name}</span> ${comp.tags ? comp.tags.map(t => `<span class="tag">${t}</span>`).join('') : ''}`;
      pill.addEventListener('dragstart', e => {
        pill.classList.add('dragging');
        e.dataTransfer.setData('text/plain', comp.id);
      });
      pill.addEventListener('dragend', () => pill.classList.remove('dragging'));
      palette.appendChild(pill);
    });
  }

  const slots = Array.from(caseEl.querySelectorAll('.case-slot'));
  const placed = JSON.parse(localStorage.getItem('csserv-lab') || '{}');
  if (Object.keys(placed).length) {
    Object.entries(placed).forEach(([slot, compId]) => placeComponent(slot, compId));
  }

  function allowDrop(ev) { ev.preventDefault(); }

  function placeComponent(slotName, compId) {
    const slotEl = slots.find(s => s.dataset.slot === slotName);
    const comp = Data.labComponents.find(c => c.id === compId);
    if (!slotEl || !comp) return false;
    if (!validatePlacement(slotName, comp)) return false;
    slotEl.textContent = comp.name;
    slotEl.classList.add('filled');
    slotEl.dataset.compId = comp.id;
    placed[slotName] = comp.id;
    localStorage.setItem('csserv-lab', JSON.stringify(placed));
    return true;
  }

  function validatePlacement(slotName, comp) {
    if (slotName === 'motherboard') return comp.type === 'motherboard';
    if (slotName === 'cpu') {
      const mbId = placed['motherboard'];
      const mb = Data.labComponents.find(c => c.id === mbId);
      return comp.type === 'cpu' && mb && mb.socket === comp.socket;
    }
    if (slotName === 'ram1' || slotName === 'ram2') return comp.type === 'ram';
    if (slotName === 'gpu') return comp.type === 'gpu';
    if (slotName === 'storage') return comp.type === 'storage';
    if (slotName === 'psu') return comp.type === 'psu';
    return false;
  }

  function attachSlotDnD() {
    slots.forEach(slot => {
      slot.addEventListener('dragover', allowDrop);
      slot.addEventListener('drop', e => {
        e.preventDefault();
        const compId = e.dataTransfer.getData('text/plain');
        if (placeComponent(slot.dataset.slot, compId)) {
          showToast('Placed!', 'success');
        } else {
          showToast('Incompatible placement', 'error');
        }
      });
    });
  }

  function computeLabScore() {
    let score = 0;
    // correctness points
    if (placed['motherboard']) score += 10;
    if (placed['cpu']) score += 10;
    if (placed['ram1']) score += 5;
    if (placed['ram2']) score += 5;
    if (placed['gpu']) score += 5;
    if (placed['storage']) score += 5;
    if (placed['psu']) score += 10;
    // compatibility bonus
    const mb = Data.labComponents.find(c => c.id === placed['motherboard']);
    const cpu = Data.labComponents.find(c => c.id === placed['cpu']);
    if (mb && cpu && mb.socket === cpu.socket) score += 10;
    // power headroom check
    const psu = Data.labComponents.find(c => c.id === placed['psu']);
    const totalTdp = [mb, cpu, Data.labComponents.find(c => c.id === placed['gpu'])]
      .filter(Boolean)
      .reduce((sum, c) => sum + (c.power || 0), 0);
    if (psu && psu.watt >= totalTdp * 1.5) score += 10;
    return score;
  }

  function checkBuild() {
    const score = computeLabScore();
    updateScore('lab', score, true);
    showToast(`Build score: ${score}/70`, score >= 50 ? 'success' : 'info');
  }

  document.getElementById('labCheckBtn').addEventListener('click', checkBuild);
  document.getElementById('labClearBtn').addEventListener('click', () => {
    Object.keys(placed).forEach(k => delete placed[k]);
    localStorage.setItem('csserv-lab', JSON.stringify(placed));
    slots.forEach(s => { s.textContent = s.dataset.slot.toUpperCase(); s.classList.remove('filled'); delete s.dataset.compId; });
    renderPalette();
    showToast('Cleared');
  });

  renderPalette();
  attachSlotDnD();
}

/* Troubleshooting */
function initTroubleshooting() {
  const select = document.getElementById('troubleScenarioSelect');
  const container = document.getElementById('troubleContainer');

  Data.troubleScenarios.forEach(sc => {
    const opt = document.createElement('option');
    opt.value = sc.id; opt.textContent = sc.name; select.appendChild(opt);
  });

  let currentScenario = Data.troubleScenarios[0];
  let currentStepId = 'start';
  let goodChoices = 0; let totalChoices = 0;

  function render() {
    container.innerHTML = '';
    const step = currentScenario.steps.find(s => s.id === currentStepId);
    if (!step) { container.textContent = 'Scenario ended.'; return; }

    const prompt = document.createElement('div');
    prompt.className = 'prompt';
    prompt.textContent = step.prompt;

    const options = document.createElement('div');
    options.className = 'options';

    step.options.forEach(o => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = o.label;
      btn.addEventListener('click', () => {
        totalChoices += 1;
        if (o.good) goodChoices += 1;
        if (o.next === 'end-good') {
          updateScore('troubleshoot', 10, false);
          showLog('Resolved correctly.');
          showToast('Scenario resolved!', 'success');
        } else if (o.next === 'end-bad') {
          updateScore('troubleshoot', -2, false);
          showLog('Incorrect action. Try again or restart.');
          showToast('Not ideal. Review steps.', 'error');
        }
        if (o.next.startsWith('end')) return;
        currentStepId = o.next; render();
      });
      options.appendChild(btn);
    });

    const log = document.createElement('div');
    log.className = 'log'; log.id = 'troubleLog';

    container.appendChild(prompt);
    container.appendChild(options);
    container.appendChild(log);
  }

  function showLog(text) {
    const log = document.getElementById('troubleLog');
    if (!log) return;
    const p = document.createElement('p'); p.textContent = text; log.appendChild(p);
  }

  select.addEventListener('change', () => {
    currentScenario = Data.troubleScenarios.find(s => s.id === select.value);
    currentStepId = 'start'; goodChoices = 0; totalChoices = 0; render();
  });
  document.getElementById('troubleRestartBtn').addEventListener('click', () => {
    currentStepId = 'start'; goodChoices = 0; totalChoices = 0; render(); showToast('Scenario restarted');
  });

  render();
}

/* OS Install */
function initOSInstall() {
  const screen = document.getElementById('osScreen');
  const prevBtn = document.getElementById('osPrevBtn');
  const nextBtn = document.getElementById('osNextBtn');

  let stepIndex = 0;
  const answers = {};

  function render() {
    const step = Data.osSteps[stepIndex];
    screen.innerHTML = '';

    const h = document.createElement('h3'); h.className = 'step-title'; h.textContent = step.title; screen.appendChild(h);
    const p = document.createElement('p'); p.textContent = step.prompt; screen.appendChild(p);

    if (step.type === 'radio') {
      const form = document.createElement('div');
      form.className = 'os-form';
      step.options.forEach(opt => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="radio" name="${step.id}" value="${opt.id}"> ${opt.label}`;
        form.appendChild(label);
      });
      screen.appendChild(form);
    } else if (step.type === 'form') {
      const form = document.createElement('div');
      form.className = 'os-form';
      step.fields.forEach(f => {
        const label = document.createElement('label');
        label.textContent = f.label;
        const input = document.createElement('input'); input.type = f.type; input.id = f.id; input.required = f.required;
        label.appendChild(input); form.appendChild(label);
      });
      screen.appendChild(form);
    } else if (step.type === 'info') {
      const div = document.createElement('div');
      div.innerHTML = '<em>Review your settings and click Next to complete installation.</em>';
      screen.appendChild(div);
    }

    prevBtn.disabled = stepIndex === 0;
    nextBtn.textContent = stepIndex === Data.osSteps.length - 1 ? 'Finish' : 'Next';
  }

  function validateAndSave() {
    const step = Data.osSteps[stepIndex];
    if (step.type === 'radio') {
      const checked = screen.querySelector(`input[name="${step.id}"]:checked`);
      if (!checked) { showToast('Select an option'); return false; }
      const opt = step.options.find(o => o.id === checked.value);
      answers[step.id] = checked.value;
      if (opt.correct) updateScore('os', 5, false); else updateScore('os', -2, false);
      return true;
    }
    if (step.type === 'form') {
      const vals = {};
      step.fields.forEach(f => { vals[f.id] = screen.querySelector(`#${f.id}`).value.trim(); });
      if (!step.validator(vals)) { showToast('Complete all fields properly'); return false; }
      answers[step.id] = vals; updateScore('os', 5, false); return true;
    }
    if (step.type === 'info') { updateScore('os', 5, false); return true; }
    return true;
  }

  prevBtn.addEventListener('click', () => { if (stepIndex > 0) { stepIndex -= 1; render(); } });
  nextBtn.addEventListener('click', () => {
    if (!validateAndSave()) return;
    if (stepIndex < Data.osSteps.length - 1) { stepIndex += 1; render(); }
    else { showToast('Installation complete!', 'success'); setRoute('home'); }
  });

  render();
}

/* Networking */
function initNetworking() {
  const list = document.getElementById('t568bList');
  const checkBtn = document.getElementById('t568bCheckBtn');
  const netResetBtn = document.getElementById('netResetBtn');
  const ipInputs = ['pc1Ip', 'pc1Mask', 'pc2Ip', 'pc2Mask'].map(id => document.getElementById(id));
  const ipFeedback = document.getElementById('ipFeedback');

  function seedList() {
    list.innerHTML = '';
    const shuffled = [...Data.networking.t568bOrder].sort(() => Math.random() - .5);
    shuffled.forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      li.draggable = true;
      li.addEventListener('dragstart', () => li.classList.add('dragging'));
      li.addEventListener('dragend', () => li.classList.remove('dragging'));
      list.appendChild(li);
    });
  }

  list.addEventListener('dragover', e => {
    e.preventDefault();
    const dragging = list.querySelector('.dragging');
    const after = Array.from(list.querySelectorAll('li:not(.dragging)')).find(li => {
      const rect = li.getBoundingClientRect();
      return e.clientY < rect.top + rect.height / 2;
    });
    if (!dragging) return;
    if (after) list.insertBefore(dragging, after); else list.appendChild(dragging);
  });

  checkBtn.addEventListener('click', () => {
    const current = Array.from(list.querySelectorAll('li')).map(li => li.textContent.trim());
    const correct = Data.networking.t568bOrder;
    const ok = current.every((t, i) => t === correct[i]);
    if (ok) { updateScore('network', 10, false); showToast('Correct T568B order!', 'success'); }
    else { updateScore('network', -2, false); showToast('Order incorrect. Try again.', 'error'); }
  });

  function parseIp(ip) {
    const m = ip.match(/^\s*(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\s*$/);
    if (!m) return null;
    const nums = m.slice(1).map(n => parseInt(n, 10));
    if (nums.some(n => n < 0 || n > 255)) return null;
    return nums;
  }
  function maskToBits(mask) {
    const ip = parseIp(mask); if (!ip) return null;
    const bin = ip.map(n => n.toString(2).padStart(8, '0')).join('');
    if (!/^1*0*$/.test(bin)) return null; // contiguous ones
    return bin.replace(/0/g, '').length;
  }
  function networkId(ip, bits) {
    const ipn = parseIp(ip); if (!ipn) return null;
    const bin = ipn.map(n => n.toString(2).padStart(8, '0')).join('');
    const netBin = bin.slice(0, bits).padEnd(32, '0');
    const parts = netBin.match(/.{8}/g).map(b => parseInt(b, 2));
    return parts.join('.');
  }

  document.getElementById('ipCheckBtn').addEventListener('click', () => {
    const [ip1, m1, ip2, m2] = ipInputs.map(i => i.value.trim());
    const b1 = maskToBits(m1); const b2 = maskToBits(m2);
    if (b1 == null || b2 == null) { ipFeedback.textContent = 'Invalid subnet mask(s).'; updateScore('network', -1, false); return; }
    const n1 = networkId(ip1, b1); const n2 = networkId(ip2, b2);
    if (!n1 || !n2) { ipFeedback.textContent = 'Invalid IP address(es).'; updateScore('network', -1, false); return; }
    if (b1 !== b2) { ipFeedback.textContent = 'Masks must match to be in same subnet.'; updateScore('network', -1, false); return; }
    if (n1 === n2) { ipFeedback.textContent = 'Valid: Same subnet.'; updateScore('network', 5, false); showToast('IP setup valid', 'success'); }
    else { ipFeedback.textContent = `Different subnets: ${n1} vs ${n2}`; updateScore('network', -2, false); }
  });

  netResetBtn.addEventListener('click', () => { seedList(); ipInputs.forEach(i => i.value = ''); ipFeedback.textContent = ''; showToast('Networking reset'); });

  seedList();
}

/* Safety */
function initSafety() {
  // Tools checklist
  const toolsDiv = document.getElementById('toolsChecklist');
  Data.safety.tools.options.forEach(opt => {
    const label = document.createElement('label');
    const input = document.createElement('input'); input.type = 'checkbox'; input.value = opt.id; label.appendChild(input);
    label.append(` ${opt.label}`); toolsDiv.appendChild(label);
  });
  document.getElementById('toolsCheckBtn').addEventListener('click', () => {
    const chosen = Array.from(toolsDiv.querySelectorAll('input:checked')).map(i => i.value);
    const correctIds = Data.safety.tools.options.filter(o => o.correct).map(o => o.id).sort();
    const ok = JSON.stringify(chosen.sort()) === JSON.stringify(correctIds);
    document.getElementById('toolsFeedback').textContent = ok ? 'Correct selection.' : 'Not quite. Select only the required tools.';
    updateScore('safety', ok ? 5 : -2, false);
    if (ok) showToast('Correct tools!', 'success');
  });

  // PPE checklist
  const ppeDiv = document.getElementById('ppeChecklist');
  Data.safety.ppe.options.forEach(opt => {
    const label = document.createElement('label');
    const input = document.createElement('input'); input.type = 'checkbox'; input.value = opt.id; label.appendChild(input);
    label.append(` ${opt.label}`); ppeDiv.appendChild(label);
  });
  document.getElementById('ppeCheckBtn').addEventListener('click', () => {
    const chosen = Array.from(ppeDiv.querySelectorAll('input:checked')).map(i => i.value);
    const correctIds = Data.safety.ppe.options.filter(o => o.correct).map(o => o.id).sort();
    const ok = JSON.stringify(chosen.sort()) === JSON.stringify(correctIds);
    document.getElementById('ppeFeedback').textContent = ok ? 'Correct PPE.' : 'Review ESD and PPE best practices.';
    updateScore('safety', ok ? 5 : -2, false);
    if (ok) showToast('ESD safe!', 'success');
  });

  // Multimeter options
  const multiDiv = document.getElementById('multiOptions');
  Data.safety.multimeter.options.forEach(opt => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="radio" name="multimeter" value="${opt.id}"> ${opt.label}`;
    multiDiv.appendChild(label);
  });
  document.getElementById('multiCheckBtn').addEventListener('click', () => {
    const checked = multiDiv.querySelector('input[name="multimeter"]:checked');
    if (!checked) { showToast('Select an option'); return; }
    const picked = Data.safety.multimeter.options.find(o => o.id === checked.value);
    const ok = !!picked?.correct;
    document.getElementById('multiFeedback').textContent = ok ? 'Correct: Use VDC 20 for 12V.' : 'Incorrect: Use DC voltage range, not AC/continuity.';
    updateScore('safety', ok ? 5 : -2, false);
    if (ok) showToast('Correct setting!', 'success');
  });

  document.getElementById('safetyResetBtn').addEventListener('click', () => {
    toolsDiv.querySelectorAll('input').forEach(i => i.checked = false);
    ppeDiv.querySelectorAll('input').forEach(i => i.checked = false);
    multiDiv.querySelectorAll('input').forEach(i => i.checked = false);
    document.getElementById('toolsFeedback').textContent = '';
    document.getElementById('ppeFeedback').textContent = '';
    document.getElementById('multiFeedback').textContent = '';
    showToast('Safety reset');
  });
}

/* Quiz */
function initQuiz() {
  const container = document.getElementById('quizContainer');
  let currentIndex = 0; let correct = 0;

  function render() {
    const item = Data.quiz[currentIndex];
    container.innerHTML = '';
    const q = document.createElement('div'); q.className = 'question'; q.textContent = `${currentIndex + 1}. ${item.q}`; container.appendChild(q);
    const opts = document.createElement('div'); opts.className = 'options';
    item.options.forEach((text, i) => {
      const btn = document.createElement('button'); btn.className = 'btn'; btn.textContent = text; btn.addEventListener('click', () => {
        if (i === item.answer) { correct += 1; updateScore('quiz', 2, false); showToast('Correct', 'success'); }
        else { updateScore('quiz', -1, false); showToast('Incorrect', 'error'); }
        if (currentIndex < Data.quiz.length - 1) { currentIndex += 1; render(); }
        else { showResult(); }
      }); opts.appendChild(btn);
    }); container.appendChild(opts);
  }

  function showResult() {
    container.innerHTML = `<p>You scored ${correct}/${Data.quiz.length}.</p>`;
  }

  document.getElementById('quizRestartBtn').addEventListener('click', () => { currentIndex = 0; correct = 0; render(); });

  render();
}

function renderTeacherMode() {
  document.body.classList.toggle('teacher', AppState.teacherMode);
}

function initApp() {
  initHeader();
  initRouter();
  initLab();
  initTroubleshooting();
  initOSInstall();
  initNetworking();
  initSafety();
  initQuiz();
  updateAllScores();
  renderTeacherMode();
}

window.addEventListener('DOMContentLoaded', initApp);