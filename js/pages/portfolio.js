/* MOONNEXT — portfolio.html page script */
MN.run(function (fx) {
  fx.headings();fx.stagger('.fbtn');
});

/* Project preview: opens the full screenshot in a dialog. Arrow keys / Esc work; only cards visible under the current filter are cycled. */
(function () {
  var d = document, body = d.body, links = [].slice.call(d.querySelectorAll('a.pf-media[data-lb]'));
  if (!links.length) return;
  var lb = d.createElement('div'); lb.className = 'lb'; lb.hidden = true;
  lb.innerHTML = '<div class="lb-bg" data-x></div><button class="lb-x" type="button" data-x aria-label="Close preview">×</button><button class="lb-n prev" type="button" aria-label="Previous project">←</button><button class="lb-n next" type="button" aria-label="Next project">→</button><figure class="lb-fig" role="dialog" aria-modal="true" aria-label="Project preview"><img alt=""><figcaption class="lb-cap"><div><b></b><span></span></div><a class="btn" data-popup data-popup-service="Website Design" href="contact.html">Get a website like this</a></figcaption></figure>';
  body.appendChild(lb);
  var img = lb.querySelector('img'), nm = lb.querySelector('b'), ds = lb.querySelector('span'), cta = lb.querySelector('.lb-cap .btn'), cur = null, last = null, reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  function vis() { return links.filter(function (a) { var c = a.closest('.pf'); return c && !c.classList.contains('hide'); }); }
  function show(a) {
    cur = a; img.src = a.getAttribute('href'); img.alt = a.dataset.name + ' website design, full size';
    nm.textContent = a.dataset.name; ds.textContent = 'Website Design · ' + a.dataset.desc;
    cta.setAttribute('data-popup-msg', 'Hi MoonNext! I saw the ' + a.dataset.name + ' website in your portfolio and I would like something similar for my business. Can we discuss it?');
    var multi = vis().length > 1; lb.querySelector('.prev').hidden = lb.querySelector('.next').hidden = !multi;
  }
  function step(n) { var v = vis(), i = v.indexOf(cur); if (i < 0 || v.length < 2) return; show(v[(i + n + v.length) % v.length]); }
  function open(a) { last = d.activeElement; show(a); lb.hidden = false; body.classList.add('gm-lock'); requestAnimationFrame(function () { lb.classList.add('on'); lb.querySelector('.lb-x').focus({ preventScroll: true }); }); }
  function close() { lb.classList.remove('on'); setTimeout(function () { lb.hidden = true; img.removeAttribute('src'); body.classList.remove('gm-lock'); if (last && last.focus) last.focus({ preventScroll: true }); }, reduce ? 0 : 350); }
  /* the enquiry dialog opens from this button: close the preview first (runs before the dialog's own click handler) */
  d.addEventListener('click', function (e) { if (!lb.hidden && e.target.closest && e.target.closest('.lb-cap [data-popup]')) { last = null; close(); } }, true);
  links.forEach(function (a) { a.addEventListener('click', function (e) { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; e.preventDefault(); open(a); }); });
  lb.addEventListener('click', function (e) { if (e.target.closest('[data-x]')) close(); else if (e.target.closest('.prev')) step(-1); else if (e.target.closest('.next')) step(1); });
  d.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') step(-1); else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'Tab') { var f = [].slice.call(lb.querySelectorAll('button,a[href]')).filter(function (x) { return !x.hidden && x.offsetParent; }), a = f[0], z = f[f.length - 1]; if (e.shiftKey && d.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && d.activeElement === z) { e.preventDefault(); a.focus(); } }
  });
})();
