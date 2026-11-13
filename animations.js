/* MOONNEXT — animations.js · shared GSAP layer. Pages pick effects from js/pages/<page>.js via MN.run().
   Respects prefers-reduced-motion. Never touches .reveal elements (global.js owns those). */
(function () {
  'use strict';
  var G = window.gsap, ST = window.ScrollTrigger, d = document;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var ok = !!(G && ST) && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (G && ST) G.registerPlugin(ST);
  var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  var plain = function (list) { return $$(list).filter(function (e) { return !e.classList.contains('reveal'); }); };

  var fx = {
    // section headings: masked wipe-up when they scroll into view
    headings: function () {
      plain('.section h2').forEach(function (h) {
        if (h.closest('.hero')) return;
        G.fromTo(h, { clipPath: 'inset(0 0 100% 0)', yPercent: 40 }, { clipPath: 'inset(0 0 -20% 0)', yPercent: 0, duration: .9, ease: 'power4.out',
          clearProps: 'clipPath,transform', scrollTrigger: { trigger: h, start: 'top 90%', once: true } });
      });
    },
    // small elements (list items, tags, buttons) cascade in, grouped per scroll position
    stagger: function (sel) {
      var els = plain(sel); if (!els.length) return;
      G.set(els, { autoAlpha: 0, y: 16 });
      ST.batch(els, { start: 'top 94%', once: true, onEnter: function (b) {
        G.to(b, { autoAlpha: 1, y: 0, duration: .6, stagger: .07, ease: 'power3.out', clearProps: 'transform,opacity,visibility' });
      } });
    },
    // soft breathing glow for one highlighted element (e.g. the popular plan)
    glow: function (sel) {
      $$(sel).forEach(function (e) {
        G.to(e, { boxShadow: '0 0 0 7px rgba(255,193,7,.16),0 30px 64px -26px rgba(255,138,0,.65)', duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });
    },
    // FAQ: answer eases open (details/summary keep working without JS)
    faq: function () {
      $$('.faq details').forEach(function (dt) {
        dt.addEventListener('toggle', function () {
          var a = dt.querySelector('summary ~ *'); if (dt.open && a) G.from(a, { autoAlpha: 0, y: -12, duration: .45, ease: 'power3.out', clearProps: 'all' });
        });
      });
    },
    // icon + arrow micro-motion on card hover (mouse only)
    hover: function () {
      if (!fine) return;
      $$('.card,.plan,.case,.pf,.outcome,.ind>div,.bento>a,.cc').forEach(function (c) {
        var i = $('.ico,.ci', c), m = $('.more', c);
        if (i) i.style.transition = 'background .3s,color .3s,box-shadow .3s';
        c.addEventListener('pointerenter', function () {
          if (i) G.to(i, { rotate: -10, scale: 1.14, duration: .45, ease: 'back.out(3)', overwrite: 'auto' });
          if (m) G.to(m, { x: 6, duration: .3, overwrite: 'auto' });
        });
        c.addEventListener('pointerleave', function () {
          if (i) G.to(i, { rotate: 0, scale: 1, duration: .4, ease: 'power3.out', overwrite: 'auto' });
          if (m) G.to(m, { x: 0, duration: .3, overwrite: 'auto' });
        });
      });
    },
    // popup: glass card rises out of a blur, fields cascade in, colour orbs drift behind it
    glass: function () {
      var m = $('.iq'); if (!m) return;
      ['o1', 'o2', 'o3'].forEach(function (k, i) {
        var o = d.createElement('i'); o.className = 'iq-orb ' + k; m.insertBefore(o, $('.iq-card', m));
        G.to(o, { x: (i % 2 ? -1 : 1) * 40, y: (i ? -1 : 1) * 34, scale: 1.18, duration: 4 + i * 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });
      var was = false;
      new MutationObserver(function () {
        var on = m.classList.contains('on');
        if (on && !was) {
          G.fromTo($('.iq-card', m), { y: 48, scale: .92, rotateX: 10, filter: 'blur(14px)', transformPerspective: 900 }, { y: 0, scale: 1, rotateX: 0, filter: 'blur(0px)', duration: .85, ease: 'expo.out', clearProps: 'transform,filter' });
          G.from($$('.iq-head > *, .iq-f, .iq-go', m), { autoAlpha: 0, y: 18, duration: .55, stagger: .06, delay: .2, ease: 'power3.out', clearProps: 'all' });
        }
        was = on;
      }).observe(m, { attributes: true, attributeFilter: ['class'] });
    },
    // page-to-page curtain (white, same as the preloader): parked below the screen, covers it on click; the next page's preloader takes over
    pages: function () {
      var o = d.createElement('div'); o.className = 'pt'; o.setAttribute('aria-hidden', 'true'); o.innerHTML = '<i></i>'; d.body.appendChild(o);
            G.set(o, { yPercent: 0 });
      d.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href]');
        if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
        var h = a.getAttribute('href') || '';
        if (!/^[a-z0-9-]+\.html(#.*)?$/i.test(h) || h.split('#')[0] === (location.pathname.split('/').pop() || 'index.html')) return;
        e.preventDefault(); 
        G.set(o, { yPercent: 0 }); G.to(o, { yPercent: -100, duration: .55, ease: 'power4.inOut', onComplete: function () { location.href = h; } });
        setTimeout(function () { location.href = h; }, 1400);
      });
      addEventListener('pageshow', function (e) { if (e.persisted) G.set(o, { yPercent: 0 }); });
    }
  };

  window.MN = { fx: fx, run: function (fn) { if (!ok) return; try { fn(fx); } catch (e) { if (window.console) console.warn('[moonnext]', e); } } };
  MN.run(function (f) { f.pages(); f.hover(); f.glass(); });
})();
