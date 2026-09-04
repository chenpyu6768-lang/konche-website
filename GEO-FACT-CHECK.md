# KONCHE GEO publication fact-check

This checklist separates implemented, low-risk technical improvements from claims that still need first-party publication evidence.

## Implemented without adding new performance claims

- Unique titles and descriptions for all 27 pages.
- Canonical URLs based on the documented official domain `https://www.konchewater.com`.
- Organization, WebSite, WebPage, Product, ItemList, BreadcrumbList and FAQPage JSON-LD where the visible page supports those entities.
- Direct-answer blocks that state use cases, required engineering inputs and performance boundaries.
- `robots.txt`, `sitemap.xml`, `llms.txt` and `llms-full.txt`.
- Open Graph and X card metadata.
- Semantic H2 headings for detailed product-documentation sections.

## Claims to approve or replace with evidence before production

| Visible claim | Current location | Evidence needed |
|---|---|---|
| ISO 9001 | Homepage hero | Current certificate, legal entity name, certificate number and validity period |
| 100+ projects delivered | Homepage statistics | Internal project register with inclusion rule and last verified date |
| 10+ countries and industries served | Homepage statistics | Project/customer country register and wording decision |
| Specific semiconductor project values and three-year operation | Homepage project carousel | Approved case sheet, commissioning report and permission to publish |
| Nearly 30 years / since 1997 | Multiple pages | Business-registration or official company-history record |
| Phone, email and street address | Footers and contact page | Final publication approval and mailbox/phone ownership check |
| Product performance ranges | Detailed product pages | Approved datasheet, test basis, feed-water assumptions and guarantee boundary |

Update — 2026-08-15: the homepage "1,000+ customers" figure was removed together with
the client-logo placeholder wall (replaced by an industries-served grid whose labels
are supported by existing site copy). If the company confirms the customer figure,
reintroduce it in exactly one place with its definition and statistics date
(audit item KON-012). No other numeric claim was added in this pass; every number in
the new quick-answer paragraphs reuses reference values already documented on the
corresponding product page.

## Entity authority still requiring external coordination

- Verify and then add official LinkedIn, YouTube, industry-directory or other third-party entity profiles to `sameAs`.
- Publish named technical authors only after their credentials and consent are approved.
- Add downloadable certificates, test reports, datasheets and signed case studies when publication rights are confirmed.
- Do not manufacture Wikipedia, reviews, forum discussions or third-party mentions. These must be independently earned.

## Domain assumption

The canonical and sitemap domain follows `VERSION.md`, which identifies `https://www.konchewater.com/` as the official source. If the English site will launch on another hostname or subdirectory, change `BASE_URL` in `tools/geo_enhance.py`, then rerun the enhancer and regenerate `sitemap.xml`, `llms.txt` and `llms-full.txt` before release.


## Owner-confirmed typical-value set — 2026-08-20 (pass 25 merge, recorded pass 26 follow-up)

The 2026-08-20 afternoon session unified cross-page parameters with the following
industry-typical ranges. The owner approved recording them as **owner-confirmed
typical reference values** (no first-party test report attached yet); pages present
them alongside the conditions disclaimer (actual performance, energy and consumable
life depend on feed-water quality, pretreatment, operating conditions and
maintenance level).

| Value | Scope | Status |
|---|---|---|
| 97–99% | RO typical salt rejection | Owner-confirmed typical. Note: the official CN site shows ≥99%; the owner chose the more conservative 97–99% for the English site (2026-08-21) — hero strips and body aligned to 97–99%. |
| 0.8–1.5 kWh/m³ | Brackish-water RO typical energy | Owner-confirmed typical |
| 1–2 kWh/m³ | Industrial ultrapure water energy reference | Owner-confirmed typical |
| 0.3–0.7 kWh/m³ | UF typical energy | Owner-confirmed typical |
| 2–5 years | UF membrane typical service life | Owner-confirmed typical |
| Up to 99.99% | UV microbial inactivation | Owner-confirmed typical |
| 8,000–10,000 h | UV lamp typical operating life | Owner-confirmed typical |
| ~~30–40%~~ | Containerized investment saving | **Removed 2026-08-20 at owner request** — replaced by a qualitative statement (factory assembly reduces on-site construction scope). Do not reintroduce without a project-based comparison. |

If datasheets or test reports later contradict any row, update the pages and this
table in the same pass.

## Owner-confirmed commercial commitments — 2026-09-04 (hero + promise-strip pass)

Registered for the homepage hero promise strip and the per-product-page promise strips.
Each value below was confirmed by the owner on 2026-09-04; pages present them as
commitments, with the configuration caveats shown in the on-page promise-note line.

