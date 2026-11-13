/* MOONNEXT — site.js
   One script for: header/menu, scroll UI, first-visit preloader, GSAP motion, pointer effects,
   starfield, typewriter, testimonial slider, portfolio filter, service sub-nav, Motion+ (v13).
   Progressive enhancement: content is visible by default. `html.anim` (set in <head>, only when
   motion is allowed) hides .reveal elements; this file reveals them, and a head-script failsafe
   removes `anim` if this file never runs. Lead capture lives in inquiry.js. */
(function () {
  'use strict';
  window.__mn = 1;
  const d = document, root = d.documentElement, body = d.body;
  const $ = (s, c) => (c || d).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || d).querySelectorAll(s));
  const reduce = false; // v15: animations always on
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const G = window.gsap, ST = window.ScrollTrigger, hasG = !!(G && ST);
  const safe = fn => { try { fn(); } catch (e) { if (window.console) console.warn('[moonnext]', fn.name, e); } };

  /* ---------- Header, mobile menu, dropdown ---------- */
  function header() {
    const burger = $('.burger'), menu = $('.menu');
    if (!burger || !menu) return;
    const page = location.pathname.split('/').pop() || 'index.html';
    $$('.menu a[href]').forEach(a => { if (a.getAttribute('href') === page) a.setAttribute('aria-current', 'page'); });
    const dd = $('.dd');
    if (dd && $('.sub a[aria-current]', dd)) $('.ddbtn', dd).classList.add('is-here');
    const setMenu = open => {
      menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); body.classList.toggle('lock', open);
    };
    // placeholder links (social / privacy / terms = "#") used to throw the page back to the top; keep the page where it is
    d.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[href="#"]'); if (a) e.preventDefault(); });
    burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
    $$('.menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    $$('.ddbtn').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation(); const p = b.parentNode, o = !p.classList.contains('open');
      p.classList.toggle('open', o); b.setAttribute('aria-expanded', String(o));
    }));
    const closeDD = () => $$('.dd.open').forEach(p => { p.classList.remove('open'); $('.ddbtn', p).setAttribute('aria-expanded', 'false'); });
    d.addEventListener('click', e => { if (!e.target.closest('.dd')) closeDD(); });
    d.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (menu.classList.contains('open')) { setMenu(false); burger.focus(); }
      const open = $('.dd.open'); if (open) { closeDD(); $('.ddbtn', open).focus(); }
    });
    addEventListener('resize', () => { if (innerWidth > 1180 && menu.classList.contains('open')) setMenu(false); });
  }

  /* ---------- Scroll UI: progress bar, header state, back-to-top ring, floating CTA ---------- */
  function scrollUI() {
    const pb = $('#pbar'), hd = $('.header'), tt = $('.totop'), ring = tt && $('.pg', tt);
    let fc = null;
    if (!/contact\.html$/.test(location.pathname)) {
      fc = d.createElement('button'); fc.className = 'fcta'; fc.type = 'button'; fc.setAttribute('data-popup', '');
      fc.innerHTML = '<i aria-hidden="true"></i>Start a project'; body.appendChild(fc);
    }
    let busy = false;
    const upd = () => {
      busy = false;
      const y = scrollY, h = root.scrollHeight - innerHeight, p = h > 0 ? Math.min(1, y / h) : 0;
      if (pb) pb.style.transform = 'scaleX(' + p + ')';
      if (hd) hd.classList.toggle('is-scrolled', y > 24);
      if (tt) { tt.classList.toggle('on', y > 500); if (ring) ring.style.strokeDashoffset = 125.66 * (1 - p); }
      if (fc) fc.classList.toggle('show', y > 500 && !body.classList.contains('gm-lock'));
    };
    addEventListener('scroll', () => { if (!busy) { busy = true; requestAnimationFrame(upd); } }, { passive: true });
    if (tt) tt.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
    upd();
  }

  /* ---------- First-visit preloader (split curtain). Progress follows real load signals. ---------- */
  function preloader(done) {
    const pl = $('#pl');
    if (!pl) return done();
    try { sessionStorage.setItem('mn_seen', '1'); } catch (e) { /* private mode: loader shows each visit */ }
    const ring = $('.pl-pg', pl), bar = $('.pl-bar i', pl), pc = $('.pl-pc span', pl), st = $('.pl-st', pl);
    const labels = [[0, 'Initializing'], [30, 'Loading assets'], [60, 'Optimizing experience'], [88, 'Almost ready'], [100, 'Welcome']];
    const quick = root.classList.contains('seen'), MIN = quick ? 450 : 1400, MAX = quick ? 1800 : 3200, C = 339.3;
    const sig = { fonts: !(d.fonts && d.fonts.ready), load: d.readyState === 'complete' };
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(() => { sig.fonts = true; });
    if (!sig.load) addEventListener('load', () => { sig.load = true; });
    let disp = 0, li = -1, fin = false; const t0 = performance.now();
    const render = v => {
      v = Math.max(0, Math.min(100, v)); const n = Math.round(v);
      pc.textContent = n; bar.style.width = v + '%'; ring.style.strokeDashoffset = C * (1 - v / 100);
      for (let i = labels.length - 1; i >= 0; i--) if (v >= labels[i][0]) { if (i !== li) { li = i; st.textContent = labels[i][1]; } break; }
    };
    const finish = () => {
      if (fin) return; fin = true; render(100);
      setTimeout(() => { pl.classList.add('done'); root.classList.add('go'); done(); setTimeout(() => pl.remove(), 1300); }, quick ? 120 : 350);
    };
    setTimeout(finish, MAX + 600); // rAF is paused in background tabs; this timer guarantees the scroll lock is always released
    const tick = now => {
      const el = now - t0, ready = (sig.fonts + sig.load) / 2, ceil = ready >= 1 ? 100 : 40 + ready * 50;
      const target = Math.min(ceil, Math.min(1, el / MIN) * 100);
      const dt = Math.min(100, now - (tick.l || now)); tick.l = now; disp += (target - disp) * (1 - Math.pow(1 - (quick ? .24 : .1), dt / 16.7)); if (target - disp < .05) disp = target; render(disp);
      if ((ready >= 1 && el >= MIN && disp >= 99.5) || el >= MAX) return finish();
      requestAnimationFrame(tick);
    };
    render(0); requestAnimationFrame(tick);
  }

  /* ---------- Count-up numbers ([data-count], optional data-dec / data-pre / data-suffix) ---------- */
  function countUp(el) {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), pre = el.dataset.pre || '', suf = el.dataset.suffix || '';
    const fmt = v => pre + (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN')) + suf;
    if (!hasG || reduce) { el.textContent = fmt(to); return; }
    const o = { v: 0 }; el.textContent = fmt(0);
    G.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(o.v); } });
  }

  /* ---------- GSAP motion: reveals, hero intro, counters, timeline, parallax ---------- */
  let intro = null, sweep = () => {};
  function motion() {
    if (!hasG) { root.classList.remove('anim'); return; }
    G.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true }); // mobile URL-bar show/hide must not re-layout every trigger (caused scroll jumps)
    const settle = els => els.forEach(e => { G.killTweensOf(e); e.classList.add('in'); G.set(e, { clearProps: 'opacity,visibility,transform' }); });
    const show = (els, opt) => G.to(els, Object.assign({ autoAlpha: 1, y: 0, x: 0, scale: 1, duration: .85, ease: 'power3.out', overwrite: true, onComplete: () => settle([].concat(els)) }, opt || {}));
    // hero intro (played by start() once the curtain opens)
    const hi = $$('.hi'), chips = $$('.chip');
    intro = () => {
      if (hi.length) show(hi, { stagger: .11, delay: .05 });
      if (chips.length) G.fromTo(chips, { scale: .6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .6, stagger: .15, delay: .9, ease: 'back.out(2)', clearProps: 'transform,opacity,visibility' });
    };
    // scroll reveals (batched so siblings stagger together)
    ST.batch($$('.reveal:not(.hi)'), { start: 'top 90%', once: true, interval: .1, batchMax: 6, onEnter: els => show(els, { stagger: .09 }) });
    // counters
    $$('[data-count]').forEach(el => ST.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => countUp(el) }));
    // vertical timeline fill
    $$('.tline').forEach(t => ST.create({ trigger: t, start: 'top 72%', end: 'bottom 72%', scrub: .4, onUpdate: s => t.style.setProperty('--tp', s.progress.toFixed(3)) }));
    // subtle hero parallax (transform-only)
    if ($('.hero-home') && !$('.hero-home').closest('[data-no-parallax]')) {
      G.to('.hero-home .a1', { yPercent: 30, ease: 'none', scrollTrigger: { trigger: '.hero-home', start: 'top top', end: 'bottom top', scrub: true } });
      G.to('.hero-home .hvw', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hero-home', start: 'top top', end: 'bottom top', scrub: true } });
    }
    // Safety net: if a fast scroll / anchor jump / filter change skipped a trigger, reveal what is already above the fold
    sweep = () => {
      if (!root.classList.contains('ready')) return;
      const vh = innerHeight;
      $$('.reveal:not(.in)').forEach(e => { const r = e.getBoundingClientRect(); if ((r.width || r.height) && (r.bottom < 0 || r.top < vh * .9) && !G.isTweening(e)) settle([e]); });
    };
    let idle = 0; addEventListener('scroll', () => { clearTimeout(idle); idle = setTimeout(sweep, 220); }, { passive: true });
    addEventListener('hashchange', () => setTimeout(sweep, 300));
    addEventListener('load', () => { ST.refresh(); setTimeout(sweep, 1800); });
    safe(svcMotion);
  }

  /* ---------- Service pages: scroll-linked motion (everything else on those pages is CSS) ---------- */
  function svcMotion() {
    if (!$('.svc-hero') || reduce) return;
    // oversized hero glyph + glow drift at a different speed from the content (transform only)
    if ($('.svc-glyph')) G.to('.svc-glyph', { yPercent: 36, rotate: 18, ease: 'none', scrollTrigger: { trigger: '.svc-hero', start: 'top top', end: 'bottom top', scrub: true } });
    if ($('.svc-hero .a1')) G.to('.svc-hero .a1', { yPercent: 28, ease: 'none', scrollTrigger: { trigger: '.svc-hero', start: 'top top', end: 'bottom top', scrub: true } });
    // process line fills as the steps scroll through
    const st = $('.svc-steps');
    if (st) ST.create({ trigger: st, start: 'top 82%', end: 'bottom 62%', scrub: .4, onUpdate: s => st.style.setProperty('--sp', s.progress.toFixed(3)) });
  }

  /* ---------- Pointer effects (mouse devices only): card spotlight + tilt, magnetic buttons, cursor glow ---------- */
  function pointer() {
    if (!fine || reduce) return;
    const sel = '.card,.bento>a,.plan,.case,.pf,.cmp>div,.ind>div,.outcome';
    $$(sel).forEach(e => e.classList.add('tilt'));
    const cg = $('.cg'), hv = $('.hvw'), sv = $('.svc-hero .visual');
    let cur = null, mg = null, px = 0, py = 0, raf = 0;
    const clamp = (v, m) => Math.max(-m, Math.min(m, v));
    const tiltBox = (el, kx, ky) => {
      const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      el.style.setProperty('--ry', clamp((px - r.left) / r.width - .5, .6) * kx + 'deg'); el.style.setProperty('--rx', clamp(.5 - (py - r.top) / r.height, .6) * ky + 'deg');
    };
    const frame = () => { // all reads + writes in one frame (no layout thrash while scrolling)
      raf = 0;
      if (cg) cg.style.transform = 'translate(' + px + 'px,' + py + 'px)';
      if (cur) {
        const r = cur.getBoundingClientRect(), x = px - r.left, y = py - r.top;
        cur.style.setProperty('--mx', x + 'px'); cur.style.setProperty('--my', y + 'px');
        cur.style.setProperty('--ry', ((x / r.width - .5) * 6).toFixed(2) + 'deg'); cur.style.setProperty('--rx', ((.5 - y / r.height) * 5).toFixed(2) + 'deg');
      }
      if (mg) { const r = mg.getBoundingClientRect(); mg.style.setProperty('--tx', ((px - r.left - r.width / 2) * .16).toFixed(1) + 'px'); mg.style.setProperty('--ty', ((py - r.top - r.height / 2) * .24).toFixed(1) + 'px'); }
      if (hv && $('.hero-home')) tiltBox(hv, 9, 7);
      if (sv) tiltBox(sv, 8, 6);
    };
    const reset = el => ['--rx', '--ry'].forEach(p => el.style.removeProperty(p));
    d.addEventListener('pointermove', e => {
      px = e.clientX; py = e.clientY; body.classList.add('cg-on');
      const c = e.target.closest && e.target.closest(sel);
      if (cur && cur !== c) reset(cur); cur = c;
      const b = e.target.closest && e.target.closest('.btn');
      if (mg && mg !== b) { mg.style.removeProperty('--tx'); mg.style.removeProperty('--ty'); }
      mg = b || null;
      if (!raf) raf = requestAnimationFrame(frame);
    }, { passive: true });
    d.documentElement.addEventListener('mouseleave', () => { body.classList.remove('cg-on'); [hv, sv].forEach(el => { if (el) reset(el); }); });
  }
  function ripple() {
    if (reduce) return;
    d.addEventListener('pointerdown', e => {
      const b = e.target.closest && e.target.closest('.btn'); if (!b) return;
      const r = b.getBoundingClientRect(), s = d.createElement('span');
      s.className = 'rp'; s.style.left = e.clientX - r.left + 'px'; s.style.top = e.clientY - r.top + 'px';
      b.appendChild(s); setTimeout(() => s.remove(), 700);
    });
  }

  /* ---------- Starfield (home hero): twinkle + occasional shooting star; paused off-screen ---------- */
  function stars() {
    const cv = $('#stars'); if (!cv || !cv.getContext) return;
    const cx = cv.getContext('2d'), hero = cv.closest('.hero');
    let w = 0, h = 0, dpr = Math.min(devicePixelRatio || 1, 1.5), S = [], shoot = null, run = false, last = 0;
    const size = () => {
      w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(110, Math.round(w * h / 9000));
      S = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.3 + .3, t: Math.random() * 6.28, v: Math.random() * .02 + .005, c: Math.random() < .14 ? '245,158,11' : Math.random() < .25 ? '14,165,198' : Math.random() < .5 ? '109,74,255' : '11,27,58' }));
    };
    const draw = now => {
      if (!run) return; requestAnimationFrame(draw);
      if (now - last < 33) return; last = now; cx.clearRect(0, 0, w, h);
      S.forEach(s => { s.t += s.v; cx.fillStyle = 'rgba(' + s.c + ',' + (.3 + Math.sin(s.t) * .22).toFixed(2) + ')'; cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.283); cx.fill(); });
      if (!shoot && Math.random() < .004) shoot = { x: Math.random() * w * .8, y: Math.random() * h * .4, l: 0 };
      if (shoot) {
        const g = cx.createLinearGradient(shoot.x, shoot.y, shoot.x - 90, shoot.y - 40); g.addColorStop(0, 'rgba(109,74,255,.7)'); g.addColorStop(1, 'rgba(109,74,255,0)');
        cx.strokeStyle = g; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(shoot.x, shoot.y); cx.lineTo(shoot.x - 90, shoot.y - 40); cx.stroke();
        shoot.x += 14; shoot.y += 6; if (++shoot.l > 40) shoot = null;
      }
    };
    size(); addEventListener('resize', size);
    if (reduce) { S.forEach(s => { cx.fillStyle = 'rgba(' + s.c + ',.4)'; cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.283); cx.fill(); }); return; }
    new IntersectionObserver(es => { const v = es[0].isIntersecting; if (v && !run) { run = true; requestAnimationFrame(draw); } else if (!v) run = false; }).observe(hero);
  }

  /* ---------- Typewriter: <span data-type="A|B|C"> ---------- */
  function typer() {
    $$('[data-type]').forEach(el => {
      const W = el.dataset.type.split('|'); if (reduce) { el.textContent = W[0]; return; }
      let w = 0, c = 0, dir = 1;
      const t = d.createElement('span'), cr = d.createElement('i'); cr.className = 'cr'; cr.setAttribute('aria-hidden', 'true');
      el.textContent = ''; el.setAttribute('aria-label', W.join(', ')); el.append(t, cr);
      const step = () => {
        if (!el.isConnected) return; const s = W[w]; c += dir; t.textContent = s.slice(0, c); let wait = dir > 0 ? 70 : 32;
        if (dir > 0 && c === s.length) { dir = -1; wait = 1700; } else if (dir < 0 && c === 0) { dir = 1; w = (w + 1) % W.length; wait = 380; }
        setTimeout(step, wait);
      };
      step();
    });
  }

  /* ---------- Testimonial slider (markup is plain HTML; this adds controls) ---------- */
  function slider() {
    $$('.tsl').forEach(sl => {
      const tr = $('.tsl-t', sl), slides = $$('.tsl-s', sl), dots = $('.tsl-d', sl), n = slides.length; if (n < 2) return;
      let i = 0, timer = 0, hold = false, x0 = null;
      slides.forEach((s, k) => { const b = d.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Show testimonial ' + (k + 1)); b.addEventListener('click', () => go(k, 1)); dots.appendChild(b); });
      const go = (k, user) => {
        i = (k + n) % n; tr.style.transform = 'translate3d(' + (-100 * i) + '%,0,0)';
        slides.forEach((s, j) => s.setAttribute('aria-hidden', String(j !== i))); $$('button', dots).forEach((b, j) => { b.classList.toggle('on', j === i); b.setAttribute('aria-current', String(j === i)); });
        if (user) restart();
      };
      const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => { if (!hold && !d.hidden) go(i + 1); }, 6500); };
      const [pv, nx] = $$('.tsl-b', sl); pv.addEventListener('click', () => go(i - 1, 1)); nx.addEventListener('click', () => go(i + 1, 1));
      sl.addEventListener('mouseenter', () => { hold = true; }); sl.addEventListener('mouseleave', () => { hold = false; });
      sl.addEventListener('focusin', () => { hold = true; }); sl.addEventListener('focusout', () => { hold = false; });
      sl.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
      sl.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1), 1); x0 = null; });
      go(0); restart();
    });
  }

  /* ---------- Portfolio filter + service sub-nav scroll-spy + off-screen animation pause ---------- */
  function filters() {
    const btns = $$('.fbtn'); if (!btns.length) return;
    btns.forEach(b => b.addEventListener('click', () => {
      const f = b.dataset.f; btns.forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      $$('.pf[data-cat]').forEach(p => p.classList.toggle('hide', f !== 'all' && p.dataset.cat !== f));
      if (hasG && ST) ST.refresh();
      setTimeout(() => { $$('.pf:not(.hide):not(.in)').forEach(p => { p.classList.add('in'); if (hasG) G.set(p, { clearProps: 'opacity,visibility,transform' }); }); }, 30);
    }));
  }
  function spy() {
    const sn = $('.subnav'), links = $$('.subnav a[href^="#"]'); if (!sn || !links.length) return;
    const map = links.map(a => [a, $(a.getAttribute('href'))]).filter(p => p[1]);
    const wrap = $('.container', sn), pill = d.createElement('i'); pill.className = 'sn-pill'; pill.setAttribute('aria-hidden', 'true');
    wrap.insertBefore(pill, wrap.firstChild); sn.classList.add('has-pill');
    const move = a => {
      pill.style.width = a.offsetWidth + 'px'; pill.style.transform = 'translateX(' + a.offsetLeft + 'px)';
      if (wrap.scrollWidth > wrap.clientWidth) wrap.scrollTo({ left: a.offsetLeft - (wrap.clientWidth - a.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
    };
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) map.forEach(p => { const on = p[1] === e.target; p[0].classList.toggle('on', on); if (on) move(p[0]); }); }), { rootMargin: '-30% 0px -60% 0px' });
    map.forEach(p => io.observe(p[1]));
  }
  function pauseOffscreen() {
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('off', !e.isIntersecting)));
    $$('.hero,.marquee').forEach(e => io.observe(e));
  }

  /* ---------- Motion+ (v13): inner-page H1 words, directional grids, scene wipe, scroll-speed marquee, hero parallax ---------- */
  function plusPrep() { // runs BEFORE motion() so ScrollTrigger sees the final markup
    if (reduce || !hasG) return;
    root.classList.add('fx'); setTimeout(() => root.classList.remove('fx'), 9000); // failsafe: never leave scenes clipped
    $$('.page-hero h1').forEach(h => { // word-by-word mask rise (service pages + home already have their own)
      const t = h.textContent.trim(); h.setAttribute('aria-label', t); h.textContent = '';
      t.split(/\s+/).forEach((w, i) => {
        const o = d.createElement('span'), s = d.createElement('span');
        o.className = 'wm'; o.setAttribute('aria-hidden', 'true'); s.style.setProperty('--i', i); s.textContent = w; o.appendChild(s);
        h.appendChild(o); h.appendChild(d.createTextNode(' '));
      });
    });
    $$('.grid,.bento,.ind').forEach(g => { // first column enters from the left, last from the right, middle scales in
      const n = getComputedStyle(g).gridTemplateColumns.split(' ').length; if (n < 2) return;
      Array.prototype.filter.call(g.children, c => c.classList.contains('reveal') && !c.dataset.from).forEach((c, i) => {
        const k = i % n; c.dataset.from = k === 0 ? 'l' : k === n - 1 ? 'r' : 'z';
      });
    });
    $$('.fgrid>div').forEach(e => e.classList.add('reveal')); // footer columns cascade in too
  }
  function plusLive() { // runs after the preloader curtain opens
    if (reduce || !hasG) return;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; io.unobserve(e.target); e.target.classList.add('wiped');
      setTimeout(() => e.target.classList.add('wdone'), 1500); // drop clip-path afterwards so nothing is ever cropped
    }), { threshold: .15 });
    $$('.sc').forEach(e => io.observe(e));
    const tracks = $$('.marquee .track'), rate = r => tracks.forEach(t => t.getAnimations().forEach(a => a.updatePlaybackRate(r)));
    if (tracks.length) { // marquees speed up with scroll velocity, then ease back
      let tgt = 1, cur = 1, last = 1;
      ST.create({ onUpdate: s => { tgt = Math.max(tgt, Math.min(1 + Math.abs(s.getVelocity()) / 450, 6)); } });
      G.ticker.add(() => {
        tgt = 1 + (tgt - 1) * .94; cur += (tgt - cur) * .2; if (tgt < 1.01) { tgt = 1; if (cur < 1.01) cur = 1; }
        if (Math.abs(cur - last) > .02 || (cur === 1 && last !== 1)) { last = cur; safe(() => rate(cur)); }
      });
    }
    $$('.page-hero').forEach(h => { // inner heroes: glow blobs drift in opposite directions, copy lifts away
      const sc = { trigger: h, start: 'top top', end: 'bottom top', scrub: true };
      if ($('.a1', h)) G.to($('.a1', h), { yPercent: 34, ease: 'none', scrollTrigger: sc });
      if ($('.a2', h)) G.to($('.a2', h), { yPercent: -22, xPercent: 8, ease: 'none', scrollTrigger: sc });
      G.to($('.container', h), { yPercent: 10, autoAlpha: .35, ease: 'none', scrollTrigger: sc });
    });
  }

  /* ---------- Boot ---------- */
  function start() {
    root.classList.add('ready');
    if (root.classList.contains('anim') && intro) safe(intro);
    else if (!root.classList.contains('anim')) $$('[data-count]').forEach(countUp);
    safe(plusLive);
  }
  safe(header); safe(scrollUI); safe(filters); safe(spy); safe(slider); safe(typer); safe(stars); safe(pointer); safe(ripple); safe(pauseOffscreen);
  if (root.classList.contains('anim')) safe(plusPrep);
  if (root.classList.contains('anim')) { try { motion(); } catch (e) { root.classList.remove('anim'); if (window.console) console.warn('[moonnext] motion', e); } }
  try { preloader(start); } catch (e) { root.classList.add('seen', 'go'); start(); if (window.console) console.warn('[moonnext] preloader', e); }
  setTimeout(() => { if (!root.classList.contains('ready')) { root.classList.add('seen', 'go'); start(); } }, 6500); // last-resort failsafe
})();
