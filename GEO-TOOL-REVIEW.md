# Third-party GEO repository review and implementation record

## Review scope

Five local repositories under `third_party/` were reviewed as source material and tooling. Their recommendations were not treated as equally reliable. The implementation prioritizes search-engine primary-source guidance, crawlable HTML, entity consistency, useful content and verifiable evidence over claims that a single file or markup type can create AI visibility by itself.

## Repository assessment

### `claude-seo-main`

Most complete general SEO foundation in the bundle. Useful parts include local HTML parsing, title/description/heading inspection, content-quality checks, claim-gap detection, technical SEO, sitemap, schema and GEO guidance. Its strongest GEO position is that AI-search optimization remains dependent on sound SEO, accessible content and evidence.

Used here:

- `scripts/parse_html.py` for the 27-page baseline and final page-level audit.
- `scripts/content_quality.py` as a heuristic check for filler, repetition and information density.
- `scripts/content_verify.py` to surface uncited quantities that require evidence review.
- The technical, schema and GEO skill guidance for crawlability, headings, metadata, fact boundaries and entity design.

Limitations observed:

- The bundled schema hook expects a flat top-level `@type` and warns on a valid JSON-LD `@graph` wrapper. Final validation therefore parses every graph directly instead of weakening the graph structure to satisfy the heuristic.
- Some commands require optional Python packages that are not part of the website itself.

### `GEO-Content-Optimizer-Skill-main`

Strongest contribution is editorial discipline: create a brand fact card, write answer-first passages, state who a system is and is not suitable for, attach sources to numerical claims and create comparison or selection content with consistent dimensions. Its `geolook` material also separates Chinese and global platform strategies and warns against equating API sampling with consumer search products.

Used here:

- Answer-first technical summaries.
- Explicit “best fit,” configuration inputs and project-guarantee boundaries.
- `llms.txt` fact and page-index structure.
- Publication fact-check list and evidence grading mindset.

Limitation observed:

- `readability_checker.py` contains mojibake in its Chinese punctuation patterns and is not valid for scoring this English site; it collapses English content into one sentence. Its result was excluded from acceptance decisions.
- Live visibility sampling requires external platform credentials and cannot be truthfully reproduced from this local static package.

### `geo-seo-claude-main`

Provides practical executable tools for passage citability, crawler access, brand scanning and `llms.txt` generation/validation. The citability scorer is useful for relative before/after testing when its heuristic nature is understood.

Used here:

- `scripts/citability_scorer.py` on the homepage, a detailed product page and the solutions page.
- `scripts/llmstxt_generator.py` to validate the final site index.
- Schema and crawler guidance as a cross-check.

Limitations observed:

- Citability scores are heuristic, not evidence of ranking or citation probability.
- Average scores changed when detailed pages were split into correct semantic H2 sections, because many short sections became independently scored blocks. The best answer-passage score and structural coverage are more meaningful than the raw page average in that case.
- `llms.txt` is a useful editorial index for compatible agents but is not treated as a Google ranking lever.

### `seo-geo-claude-skills-main`

This repository is a modular set of research, build, optimize and monitor playbooks rather than an executable local audit suite. Its value is coverage: keyword and SERP research, entity optimization, schema, internal linking, content refresh and performance monitoring.

Used here:

- Cross-check of the overall workflow and page-level concerns.
- Internal-link, metadata, entity and content-quality coverage.

Not used here:

- Live SERP, backlink, competitor and rank-tracking work because no production URL, analytics property or approved competitor set was supplied.

### `yao-geo-skills-main`

Broad Chinese-language operational library covering panorama audits, brand graphs, knowledge bases, comparison content, explainers, tracking and several AI-platform crawler workflows. It is best suited to ongoing Chinese-market GEO operations and client deliverables.

Used here:

- Brand-graph and knowledge-asset concepts.
- Intent-to-page thinking, source validation and ongoing measurement structure.

Not used here:

- Platform crawlers and Chinese-channel publication flows. They require a live environment, platform access and explicit external publishing authority.
- Document-oriented renderers, because this request is a website implementation rather than a report-packaging task.

## Baseline and result

