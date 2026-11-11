# 发布到 shop.manbomanbo.top

这个鞋站使用独立源码仓库，生产分支为 `main`。Cloudflare Pages 从 GitHub 构建 Vite 应用并托管静态资源。发布成功后可以关闭开发电脑。[鞋站 GitHub 仓库](https://github.com/wenguozhong/manbo-shoe-shop)

截至本轮交付，独立仓库已有 main。该仓库在 GitHub 上出现了现有的 **Workers Builds: manbo-shoe-shop** 成功检查，Pages 仍需通过控制台核实。若沿用计划书中的 Pages 路径，在下面第 2 节明确选择 **Pages**，先用实际分配的 pages.dev 地址确认站点可用，再打开第 3 节处理 shop 的现有绑定和证书。若显示这个子域名已经绑定到其他服务，先在控制台辨认对应项目；对接手者而言，需要迁移的范围只有鞋站子域名。

## 1. 准备生产分支

在鞋站项目目录操作。GitHub 的 `main` 应包含 `package.json`、`package-lock.json`、`.node-version`、`index.html`、`src/` 与 `public/`。已推送代码的情况下直接进入下一步。更新已有本地提交时，先确认仓库地址，然后推送。

```bash
git remote -v
git push -u origin main
```

若此独立项目还没有 `origin`，先运行 `git remote add origin https://github.com/wenguozhong/manbo-shoe-shop.git`。在其他电脑上可直接克隆该仓库。构建和本地预览命令如下。

```bash
npm ci
npm run build
npm run preview
```

## 2. 将鞋站与 Cloudflare Pages 关联

1. 登录管理 `manbomanbo.top` 的 Cloudflare 账户，在账户首页确认能看到这个域名。打开 **Workers & Pages → Create application → Pages → Connect to Git**。[Cloudflare 控制台](https://dash.cloudflare.com/) [Git 集成向导](https://developers.cloudflare.com/pages/get-started/git-integration/)
2. 选择 GitHub 账号与 `wenguozhong/manbo-shoe-shop`。首次将账户与 Cloudflare 关联时，按向导配置 **Cloudflare Workers and Pages** GitHub App，仅为鞋站添加所需的仓库访问权限。已有安装时，保留原有仓库授权。[GitHub 集成说明](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)
3. 创建项目时填写下表。项目名被占用时可换另一个可用名，后续读取控制台分配的网址。[Pages 构建配置](https://developers.cloudflare.com/pages/configuration/build-configuration/) [Node 版本设置](https://developers.cloudflare.com/pages/configuration/build-image/)

| 项目设置 | 填写值 |
| --- | --- |
| Project name | `manbo-shoe-shop` |
| Production branch | `main` |
| Framework preset | `React (Vite)` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | 留空，使用 Git 仓库根目录 |
| Node.js | 仓库根目录的 `.node-version` 指定 `22`；需要手动指定时填 `NODE_VERSION=22` |

4. 选择 **Save and Deploy**。在 **Deployments** 打开这次生产构建，核对提交 SHA。看到成功状态后，打开页面列出的实际 `pages.dev` 地址，确认首页和 `/customize` 能加载。之后推送 `main` 会触发生产构建；项目内其他分支按 **Settings → Builds → Branch control** 设置生成预览部署。[分支控制](https://developers.cloudflare.com/pages/configuration/branch-build-controls/)

## 3. 绑定 shop 子域名

1. 在鞋站 Pages 项目中打开 **Custom domains → Set up a domain**，输入 `shop.manbomanbo.top` 并继续。由此建立 Pages 与自定义域名的关联。[自定义域名向导](https://developers.cloudflare.com/pages/configuration/custom-domains/)
2. 同账户管理 DNS 时，核对向导显示的记录并确认。若向导要求手动配置，进入 `manbomanbo.top` 的 **DNS → Records**，添加类型 `CNAME`、名称 `shop`，目标为上一步控制台显示的实际 `….pages.dev` 主机名。目标仅填主机名。若 `shop` 已有记录，先核实它当前承载的服务；本次所有 DNS 操作仅涉及 `shop`。[DNS 记录与 Pages 关联](https://developers.cloudflare.com/pages/configuration/custom-domains/)
3. 等待 **Custom domains** 显示 **Active**，使用 HTTPS 直接打开首页，以及 `/collection`、`/product/court-01`、`/customize?color=volt` 和 `/bag`，分别刷新。现场演示重点确认手机可操作 3D、定制图像可导出、同一域名保存的方案刷新后仍可恢复。另打开原博客确认访问正常。

首次上线记录应包含生产提交 SHA、控制台分配的实际 `pages.dev` 地址、`shop.manbomanbo.top` 的证书和深层链接结果。发布进度见仓库 README 的交付记录。

## 故障定位

| 现象 | 查看或修复的位置 |
| --- | --- |
| Cloudflare 仓库选择框里找不到鞋站 | 在 GitHub 的 **Settings → Applications → Installed GitHub Apps** 打开 **Cloudflare Workers and Pages → Configure**，为这次关联加入鞋站，并核实所选 GitHub 账户。 |
| 构建失败或首页 404 | 在失败部署中查看第一条错误。确认构建根目录、Node 22、锁文件、大小写和 `dist/index.html`。本地复现可使用上面的构建命令。 |
| 首页正常，直接访问定制器却 404 | 查看产物根目录是否误含 `404.html`。Pages 默认让缺少根级 `404.html` 的单页应用处理客户端路由。[SPA 回退机制](https://developers.cloudflare.com/pages/configuration/serving-pages/) |
| 子域名显示 522、域名待验证 | 核对 Pages 的 **Custom domains** 关联、`shop` 的现有 DNS 记录和目标主机，查看控制台的证书验证提示。[域名关联与 522](https://developers.cloudflare.com/pages/configuration/custom-domains/) |
| 部署报单文件太大 | 查看构建产物中出错的资产。Pages 每个静态文件最多 25 MiB；压缩贴图或模型后再提交。[静态资源上限](https://developers.cloudflare.com/pages/platform/limits/) |
| 鞋子画布或 PNG 导出异常 | 检查浏览器的 WebGL 支持与控制台信息，在 Network 中查看贴图、模型的路径、响应类型与同源加载。 |
