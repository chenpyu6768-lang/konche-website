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