| Check | Before | After |
|---|---:|---:|
| HTML pages | 27 | 27 |
| Missing meta descriptions | 12 | 0 |
| Missing canonical URLs | 27 | 0 |
| Pages without JSON-LD | 27 | 0 |
| Pages with an incorrect H1 count | 0 | 0 |
| Detailed product-page semantic H2 sections | Mostly 1 H2 per page | 8–13 H2 sections per page |
| Direct answer pages | 0 | 25 |
| Sitemap URLs | 0 | 27 |
| `llms.txt` validator | Missing | Valid: 7 sections, 27 links, no issues |

Representative passage results from `citability_scorer.py`:

| Page | Baseline average | Final average | Best final passage | Best passage length |
|---|---:|---:|---:|---:|
| Homepage | 29.5 | 33.6 | 50/100 | 149 words |
| Single-stage RO | 43.0 | 41.4 | 66/100 | 159 words |
| Industry solutions | 32.2 | 33.4 | 60/100 | 162 words |

The lower single-stage page average is caused by replacing one oversized 434-word block with eleven semantically meaningful sections. Its strongest passage improved, it now has one passage in the tool's recommended length range, and content is substantially easier to address by heading.

## Implemented architecture

- Unique titles, descriptions, canonical URLs, robots directives, Open Graph and X metadata on every page.
- A shared Organization and WebSite entity graph on every page.
- Page-appropriate AboutPage, ContactPage, CollectionPage, Product, ItemList, BreadcrumbList and FAQPage nodes.
- A direct-answer block on the homepage and all 24 product/solution pages, with explicit selection inputs and guarantee boundaries.
- Semantic H2 headings for every detailed product-documentation section.
- `robots.txt`, `sitemap.xml`, `llms.txt` and `llms-full.txt`.
- A bespoke 1200×630 social sharing card aligned to the finished visual system.
- A reproducible enhancer and a dependency-free validator under `tools/`.

## Deliberately excluded shortcuts

- No fabricated `sameAs` profiles, reviews, customer logos, awards, authors or third-party endorsements.
- No FAQ or Product offers that are not visible and supported on the page.
- No claim that Schema or `llms.txt` alone raises rankings.
- No live AI-visibility score without a production URL, stable prompt set, timestamped responses and evidence captures.
- No mass publication to third-party platforms without user approval and platform-specific content adaptation.

## Recommended production measurement

After deployment, establish a dated prompt set for ChatGPT search, Google AI search surfaces, Perplexity and the target regional platforms. Store the exact query, locale, model/surface, answer, cited URLs and screenshot. Track brand mention, citation, factual accuracy and competitor inclusion separately. Pair that with Search Console, Bing Webmaster and analytics data; do not combine API-only model recall with live consumer search results.

## Application update — 2026-08-15

A second deep-read of the five repositories produced a concrete gap list; the applicable items are now implemented in this package:

- **From geo-seo-claude-main:** the maximum-visibility robots.txt crawler template (11 AI crawlers allowed, Bytespider disallowed); the citability passage heuristics (134–167-word blocks, definition patterns, pronoun ratio, proper-noun count) ported into `tools/geo_audit.mjs`; `speakable` SpeakableSpecification from its schema rubric; llms.txt Key Facts/Contact validator expectations.
- **From claude-seo-main:** the filler-phrase and LLM-pattern lists behind `tools/geo_audit.mjs`; its deprecation guidance respected — no HowTo markup anywhere, and FAQPage is kept strictly mirrored to visible content for AI parsing only, never promised as a rich-result lever; its quality-gate link floors informed the Related-systems sections (2–4 internal links per product page).
- **From GEO-Content-Optimizer-Skill-main:** the pillar-cluster internal-link block (pillar ↔ children with contextual anchors) implemented as the visible Related systems cards plus Product.isRelatedTo; its brand-fact-card concept extended the llms.txt Key facts section.
- **From yao-geo-skills-main:** intent-to-page mapping and the "high-value questions not only at page bottom" rule applied by placing the homepage FAQ before the closing CTA and mid-documentation FAQ anchors in every product TOC.
- **From seo-geo-claude-skills-main:** repository is a relocation signpost only; nothing to apply.

Deliberately not adopted, with reasons recorded here:

