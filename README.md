# idc. × THE QUEEN’S CRAFT

面向高中商赛评审的球鞋概念网站。品牌为 `idc.`，主打原创低帮板鞋 IDC COURT 01。郑钦文是拟议合作对象。演示购物袋仅保存在浏览器中。

## 启动

在独立鞋站仓库 `manbo-shoe-shop` 根目录，使用 Node.js 22.12 或更新的 Node 22 与 npm。

```sh
npm ci
npm run dev
```

开发服务器会输出本地地址。预览生产产物使用以下命令。

```sh
npm run build
npm run preview
```

## 演示路线

1. 从首页浏览品牌故事及三款配色，进入 Collection 或直接用颜色圆点预览鞋款，再进入 Studio。
2. 在 BASE 切换两种鞋楦和三种配色。点鞋上的真实部件或面板名称，设定颜色与四种基础材质。滑鼠或单指拖动可旋转，滚轮或双指可缩放。视角按钮可观察后跟、顶面及鞋底。
3. 在 DETAILS 选择鞋带式样、颜色、演示尺码和鞋舌内侧的原创字体字样。在 PERSONALIZE 输入最多 14 个文字、数字或空格，自选字体、颜色、内外侧和纹样。
4. 打开高级定制可模拟印花、刺绣，上传本地图案并移动或缩放。图像经过本地缩小、重新编码后放入方案，所以保存、刷新和 JSON 往返都能保留图案。
5. 在 REVIEW 查看八个部件的配置、概念赠品与当前搭配。导出 PNG 获取真实相机画面，导出 JSON 保存可编辑副本，导入 JSON 恢复。My Designs 可载入或删除方案。
6. 加入演示购物袋后可以调整数量、删除或返回工作室更新原条目。编辑购物袋中的方案保留数量。已保存方案和已加入的鞋子使用独立快照。

| 页面 | 路径 |
| --- | --- |
| 首页、系列 | `/`、`/collection` |
| 产品 | `/product/court-01?color=volt` |
| 工作室 | `/customize`，亦支持 `?color=origin\|volt\|shadow` |
| 品牌故事、杂志及三篇文章 | `/story`、`/journal`、`/journal/:id` |
| 购物袋、概念与隐私声明 | `/bag`、`/concept-notice` |

## 工程

React 19.3 与 React Three Fiber 9.8 配对，Three.js 0.180、Drei 10.7、TypeScript 5.9、Vite 7.3、React Router 7、Tailwind CSS 4、Zustand 5 和 Zod 4。WebGL 模块按需加载；首页使用同模型的预渲染图。

- `src/domain/config.ts` 定义唯一配置及导入校验，`src/domain/store.ts` 管理本机方案与购物袋。
- `src/three/ShoeModel.tsx`、`shoeGeometry.ts`、`appearance.ts` 生成可拾取网格与纹理。`Viewer.tsx` 提供相机、截图与设备降级。
- `src/studio/` 实现四步操作，`src/pages/` 是品牌、系列、产品、购物袋及内容页面。
- `public/` 包含同源图像、模型清单、原创图形、字体以外的静态资源与许可。`artifacts/screenshots/` 保存最终验收图。
- 可用 `node scripts/render-catalog.mjs` 离线重建三张产品图。此脚本需要可用的 Chromium，可通过 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指向本地安装。

### 接入自有授权的 GLB

将自包含 GLB 放进 `public/models/`，在 `public/court-model.json` 中把 `source` 改为 `glb` 并添加 `url`，例如 `/models/court-01.glb`。按文件内的 `partMap` 将 8 个 Part ID 对应至实际网格名，可每个部件填多个名称。外侧面朝 +Z、前掌朝 +X、Y 向上。加载器会归一化鞋长和离地高度，复制可调材质，保留原纹理。缺失映射会在面板中提示；文件无法解析时自动回到程序化模型。

可选的内/外侧 UV 饰片可在网格 extras 中加 `artworkPlacement: "inner"` 或 `"outer"`，UV 应上下、左右正读。变体鞋带和舌内字样网格可加 `laceType` 或 `tongueScript` 枚举值。自有 GLB 须自行提供对应的饰片、标记或变体几何。静态产品图可在接入后重新生成。

### 验收命令

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

E2E 针对正式构建启动本地预览。默认优先使用 Windows 安装的 Chrome，亦可指定上述可执行文件或先运行 `npx playwright install chromium`。桌面和触控模拟均操作实际浏览器中的 WebGL 画布。

## 交付与发布

- 独立仓库 [wenguozhong/manbo-shoe-shop](https://github.com/wenguozhong/manbo-shoe-shop)，生产分支 `main`。
- 正式展示目标为 `shop.manbomanbo.top`。Cloudflare Pages 从 GitHub 自动构建并托管 `dist/`，完成发布后本地开发机可以关机。原博客使用单独仓库。
- [Cloudflare Pages 发布设置及域名绑定](docs/DEPLOY_CLOUDFLARE.md) · [最终验收与发布记录](docs/ACCEPTANCE.md) · [素材与许可](CREDITS.md)。

## 演示边界

工艺、材质、联名字标、签名字样和盲盒赠品均为视觉提案。手机体验受设备 WebGL 支持程度影响，无法创建或丢失 WebGL 上下文时可使用二维配色示意继续编辑及导出 JSON。PNG 需要有效的 3D 画布。图片限制为 PNG/JPEG/WebP、最多 5 MB，导入配置最多 1 MB。浏览器存储配额耗尽时会提示导出 JSON。清除浏览器数据会同时移除本地方案和演示购物袋。