| Value | Scope | Status |
|---|---|---|
| 1-Year Warranty | Whole machine from shipment; membranes, UV lamps, cartridges, resin and other consumables excluded | Owner-confirmed 2026-09-04 |
| 72-Hr Spare-Parts Dispatch | Spare parts dispatched within 72 hours; shipping origin intentionally not stated | Owner-confirmed 2026-09-04 |
| 24-Hr Response | Reply to inquiries within 24 hours | Owner-confirmed 2026-09-04 |
| OEM / ODM | Standard models resellable under buyer's brand (already claimed on equipment-oem page) | Owner-confirmed 2026-09-04 |
| PLC Auto-Run | PLC automatic operation; offered where the application calls for it | Owner-confirmed 2026-09-04 |
| Easy Assembly | Qualitative assembly-friendliness claim (no percentage) | Owner-confirmed 2026-09-04 |
| First-tier brand components (e.g., Dow, Hydranautics membranes) | Named as examples; actual brands configured per feed-water scenario and quality target | Owner-confirmed 2026-09-04 |
| System capacity 0.25–50 m³/h (t/h) | Company-wide RO/UPW range; supersedes the earlier 0.5–100 m³/h figure. NOTE: category pages still carry their own documented ranges (RO 0.25–500, UF 1–200, containerized 5–500, UV 0.5–300 m³/h) — pending owner confirmation whether those exceed the 50 m³/h ceiling | Owner-confirmed 2026-09-04, sub-ranges flagged |

## Update — 2026-09-04 (b): capacity blanket ruling + hero strip revision

- Owner instruction: ALL advertised water-treatment capacity ranges are now 0.25–50 m³/h (t/h);
  1 t/h = 1 m³/h for water, site keeps the m³/h unit. Range claims replaced on RO, UPW/EDI/DI,
  containerized, UF, UV (hub/low-pressure/medium-pressure), TOC, ozone, drinking-water and the
  Philippines market page. Laboratory page untouched (L/h benchtop units, different product class).
- Model-table rows above 50 m³/h removed so tables cannot contradict the blanket range:
  KCEDI-100, KCDI-100, KC-UPW-100, KC-UF-50/100, KC-UF-200, KC-UV-20/60, KC-UV-100+,
  KC-MUV-4K, KC-MUV-10K, KC-MUV-20K, KCIW-200, KCIW-500. Model-range header strings updated
  (e.g. "KCEDI-0.5 to KCEDI-30"). Restore from git history if any of these models are real offers.
- Homepage hero promise strip: "PLC Auto-Run" chip removed per owner (now 5 chips, evenly spread).
  PLC Auto-Run chips remain on product pages where the page's own CORE BENEFITS table documents
  PLC control; each strip's fine print states control configuration is matched to the scenario.
- Homepage "Served 10,000+ Clients Worldwide" badge: owner confirms the figure is real (2026-09-04);
  keep as-is.

## Update — 2026-09-04 (c): model rows restored, homepage H1 reverted, QTA → hero tags

- Owner decision: the twelve >50 m³/h model rows removed earlier the same day are restored — the
  0.25–50 m³/h ruling applies to headline capacity-range claims, not to the model catalog.
- Homepage H1 set back to "30-Year-Experienced Water-Treatment Solution Provider" (owner instruction;
  the "30-year" phrasing was owner-approved 2026-09-02; conservative alternative remains "Since 1997").
- Product-page QUICK TECHNICAL ANSWER sections: key facts distilled into hero tags; sections removed
  where they duplicated hero content (15 pages); the three diagram-bearing sections keep their figure.
  GEO note: product pages no longer carry a separate direct-answer block — the hero intro paragraph
  plus tags now serve that role; monitor AI-citation behavior at the next GEO review.

## Update — 2026-09-04 (g): UV capacity supersedes blanket for the UV category

- Owner ruling on the UV hub page: single-unit treatment capacity is 4.5–600 t/h (KCF series).
  uv-water-sterilizer.html now shows 4.5–600 m³/h (hero params, capability text, comparison table).
  The 2026-09-04 (b) blanket 0.25–50 m³/h remains for other categories; UV sub-pages
  (low/medium-pressure, TOC, ozone) still read 0.25–50 pending owner alignment decision.
- KCF model/specification tables translated from the owner's CN site (konche.com id=90): KCF-80W…7200W.
- Engineering cases named are owner-published references on the CN site (Dongguan International Trade
  Center; municipal projects). Ping An Finance Center photo unavailable (dead mirror host) — not used.
