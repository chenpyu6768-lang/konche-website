// apply-banner-template.mjs — 把 UPW 首屏模板批量套用到产品页（2026-09-11）
// 用法: node tools/apply-banner-template.mjs
// 只改 <section class="product-hero"> 内部；每页场景文案见 PAGES 表。
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const root = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const productsDir = path.join(root, "products");

const DROP_TAGS = new Set([
  "1-Year Warranty",
  "72-Hr Spare-Parts Dispatch",
  "24-Hr Response",
  "OEM / ODM",
]);
const MIN_TAGS = 2; // 过滤商业承诺标签后至少保留的产品事实标签数

const PAGES = {
  "1000-lph-community-ro-system.html": {
    sub: "Refilling-Station RO for Communities & Water Shops",
    line: "RO + UV Disinfection · Groundwater & Deep-Well Sources · 97–99% Rejection",
    ghost: null,
  },
  "500-lph-compact-ro-system.html": {
    sub: "Compact 0.5 m³/h RO for Tight Installation Spaces",
    line: "Multi-Stage RO Skid · 500 L/h · PLC Controlled",
    ghost: null,
  },
  "containerized-water-treatment-system.html": {
    sub: "Turnkey RO & Desalination Plants in a Shipping Container",
    line: "RO Plant & Seawater/Brackish Desalination · Factory-Assembled Delivery",
    ghost: "#industry-applications",
  },
  "electronic-grade-ultrapure-water-system.html": {
    sub: "Ultrapure Water for Electronics, Pharmaceutical & Precision Industry",
    line: "RO + EDI + UV & Deionized Trains · One Ultra-Pure Water Platform",
    ghost: null,
  },
  "general-water-treatment-consumables.html": {
    sub: "Membranes, Filters, Media & Resin for RO · UF · EDI Plants",
    line: "Five-Series One-Stop Supply · Mainstream-Brand Compatibility",
    ghost: null,
  },
  "laboratory-ultrapure-water-system.html": {
    sub: "Type I Ultrapure Water for Laboratories & Instrumentation",
    line: "Type I 18.2 MΩ·cm · TOC ≤5 ppb · 5–100 L/h",
    ghost: null,
  },
  "low-pressure-uv-sterilizer.html": {
    sub: "Chemical-Free 254 nm Disinfection for Process & Potable Water",
    line: "≥99.99% Inactivation · 0.25–50 m³/h · 9,000 h Lamp Life",
    ghost: null,
  },
  "medium-pressure-uv-system.html": {
    sub: "Broad-Spectrum UV for Large-Flow Disinfection & Reuse",
    line: "2–10 kW · 200–400 nm · 0.25–50 m³/h",
    ghost: null,
  },
  "ozone-disinfection-system.html": {
    sub: "Ozone Disinfection, COD Reduction & Odor Control",
    line: "1–200 g/h Output · ≥99.99% Kill Rate · PLC One-Button Start",
    ghost: null,
  },
  "spare-parts-sourcing-service.html": {
    sub: "Spare-Parts Sourcing for EPC Projects & Distributors",
    line: "Qualified-Supplier Network · Brand or Compatible Parts · Consolidated Sourcing",
    ghost: null,
  },
  "spare-parts.html": {
    sub: "Membranes, Cartridges & Precision Filters for RO Plants",
    line: "Five-Series One-Stop Supply · Brand Cross-Matching",
    ghost: null,
  },
  "toc-uv-degradation-system.html": {
    sub: "TOC Degradation for Semiconductor & Pharmaceutical Loops",
    line: "185 nm + 254 nm Dual-Wavelength · TOC ≤0.5 μg/L Outlet",
    ghost: null,
  },
  "uf-ultrafiltration-system.html": {
    sub: "Surface-Water Filtration & Reuse with 0.01 μm UF",
    line: "≤0.1 NTU · Automatic Backwash · 2–5-yr Membrane Life",
    ghost: null,
  },
  "uv-disinfection-consumables.html": {
    sub: "Matched Lamps, Ballasts & Sleeves for Any UV Brand",
    line: "8,000–10,000 h Lamp Life · Genuine Matched Parts · Technical Selection Support",
    ghost: null,
  },
  "uv-water-sterilizer.html": {
    sub: "In-Line UV Disinfection for Industrial Process Water",
    line: "≥99.99% Inactivation · 8,000–10,000 h Lamp Life · OEM / ODM",
    ghost: null,
  },
};

