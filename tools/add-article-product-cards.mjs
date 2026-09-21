#!/usr/bin/env node
// One-shot: append a "Recommended systems" product-card section to every article.
// Products are mapped per article topic; copy uses only facts already on product pages.
import { readFileSync, writeFileSync } from 'node:fs';

const P = (href, tag, name, desc) => ({ href, tag, name, desc });
const CARD_SETS = {
  'water-refilling-station-business': [
    P('products/1000-lph-community-ro-system', 'COMMUNITY RO', '1,000 LPH Community RO System', '1 m³/h standard configuration for water refilling stations, schools and small communities on well or municipal water.'),
    P('products/500-lph-compact-ro-system', 'COMPACT RO', '500 LPH Compact RO System', '0.5 m³/h compact drinking-water system for tight installation spaces.'),
    P('products/drinking-water-system', 'DRINKING WATER', 'Commercial Drinking Water System', '0.25–50 m³/h commercial drinking-water production with multi-stage pretreatment.'),
  ],
  'boiler-feed-water-system': [
    P('products/single-double-stage-ro', 'BOILER FEED RO', 'Single & Double Stage RO System', '0.25–50 m³/h single- and double-stage RO for boiler-feed, process and ingredient water.'),
    P('products/industrial-ultrapure-water-system', 'HIGH-PURITY TRAIN', 'Industrial Ultrapure Water System', '0.25–50 m³/h ultrapure systems with EDI polishing for high-pressure and high-purity feed duties.'),
    P('products/general-water-treatment-consumables', 'CONSUMABLES', 'General Water Treatment Consumables', 'Filter cartridges, membranes and replacement media to keep the treatment train in specification.'),
  ],
  'boiler-feedwater-systems-food-beverage-plants': [
    P('products/single-double-stage-ro', 'BOILER FEED RO', 'Single & Double Stage RO System', '0.25–50 m³/h single- and double-stage RO for boiler-feed, process and ingredient water.'),
    P('products/industrial-ultrapure-water-system', 'HIGH-PURITY TRAIN', 'Industrial Ultrapure Water System', '0.25–50 m³/h ultrapure systems with EDI polishing for high-pressure and high-purity feed duties.'),
    P('products/general-water-treatment-consumables', 'CONSUMABLES', 'General Water Treatment Consumables', 'Filter cartridges, membranes and replacement media to keep the treatment train in specification.'),
  ],
  'how-to-size-uv-water-treatment-system': [
    P('products/uv-water-sterilizer', 'LOW-PRESSURE UV', 'UV Water Sterilizer', '254 nm low-pressure UV sterilizers, 0.25–50 m³/h standard bands.'),
    P('products/medium-pressure-uv-system', 'MEDIUM-PRESSURE UV', 'Medium-Pressure UV System', 'High-output broad-spectrum UV for larger flows and demanding water, up to 500 m³/h.'),
  ],
  'toc-reduction-uv-system': [
    P('products/toc-uv-degradation-system', 'TOC UV', 'TOC UV Degradation System', '185 nm TOC-reduction reactors for ultrapure-water loops, 0.25–50 m³/h.'),
    P('products/laboratory-ultrapure-water-system', 'LABORATORY UPW', 'Laboratory Ultrapure Water System', 'KCLAB Type I systems — 5–100 L/h at 18.2 MΩ·cm with TOC ≤5 ppb.'),
    P('products/industrial-ultrapure-water-system', 'INDUSTRIAL UPW', 'Industrial Ultrapure Water System', '0.25–50 m³/h ultrapure systems for electronics, pharmaceutical and precision-rinse duties.'),
  ],
  'uv-lamp-replacement-water-treatment': [
    P('products/uv-disinfection-consumables', 'UV CONSUMABLES', 'UV Disinfection Consumables', 'Replacement UV lamps, quartz sleeves, sensors and seals matched by reactor model.'),
    P('products/uv-water-sterilizer', 'LOW-PRESSURE UV', 'UV Water Sterilizer', '254 nm UV sterilizers, 0.25–50 m³/h, with published lamp-life references.'),
  ],
  'uv-water-treatment-food-beverage-plants': [
    P('products/uv-water-sterilizer', 'LOW-PRESSURE UV', 'UV Water Sterilizer', '254 nm low-pressure UV for ingredient, rinse and circulation duties, 0.25–50 m³/h.'),
    P('products/medium-pressure-uv-system', 'MEDIUM-PRESSURE UV', 'Medium-Pressure UV System', 'High-output MP UV for larger flows and demanding water, up to 500 m³/h.'),
    P('products/uv-disinfection-consumables', 'UV CONSUMABLES', 'UV Disinfection Consumables', 'Replacement lamps, quartz sleeves, sensors and seals matched by reactor model.'),
  ],
  'uv-water-treatment-systems': [
    P('products/uv-water-sterilizer', 'LOW-PRESSURE UV', 'UV Water Sterilizer', '254 nm low-pressure UV sterilizers, 0.25–50 m³/h standard bands.'),
    P('products/medium-pressure-uv-system', 'MEDIUM-PRESSURE UV', 'Medium-Pressure UV System', 'High-output broad-spectrum UV for larger flows and demanding water, up to 500 m³/h.'),
    P('products/toc-uv-degradation-system', 'TOC UV', 'TOC UV Degradation System', '185 nm TOC-reduction reactors for ultrapure-water loops, 0.25–50 m³/h.'),
  ],
  'laboratory-water-purification-systems': [
    P('products/laboratory-ultrapure-water-system', 'LABORATORY UPW', 'Laboratory Ultrapure Water System', 'KCLAB-10/30/60/100 — Type I 18.2 MΩ·cm, TOC ≤5 ppb; 5–100 L/h ultrapure plus 10–200 L/h pure water.'),
    P('products/toc-uv-degradation-system', 'TOC UV', 'TOC UV Degradation System', '185 nm polishing for low-TOC applications such as HPLC and LC-MS.'),
  ],
  'distilled-vs-deionized-vs-ro-water-laboratory': [
    P('products/laboratory-ultrapure-water-system', 'LABORATORY UPW', 'Laboratory Ultrapure Water System', 'KCLAB systems combine RO, DI/EDI, UV and UF so Type I water is produced fresh at the point of use.'),
  ],
};