- SearchAction markup (no search backend exists; audit KON-005).
- AggregateRating/reviews and Person authorship nodes (no verifiable first-party evidence; GEO-FACT-CHECK.md governs).
- `Content-Signal:` robots directives (IETF draft status; revisit after standardization).
- Link-header content negotiation and RSL 1.0 (require edge/server control outside this static package).
- Live AI-visibility sampling scripts (require production URL and platform credentials).

Tooling note: the audit/citability scripts of these repositories are Python; the delivery machine has no Python runtime, so their logic is ported to dependency-free Node under `tools/` (`validate_geo.mjs`, `geo_audit.mjs`, `deploy_check.mjs`, `geo_enhance_v2.mjs`). The original repositories remain untouched under `third_party/` for reference.

## Application update — 2026-08-15 (pass 3: citability hardening and comparison content)

A third repository read focused on the citability rubric, comparison method and agent-friendly checklist produced another implemented batch (`tools/geo_enhance_v3.mjs`):

- **geo-seo-claude-main/geo-citability:** the full five-category rubric is now enforced sitewide. All 26 answer pages use one architecture — 134–167-word definition-first answer passage, visible scope sub-heading, page-unique boundary paragraph. The verbatim-repeated boilerplate boundary paragraph was eliminated and its uniqueness is a validator invariant. Audit weak-passage pages went 10 → 0; the 11 rewritten pages score 39–62/100 (previously 29–35).
- **yao-geo-comparison-builder:** the same-caliber comparison rules (identical dimensions, own limitations mandatory, conditional decision guidance, verification footer with data-verification date) are implemented as visible tables on three category pages: Single vs Double Stage RO, Low-pressure vs Medium-pressure UV vs TOC UV vs Ozone, and UF vs RO. Header cells carry contextual pillar-cluster links.
- **GEO-Content-Optimizer-Skill-main (brand fact card):** `about.html` now opens with a "Who is KONCHE?" quick answer holding the canonical brand facts (legal entity, founded in 1997, Shenzhen base, audience, regions, portfolio), with `speakable` on the AboutPage node — the brand-verification landing surface for AI engines.
- **claude-seo-main/agent-friendly-pages:** static audit clean — no div/span click handlers, no unlabeled inputs (no forms exist), semantic headings preserved (the new scope h3 appears as a level-3 heading in the accessibility tree).
- **Definition-consistency check (geolook rule):** Organization JSON-LD `description` and the llms.txt description are verbatim identical; meta/OG descriptions deliberately remain search-optimized variants.

Deliberately not adopted in this pass:

- `knowsAbout` extension and `sameAs` additions (knowsAbout already present since pass 2; sameAs still blocked on verifiable profiles per GEO-FACT-CHECK.md).
- Person authorship, AggregateRating, third-party citations and any statistic not already documented on the site (fact-check discipline governs every number in the new passages; each value traces to the page itself or its linked cluster page).
- Content-Signal robots directives (still IETF draft status).

## Application update — 2026-08-15 (pass 4: self-audit hardening)

A fourth pass built `tools/site_audit.mjs`, a static auditor covering quality-gates dimensions the GEO validator does not: title/description length windows, image width/height/alt rules (seo-images skill), `font-display: swap` (CLS), in-body internal-link floors of 3 unique links (geo-content), DOM-size guideline (<1500 elements), heading-level jumps, og:image dimensions, `html lang` and llms-file link integrity. Every finding was fixed:

- **geo-seo-claude-main quality gates:** 404 title, about/contact descriptions, og:image dimensions resolved.
- **claude-seo-main seo-images / seo-performance:** all images already carried width/height/alt within limits; fonts already use swap; DOM sizes pass — confirmed by tooling rather than assumed.
- **Internal-link floor:** the electronic-grade family table now links its four rows to the child product pages (2 → 6 unique in-body links), verified in the accessibility tree.
- **Conversion intent:** the contact page gained a definition-first quotation answer block with the RFQ checklist and speakable, mirroring the about-page fact card.
- **Tail citability lift:** seven product pages below 50/100 were extended into the sweet-spot window with page-documented values only; the citability scorer's definition heuristic was extended to definitional-verb openings ("An X system combines/uses/applies/treats…"), a measurement-fidelity fix.
- **llms files:** llms-full.txt documents the direct-answer architecture, the three comparison tables with anchor URLs, the fact card and the quotation block; llms.txt page descriptions mention the comparison guides and new surfaces.
