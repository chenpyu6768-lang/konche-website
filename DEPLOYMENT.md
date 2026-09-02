# KONCHE Website — Deployment & Release Guide

## Inquiry form backend (added 2026-08-27)

All three site forms now submit directly to a Cloudflare Worker
(`https://konche-form.chenpyu6768.workers.dev`) with mailto as the automatic fallback.
The Worker source, D1 schema and step-by-step setup live in
`../konche-platform/form-worker/` (see `README-部署指南.md`; repo-level
handoff notes in `../konche-platform/HANDOFF.md`). Key points:

- Submission flow, upload validation and admin endpoints are covered by
  `node tests/worker-smoke.mjs` (run from the project root; must pass 10/10).
- The Worker URL is whitelisted in every page's CSP meta tag
  (`connect-src`) and in `_headers`. If the Worker URL changes, update:
  `API_BASE` in `app/site-enhancements.js`, the CSP meta in all 27 pages,
  and `_headers`.
- After deploying the Worker, verify end-to-end: submit the contact form,
  confirm the success card with a KON-xxxxxx reference, then check
  `/api/submissions?token=<ADMIN_TOKEN>`.

This guide closes the operations-side items from the 2026-08-14 site audit
(`outputs/.../Konche123网站问题整改清单_开发交付版_2026-08-14.xlsx`): KON-003
(domain redirect), KON-004 (llms.txt serving), KON-001 (old-URL redirects),
KON-008 (release process), KON-021 (search-platform submission).

## Release package contents

- 33 physical HTML files: 26 indexable pages, six noindex legacy stubs, and 404.html.
- Public canonical URLs are suffixless. Keep the physical `.html` files because the
  web server resolves clean requests to them and redirects legacy `.html` requests.
- `app/` styles, fonts, logo and the 1200×630 Open Graph image.
- `robots.txt`, `sitemap.xml` (26 clean URLs), `llms.txt`, `llms-full.txt`.
- `tools/validate-clean-urls.mjs` — dependency-free Node validation (Node ≥ 18).

## Pre-deploy checklist

1. Run `node tools/validate-clean-urls.mjs`; it must exit 0.
2. Confirm the release only changes URL/SEO signals unless page-content changes
   were separately approved.
3. Keep all physical `.html` files and the server-side `.html` compatibility redirects.
4. Record the release version and date in `VERSION.md` before uploading.

## Nginx configuration (KON-003, KON-004, KON-001)

