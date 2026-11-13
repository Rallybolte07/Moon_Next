/* MOONNEXT – inquiry system: enquiry dialog (opens from any [data-popup] button, or on exit-intent for desktop visitors once per 7 days), contact page form, service-page hero quick form (form.qf), newsletter.
   v12: every CTA button on the site opens this dialog (WhatsApp buttons were cut down to the floating button + footer link). Every lead goes to the Google Sheet with the page and button it came from in the Source column.
   v13: after a valid submit WhatsApp opens with the visitor's details typed into the page's own message (config WHATSAPP_ON_FORMS) while the lead is saved to the Sheet.
   WhatsApp works even before the Sheet is connected. If the Sheet cannot be reached the form still shows the WhatsApp message, so the lead is never lost.
   v11: the dialog no longer pops up on a 10 s timer. That timer locked the page in the middle of scrolling, which felt like a scroll bug.
   Success is shown ONLY after the Apps Script endpoint confirms the row was saved. */
(function () {
  'use strict';
  var d = document, C = window.MOONNEXT_CONFIG || {}, KEY = 'mn_iq', body = d.body, reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var onContact = /contact\.html$/.test(location.pathname);
  var slug = (location.pathname.split('/').pop() || 'index').replace(/\.html?$/i, '') || 'index';
  var PAGE_SV = { 'digital-marketing': 'Digital Marketing', 'seo': 'SEO', 'local-seo': 'Local SEO', 'social-media-marketing': 'Social Media Marketing', 'google-ads': 'Google Ads / PPC', 'meta-ads': 'Meta Ads', 'website-design': 'Website Design', 'website-development': 'Website Development', 'ecommerce-development': 'Ecommerce Development', 'content-marketing': 'Content Marketing', 'email-marketing': 'Email Marketing', 'graphic-design': 'Graphic Design & Branding' };
  var SV = ['Digital Marketing', 'SEO', 'Local SEO', 'Social Media Marketing', 'Google Ads / PPC', 'Meta Ads', 'Website Design', 'Website Development', 'Ecommerce Development', 'Content Marketing', 'Email Marketing', 'Graphic Design & Branding', 'Not sure yet'];
  var BU = ['Under ₹25,000 / month', '₹25,000 – ₹75,000 / month', '₹75,000+ / month', 'Not sure yet'];
  var $ = function (s, c) { return (c || d).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || d).querySelectorAll(s)); };
  var opt = function (a) { return a.map(function (x) { return '<option>' + x.replace(/&/g, '&amp;') + '</option>'; }).join(''); };
  var uid = function () { return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2); };
  var DAYS = 7;
  function seen() { try { var t = +localStorage.getItem(KEY); return !!t && Date.now() - t < DAYS * 864e5; } catch (e) { try { return !!sessionStorage.getItem(KEY); } catch (x) { return false; } } }
  function store() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) { try { sessionStorage.setItem(KEY, '1'); } catch (x) { /* storage blocked: the dialog may show again, harmless */ } } }

  function waNote() { return C.WHATSAPP_ON_FORMS === false ? '' : '<p class="iq-wn"><svg aria-hidden="true" focusable="false"><use href="#wa-i"/></svg>Your details also open in WhatsApp. Press Send there to reach us instantly.</p>'; }
  function fields(p) {
    var f = function (n, l, t, req, ac) { return '<div class="iq-f"><label for="' + p + n + '">' + l + (req ? ' <abbr title="required">*</abbr>' : '') + '</label><input id="' + p + n + '" name="' + n + '" type="' + t + '" autocomplete="' + ac + '"' + (req ? ' required aria-required="true"' : '') + ' aria-describedby="' + p + n + 'e"><span class="err" id="' + p + n + 'e" aria-live="polite"></span></div>'; };
    return f('name', 'Full name', 'text', 1, 'name') + f('email', 'Business email', 'email', 1, 'email') + f('phone', 'Phone number', 'tel', 1, 'tel') + f('company', 'Company name', 'text', 0, 'organization') +
      '<div class="iq-f"><label for="' + p + 'service">Service required <abbr title="required">*</abbr></label><select id="' + p + 'service" name="service" required aria-required="true"><option value="">Select a service</option>' + opt(SV) + '</select><span class="err" aria-live="polite"></span></div>' +
      '<div class="iq-f"><label for="' + p + 'budget">Budget range</label><select id="' + p + 'budget" name="budget"><option value="">Prefer not to say</option>' + opt(BU) + '</select></div>' +
      '<div class="iq-f full"><label for="' + p + 'message">Project requirements</label><textarea id="' + p + 'message" name="message" rows="3" maxlength="2000"></textarea></div>' +
      '<div class="iq-hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>' +
      '<div class="iq-f full iq-c"><label><input type="checkbox" name="consent" required> <span>I agree to MOONNEXT contacting me about this enquiry. <abbr title="required">*</abbr></span></label><span class="err" aria-live="polite"></span></div>' +
      '<div class="full"><button class="btn iq-go" type="submit"><span>Request a Consultation</span><i aria-hidden="true"></i></button><p class="iq-st" role="status" aria-live="polite"></p>' + waNote() + '</div>';
  }
  function check(form) {
    var ok = true, first = null;
    $$('input,select,textarea', form).forEach(function (f) {
      if (f.name === 'website') return;
      var v = f.type === 'checkbox' ? f.checked : f.value.trim(), m = '';
      if (f.required && !v) m = f.type === 'checkbox' ? 'Please confirm to continue.' : 'This field is required.';
      else if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) m = 'Enter a valid email address.';
      else if (f.type === 'tel' && v && !(/^\+?[0-9\s\-()]{10,18}$/.test(v) && v.replace(/\D/g, '').length >= 10 && v.replace(/\D/g, '').length <= 13)) m = 'Enter a valid phone number (10–13 digits).';
      f.setAttribute('aria-invalid', m ? 'true' : 'false'); var e = f.closest('.iq-f,div'); e = e && e.querySelector('.err'); if (e) e.textContent = m;
      if (m) { ok = false; first = first || f; }
    });
    if (first) first.focus(); return ok;
  }
  /* If the Sheet is not reachable, hand the visitor a prefilled WhatsApp message so the lead is not lost */
  function fallback(st, form) {
    try {
      var fd = new FormData(form), t = 'Hi MoonNext! I tried your website form but it could not save my details.\nName: ' + (fd.get('name') || '') + '\nPhone: ' + (fd.get('phone') || '') + (fd.get('service') || form.dataset.service ? '\nService: ' + (fd.get('service') || form.dataset.service) : '') + (fd.get('message') ? '\nMessage: ' + fd.get('message') : '');
      var a = d.createElement('a'); a.className = 'iq-fb'; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'Send these details on WhatsApp instead';
      a.href = window.MN_WA ? window.MN_WA.url(t) : 'https://wa.me/' + String(C.WHATSAPP_NUMBER || '919911764456').replace(/\D/g, '') + '?text=' + encodeURIComponent(t);
      st.appendChild(d.createElement('br')); st.appendChild(a);
    } catch (x) { /* optional helper */ }
  }
  function submit(form, source, onOk) {
    if (form._busy) return;
    var st = $('.iq-st', form), btn = $('.iq-go', form); st.className = 'iq-st'; st.textContent = '';
    if (!check(form)) return;
    var fd = new FormData(form), data = { id: form._id || (form._id = uid()), name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'), company: fd.get('company'), service: fd.get('service') || form.dataset.service || PAGE_SV[slug] || '', budget: fd.get('budget'), type: form.hasAttribute('data-quick') ? 'quick' : undefined, message: fd.get('message'), website: fd.get('website'), consent: !!fd.get('consent'), pageUrl: location.href, leadSource: source + (location.search.match(/utm_source=([^&]+)/) ? ' / utm:' + decodeURIComponent(RegExp.$1) : '') };
    /* WhatsApp first, inside the click (browsers allow a new tab only here), then the Sheet save runs alongside */
    var waUrl = (C.WHATSAPP_ON_FORMS !== false && window.MN_WA && window.MN_WA.lead) ? window.MN_WA.lead(data) : '', opened = false;
    if (waUrl) { try { var w = window.open(waUrl, '_blank'); opened = !!w; if (w) w.opener = null; } catch (x) { opened = false; } }
    if (!C.SHEETS_ENDPOINT) {
      if (waUrl) { onOk({ saved: false, wa: waUrl, opened: opened }); return; }
      st.className = 'iq-st bad'; st.textContent = 'The inquiry service is not connected yet, so nothing was sent. Your details are still here — please email websolutionkaran@gmail.com meanwhile.'; fallback(st, form); return;
    }
    form._busy = true; btn.disabled = true; btn.classList.add('ld'); btn.setAttribute('aria-busy', 'true');
    var ac = new AbortController(), t = setTimeout(function () { ac.abort(); }, 20000), done = false;
    fetch(C.SHEETS_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data), signal: ac.signal, redirect: 'follow', keepalive: true })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (j && j.ok === true) { form._id = null; done = true; onOk({ saved: true, wa: waUrl, opened: opened }); } else throw new Error((j && j.error) || 'Server error'); })
      .catch(function (e) {
        if (done) return;
        if (waUrl) { done = true; onOk({ saved: false, wa: waUrl, opened: opened }); return; }
        st.className = 'iq-st bad'; st.textContent = e.name === 'AbortError' ? 'The request timed out. Your details are kept — please try again.' : 'We could not save your enquiry' + (e.message && e.message !== 'Failed to fetch' ? ' (' + e.message + ')' : '') + '. Your details are kept — please try again.'; fallback(st, form);
      })
      .then(function () { clearTimeout(t); form._busy = false; btn.disabled = false; btn.classList.remove('ld'); btn.removeAttribute('aria-busy'); });
  }
  function thanks(form, r) {
    r = r || {}; var what = form.hasAttribute('data-quick') ? 'audit request' : 'enquiry';
    var h = '<div class="iq-ok full" role="status"><b>' + (r.saved || !r.wa ? 'Thank you — your ' + what + ' is saved.' : 'Almost done — send it on WhatsApp.') + '</b>';
    if (r.wa) h += '<p>' + (r.opened ? 'WhatsApp has opened with your details typed in. Press Send there to reach us instantly.' : 'Tap the button to open WhatsApp with your details typed in, then press Send.') + '</p><a class="btn wa-green iq-wab" href="' + r.wa.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '" target="_blank" rel="noopener noreferrer"><svg class="wa-ic" aria-hidden="true" focusable="false"><use href="#wa-i"/></svg>Send on WhatsApp</a>';
    form.innerHTML = h + '<p>We will reply within one working day.</p></div>';
  }

  /* Contact page form */
  var cf = $('#cform'); if (cf) { cf.innerHTML = fields('c-'); cf.addEventListener('submit', function (e) { e.preventDefault(); submit(cf, 'contact-page', function (r) { thanks(cf, r); }); }); }

  /* Service-page hero quick form (name + phone) -> same sheet */
  $$('form.qf').forEach(function (qf) { qf.addEventListener('submit', function (e) { e.preventDefault(); submit(qf, 'hero-form / ' + slug, function (r) { store(); thanks(qf, r); }); }); });

  /* Dialog */
  if (!onContact) {
    var m = d.createElement('div'), last = null, tm;
    m.className = 'iq'; m.hidden = true;
    m.innerHTML = '<div class="iq-bg" data-x></div><div class="iq-card" role="dialog" aria-modal="true" aria-labelledby="iqt" aria-describedby="iqd"><button class="iq-x" type="button" data-x aria-label="Close enquiry form">×</button><div class="iq-head"><span class="pill"><i></i>Free consultation</span><h2 id="iqt">Let’s plan your next stage of growth</h2><p id="iqd">Tell us about your goals — we reply within one working day.</p></div><form novalidate class="iq-form">' + fields('q-') + '</form><a class="iq-wa" data-wa href="https://wa.me/' + ((C.WHATSAPP_NUMBER) || '919911764456') + '" target="_blank" rel="noopener noreferrer"><svg aria-hidden="true" focusable="false"><use href="#wa-i"/></svg>Prefer WhatsApp? Chat with us now</a></div>';
    body.appendChild(m);
    var form = $('form', m), card = $('.iq-card', m), src = 'popup-manual';
    form.addEventListener('submit', function (e) { e.preventDefault(); submit(form, src, function (r) { store(1); thanks(form, r); setTimeout(close, r && r.wa ? 12000 : 3200); }); });
    var open = function (s, svc, msg) {
      if (!m.hidden) return; src = s; last = d.activeElement; m.hidden = false;
      var bg = $('.burger[aria-expanded="true"]'); if (bg) bg.click();
      svc = svc || PAGE_SV[slug];
      if (msg) { var tx = $('[name=message]', form); if (tx) tx.value = msg; }
      var sw = innerWidth - d.documentElement.clientWidth; body.style.paddingRight = sw + 'px'; body.classList.add('gm-lock');
      if (svc) { var sel = $('[name=service]', form); if (sel) sel.value = svc; }
      requestAnimationFrame(function () { m.classList.add('on'); var f = $('input', form); if (f) f.focus({ preventScroll: true }); });
    };
    var close = function () { if (m.hidden) return; store(1); m.classList.remove('on'); setTimeout(function () { m.hidden = true; body.classList.remove('gm-lock'); body.style.paddingRight = ''; if (last && last.focus) last.focus(); }, reduce ? 0 : 320); };
    m.addEventListener('mousedown', function (e) { if (e.target.hasAttribute('data-x') || e.target.closest('.iq-x')) close(); });
    d.addEventListener('keydown', function (e) {
      if (m.hidden) return; if (e.key === 'Escape') return close(); if (e.key !== 'Tab') return;
      var f = $$('button,input,select,textarea,a[href]', card).filter(function (x) { return !x.disabled && !x.closest('.iq-hp') && x.offsetParent; }), a = f[0], z = f[f.length - 1];
      if (e.shiftKey && d.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && d.activeElement === z) { e.preventDefault(); a.focus(); }
    });
    d.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-popup],a.btn[href="contact.html"]');
      if (!t || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; e.preventDefault(); e.stopImmediatePropagation(); open('popup / ' + slug + ' / ' + (t.getAttribute('aria-label') || t.textContent || 'button').replace(/\s+/g, ' ').trim().slice(0, 40), t.dataset.popupService, t.dataset.popupMsg);
    }, true); /* capture: runs before the page-transition link handler */
    /* Exit-intent (mouse leaves through the top edge) for desktop only, after 15 s on the page, once per 7 days. Never on touch devices. */
    if (!seen() && matchMedia('(hover:hover) and (pointer:fine)').matches) {
      var t0 = Date.now();
      d.documentElement.addEventListener('mouseleave', function (e) {
        if (e.clientY > 0 || Date.now() - t0 < 15000 || seen()) return;
        var a = d.activeElement; if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) return;
        if (body.classList.contains('lock')) return;
        open('popup-exit / ' + slug);
      });
    }
  }

  /* On the contact page the form is already there: [data-popup] buttons scroll to it instead of opening a dialog */
  if (onContact && cf) d.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-popup],a.btn[href="contact.html"]');
    if (!t || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var bg = $('.burger[aria-expanded="true"]'); if (bg) bg.click();
    cf.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    var f = $('input', cf); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, reduce ? 0 : 500);
  }, true);

  /* Newsletter → same sheet (email only) */
  var nl = $('.nl'); if (nl) nl.addEventListener('submit', function (e) {
    e.preventDefault(); e.stopImmediatePropagation(); var i = $('input', nl), b = $('button', nl);
    i.addEventListener('input', function () { i.setCustomValidity(''); });
    if (!i.value || !i.checkValidity()) return i.reportValidity();
    if (!C.SHEETS_ENDPOINT) { i.setCustomValidity('Service not connected yet'); return i.reportValidity(); } i.setCustomValidity('');
    b.disabled = true; fetch(C.SHEETS_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ id: uid(), type: 'newsletter', email: i.value, consent: true, pageUrl: location.href, leadSource: 'footer-newsletter' }) })
      .then(function (r) { return r.json(); }).then(function (j) { if (!j.ok) throw 0; nl.innerHTML = '<p>Thanks — you are subscribed.</p>'; }).catch(function () { b.disabled = false; i.setCustomValidity('Could not subscribe. Try again.'); i.reportValidity(); i.setCustomValidity(''); });
  }, true);
})();
