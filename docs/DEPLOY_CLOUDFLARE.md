# 使用 Workers Builds 发布静态鞋站

生产仓库是 [wenguozhong/manbo-shoe-shop](https://github.com/wenguozhong/manbo-shoe-shop)，生产分支为 `main`。GitHub 已连接 Cloudflare 上的 `manbo-shoe-shop` Worker。这个站点仅发布静态资源，定制器、方案和购物袋都在浏览器运行。

## 发布

1. 从项目根目录提交变更并推送到 `main`。在对应提交的检查项中打开 **Workers Builds: manbo-shoe-shop** 观察构建与发布。
2. 生产部署命令使用 `npx wrangler deploy`。仓库根目录的 [wrangler.jsonc](../wrangler.jsonc) 让 Wrangler 调用 `npm run build` 并上传 `dist/`。可将 Workers Builds 控制台中独立的 Build command 留空，以避免构建两次。Node 使用 `.node-version` 约定的 22 系列。
3. Worker 名称应为 `manbo-shoe-shop`。配置里的 Custom Domain 是 `shop.manbomanbo.top`。在 Worker 的 **Settings → Domains & Routes** 中查看关联结果。若提示同名 DNS 记录或域名归属冲突，核实该 `shop` 记录所服务的项目后，仅处理该子域名。
4. 发布完成后从正式网址直接访问首页、`/collection`、`/product/court-01`、`/customize?color=volt` 和 `/bag`。在工作室刷新，确认正确的页面与 3D 画布出现。单页导航回退由 `assets.not_found_handling` 配置。[Cloudflare SPA 静态资源说明](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/) · [自定义域名](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)

## 本地预览

```sh
npm ci
npm run build
npm run preview
```

## 排查线上 404

先核对 GitHub 检查的提交与生产 Worker 版本。首页 404 时，查看该版本部署日志中的静态资源上传及自定义域名步骤，再核对域名当前指向的服务。如果首页正常而地址栏直达工作室失败，确认 `assets.directory` 为 `./dist`、产物根目录有 `index.html`，且导航回退为 `single-page-application`。生产实测与限制见[验收记录](ACCEPTANCE.md)。
