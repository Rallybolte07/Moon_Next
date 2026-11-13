/* MOONNEXT v15 — always-on looping motion (GSAP + Lottie). Runs even when the OS has "reduce motion" on. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  function lottieJSON() {   // hand-built Lottie: pulsing moon + 3 orbiting dots + breathing ring (300x300, 4s loop)
    const k = v => ({ a: 0, k: v });
    const anim = (kf) => ({ a: 1, k: kf.map(([t, s], i) => ({ t, s, i: { x: [.5], y: [1] }, o: { x: [.5], y: [0] } })) });
    const tr = { ty: 'tr', p: k([0, 0]), a: k([0, 0]), s: k([100, 100]), r: k(0), o: k(100) };
    const el = (w, h, x = 0, y = 0) => ({ ty: 'el', p: k([x, y]), s: k([w, h]) });
    const fl = c => ({ ty: 'fl', c: k(c), o: k(100) }), st = (c, w) => ({ ty: 'st', c: k(c), o: k(100), w: k(w), lc: 2, lj: 2 });
    const L = (ind, ks, shapes) => ({ ty: 4, ind, ip: 0, op: 240, st: 0, sr: 1, ks: Object.assign({ o: k(100), r: k(0), p: k([150, 150, 0]), a: k([0, 0, 0]), s: k([100, 100, 100]) }, ks), shapes: [{ ty: 'gr', it: shapes.concat([tr]) }] });
    const spin = (d) => ({ r: anim([[0, [0]], [240, [d]]]) });
    return { v: '5.7.0', fr: 60, ip: 0, op: 240, w: 300, h: 300, nm: 'moonnext', ddd: 0, assets: [], layers: [
      L(1, spin(360), [el(26, 26, 0, -125), fl([.133, .827, .933, 1])]),
      L(2, spin(-360), [el(20, 20, 0, 95), fl([1, .435, .694, 1])]),
      L(3, { r: anim([[0, [120]], [240, [480]]]) }, [el(22, 22, 0, -70), fl([.427, .29, 1, 1])]),
      L(4, { s: anim([[0, [90, 90, 100]], [120, [112, 112, 100]], [240, [90, 90, 100]]]) }, [el(110, 110), st([1, .757, .027, 1], 6)]),
      L(5, { s: anim([[0, [100, 100, 100]], [120, [112, 112, 100]], [240, [100, 100, 100]]]) }, [el(62, 62), fl([1, .757, .027, 1])]),
      L(6, { s: anim([[0, [100, 100, 100]], [240, [100, 100, 100]]]) }, [el(250, 250), st([.427, .29, 1, .35], 2)])
    ] };
  }
  function boot() {
    const g = window.gsap;
    // ---- Lottie badges ----
    if (window.lottie) {
      ['.hvw', '.page-hero'].forEach(sel => { const h = $(sel); if (!h || $('.lot', h)) return; const d = document.createElement('div'); d.className = 'lot'; d.setAttribute('aria-hidden', 'true'); h.appendChild(d);
        try { window.lottie.loadAnimation({ container: d, renderer: 'svg', loop: true, autoplay: true, animationData: lottieJSON() }); } catch (e) { d.remove(); } });
    }
    if (!g) return;
    // ---- Home graph: draw -> ride the dot -> hold -> fade -> repeat ----
    const l1 = $('.hv-ch .ln1'), l2 = $('.hv-ch .ln2'), ar = $('.hv-ch .ar'), dt = $('.hv-ch .dt'), dt2 = $('.hv-ch .dt2');
    if (l1 && dt) {
      [l1, l2, ar, dt, dt2].forEach(e => e && (e.style.animation = 'none'));
      const len = l1.getTotalLength(), P = { p: 0 };
      const put = () => { const pt = l1.getPointAtLength(P.p * len); dt.setAttribute('cx', pt.x); dt.setAttribute('cy', pt.y); dt2.setAttribute('cx', pt.x); dt2.setAttribute('cy', pt.y); };
      g.set([l1, l2], { strokeDashoffset: 1, opacity: 1 }); g.set(ar, { opacity: 0 }); g.set([dt, dt2], { opacity: 0 });
      const tl = g.timeline({ repeat: -1, repeatDelay: .4 });
      tl.set([dt, dt2], { opacity: 1 }).to(l1, { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut' }, 0)
        .to(l2, { strokeDashoffset: 0, duration: 3, ease: 'power2.inOut' }, .3).to(P, { p: 1, duration: 2.6, ease: 'power2.inOut', onUpdate: put }, 0)
        .to(ar, { opacity: 1, duration: 1.2 }, 1.4).to(dt2, { attr: { r: 20 }, opacity: .1, duration: .9, repeat: 3, yoyo: true }, 2.6)
        .to([l1, l2, ar, dt, dt2], { opacity: 0, duration: .7 }, 5.8).set(l1, { strokeDashoffset: 1 }).set(l2, { strokeDashoffset: 1 }).set(P, { p: 0, onComplete: put }).set([l1, l2], { opacity: 1 });
      put();
    }
    // ---- Endless float / breathe loops ----
    $$('.chip').forEach((c, i) => g.to(c, { y: i % 2 ? 12 : -12, x: i === 1 ? 8 : -6, rotation: i % 2 ? -2 : 2, duration: 2.4 + i * .5, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    $$('.hv-orb').forEach(o => { o.style.animation = 'none'; g.to(o, { rotation: 360, duration: 40, ease: 'none', repeat: -1 }); g.to(o, { scale: 1.08, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }); });
    $$('.mmoon').forEach(m => { m.style.animation = 'none'; g.to(m, { y: -16, scale: 1.05, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }); });
    $$('.morb').forEach(m => g.to(m, { y: -10, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    $$('.decor i').forEach((b, i) => g.to(b, { x: i % 2 ? -60 : 60, y: i === 1 ? 40 : -40, scale: 1.2, duration: 7 + i * 2, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    $$('.hv-b span').forEach((b, i) => { b.style.animation = 'none'; const s = +b.style.getPropertyValue('--s') || 1; g.fromTo(b, { scaleY: .25 }, { scaleY: s, duration: 1.2, delay: i * .1, ease: 'sine.inOut', yoyo: true, repeat: -1, repeatDelay: .3 }); });
    $$('.bento .ico, .trust svg, .svc-chip, .ind').forEach((e, i) => { e.style.animation = 'none'; g.to(e, { y: -6, duration: 1.8 + (i % 4) * .3, delay: (i % 5) * .2, ease: 'sine.inOut', yoyo: true, repeat: -1 }); });
    /* v14: the logo used to swing +-8deg forever (header and footer looked crooked). It now stays still and straight. */
  }
  const go = () => { if (document.readyState === 'complete') setTimeout(boot, 300); else addEventListener('load', () => setTimeout(boot, 300)); };
  go();
})();
