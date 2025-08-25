const appState = {
  relationshipStartISO: '2023-02-14',
  gifUrls: [
    'https://media.giphy.com/media/l0HUpt2s9Pclgt9Vm/giphy.gif',
    'https://media.giphy.com/media/za5xikuRr0OzK/giphy.gif',
    'https://media.giphy.com/media/3oz8xAFtqoOUUrsh7W/giphy.gif',
    'https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif',
    'https://media.giphy.com/media/9gISqB3tncMmY/giphy.gif',
    'https://media.giphy.com/media/H4DjXQXamtTiIuCcRU/giphy.gif'
  ],
  stickerUrls: [
    'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f497.png',
    'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f618.png',
    'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f970.png',
    'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f60d.png',
    'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f496.png',
    'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f381.png'
  ],
  typewriterLines: [
    'Angela, you are my favorite notification.',
    'Every day with you rewrites my best chapter.',
    'If kisses were stars, the sky is yours.',
  ]
};

function initializeTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  let lineIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let current = appState.typewriterLines[0];

  function tick() {
    current = appState.typewriterLines[lineIndex % appState.typewriterLines.length];
    const delta = deleting ? -1 : 1;
    charIndex += delta;
    el.textContent = current.slice(0, charIndex);

    const pause = deleting ? 30 : 60;

    if (!deleting && charIndex === current.length) {
      setTimeout(() => (deleting = true), 1200);
    }
    if (deleting && charIndex === 0) {
      deleting = false;
      lineIndex++;
    }
    setTimeout(tick, pause);
  }
  tick();
}

function renderGifs() {
  const grid = document.getElementById('gifGrid');
  if (!grid) return;
  appState.gifUrls.forEach(url => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Love gif';
    img.loading = 'lazy';
    grid.appendChild(img);
  });
}

function renderStickers() {
  const bar = document.getElementById('stickers');
  if (!bar) return;
  appState.stickerUrls.forEach(url => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Sticker';
    img.draggable = true;
    img.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', url);
    });
    bar.appendChild(img);
  });
}

function makeStickerInteractive(el) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;
  let rotation = 0;

  el.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    originX = parseFloat(el.style.left || '0');
    originY = parseFloat(el.style.top || '0');
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    el.style.left = originX + dx + 'px';
    el.style.top = originY + dy + 'px';
  });
  window.addEventListener('mouseup', () => (isDragging = false));
  el.addEventListener('dblclick', () => {
    rotation = (rotation + 20) % 360;
    el.style.transform = `rotate(${rotation}deg)`;
  });
  el.addEventListener('contextmenu', e => {
    e.preventDefault();
    el.remove();
  });
}

function initializeStickerCanvas() {
  const canvas = document.getElementById('stickerCanvas');
  if (!canvas) return;
  canvas.addEventListener('dragover', e => e.preventDefault());
  canvas.addEventListener('drop', e => {
    e.preventDefault();
    const url = e.dataTransfer.getData('text/plain');
    const img = document.createElement('img');
    img.src = url;
    img.className = 'sticker-item';
    img.style.left = e.offsetX + 'px';
    img.style.top = e.offsetY + 'px';
    img.width = 72;
    canvas.appendChild(img);
    makeStickerInteractive(img);
  });
}

function initializeComposer() {
  const form = document.getElementById('composer');
  const textarea = document.getElementById('noteText');
  const notes = document.getElementById('notes');
  const promptBtn = document.getElementById('generatePrompt');
  if (!form || !textarea || !notes) return;

  const prompts = [
    'I love the way you',
    'A favorite memory with you is',
    'When I think of our future, I imagine',
    'You make me feel'
  ];
  promptBtn?.addEventListener('click', () => {
    const p = prompts[Math.floor(Math.random() * prompts.length)];
    textarea.value = `${p} ...`;
    textarea.focus();
  });

  function saveNotesToStorage() {
    const all = Array.from(notes.querySelectorAll('.note-card .content')).map(n => n.textContent || '');
    localStorage.setItem('love_notes', JSON.stringify(all));
  }

  function renderNote(text) {
    const card = document.createElement('div');
    card.className = 'note-card';
    const content = document.createElement('div');
    content.className = 'content';
    content.textContent = text;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = new Date().toLocaleString();
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.className = 'btn btn-link';
    del.addEventListener('click', () => { card.remove(); saveNotesToStorage(); });
    card.appendChild(content);
    card.appendChild(meta);
    card.appendChild(del);
    notes.prepend(card);
  }

  const existing = JSON.parse(localStorage.getItem('love_notes') || '[]');
  existing.forEach(renderNote);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = textarea.value.trim();
    if (!text) return;
    renderNote(text);
    saveNotesToStorage();
    textarea.value = '';
  });
}

