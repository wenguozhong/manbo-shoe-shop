# 素材与依赖

## 原创内容

- 低帮鞋几何由本项目生成。鞋楦、杯底、人字底纹、鞋孔、鞋带、线迹、饰片、鞋垫与标记位于 `src/three/`。当前发行版使用程序化模型，三个配色的 WebP 都从同一个 Viewer 生成。
- 黑白场地图像、穿搭与鞋材微距为原创生成图像，字标与挂件为本项目原创 SVG。文件、生成说明与拍摄构图见[图像清单](docs/IMAGE_CREDITS.md)。
- 品牌理念和指定英文口号来自上级目录的商赛任务书。网站中文、Journal 文章、原创纹样、鞋舌概念字样和概念香卡为本项目编写或绘制。
- 郑钦文为提案中的联名对象。运动员场景为虚构人物。项目没有使用其肖像、亲笔签名或赞助商标志。演示价、订单及授权状态均以网站概念声明为准。

## 浏览器运行依赖

版本由 `package-lock.json` 固定。字体通过 Fontsource 随站点分发，网页图像、模型与字体均为同源资源。中文使用设备字体。

| 资源 | 用途 | 项目与许可 |
| --- | --- | --- |
| DM Sans、Barlow Condensed | 正文、英文标题 | [DM Sans](https://fontsource.org/fonts/dm-sans)、[Barlow Condensed](https://fontsource.org/fonts/barlow-condensed)，SIL OFL 1.1 |
| Lucide React | 线性界面图标 | [Lucide](https://lucide.dev/license)，ISC，部分 Feather 图标沿用 MIT |
| React、React DOM、React Router、Zustand、Zod | 页面、路由、状态与配置校验 | [React](https://github.com/facebook/react)、[React Router](https://github.com/remix-run/react-router)、[Zustand](https://github.com/pmndrs/zustand)、[Zod](https://github.com/colinhacks/zod)，MIT |
| Three.js、React Three Fiber、Drei | WebGL、渲染层与相机控制 | [Three.js](https://threejs.org/)、[R3F](https://r3f.docs.pmnd.rs/)、[Drei](https://github.com/pmndrs/drei)，MIT |
| Tailwind CSS、Vite | 样式处理与静态打包 | [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss)、[Vite](https://github.com/vitejs/vite)，MIT |

随发行版分发的资源许可文本见 [THIRD-PARTY.txt](public/THIRD-PARTY.txt)。上传的用户图案只在该用户的浏览器与其主动导出的配置中使用。

