Konche Website — Local Review Package
=====================================

打开方式：
1. 解压整个 ZIP 文件。
2. 保持文件夹结构不变。
3. 双击 index.html，即可使用电脑浏览器打开网站。

说明：
- 本文件包不需要安装软件或启动网站服务器。
- 首页及全部产品页面均可通过菜单相互跳转。
- Manrope 字体、Konche Logo、样式和交互脚本已经包含在文件包内，可离线查看。
- 邮件、电话等链接只有在电脑配置了相应应用时才会启动。
- 404.html 仅在线上服务器直接访问不存在路径时展示；本地双击也可打开预览。

Version: 框架+产品信息补充 · 工业工程强化 · 消毒系列原理图上线（2026-08-20）
Prepared: 2026-08-20
Pages: 29 HTML files（28 个可索引页面 + 1 个 404 页）

本地校验（无需 Python，Node 18+）：
- node tools/validate_geo.mjs    全站 GEO/SEO 校验
- node tools/geo_audit.mjs       内容质量与可引用性审计
- node tools/site_audit.mjs       静态质量体检（标题/描述/图片/字体/内链/DOM/llms 链接完整性）
- node tools/deploy_check.mjs http://localhost:8642  部署后线上核验（示例）

部署指引见 DEPLOYMENT.md（含 nginx 域名 301、llms.txt 文本类型、旧文章 301 映射、发布清单）。
