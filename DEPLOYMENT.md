# KONCHE Website — Deployment & Release Guide

This guide closes the operations-side items from the 2026-08-14 site audit
(`outputs/.../Konche123网站问题整改清单_开发交付版_2026-08-14.xlsx`): KON-003
(domain redirect), KON-004 (llms.txt serving), KON-001 (old-URL redirects),
KON-008 (release process), KON-021 (search-platform submission).

## Release package contents

- 29 HTML pages: index, about, contact, privacy, 404, and 25 product/solution pages.
- 28 indexable pages (404.html is noindex and excluded from the sitemap).
- `app/` styles, fonts, logo and the 1200×630 Open Graph image.
- `robots.txt`, `sitemap.xml` (28 URLs), `llms.txt`, `llms-full.txt`.
- `tools/` — Node validation suite (no dependencies, Node ≥ 18):
  - `node tools/validate_geo.mjs` — local gates: metadata, canonical, JSON-LD,
    FAQ-schema-visible parity, sitemap↔page set, lastmod↔dateModified, links.
  - `node tools/geo_audit.mjs` — content-quality and citability heuristics.
  - `node tools/deploy_check.mjs https://www.konchewater.com` — post-deploy live checks.
- Python equivalents (`geo_enhance.py`, `validate_geo.py`) remain for reference;
  the Node tools are authoritative because the delivery machine has no Python.

## Pre-deploy checklist

1. `node tools/validate_geo.mjs` exits 0 (no errors).
2. `node tools/geo_audit.mjs` shows no filler/AI-pattern flags.
3. If any page content changed after the last enhancement run, re-run
   `node tools/geo_enhance_v2.mjs` (idempotent), then re-validate.
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
  location ~ ^/news/article-00(1|2|3|4|5|6|7)\.html$ { return 301 /tech/article-00$1.html; }
  location ~ ^/news/article-00(8|9)\.html$           { return 301 /faq/article-00$1.html; }
  location ~ ^/news/article-01(0|1|2)\.html$         { return 301 /faq/article-00$1.html; }
  # If a /tech/ or /faq/ target itself does not exist yet, temporarily redirect
  # to the homepage Knowledge section instead of leaving a 404 in the sitemap.

  # Long-lived caching for assets; short for HTML.
  location /app/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
  location ~ \.html$ { add_header Cache-Control "public, max-age=3600"; }

  gzip on;
  gzip_types text/plain text/css application/xml application/json image/svg+xml;

  # History fallback must NOT swallow the exact-match locations above.
  location / { try_files $uri $uri/ =404; }

  add_header X-Content-Type-Options nosniff;
}
```

Also configure TLS certificates for both hostnames so the bare-domain 301 works
over HTTPS (HSTS can be enabled after both hosts serve TLS correctly).

## Post-deploy verification (KON-008)

1. Run `node tools/deploy_check.mjs https://www.konchewater.com`.
   All checks must pass: llms content types, 28-URL sitemap with all-200,
   sample-page canonical/OG/JSON-LD integrity, host convergence, old /news/ handling.
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
