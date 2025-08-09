// EventBus
const Bus = (()=>{
  const map = new Map();
  return {
    on(evt, fn){ const arr = map.get(evt)||[]; arr.push(fn); map.set(evt, arr); return ()=>{ const a = map.get(evt)||[]; const i=a.indexOf(fn); if(i>=0)a.splice(i,1); } },
    emit(evt, data){ (map.get(evt)||[]).forEach(fn=>{ try{ fn(data) }catch(e){ console.error(e) } }); },
    clear(){ map.clear(); }
  };
})();

// Logger
const Logger = (()=>{
  let level = 'info';
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };
  function log(l, ...args){ if (levels[l] >= levels[level]) console[l==='debug'?'log':l](...args); }
  return { setLevel(l){ level=l }, debug: (...a)=>log('debug',...a), info: (...a)=>log('info',...a), warn: (...a)=>log('warn',...a), error: (...a)=>log('error',...a) };
})();

// Easing
const Easing = {
  linear: t=>t,
  easeInQuad: t=>t*t, easeOutQuad:t=>t*(2-t), easeInOutQuad:t=>t<.5?2*t*t:-1+(4-2*t)*t,
  easeInCubic:t=>t*t*t, easeOutCubic:t=>(--t)*t*t+1, easeInOutCubic:t=>t<.5?4*t*t*t:(t-1)*(2*t-2)*(2*t-2)+1,
  backOut:t=>{ const c1=1.70158, c3=c1+1; return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2) },
};

// RNG
class RNG { constructor(seed=Date.now()){ this.seed=seed>>>0 } next(){ let t=this.seed+=0x6D2B79F5; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296 } nextRange(a,b){ return a+(b-a)*this.next() } pick(arr){ return arr[(this.next()*arr.length)|0] } }

// Perlin noise 2D (simple)
const Noise2D = (function(){
  const P=new Uint8Array(512); const perm=new Uint8Array(256); for(let i=0;i<256;i++)perm[i]=i; for(let i=0;i<255;i++){ const j=(Math.random()*(256-i)|0)+i; const t=perm[i]; perm[i]=perm[j]; perm[j]=t; } for(let i=0;i<512;i++)P[i]=perm[i&255];
  function fade(t){ return t*t*t*(t*(t*6-15)+10) }
  function lerp(t,a,b){ return a+t*(b-a) }
  function grad(hash,x,y){ const h=hash&3; const u=h<2?x:y; const v=h<2?y:x; return ((h&1)?-u:u)+((h&2)?-2*v:2*v) }
  return function(x,y){ const X=x|0, Y=y|0; x-=X; y-=Y; const u=fade(x), v=fade(y); const A=P[X]+Y, B=P[X+1]+Y; return lerp(v, lerp(u, grad(P[A],x,y), grad(P[B],x-1,y)), lerp(u, grad(P[A+1],x,y-1), grad(P[B+1],x-1,y-1))) };
})();

// Particles
class ParticleSystem {
  constructor(ctx){ this.ctx=ctx; this.p=[]; }
  spawn(x,y,color='white'){ for(let i=0;i<12;i++){ this.p.push({x,y, vx:(Math.random()*2-1)*120, vy:(Math.random()*2-1)*120, life:600, color, r:2+Math.random()*2}); } }
  update(dt){ const arr=this.p; for(let i=arr.length-1;i>=0;i--){ const a=arr[i]; a.life-=dt*1000; if(a.life<=0){ arr.splice(i,1); continue } a.x+=a.vx*dt; a.y+=a.vy*dt; a.vy+=50*dt; } }
  render(){ const ctx=this.ctx; this.p.forEach(a=>{ ctx.globalAlpha=Math.max(0,a.life/600); ctx.fillStyle=a.color; ctx.beginPath(); ctx.arc(a.x,a.y,a.r,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1; }); }
}

// AudioManager
const AudioManager = (()=>{
  let ctx; let muted=false; let musicGain, sfxGain; let currentMusic;
  function ensure(){ if (!ctx){ try { ctx = new (window.AudioContext||window.webkitAudioContext)(); musicGain=ctx.createGain(); sfxGain=ctx.createGain(); musicGain.gain.value=.2; sfxGain.gain.value=.3; musicGain.connect(ctx.destination); sfxGain.connect(ctx.destination);} catch(e){} } }
  function tone(freq=440, dur=0.2, type='sine'){ ensure(); if(!ctx) return; const o=ctx.createOscillator(); const g=ctx.createGain(); o.type=type; o.frequency.value=freq; o.connect(g); g.connect(sfxGain); const now=ctx.currentTime; g.gain.setValueAtTime(0.001, now); g.gain.linearRampToValueAtTime(.15, now+.02); g.gain.exponentialRampToValueAtTime(.0001, now+dur); o.start(); o.stop(now+dur+0.05); }
  function playGood(){ tone(880, .18, 'triangle') }
  function playBad(){ tone(220, .22, 'square') }
  function setMuted(m){ muted=m; if (ctx){ musicGain.gain.value=m?0:.2; sfxGain.gain.value=m?0:.3; } }
  function isMuted(){ return muted }
  return { playGood, playBad, setMuted, isMuted };
})();

// Misc Helpers
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)) }
function lerp(a,b,t){ return a+(b-a)*t }
function now(){ return performance.now() }