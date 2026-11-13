/* MOONNEXT – WhatsApp click-to-chat (shared, loads on every page).
   Any element with the data-wa attribute becomes a WhatsApp link that opens a chat with WHATSAPP_NUMBER (js/config.js)
   with a ready-typed message for the page the visitor is on. A button can carry its own text in data-wa-msg
   (project cards, pricing plans). Links are filled in on load AND again at click time, so buttons added later
   (popup, project preview) work too. No API key needed: this uses WhatsApp's official wa.me link. */
(function () {
  'use strict';
  var d = document, C = window.MOONNEXT_CONFIG || {};
  var NUM = String(C.WHATSAPP_NUMBER || '919911764456').replace(/\D/g, '');
  var slug = (location.pathname.split('/').pop() || 'index').replace(/\.html?$/i, '') || 'index';
  var base = (C.WHATSAPP_MESSAGES && C.WHATSAPP_MESSAGES[slug]) || C.WHATSAPP_DEFAULT || 'Hi MoonNext!';
  var web = /^https?:$/.test(location.protocol);

  function url(msg) {
    var t = msg || base;
    if (web) t += '\n\nSent from: ' + location.origin + location.pathname;
    return 'https://wa.me/' + NUM + '?text=' + encodeURIComponent(t);
  }
  function wire(el) {
    el.setAttribute('href', url(el.getAttribute('data-wa-msg')));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  }
  [].forEach.call(d.querySelectorAll('[data-wa]'), wire);

  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-wa]');
    if (!a) return;
    wire(a);
    try { if (window.gtag) window.gtag('event', 'whatsapp_click', { page: slug, label: (a.textContent || '').trim().slice(0, 40) }); } catch (x) { /* analytics is optional */ }
  }, true);

  /* Form leads: the page's ready-typed message on top, the visitor's details underneath (WhatsApp bold = *text*).
     If the visitor's own message already starts with "Hi MoonNext" (project cards, pricing plans) it becomes the opening line. */
  function lead(d) {
    var own = /^hi moonnext/i.test(d.message || '');
    var rows = [['Name', d.name], ['Phone', d.phone], ['Email', d.email], ['Company', d.company], ['Service', d.service], ['Budget', d.budget], ['Message', own ? '' : d.message]]
      .filter(function (r) { return r[1]; })
      .map(function (r) { return '*' + r[0] + ':* ' + String(r[1]).replace(/\s+/g, ' ').trim(); });
    return url((own ? d.message : base) + '\n\n' + rows.join('\n'));
  }
  window.MN_WA = { url: url, lead: lead, number: NUM, page: slug };
})();