```nginx
# --- 1. Single canonical host (KON-003) ------------------------------------
# Merge http/https and www/non-www into https://www.konchewater.com.
# Keep the original request path but never append a second slash (audit found
# konchewater.com → https://www.konchewater.com// → 404).
server {
  listen 80;
  listen 443 ssl;
  server_name konchewater.com;            # bare domain only
  return 301 https://www.konchewater.com$request_uri;
}

server {
  listen 80;
  server_name www.konchewater.com;
  return 301 https://www.konchewater.com$request_uri;
}

# --- 2. Main site ------------------------------------------------------------
server {
  listen 443 ssl;
  server_name www.konchewater.com;
  root /var/www/konche;                 # upload the whole package here
  index index.html;

  # KON-004: serve AI index files as UTF-8 text BEFORE any SPA/history fallback.
  location = /llms.txt     { default_type text/plain; charset utf-8; add_header Cache-Control "public, max-age=3600"; }
  location = /llms-full.txt{ default_type text/plain; charset utf-8; add_header Cache-Control "public, max-age=3600"; }
  location = /robots.txt   { default_type text/plain; charset utf-8; }
  location = /sitemap.xml  { default_type application/xml; charset utf-8; }

  # KON-001: old article URLs must not 404 silently. One-to-one 301s to the
  # current equivalents (adjust the right-hand side if /tech/ pages change).
  # Keep these regex locations before the general .html rule below.
  location ~ ^/news/article-00(1|2|3|4|5|6|7)\.html$ { return 301 /tech/article-00$1; }
  location ~ ^/news/article-00(8|9)\.html$           { return 301 /faq/article-00$1; }
  location ~ ^/news/article-01(0|1|2)\.html$         { return 301 /faq/article-00$1; }
  # If a /tech/ or /faq/ target itself does not exist yet, temporarily redirect
  # to the homepage Knowledge section instead of leaving a 404 in the sitemap.

  # Known legacy aliases redirect directly to their final clean URL.
  location = /products/single-stage-ro.html { return 308 /products/single-double-stage-ro; }
  location = /products/double-stage-ro.html { return 308 /products/single-double-stage-ro; }
  location = /products/laboratory-ultrapure-water-equipment.html { return 308 /products/laboratory-ultrapure-water-system; }
  location = /products/edi-ultrapure-water-system.html { return 308 /products/industrial-ultrapure-water-system; }
  location = /products/pharmaceutical-purified-water-system.html { return 308 /products/industrial-ultrapure-water-system; }
  location = /products/deionized-water-system.html { return 308 /products/industrial-ultrapure-water-system; }

  # One canonical public URL: legacy .html requests make one hop to suffixless.
  location = /index.html { return 308 /; }
  location ~ ^(.+)\.html$ { return 308 $1; }

  # Long-lived caching for assets.
  location /app/ { add_header Cache-Control "public, max-age=31536000, immutable"; }

  gzip on;
  gzip_types text/plain text/css application/xml application/json image/svg+xml;

  # Resolve a clean public URL to its physical .html file without exposing it.
  # Exact and regex redirect locations above take precedence.
  location / { try_files $uri $uri.html $uri/ =404; }

  add_header X-Content-Type-Options nosniff;
}
```

Also configure TLS certificates for both hostnames so the bare-domain 301 works
over HTTPS (HSTS can be enabled after both hosts serve TLS correctly).

## Post-deploy verification (KON-008)

1. Run `node tools/validate-clean-urls.mjs https://www.konchewater.com`.
   All checks must pass: 26 clean sitemap URLs return 200; canonical, Open Graph,
   JSON-LD and internal links use clean URLs; each legacy `.html` URL makes one
   308 hop to its matching clean URL; and no retired-host reference remains.
2. Spot-check in a browser: homepage FAQ accordion, a product page's
   "On this page" TOC, and the "Related systems" cards.
3. Purge CDN/page caches for `/`, `/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/robots.txt`.
4. Keep the previous release directory as the rollback point; record the release
   date and git tag/zip hash in VERSION.md.

## Search platform submission (KON-021)

1. Google Search Console: verify the domain property, submit
   `https://www.konchewater.com/sitemap.xml`, then run URL Inspection on the
   homepage and each category page and "Request Indexing".
2. Bing Webmaster Tools: import from GSC or verify manually, submit the sitemap.
   This also feeds ChatGPT Search and Copilot indexing surfaces.
3. Optional IndexNow ping after each release (Bing/Yandex/Seznam):
   generate a key, host it at `/.well-known/indexnow-key.txt`, then POST the
   changed URL list to `https://api.indexnow.org/indexnow?url=<site>&key=<key>`.

## robots.txt policy notes

- AI answer-engine crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot,
  anthropic-ai, PerplexityBot, Google-Extended, GoogleOther, Applebot-Extended,
  Amazonbot, FacebookBot, CCBot) are explicitly allowed for maximum AI visibility.
- Bytespider is disallowed as an aggressive crawler per the third-party
  geo-crawlers guidance; revisit if ByteDance channels become business-relevant.
- The `Content-Signal:` robots directive from the IETF aipref draft is intentionally
  not used while it remains a draft; revisit after standardization.

## Evidence reminders (do not skip)

Before public launch, complete the items in `GEO-FACT-CHECK.md`: certificate
numbers for ISO claims, the project/customer registers behind the 100+/10+/30+
figures, contact-detail ownership, and approval for case-study publication.
The homepage no longer carries the previous "1,000+ customers" figure; if the
company confirms that number, reintroduce it in one place with its definition
and statistics date (audit item KON-012).