const done = [];
const skipped = [];
for (const [file, cfg] of Object.entries(PAGES)) {
  const fp = path.join(productsDir, file);
  let s = fs.readFileSync(fp, "utf8");
  const heroM = s.match(/<section class="product-hero">[\s\S]*?<\/section>/);
  if (!heroM) { skipped.push(file + " (no product-hero)"); continue; }
  let hero = heroM[0];
  const orig = hero;

  // 1. 副标题 → 场景副标题 + 工艺行
  if (!/<p class="product-subtitle">/.test(hero)) { skipped.push(file + " (no subtitle)"); continue; }
  hero = hero.replace(
    /<p class="product-subtitle">[\s\S]*?<\/p>/,
    `<p class="product-subtitle">${cfg.sub}</p><p class="upw-subline">${cfg.line}</p>`
  );

  // 2. 删承诺条 + 质保小字
  hero = hero.replace(/<ul class="promise-strip"[\s\S]*?<\/ul>/, "");
  hero = hero.replace(/<p class="promise-note">[\s\S]*?<\/p>/, "");

  // 3. 删 hero 简介段（无 class、紧邻主 CTA 的 <p>）
  hero = hero.replace(/<p>(?![^>]*class)[\s\S]*?<\/p>(<a class="button button-primary")/, "$1");

  // 4. CTA 行：包 upw-hero-actions + 规范箭头 + 幽灵按钮
  const arrowFix = hero.replace(/(<a class="button button-primary" href="\/#contact">Discuss Your Requirement <span>)↗(<\/span><\/a>)/, "$1→$2");
  hero = arrowFix;
  const ghost = cfg.ghost
    ? `<a class="button button-ghost upw-jump" href="${cfg.ghost}" data-ga-event="hero_find_industry_click">Find Your Industry <span>↓</span></a>`
    : "";
  hero = hero.replace(
    /(<a class="button button-primary" href="\/#contact">Discuss Your Requirement <span>→<\/span><\/a>)/,
    `<div class="upw-hero-actions">$1${ghost}</div>`
  );

  // 5. 质保折叠（CTA 行之后）
  hero = hero.replace(
    /(<div class="upw-hero-actions">[\s\S]*?<\/div>)/,
    `$1<details class="upw-warranty-fold"><summary>1-Year Warranty &amp; Consumables Terms <i class="upw-warranty-arrow">▾</i></summary><div class="upw-warranty-body">1-year whole-machine warranty from commissioning. Exclusions: membranes, UV lamps, filter cartridges and other consumables. First-tier brand membranes and components (e.g., Dow, Hydranautics) and control configuration are selected for your feed-water scenario and quality targets.</div></details>`
  );

  // 6. 过滤 qta-tags 里的商业承诺标签（保留 ≥MIN_TAGS 个产品事实标签）
  const tagsM = hero.match(/<ul class="qta-tags"[^>]*>([\s\S]*?)<\/ul>/);
  if (tagsM) {
    const lis = [...tagsM[1].matchAll(/<li>[\s\S]*?<\/li>/g)].map(m => m[0]);
    const texts = lis.map(li => li.replace(/<[^>]+>/g, "").trim());
    const product = [], dropped = [];
    lis.forEach((li, i) => (DROP_TAGS.has(texts[i]) ? dropped.push(li) : product.push(li)));
    let keep = product;
    if (keep.length < MIN_TAGS) keep = keep.concat(dropped.slice(0, MIN_TAGS - keep.length));
    keep = keep.slice(0, 5);
    if (keep.length) {
      hero = hero.replace(tagsM[0], `<ul class="qta-tags" aria-label="Key facts at a glance">${keep.join("")}</ul>`);
    } else {
      hero = hero.replace(tagsM[0], "");
    }
  }

  // 7. CTA 箭头规范化兜底（个别页 ↗ 在别处）
  hero = hero.replace(/Discuss Your Requirement <span>↗<\/span>/, "Discuss Your Requirement <span>→</span>");

  if (hero === orig) { skipped.push(file + " (no changes)"); continue; }
  s = s.replace(orig, hero);

  // 8. CSS / site-enhancements 版本号
  s = s.replace(/industrial\.css\?v=[0-9-]+/, "industrial.css?v=20260911-1");
  s = s.replace(/site-enhancements\.js\?v=[0-9-]+/, "site-enhancements.js?v=20260911-1");

  fs.writeFileSync(fp, s);
  done.push(file);
}

console.log("transformed:", done.length);
console.log(done.map(f => "  ✓ " + f).join("\n"));
if (skipped.length) console.log("skipped:\n" + skipped.map(f => "  ✗ " + f).join("\n"));
