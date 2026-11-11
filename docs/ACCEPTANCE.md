# 最终验收 · 2026-11-12

验收环境为 Windows、Node.js 22.23.4 与 Chrome 157.0.8103.50。以下交互在 Vite 正式构建的静态产物上完成。手机采用 390 × 844 的 Chrome 触屏设备模拟。

| 项目 | 实际结果 |
| --- | --- |
| 干净安装与生产构建 | `npm ci` 成功，`npm run build` 生成 `dist/index.html`。最大的单个产物为 Three.js 引擎，约 704 kB。首页使用静态产品图，进入产品页和工作室时才加载 WebGL。 |
| 类型与静态检查 | `npm run typecheck` 通过。Lint 首次报告一个未使用的图标导入，移除后 `npm run lint` 通过。 |
| 配置、存储、几何 | `npm test` 的 21 项 Vitest 检查全部通过，覆盖不兼容文件、旧数据回退、独立快照、存储失败、实际鞋底尺寸变化、8 个部件及双面贴花网格。 |
| 浏览器验收 | 7 项 Playwright 场景全部通过。首次跑完 5 项通过；修正滑块无障碍名称和测试对路由切换的等待条件后，只复核两项受影响的桌面流程，2 项通过。 |
| 桌面内容与导航 | 首页主题切换、真实配色筛选、搜索、产品视角和演示尺码、3 篇文章、故事、FAQ、演示订阅、概念声明及 404 页面均已操作。 |
| 真实 3D 编辑 | 从渲染画面中选取蓝色网格，确认命中部件。实际 WebGL 像素随鞋型、配色、鞋头颜色、鞋带、侧面文字、纹样和刺绣而改变；其他部件的颜色保持独立。检查顶、后、底、重置视角及滚轮缩放。 |
| 图片与配置输入 | 本地标记图上传、横向移动、移除及重新上传通过。错误类型、超 5 MB 图片、超 1 MB JSON、不兼容文件和超长文字都有对应处理。 |
| 保存、导入、输出 | 实际下载并解码 PNG，验证为有多种颜色的非空图像。JSON 往返恢复了八个部件、文字、纹样、上传图片及位置。My Designs 载入与删除通过。 |
| 购物袋 | 普通鞋款和定制作品可加入演示袋。刷新后仍存在，编辑原条目能保留数量，增减及删除可用。 |
| 移动与布局 | 360 / 390 / 768 / 1024 / 1440 宽度检查。触控设备模拟验证单指旋转、双指缩放、移动菜单、四步定制及加入购物袋。 |
| 3D 降级 | 外部 GLB 无法解析时回到程序化模型。有效的小型 GLB 测试文件可按网格名映射，未映射部件显示禁用。关闭 WebGL 后可继续二维配置并导出 JSON；模拟上下文丢失后可重建 3D 并保留方案。 |
| 视觉验收 | 查看了桌面首页、全页、桌面与手机工作室、手机首页及带 MANBO 字样的刺绣特写。截图由生产预览生成。 |
| 已知范围 | 本轮使用 Windows Chrome 和模拟触屏，未使用真实 iPhone 或 Safari。印花、刺绣与材质属于概念表现。构建日志含第三方 Zod 注释在打包时被移除的提示。 |

[首页桌面](../artifacts/screenshots/home-desktop.png) · [完整首页](../artifacts/screenshots/home-desktop-full.png) · [手机首页](../artifacts/screenshots/home-mobile.png) · [桌面工作室](../artifacts/screenshots/studio-desktop.png) · [手机工作室](../artifacts/screenshots/studio-mobile.png) · [ORIGIN](../artifacts/screenshots/colorway-origin.png) · [VOLT](../artifacts/screenshots/colorway-volt.png) · [鞋侧文字与图案](../artifacts/screenshots/side-lettering-detail.png)

## 发布记录

- 源码版本 `4754aa47e4a64e7dfffb3d3ae154dbe9b94d3b45` 已推送，远端 main 的 SHA 经 Git 核对一致。[GitHub 源码版本](https://github.com/wenguozhong/manbo-shoe-shop/commit/4754aa47e4a64e7dfffb3d3ae154dbe9b94d3b45)
- GitHub 收到 `Workers Builds: manbo-shoe-shop` 成功回执。这个现有集成属于 Workers。回执中没有 Pages 部署地址。
- 截至 2026-11-12 01:22（北京时间），正式域名已解析，HTTPS 首页、系列、产品、工作室、购物袋返回 HTTP 404。原博客首页返回 HTTP 200。
- Cloudflare Pages 状态为 **NOT DEPLOYED: MANUAL ACTION REQUIRED**。当前可操作的控制台会话停在登录页。接手时先确认鞋站子域名现有绑定，再依照[发布步骤](DEPLOY_CLOUDFLARE.md)连接 Pages、绑定域名，并从真实网址核对静态资源、HTTPS 与深层链接。已通过的本地测试无需重跑。

