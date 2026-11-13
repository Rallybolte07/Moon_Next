/* MOONNEXT site settings.
   SHEETS_ENDPOINT: paste your deployed Google Apps Script Web App URL (ends in /exec). See apps-script/Code.gs header.
   WHATSAPP_NUMBER: country code + number, digits only (no + or spaces). Every WhatsApp button on the site uses it.
   WHATSAPP_ON_FORMS: true = after every form (popup, contact page, service-page hero form) WhatsApp opens with the visitor's details typed into this page's message; set false to switch it off.
   WHATSAPP_MESSAGES: the ready-typed message each page opens in WhatsApp. Edit the text freely, keep the page name on the left. */
window.MOONNEXT_CONFIG = {
  SHEETS_ENDPOINT: '',
  WHATSAPP_NUMBER: '919911764456',
  WHATSAPP_ON_FORMS: true,
  WHATSAPP_DEFAULT: 'Hi MoonNext! I found your website and would like to talk about growing my business online.',
  WHATSAPP_MESSAGES: {
    'index': 'Hi MoonNext! I came across your website and I would like a free consultation to grow my business online. Can we talk?',
    'about': 'Hi MoonNext! I read about your team on the About page and would like to discuss working together on my digital marketing.',
    'digital-marketing': 'Hi MoonNext! I am interested in your Digital Marketing services. Please share how you would plan SEO, ads and social media for my business.',
    'seo': 'Hi MoonNext! I want my business to rank higher on Google. Please share your SEO plan and a free audit of my website.',
    'local-seo': 'Hi MoonNext! I want more local customers from Google Maps and "near me" searches. Can you help me with Local SEO?',
    'social-media-marketing': 'Hi MoonNext! I am interested in Social Media Marketing. Please share your packages for content and page growth.',
    'google-ads': 'Hi MoonNext! I want to run Google Ads to get more leads. Please tell me how you would set up and manage my campaigns.',
    'meta-ads': 'Hi MoonNext! I would like to run Facebook and Instagram ads. Please share how you would plan and manage Meta Ads for my business.',
    'website-design': 'Hi MoonNext! I need a new website design. Please share your process, timeline and pricing.',
    'website-development': 'Hi MoonNext! I need a website developed. Can we discuss my requirements?',
    'ecommerce-development': 'Hi MoonNext! I want to launch or improve my online store. Please share how you would build my ecommerce website.',
    'content-marketing': 'Hi MoonNext! I am interested in Content Marketing. Please share how you would plan blogs and content for my brand.',
    'email-marketing': 'Hi MoonNext! I would like to start Email Marketing for my business. Please share your plans and what you would set up.',
    'graphic-design': 'Hi MoonNext! I need Graphic Design and Branding help (logo, creatives, brand identity). Can we discuss it?',
    'portfolio': 'Hi MoonNext! I saw your portfolio and I would like a website like the ones you have built. Can we discuss my project?',
    'case-studies': 'Hi MoonNext! I read your case studies and I want similar results for my business. Can we talk?',
    'pricing': 'Hi MoonNext! I saw your pricing page and I would like help choosing the right plan for my business.',
    'blog': 'Hi MoonNext! I read your blog and I would like advice on growing my business online. Can we talk?',
    'faq': 'Hi MoonNext! I read your FAQ and I still have a question about your services. Can you help?',
    'contact': 'Hi MoonNext! I am contacting you from your website and would like to discuss my project.'
  }
};
