#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://www.konchewater.com";
const RETIRED_HOST = ["konche", "123.com"].join("");
const liveOrigin = process.argv[2]?.replace(/\/$/, "");
const errors = [];

function walkHtml(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if ([".git", "node_modules", "tools"].includes(entry)) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files.push(...walkHtml(path));
    else if (entry.endsWith(".html")) files.push(path);
  }
  return files;
}

function pageUrl(relativePath) {
  if (relativePath === "index.html") return `${ORIGIN}/`;
  return `${ORIGIN}/${relativePath.replace(/\.html$/, "")}`;
}

function extractCanonical(html) {
  return html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
}

function extractOgUrl(html) {
  return html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i)?.[1];
}

function internalHrefTarget(currentUrl, href) {
  if (/^(?:https?:|mailto:|tel:|javascript:|#)/i.test(href)) return null;
  const target = new URL(href, currentUrl);
  if (target.origin !== ORIGIN) return null;
  const pathname = decodeURIComponent(target.pathname);
  if (pathname === "/") return join(ROOT, "index.html");
  const relativePath = pathname.replace(/^\//, "");
  if (/\.[a-z0-9]+$/i.test(relativePath)) return join(ROOT, relativePath);
  return join(ROOT, `${relativePath}.html`);
}

function findLegacyJsonLdUrls(value, path = "$") {
  const findings = [];
  if (Array.isArray(value)) {
    value.forEach((item, index) => findings.push(...findLegacyJsonLdUrls(item, `${path}[${index}]`)));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      findings.push(...findLegacyJsonLdUrls(item, `${path}.${key}`));
    }
  } else if (typeof value === "string" && /(?:^|\/)\S*\.html(?:[#?]|$)/i.test(value)) {
    findings.push(path);
  }
  return findings;
}

function findProductsWithoutOffers(value, path = "$") {
  const findings = [];
  if (Array.isArray(value)) {
    value.forEach((item, index) => findings.push(...findProductsWithoutOffers(item, `${path}[${index}]`)));
  } else if (value && typeof value === "object") {
    const type = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
    if (type.includes("Product") && !("offers" in value)) findings.push(path);
    for (const [key, item] of Object.entries(value)) {
      if (key === "@type") continue;
      findings.push(...findProductsWithoutOffers(item, `${path}.${key}`));
    }
  }
  return findings;
}

const htmlFiles = walkHtml(ROOT).sort();
const indexableCanonicals = new Set();
const inboundLinks = new Map();
const titles = new Map();
const descriptions = new Map();

for (const path of htmlFiles) {
  const rel = relative(ROOT, path).replaceAll("\\", "/");
  const html = readFileSync(path, "utf8");
  const isNoindex = /<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  const sourceIndexable = !isNoindex && rel !== "404.html";
  const canonical = extractCanonical(html);
  const expected = pageUrl(rel);

  if (html.toLowerCase().includes(RETIRED_HOST)) errors.push(`${rel}: retired domain remains`);
  // 拦截内部遗留 .html 链接；外部权威站点（如 CDC）的 .html 引用不适用本规则（2026-09-16）
  const htmlHrefMatch = html.match(/href=["']([^"']*\.html)(?:[#?][^"']*)?["']/i);
  const htmlHrefIsExternal = htmlHrefMatch && /^https?:\/\//i.test(htmlHrefMatch[1]) && !/konchewater\.com/i.test(htmlHrefMatch[1]);
  if (htmlHrefMatch && !htmlHrefIsExternal) {
    errors.push(`${rel}: internal href still contains .html`);
  }
  if (/https:\/\/www\.konchewater\.com\/[^"'\s<>]*\.html/i.test(html)) {
    errors.push(`${rel}: public metadata or structured data still contains .html`);
  }
  if (/https:\/\/www\.konchewater\.com\/index(?:[#?"'\s<>]|$)/i.test(html)) {
    errors.push(`${rel}: homepage URL must be ${ORIGIN}/, not /index`);
  }

  if (sourceIndexable) {
    if (canonical !== expected) errors.push(`${rel}: canonical ${canonical ?? "missing"} != ${expected}`);
    const ogUrl = extractOgUrl(html);
    if (ogUrl !== expected) errors.push(`${rel}: og:url ${ogUrl ?? "missing"} != ${expected}`);
    indexableCanonicals.add(expected);

    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim();
    if (title) {
      if (titles.has(title)) errors.push(`${rel}: duplicate <title> (also on ${titles.get(title)}): ${title}`);
      else titles.set(title, rel);
    }
    const descriptionTag = html.match(/<meta[^>]*name=["']description["'][^>]*>/i)?.[0];
    const description = descriptionTag?.match(/content=["']([^"']*)["']/i)?.[1]?.replace(/\s+/g, " ").trim();
    if (description) {
      if (descriptions.has(description)) {
        errors.push(`${rel}: duplicate meta description (also on ${descriptions.get(description)})`);
      } else {
        descriptions.set(description, rel);
      }
    }
  } else if (canonical?.includes(".html")) {
    errors.push(`${rel}: noindex redirect canonical still contains .html`);
  }

  for (const match of html.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi)) {
    const href = match[1];
    const target = internalHrefTarget(expected, href);
    if (!target) continue;
    if (!existsSync(target)) {
      errors.push(`${rel}: missing internal target ${href}`);
    } else if (target !== path && sourceIndexable) {
      inboundLinks.set(target, (inboundLinks.get(target) ?? 0) + 1);
    }
  }

  for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
    try {
      const jsonLd = JSON.parse(match[1]);
      for (const legacyPath of findLegacyJsonLdUrls(jsonLd)) {
        errors.push(`${rel}: JSON-LD URL contains .html at ${legacyPath}`);
      }
      for (const productPath of findProductsWithoutOffers(jsonLd)) {
        errors.push(`${rel}: Product JSON-LD node without offers at ${productPath} (triggers GSC invalid product snippet)`);
      }
    } catch (error) {
      errors.push(`${rel}: invalid JSON-LD (${error.message})`);
    }
  }
}

for (const url of indexableCanonicals) {
  const file = url === `${ORIGIN}/`
    ? join(ROOT, "index.html")
    : join(ROOT, `${url.slice(ORIGIN.length + 1)}.html`);
  if (!(inboundLinks.get(file) > 0)) {
    errors.push(`orphan page (no internal inbound link from any indexable page): ${url}`);
  }
}

const sitemap = readFileSync(join(ROOT, "sitemap.xml"), "utf8");
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
for (const url of sitemapUrls) {
  if (url.includes(".html")) errors.push(`sitemap.xml: redirected URL listed: ${url}`);
  if (!indexableCanonicals.has(url)) errors.push(`sitemap.xml: URL is not an indexable canonical: ${url}`);
}
for (const url of indexableCanonicals) {
  if (!sitemapUrls.has(url)) errors.push(`sitemap.xml: missing canonical URL: ${url}`);
}

for (const name of ["llms.txt", "llms-full.txt"]) {
  const text = readFileSync(join(ROOT, name), "utf8");
  if (/https:\/\/www\.konchewater\.com\/[^\s)]*\.html/i.test(text)) {
    errors.push(`${name}: official URL still contains .html`);
  }
  if (/https:\/\/www\.konchewater\.com\/index(?:[#?\s)]|$)/i.test(text)) {
    errors.push(`${name}: homepage URL must be ${ORIGIN}/, not /index`);
  }
  if (text.toLowerCase().includes(RETIRED_HOST)) errors.push(`${name}: retired domain remains`);
}

const redirects = readFileSync(join(ROOT, "_redirects"), "utf8");
for (const line of redirects.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const [source, target, status] = trimmed.split(/\s+/);
  if (!source?.endsWith(".html")) errors.push(`_redirects: legacy source must end in .html: ${source}`);
  if (target?.includes(".html")) errors.push(`_redirects: target creates an extra hop: ${target}`);
  if (status !== "308") errors.push(`_redirects: legacy redirect must use 308: ${trimmed}`);
  const targetUrl = target ? new URL(target, ORIGIN).href : null;
  if (targetUrl && !indexableCanonicals.has(targetUrl)) {
    errors.push(`_redirects: target is not an indexable canonical: ${target}`);
  }
}

async function validateLive(origin) {
  const sitemapResponse = await fetch(`${origin}/sitemap.xml`, { redirect: "manual" });
  if (sitemapResponse.status !== 200) {
    errors.push(`live sitemap returned ${sitemapResponse.status}`);
    return;
  }
  const xml = await sitemapResponse.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  for (const url of urls) {
    if (url.includes(".html")) errors.push(`live sitemap contains redirected URL: ${url}`);
    const cleanResponse = await fetch(url, { redirect: "manual" });
    if (cleanResponse.status !== 200) {
      errors.push(`live canonical URL returned ${cleanResponse.status}: ${url}`);
      continue;
    }
    const html = await cleanResponse.text();
    if (extractCanonical(html) !== url) errors.push(`live canonical mismatch: ${url}`);
    // 外部权威站点（如 CDC）的 .html 引用不适用内部遗留链接规则（2026-09-16）
    const liveHtmlHref = html.match(/href=["']([^"']*\.html)(?:[#?][^"']*)?["']/i);
    const liveHtmlIsExternal = liveHtmlHref && /^https?:\/\//i.test(liveHtmlHref[1]) && !/konchewater\.com/i.test(liveHtmlHref[1]);
    if (liveHtmlHref && !liveHtmlIsExternal) {
      errors.push(`live page contains .html href: ${url}`);
    }
    if (/https:\/\/www\.konchewater\.com\/[^"'\s<>]*\.html/i.test(html)) {
      errors.push(`live metadata or structured data contains .html: ${url}`);
    }
    if (url !== `${origin}/`) {
      const legacy = `${url}.html`;
      const legacyResponse = await fetch(legacy, { redirect: "manual" });
      const location = legacyResponse.headers.get("location");
      const target = location ? new URL(location, legacy).href : null;
      if (legacyResponse.status !== 308 || target !== url) {
        errors.push(`legacy URL must redirect once with 308: ${legacy} -> ${legacyResponse.status} ${target}`);
      }
    }
  }
}

if (liveOrigin) {
  if (liveOrigin !== ORIGIN) errors.push(`live origin must be ${ORIGIN}`);
  else await validateLive(liveOrigin);
}

if (errors.length) {
  console.error(`Clean URL validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Clean URL validation passed: ${htmlFiles.length} HTML files retained, ${indexableCanonicals.size} canonical pages, ${sitemapUrls.size} sitemap URLs${liveOrigin ? ", live redirects verified" : ""}.`,
);