const CSS_EXTRA = ' .art-products {margin:34px 0 8px;padding:22px 24px;background:#F7F9FA;border:1px solid #E2E8EA;border-radius:10px;} .art-products h2 {margin:0 0 6px;color:#071C2C;font-size:19px;} .art-products-intro {margin:0 0 16px;color:#5A6870;font-size:13.5px;} .art-products-grid {display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;} .art-product-card {display:flex;flex-direction:column;gap:6px;padding:16px 18px;background:#fff;border:1px solid #DCE5E0;border-radius:8px;text-decoration:none;transition:transform .2s ease, box-shadow .2s ease;} .art-product-card:hover {transform:translateY(-2px);box-shadow:0 12px 24px rgba(7,28,44,.08);} .art-product-tag {color:#005C43;font-size:11px;font-weight:700;letter-spacing:.06em;} .art-product-card strong {color:#071C2C;font-size:15px;line-height:1.35;} .art-product-card p {margin:0;color:#4A575E;font-size:13px;line-height:1.65;} .art-product-go {margin-top:auto;padding-top:8px;color:#005C43;font-size:12.5px;font-weight:600;} @media (max-width:640px){.art-products-grid{grid-template-columns:1fr;}}';

for (const [slug, products] of Object.entries(CARD_SETS)) {
  const file = `articles/${slug}.html`;
  let t = readFileSync(file, 'utf8');
  if (t.includes('art-product-card')) { console.log('SKIP(已有卡片):', file); continue; }
  let cssAnchor = '.art-sources li {margin-bottom:4px;}';
  if (!t.includes(cssAnchor)) cssAnchor = '.art-sources strong {color:#42505C;}';
  if (!t.includes(cssAnchor)) { console.log('FAIL(CSS锚点缺失):', file); process.exitCode = 1; continue; }
  t = t.replace(cssAnchor, cssAnchor + CSS_EXTRA);
  const cards = products.map((c) =>
    `<a class="art-product-card" href="../${c.href}"><span class="art-product-tag">${c.tag}</span><strong>${c.name}</strong><p>${c.desc}</p><span class="art-product-go">View specifications ↗</span></a>`,
  ).join('');
  const section = `<section class="section"><div class="container detail-container"><div class="art-products"><h2>Recommended systems for this application</h2><p class="art-products-intro">Systems commonly specified for the duties discussed in this guide:</p><div class="art-products-grid">${cards}</div></div></div></section>`;
  const ctaIdx = t.indexOf('<section class="product-cta');
  const footerIdx = t.indexOf('<footer class="site-footer"');
  const at = ctaIdx >= 0 ? ctaIdx : footerIdx;
  if (at < 0) { console.log('FAIL(插入点缺失):', file); process.exitCode = 1; continue; }
  t = t.slice(0, at) + section + t.slice(at);
  writeFileSync(file, t);
  console.log('OK:', file, `(${products.length} 卡片, 插于${ctaIdx >= 0 ? 'CTA前' : '页脚前'})`);
}
