# 产品页 Banner 模板使用指南

模板文件：`tools/banner-template.html`（v1 · 2026-09-11）
参照范本：`products/industrial-ultrapure-water-system.html`
适用：所有 `products/*.html`（已核对 5 个抽样页面骨架一致，可干净替换）

---

## 一、这个模板改了什么（相对旧 banner）

| 旧结构 | 新结构 | 原因 |
|---|---|---|
| H1 → 设备类别副标题 → 承诺标签条(promise-strip) → 简介段 → 参数 → 标签 → 单CTA | H1 → **场景承诺副标题** → 工艺行(upw-subline) → 参数 → 标签 → **双按钮** → **质保折叠** | 首屏文字 -60%；场景优先；承诺/小字不再遮挡重点 |
| 纯参数副标题 | 副标题写行业场景，参数降为数字条 | 访客 3 秒内判断"这是给我用的" |
| 质保 12px 小字 | 原生 `<details>` 折叠，14px 可读 | 避免"小字藏条款"观感 |
| — | 次按钮 "Find Your Industry ↓" | 给非询盘访客一个出口 |

## 二、迁移步骤（每个页面约 15 分钟）

1. **替换 hero 段**：用 `banner-template.html` 整段替换该页 `<section class="product-hero">…</section>`，按注释填 8 个占位符。面包屑和 hero 图片沿用该页原值。
2. **删除旧元素**（模板里已不含，确认没残留）：`promise-strip` 承诺条、hero 简介段、`promise-note` 小字。
3. **检查 CSS 版本**：该页 `<head>` 的 `industrial.css?v=` 必须 ≥ `20260911-1`。
4. **附带增强脚本**：把下面脚本放在该页 `</body>` 前（`site-enhancements.js` 的 script 标签之后）：

```html
<script>
(function(){
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('upw-js');
  var reveals=document.querySelectorAll('.upw-reveal');
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('is-in');io.unobserve(en.target);}});},{threshold:0.15});
    for(var k=0;k<reveals.length;k++){io.observe(reveals[k]);}
  } else {
    for(var m=0;m<reveals.length;m++){reveals[m].classList.add('is-in');}
  }
  if(reduce||!('IntersectionObserver' in window))return;
  var nums=document.querySelectorAll('[data-countup]');
  var io2=new IntersectionObserver(function(es){es.forEach(function(en){
    if(!en.isIntersecting)return;io2.unobserve(en.target);
    var el=en.target,v=parseFloat(el.getAttribute('data-value')),d=parseInt(el.getAttribute('data-decimals')||'0',10),pre=el.getAttribute('data-prefix')||'',suf=el.getAttribute('data-suffix')||'',t0=null,D=1100;
    function step(ts){if(!t0)t0=ts;var p=Math.min((ts-t0)/D,1);p=1-Math.pow(1-p,3);el.textContent=pre+(v*p).toFixed(d)+suf;if(p<1)requestAnimationFrame(step);}
    requestAnimationFrame(step);
  });},{threshold:0.6});
  for(var n=0;n<nums.length;n++){io2.observe(nums[n]);}
})();
</script>
```

5. **GA4 埋点**（与主脚本并存）：

```html
<script>
(function(){var els=document.querySelectorAll('[data-ga-event]');for(var i=0;i<els.length;i++){(function(el){el.addEventListener('click',function(){if(typeof window.gtag==='function'){window.gtag('event',el.getAttribute('data-ga-event'),{industry:el.getAttribute('data-ga-industry')||'',page_location:window.location.pathname});}});})(els[i]);}})();
</script>
```

6. **SEO 红线**：`<title>`、meta description、H1、hero 图的 alt 一律沿用原值；副标题改写时必须保留该页 meta/H1 中的核心关键词（模板只动视觉层级，不删关键词）。

## 三、各槽位写作公式

| 槽位 | 公式 | 反例（不要写） |
|---|---|---|
| SCENARIO_SUBTITLE | `用途 + 行业列举`（2–4 个行业） | "Industrial RO Pure Water Equipment"（设备类别） |
| PROCESS_SUBLINE | `工艺路线 · 执行标准/认证` | 营销形容词 |
| 参数×3 | 客户最先问的 3 个数字（出水指标、能力、覆盖范围） | 超过 3 个、或放" years 工厂历史"类非参数 |
| 标签 3–5 个 | 出水指标 / 工艺亮点 / 标准 / 认证，短语 ≤6 词 | 完整句子 |
| 幽灵按钮目标 | 本页场景板块锚点；没有场景板块就删掉按钮 | 指向不存在的锚点 |

## 四、上线前 QA 清单

- [ ] 无 JS 时（禁用 JS 刷新）首屏信息完整、质保折叠可用（原生 details）
- [ ] 点击幽灵按钮滚动到目标锚点；目标 id 在页内真实存在
- [ ] 移动端 390px：参数不挤压、按钮可点、标签可横向滑动
- [ ] GA4 DebugView 里能看到 `hero_find_industry_click`
- [ ] title/meta/H1 与改版前一致
- [ ] 若页面有 `data-industrial="v1"` 铭牌条：确认它仍紧跟 hero（该条样式全站已有）

## 五、已知坑（在 industrial-ultrapure 页踩过的）

1. **锚点目标必须真实存在**：`site-enhancements.js` 会把静态 `.product-cta` 替换为注入的 `#project-inquiry` 表单——不要把锚点指向 `.product-cta` 上自己新加的 id（会被移除）。
2. **平滑滚动兼容**：不要依赖 CSS `scroll-behavior: smooth` 做锚点跳转（部分内置浏览器无效果），使用指南第 4 步脚本里的瞬时兜底逻辑。
3. **版本号**：改了 `industrial.css` / `site-enhancements.js` 后，必须同步抬高引用处的 `?v=`，否则用户拿到旧缓存。
