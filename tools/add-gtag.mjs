// add-gtag.mjs —— 把 GA4 代码插进目录下所有 html 的 </head> 前
// 用法: node add-gtag.mjs 网站目录路径 G-XXXXXXXXXX
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';

const [dir, id] = process.argv.slice(2);
if (!dir || !id) { console.log('用法: node add-gtag.mjs <网站目录> <G-XXXXXXXXXX>'); process.exit(1); }

const snippet = `\n<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n\n  gtag('config', '${id}');\n</script>\n`;

function walk(d) {
  const out = [];
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory() && !f.startsWith('.') && f !== 'node_modules') out.push(...walk(p));
    else if (f.endsWith('.html')) out.push(p);
  }
  return out;
}

let done = 0, skipped = 0;
for (const file of walk(dir)) {
  const html = readFileSync(file, 'utf8');
  if (html.includes('gtag/js?id=') || html.includes('GTM-')) { console.log(`跳过(已有): ${file}`); skipped++; continue; }
  if (!html.includes('</head>')) { console.log(`跳过(无</head>): ${file}`); continue; }
  writeFileSync(file, html.replace('</head>', `${snippet}</head>`));
  console.log(`已插入: ${file}`); done++;
}
console.log(`\n完成: 插入 ${done} 个，跳过 ${skipped} 个`);
