MOONNEXT website - folder structure
  *.html                20 pages (index, about, 12 service pages, portfolio, case-studies, pricing, blog, faq, contact)
  assets/logo/          moonnext-logo.png (for light backgrounds), moonnext-logo-light.png (for dark backgrounds), favicon.png, apple-touch-icon.png
  css/global.css        shared: tokens, header, footer, buttons, forms, preloader, glass popup, hover colour system
  css/services.css      hero v2 of the 12 service pages (dark hero + quick lead form that saves to the Google Sheet)
  css/enhance.css       site-wide: project-card enquiry button, WhatsApp bits of the forms, and the styles of the extra content blocks (xs-*)
  css/pages/<page>.css  styles used by that page only (+ that page's hover palette; index.css also holds the home-page colour layer)
  js/global.js          shared: menu, preloader (runs on every page), scroll UI, reveals, counters, pointer effects
  js/animations.js      shared GSAP layer (heading wipes, stagger, hover micro-motion, glass popup motion, page-transition curtain)
  js/pages/<page>.js    GSAP effects chosen for that page
  js/vendor/            gsap.min.js + ScrollTrigger.min.js (3.12.5)
  apps-script/Code.gs   Google Sheet lead receiver (setup steps are in its header) - paste it in Extensions > Apps Script of your sheet
  js/config.js          SHEETS_ENDPOINT = your Google Apps Script /exec URL (form leads). WHATSAPP_NUMBER = number for every WhatsApp button. WHATSAPP_MESSAGES = the ready-typed message for each page (edit the text freely).
  js/whatsapp.js        WhatsApp click-to-chat, now only on the floating green button + the footer link (+ contact-page card). Any element with data-wa opens wa.me/<number> with that page's message
  js/approach.js        home page "Our approach" section: the step in the middle of the screen lights up, the moon moves round the orbit, a progress line fills
  js/scroll-fx.js       scroll-triggered animation on every page: word-fill text (data-fill), card + image parallax, dark sections unfolding, marquees that speed up with your scroll, hero depth, footer cascade, pop-in icons (data-pop). Off for prefers-reduced-motion.
  js/inquiry.js         every CTA button (data-popup) opens the enquiry popup; contact form, hero quick form (form.qf) and popup all post to the Google Sheet. data-popup-service / data-popup-msg preselect the service and prefill the message. The Source column in the sheet shows page + button.
  css/whatsapp.css      floating WhatsApp button + WhatsApp icon styles
  assets/projects/      the 6 project screenshots (S3M Ayurveda, RKCE, Active Bone & Joint, AVS Financial, RealKeeper, Brit Lifesciences) in 640w + 1200w WebP
Open index.html in a browser (or upload the folder to hosting). Fonts and Lottie load from the internet.


GOOGLE SHEET (leads): follow SETUP-GOOGLE-SHEET.txt. Nothing is saved until you deploy apps-script/Code.gs and paste its /exec URL into js/config.js (SHEETS_ENDPOINT). Until then the forms show a clear 'not connected' message and offer a prefilled WhatsApp message instead, so no lead is silently lost.

WHATSAPP ON FORMS: after a valid submit (popup, contact page, service-page hero form) WhatsApp opens to the number in js/config.js with this page's ready-typed message plus the visitor's name, phone, email, service and message. It works even before the Google Sheet is connected. Switch it off with WHATSAPP_ON_FORMS: false in js/config.js. The newsletter box stays email-only.

HOME PAGE: the "Featured projects" section was removed from index.html and replaced by "Our approach" (id="approach"). The projects are still on portfolio.html.
LOGO: js/loops.js no longer swings the logo +-8 degrees, so header and footer logos stay straight.
