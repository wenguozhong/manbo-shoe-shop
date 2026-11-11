# 品牌视觉素材记录

## 商品渲染图

`public/images/court-01-origin.webp`、`public/images/court-01-volt.webp`、`public/images/court-01-shadow.webp` 对应工作室的 ORIGIN、VOLT、SHADOW 三种基础配置。图像来源是本项目原创的程序化低帮鞋模型 `src/three/ShoeModel.tsx`。渲染时使用 `createConfig` 的默认鞋型与材质、同一摄影机视角与灯光，三款共用取景范围，输出尺寸为 1000 × 760。

依赖安装完成后可在项目根目录运行 `node scripts/render-catalog.mjs` 重新生成。脚本用 Vite 临时提供模型入口，通过 Playwright 启动 Chromium 读取工作室的 WebGL 画面。可以用环境变量 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指定浏览器，Windows 默认识别常规位置安装的 Chrome，其他环境可以使用 Playwright 安装的 Chromium。

## 原创矢量图形

品牌字标、浏览器图标和鞋带挂件均为本项目绘制的 SVG 路径，可直接在矢量编辑器中打开。字标以向前倾斜的小写字形拼写 `idc.`，保留句点。浏览器图标提取字标中的 `i` 和句点，使用电蓝底色。

| 文件 | 图形 |
| --- | --- |
| `public/graphics/wordmark-black.svg`、`public/graphics/wordmark-white.svg` | 同一轮廓的黑、白品牌字标 |
| `public/favicon.svg` | 电蓝底的浏览器图标 |
| `public/graphics/charm-0.svg` | RALLY，双曲球缝网球 |
| `public/graphics/charm-1.svg` | MOTION，折线箭翼 |
| `public/graphics/charm-2.svg` | CROWN，三齿王冠 |
| `public/graphics/charm-3.svg` | SPARK，切面闪电 |
| `public/graphics/charm-4.svg` | STAR，放射刻面五角星 |
| `public/graphics/charm-5.svg`、`public/graphics/charm-6.svg` | HIDDEN 01 和 HIDDEN 02，带金属扣环的隐藏轮廓 |

## 摄影风格图像

这组图像由本项目使用 OpenAI 内置 imagegen 生成。网页交付文件存放于 `public/images/`，由生成的原始 PNG 缩放、编码为 WebP。图中运动员为虚构人物，鞋材与鞋款用于学生商赛概念展示。

| 文件 | 像素 | 文件大小 | 内容 |
| --- | --- | --- | --- |
| `hero.webp` | 1920 × 817 | 138 KiB | 俯拍球场右侧挥拍的虚构运动员，左侧留出标题空间。 |
| `journal-court.webp` | 1120 × 747 | 210 KiB | 空球场上的斜向球网、网格投影与网球。 |
| `journal-style.webp` | 1120 × 747 | 93 KiB | 白色低帮板鞋与卷边牛仔裤迈过城市路缘。 |
| `detail.webp` | 1120 × 840 | 225 KiB | 电蓝麂皮鞋眼片、奶白皮革、织带和双行明线的微距概念图。 |

## 生成提示词

### hero

Use case: photorealistic-natural. An ultra-wide 2.35:1 horizontal black-and-white editorial sports photograph of a tennis court seen from above. Strong graphic lines and distant chain-link shadows. On the right side of the frame, a single adult tennis player in a plain white full tracksuit, long trousers and a white cap, steps into a powerful forehand with racket extended to meet a tennis ball. The figure is fully in frame, in dynamic motion, anonymously seen from the back and overhead. Left half consists of dark, evenly shaded empty court, perfectly quiet behind a website headline to be added later. Late afternoon, crisp diagonal athletic shadow on the right, rich silver 35mm film texture and beautiful contrast. Architectural framing with one painted sideline and net in the distance. Make the figure and extended racket large and clear in the right third. A premium independent sports magazine campaign image. No lettering, sponsor marks, watermark or actual celebrity.

### journal-court

Use case: photorealistic-natural. A single landscape 3:2 pure monochrome photographic editorial still life for a premium independent sport culture journal. An utterly empty outdoor hard tennis court from a high overhead angle. A long court net with slim ivory top tape cuts diagonally through frame and casts sharp repeating geometric shadows. Offbeat severe crop, chalk white court lines, empty charcoal asphalt in late-afternoon sunshine, one tilting pale tennis ball. Black and white 35mm film study, deep tonal range, exceptionally tactile dusty surface, light analog grain. Beautiful abstract geometry without becoming a drawing. No people, no words, no logos, no watermarks.

### journal-style

Use case: photorealistic-natural. Single landscape 3:2 black-and-white editorial street-style film photograph. Frame a young adult from the knees down as they step off a worn concrete curb, urban sun and deep architectural shadows, visible cuffed loose raw denim trousers, ribbed white socks, plain unbranded ivory low-top leather cupsole sneakers with black heel patch, flat cotton laces and clean undecorated side panels. One foot landed prominently, the other blurred mid-stride, effortless natural motion, knee and waist cropped out. Independent contemporary fashion journal, premium graphic crop, documentary 35mm film grain and direct hard light, real material creases and texture. No text, no logos, no famous silhouette markings, no stripes or checks, no watermark.

### detail

Use case: product-mockup. A single 4:3 sculptural extreme macro product photograph of an original electric cobalt blue and warm ivory low-top court sneaker. Camera close to the blue suede eyestay and ivory pebbled-leather quarter panel with double rows of ivory topstitching; two broad white woven cotton lace crossings slice diagonally across the upper third, blue punched eyelets. Focus on nap, stitch tension and cotton fibers under a crisp raking softbox light from left. Fill the entire frame edge to edge with physical materials. Minimal luxurious editorial art direction, mostly monochrome cream materials with one strong saturated blue suede strip. Natural slight surface imperfections, realistic depth of field, incredibly tactile. No text, no logo, no watermark, no foot, no decorative colored stripes, no sales page.
