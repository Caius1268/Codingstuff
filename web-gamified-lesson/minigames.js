// Arcade Minigames
(function(){
  const view = ()=> document.querySelector('#view');
  function section(title){ const card=document.createElement('div'); card.className='card'; const h=document.createElement('h3'); h.textContent=title; card.appendChild(h); return card; }

  // Memory Match
  function renderMemoryMatch(){
    const root = section('Memory Match');
    const grid = document.createElement('div'); grid.className='grid-auto';
    const icons = ['🍎','🍌','🍇','🍓','🍍','🍉','🥝','🍑'];
    const deck = [...icons, ...icons].sort(()=>Math.random()-.5);
    let selected=[], solved=new Set(), moves=0, start=Date.now();
    deck.forEach((v,i)=>{
      const btn=document.createElement('button'); btn.className='btn'; btn.textContent='?'; btn.setAttribute('aria-label','card');
      btn.addEventListener('click', ()=>{
        if (solved.has(i)||selected.includes(i)) return;
        btn.textContent=v; selected.push(i);
        if (selected.length===2){ moves++; const [a,b]=selected; if (deck[a]===deck[b]){ solved.add(a); solved.add(b); selected=[]; btn.disabled=true; grid.children[a].disabled=true; if (solved.size===deck.length){ const time=Math.round((Date.now()-start)/1000); const p=document.createElement('p'); p.textContent=`Solved in ${moves} moves, ${time}s`; root.appendChild(p); Bus.emit('arcade:score', { game:'memory', moves, time }); } } else { setTimeout(()=>{ grid.children[a].textContent='?'; grid.children[b].textContent='?'; selected=[]; }, 600); }
        }
      }); grid.appendChild(btn);
    });
    root.appendChild(grid); view().appendChild(root);
  }

  // Typing Challenge
  function renderTypingChallenge(){
    const root = section('Typing Challenge');
    const text = 'The quick brown fox jumps over the lazy dog';
    const p = document.createElement('p'); p.textContent = text; root.appendChild(p);
    const input = document.createElement('input'); input.type='text'; input.placeholder='Type here...'; input.className='p-12'; root.appendChild(input);
    let start=0; input.addEventListener('focus', ()=>{ start=Date.now(); });
    input.addEventListener('input', ()=>{
      if (input.value===text){ const ms = Date.now()-start; const wpm = Math.round((text.length/5)/(ms/60000)); const r=document.createElement('p'); r.textContent=`Done! WPM: ${wpm}`; root.appendChild(r); Bus.emit('arcade:score', { game:'typing', wpm, ms }); }
    });
    view().appendChild(root);
  }

  // Reaction Test
  function renderReactionTest(){
    const root = section('Reaction Test');
    const canvas = document.createElement('canvas'); canvas.className='arcade-canvas'; root.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    function resize(){ const r=canvas.getBoundingClientRect(); canvas.width=r.width*window.devicePixelRatio; canvas.height=r.height*window.devicePixelRatio; }
    resize(); window.addEventListener('resize', resize);
    let wait = 1000 + Math.random()*2000; let t0=performance.now(); let clicked=false;
    canvas.addEventListener('click', ()=>{
      const t=performance.now()-t0; if (t>wait && !clicked){ const ms=Math.round(t-wait); clicked=true; Bus.emit('arcade:score', { game:'reaction', ms }); } else if (!clicked){ // too soon
        t0=performance.now(); wait = 1000 + Math.random()*2000;
      }
    });
    function loop(){ const t=performance.now()-t0; ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle = t>wait? '#1dd1a1':'#ff6b6b'; ctx.fillRect(0,0,canvas.width,canvas.height); requestAnimationFrame(loop); }
    loop(); view().appendChild(root);
  }

  window.ARCADE = { renderMemoryMatch, renderTypingChallenge, renderReactionTest };
})();