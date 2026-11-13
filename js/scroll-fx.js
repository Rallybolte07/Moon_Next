/* MOONNEXT – scroll-fx.js · scroll-triggered animation layer, loaded on every page (GSAP + ScrollTrigger).
   What it adds on top of the reveals in global.js / animations.js:
   1. word-fill      paragraphs marked data-fill light up word by word while you scroll past them
   2. card parallax  cards in 3-column grids drift at different speeds, so rows stagger while scrolling
   3. image parallax project screenshots glide inside their frames
   4. dark sections  dark bands unfold from a rounded card to full width as they arrive
   5. marquees       every scrolling strip speeds up with your scroll speed and reverses when you scroll up
   6. hero lag       hero content trails the scroll slightly, giving the page depth
   7. CTA + footer   the call-to-action icon turns with the scroll, footer columns rise in one after another
   8. pop-in         icons and chips marked data-pop pop in with a small bounce
   Only transform / opacity / CSS variables are animated. Everything is off for prefers-reduced-motion.
   Cards use the CSS "translate" property (via the --py variable) so they never fight the tilt / hover transforms. */
(function () {
  'use strict';
  var G = window.gsap, ST = window.ScrollTrigger, d = document;
  if (!G || !ST || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  G.registerPlugin(ST);
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var esc = function (t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  function safe(fn) { try { fn(); } catch (e) { if (window.console) console.warn('[moonnext scroll-fx]', e); } }

  /* 1. word-fill (runs once, any size) */
  safe(function () {
    $$('[data-fill]').forEach(function (p) {
      var words = p.textContent.trim().split(/\s+/);
      p.innerHTML = words.map(function (w) { return '<span class="wf">' + esc(w) + '</span>'; }).join(' ');
      G.fromTo(p.querySelectorAll('.wf'), { opacity: .16 }, { opacity: 1, ease: 'none', stagger: .12,
        scrollTrigger: { trigger: p, start: 'top 84%', end: 'bottom 50%', scrub: .4 } });
    });
  });

  /* 8. pop-in (runs once, any size) */
  safe(function () {
    var els = $$('[data-pop]'); if (!els.length) return;
    G.set(els, { scale: .55, autoAlpha: 0 });
    ST.batch(els, { start: 'top 92%', once: true, onEnter: function (b) {
      G.to(b, { scale: 1, autoAlpha: 1, duration: .6, stagger: .08, ease: 'back.out(2.4)', clearProps: 'transform,opacity,visibility' });
    } });
  });

  /* 5. marquees: scroll velocity drives the playback rate of the CSS animation */
  safe(function () {
    var anims = [];
    $$('.marquee .track').forEach(function (t) { var a = t.getAnimations && t.getAnimations()[0]; if (a) anims.push(a); });
    if (!anims.length) return;
    var px = { r: 1 }, clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
    var set = function () { anims.forEach(function (a) { a.playbackRate = px.r; }); };
    ST.create({ start: 0, end: 'max', onUpdate: function (self) {
      G.to(px, { r: clamp(1 + self.getVelocity() / 240, -4, 7), duration: .35, ease: 'power2.out', overwrite: true, onUpdate: set });
    } });
    ST.addEventListener('scrollEnd', function () { G.to(px, { r: 1, duration: 1.1, ease: 'power2.out', overwrite: true, onUpdate: set }); });
  });

  /* 7. footer cascade + CTA icon (any size) */
  safe(function () {
    var cols = $$('.footer .fgrid > div');
    if (cols.length) G.from(cols, { autoAlpha: 0, y: 40, duration: .8, stagger: .12, ease: 'power3.out', clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '.footer', start: 'top 92%', once: true } });
    $$('.cta-ill').forEach(function (e) {
      G.fromTo(e, { rotate: -20, y: 26 }, { rotate: 14, y: -18, ease: 'none', scrollTrigger: { trigger: e.closest('.cta') || e, start: 'top bottom', end: 'bottom top', scrub: .6 } });
    });
  });

  /* size-dependent effects */
  var mm = G.matchMedia();

  mm.add('(min-width: 901px)', function () {
    /* 2. card parallax: columns of a 3-column grid move at different speeds */
    $$('.grid').forEach(function (g) {
      var cards = $$(':scope > .card', g); if (cards.length < 3) return;
      var cols = getComputedStyle(g).gridTemplateColumns.split(' ').length; if (cols !== 3) return;
      cards.forEach(function (c, i) {
        var mid = i % 3 === 1; c.classList.add('sfx-par');
        G.fromTo(c, { '--py': mid ? '26px' : '0px' }, { '--py': mid ? '-26px' : '0px', ease: 'none',
          scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    });
    /* 4. dark sections unfold */
    $$('.section.dark').forEach(function (s) {
      G.fromTo(s, { scale: .93, borderRadius: '56px', transformOrigin: '50% 0%' }, { scale: 1, borderRadius: '0px', ease: 'none',
        scrollTrigger: { trigger: s, start: 'top 100%', end: 'top 30%', scrub: true } });
    });
    /* 6. hero content trails the scroll */
    $$('.hero:not(.hero-home) > .container').forEach(function (c) {
      G.to(c, { y: 70, ease: 'none', scrollTrigger: { trigger: c.closest('.hero'), start: 'top top', end: 'bottom top', scrub: true } });
    });
  });

  mm.add('(max-width: 900px)', function () {
    $$('.section.dark').forEach(function (s) {
      G.fromTo(s, { scale: .97, borderRadius: '28px', transformOrigin: '50% 0%' }, { scale: 1, borderRadius: '0px', ease: 'none',
        scrollTrigger: { trigger: s, start: 'top 100%', end: 'top 55%', scrub: true } });
    });
  });

  /* 3. image parallax inside project frames (all sizes) */
  safe(function () {
    $$('.pf-media img').forEach(function (img) {
      G.fromTo(img, { '--iy': '-2.5%' }, { '--iy': '2.5%', ease: 'none', scrollTrigger: { trigger: img.closest('.pf-media'), start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });

  addEventListener('load', function () { setTimeout(function () { ST.refresh(); }, 900); });
})();
