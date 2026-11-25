# 第三方组件与素材声明

本文件记录当前仓库中已确认的第三方组件和字体。它们不因仓库根目录的 MIT License 或 CONTENT-LICENSE.md 而改变原有许可证。

## 1. KaTeX

- 版本：0.16.11
- 用途：本地数学公式排版。
- 位置：current/vendor/katex/
- 许可证：MIT License
- 版权声明及许可证全文：[current/vendor/katex/LICENSE](current/vendor/katex/LICENSE)
- 上游项目：https://github.com/KaTeX/KaTeX

KaTeX 的版权声明和许可证文本随仓库保留。

## 2. Noto 字体

项目自托管了 Noto 字体的子集和切片版本，字体文件仍按各自的 SIL Open Font License 1.1（OFL 1.1）授权。

### Noto Serif SC

- 文件：current/vendor/fonts/noto-serif-sc/NotoSerifSC-*.woff2
- 许可证：SIL Open Font License 1.1
- 版权声明及许可证全文：[current/vendor/fonts/noto-serif-sc/OFL.txt](current/vendor/fonts/noto-serif-sc/OFL.txt)（文件内版权声明：Google Inc., 2012）

### Noto Serif Latin / Greek

- 文件：current/vendor/fonts/noto-serif-sc/NotoSerif-latin-greek.woff2
- 许可证：SIL Open Font License 1.1
- 版权声明及许可证全文：[current/vendor/fonts/noto-serif-sc/OFL-NotoSerif.txt](current/vendor/fonts/noto-serif-sc/OFL-NotoSerif.txt)（文件内版权声明：The Noto Project Authors, 2022）

这些字体经过子集化和切片处理。字体软件及其修改版本仍受 OFL 1.1 约束，不适用仓库根目录的 MIT 或 CC BY-SA 许可证。分发字体文件时，应继续保留相应版权声明和 OFL 文本，并遵守 OFL 对保留字体名称等事项的要求。

## 3. Playwright

以下软件由根目录 package-lock.json 锁定，仅用于开发和自动化测试，不是网站运行时依赖：

- @playwright/test 1.63.0
- playwright 1.63.0
- playwright-core 1.63.0（传递依赖）

许可证：Apache License 2.0（Apache-2.0）

- 上游项目及许可证：https://github.com/microsoft/playwright
- 许可证文本：https://github.com/microsoft/playwright/blob/main/LICENSE

本仓库没有将 Playwright 的软件包源代码复制到网站运行目录；实际安装版本和完整依赖关系以 package-lock.json 为准。

## 4. 教材与研究参考

README 的致谢部分列出了北大版《高等代数》、Gilbert Strang、David Lay、Sheldon Axler、《线性代数不难》和 3Blue1Brown 等参考来源。

这些引用用于说明项目的教材背景和研究参考，不表示相关书籍、课程、视频、图像或代码被纳入本仓库许可证。第三方作品仍适用其各自的版权和授权条件。

## 5. 项目原创视觉素材与其他媒体

项目作者原创的首页水晶背景、主题插画、装饰图形、图标和 Logo 图形等视觉作品，按 [CONTENT-LICENSE.md](CONTENT-LICENSE.md) 采用 CC BY-SA 4.0 授权。Logo 图形的著作权授权不包含项目名称、商标或品牌识别权利。

本清单仅记录已确认的第三方组件和素材，不构成对所有媒体来源的完整审计。第三方图片、音频、视频、截图或其他素材仍适用其各自的权利声明；不要将它们视为已获得 MIT 或 CC BY-SA 4.0 授权。