function initializeMusic() {
  const btn = document.getElementById('playMusic');
  const audio = document.getElementById('audio');
  if (!btn || !(audio instanceof HTMLAudioElement)) return;
  btn.addEventListener('click', async () => {
    try {
      await audio.play();
      btn.textContent = 'Pause ⏸';
    } catch {}
  });
}

function initializeShare() {
  const btn = document.getElementById('shareBtn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const shareData = { title: 'For Angela 💖', text: 'A little site I made for you 💌', url: location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard.writeText(location.href);
      btn.textContent = 'Link copied ✅';
      setTimeout(() => (btn.textContent = 'Share this page'), 2000);
    } catch {}
  });
}

function initializeHearts() {
  const canvas = document.getElementById('floating-hearts');
  const ctx = canvas.getContext('2d');
  let width = canvas.width = innerWidth;
  let height = canvas.height = innerHeight;
  const hearts = [];
  function makeHeart() {
    const x = Math.random() * width;
    const y = height + 20;
    const size = 6 + Math.random() * 12;
    const speed = 0.4 + Math.random() * 0.9;
    const hue = 330 + Math.random() * 40;
    return { x, y, size, speed, hue, alpha: 0.3 + Math.random() * 0.6 };
  }
  for (let i = 0; i < 60; i++) hearts.push(makeHeart());
  function drawHeart(h) {
    const s = h.size;
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(-Math.PI/4);
    ctx.fillStyle = `hsla(${h.hue} 90% 60% / ${h.alpha})`;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(0, -s, s, -s, s, 0);
    ctx.bezierCurveTo(s, s, 0, s*1.2, 0, s*1.8);
    ctx.bezierCurveTo(0, s*1.2, -s, s, -s, 0);
    ctx.bezierCurveTo(-s, -s, 0, -s, 0, 0);
    ctx.fill();
    ctx.restore();
  }
  function animate() {
    ctx.clearRect(0,0,width,height);
    hearts.forEach(h => {
      h.y -= h.speed;
      h.x += Math.sin(h.y * 0.01) * 0.2;
      if (h.y < -30) {
        const i = hearts.indexOf(h);
        hearts[i] = makeHeart();
      }
      drawHeart(h);
    });
    requestAnimationFrame(animate);
  }
  window.addEventListener('resize', () => {
    width = canvas.width = innerWidth;
    height = canvas.height = innerHeight;
  });
  animate();
}

function initializeDaysCounter() {
  const el = document.getElementById('daysCounter');
  if (!el) return;
  const start = new Date(appState.relationshipStartISO).getTime();
  const now = Date.now();
  const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  el.textContent = `Days since we began: ${days}`;
}

function renderPhotos() {
  const gallery = document.getElementById('photoGallery');
  const tmpl = document.getElementById('photoTemplate');
  if (!gallery || !(tmpl instanceof HTMLTemplateElement)) return;
  const samplePhotos = [
    { url: 'https://images.unsplash.com/photo-1504198266285-165a3b395b9b?q=80&w=1200&auto=format&fit=crop', caption: 'Sunset walks' },
    { url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop', caption: 'Coffee dates' },
    { url: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?q=80&w=1200&auto=format&fit=crop', caption: 'City lights' },
    { url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1200&auto=format&fit=crop', caption: 'Weekend adventures' }
  ];
  samplePhotos.forEach(p => {
    const node = tmpl.content.cloneNode(true);
    const img = node.querySelector('img');
    const cap = node.querySelector('figcaption');
    img.src = p.url;
    cap.textContent = p.caption;
    gallery.appendChild(node);
  });
}

function boot() {
  initializeTypewriter();
  renderPhotos();
  renderGifs();
  renderStickers();
  initializeStickerCanvas();
  initializeComposer();
  initializeMusic();
  initializeShare();
  initializeHearts();
  initializeDaysCounter();
}

document.addEventListener('DOMContentLoaded', boot);

