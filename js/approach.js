/* MOONNEXT – "Our approach" section on the home page (.ap).
   While you scroll, the step in the middle of the screen becomes active: its card lights up, the moon travels round the orbit to its marker
   and the number / label in the middle change. A line down the side fills as you read. No GSAP needed, so it also works with reduced motion
   (the CSS turns the movement off then). */
(function () {
  'use strict';
  var ap = document.querySelector('.ap'); if (!ap) return;
  var steps = [].slice.call(ap.querySelectorAll('.ap-step')), dots = [].slice.call(ap.querySelectorAll('.ap-dot')),
      num = ap.querySelector('[data-ap-num]'), lab = ap.querySelector('[data-ap-label]'),
      fill = ap.querySelector('.ap-line i'), list = ap.querySelector('.ap-steps'), cur = -1;
  function set(i) {
    if (i < 0 || i === cur) return; cur = i;
    ap.style.setProperty('--ap-a', (i * 90) + 'deg');
    steps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    dots.forEach(function (d, k) { d.classList.toggle('on', k <= i); });
    if (num) num.textContent = '0' + (i + 1);
    if (lab) lab.textContent = steps[i].getAttribute('data-label') || '';
  }
  set(0);
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) set(steps.indexOf(e.target)); }); }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    steps.forEach(function (s) { io.observe(s); });
  }
  var tick = false;
  function upd() {
    tick = false; if (!fill || !list) return;
    var r = list.getBoundingClientRect(), p = (innerHeight * .6 - r.top) / Math.max(1, r.height);
    fill.style.transform = 'scaleY(' + Math.max(0, Math.min(1, p)) + ')';
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  addEventListener('resize', upd); upd();
})();
