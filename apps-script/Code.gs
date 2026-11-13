/**
 * MOONNEXT - lead capture -> Google Sheet
 * Receives every lead form on the website: the popup (enquiry) form that all CTA buttons open, the contact-page form,
 * the quick form in the hero of the 12 service pages, and the footer newsletter form.
 * The "Source" column shows where a lead came from, e.g. "hero-form / seo", "popup / pricing / Request a Proposal", "contact-page".
 *
 * SETUP (one time, ~3 minutes)
 *  1. Open your Google Sheet -> Extensions -> Apps Script, delete the sample code and paste this whole file. Save.
 *  2. Deploy -> New deployment -> gear icon -> "Web app".  Execute as: Me.  Who has access: Anyone.  Deploy.
 *  3. Click Authorize access -> choose your account -> Advanced -> "Go to project" -> Allow.
 *  4. Copy the Web app URL (ends with /exec) and paste it into js/config.js as SHEETS_ENDPOINT.
 *  After you ever change this code: Deploy -> Manage deployments -> pencil -> Version: New version -> Deploy.
 */
var SHEET_ID = '1HyFTU3qNKM1O5hqE9FFkxISk08U7qyzDeoNTMNha1bc';
var LEADS_GID = 0;                 // first tab of the sheet (gid=0 in its URL)
var NEWSLETTER_TAB = 'Newsletter'; // created automatically
var TZ = 'Asia/Kolkata';
var LEAD_HEAD = ['Date & time', 'Lead ID', 'Name', 'Email', 'Phone', 'Company', 'Service', 'Budget', 'Message', 'Consent', 'Source', 'Page URL'];
var NEWS_HEAD = ['Date & time', 'Lead ID', 'Email', 'Consent', 'Source', 'Page URL'];

function doPost(e) {
  var lock = LockService.getScriptLock(), locked = false;
  try {
    var b = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (clean(b.website)) return reply({ ok: true });                       // honeypot filled = bot: pretend success, save nothing
    var news = b.type === 'newsletter', quick = b.type === 'quick', email = clean(b.email);
    var okMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    if ((!quick && !okMail) || (quick && email && !okMail)) return reply({ ok: false, error: 'Invalid email' });   // the short hero form has no email field
    if (!news && (!clean(b.name) || !clean(b.phone))) return reply({ ok: false, error: 'Name and phone are required' });
    lock.waitLock(15000); locked = true;
    var ss = SpreadsheetApp.openById(SHEET_ID), id = clean(b.id), when = Utilities.formatDate(new Date(), TZ, 'dd MMM yyyy, HH:mm:ss');
    var sh = news ? tab(ss, NEWSLETTER_TAB, NEWS_HEAD) : leads(ss);
    if (id && sh.getLastRow() > 1 && sh.getRange(2, 2, sh.getLastRow() - 1, 1).createTextFinder(id).matchEntireCell(true).findNext()) return reply({ ok: true }); // double-click / retry
    var row = news ? [when, id, email, b.consent ? 'Yes' : 'No', clean(b.leadSource), clean(b.pageUrl)]
      : [when, id, clean(b.name), email, clean(b.phone), clean(b.company), clean(b.service), clean(b.budget), clean(b.message), b.consent ? 'Yes' : 'No', clean(b.leadSource), clean(b.pageUrl)];
    var r = sh.getLastRow() + 1, rng = sh.getRange(r, 1, 1, row.length);
    rng.setNumberFormat('@'); rng.setValues([row]);                          // plain text: keeps +91 / leading zeros, and stops "=formula" injection
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: 'Server error' });
  } finally { if (locked) lock.releaseLock(); }
}
function doGet() { return reply({ ok: true, service: 'MOONNEXT lead endpoint' }); }

function leads(ss) {
  var sh = null, all = ss.getSheets();
  for (var i = 0; i < all.length; i++) if (all[i].getSheetId() === LEADS_GID) sh = all[i];
  sh = sh || all[0];
  if (sh.getLastRow() === 0) head(sh, LEAD_HEAD);
  return sh;
}
function tab(ss, name, headers) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) head(sh, headers);
  return sh;
}
function head(sh, h) { sh.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight('bold').setBackground('#FFF1BF'); sh.setFrozenRows(1); }
function clean(v) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, 2000); }
function reply(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
