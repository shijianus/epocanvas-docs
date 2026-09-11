# v1.2.0

发布日期：2026-09-11
在线站点：[https://doc.epocanvas.com](https://doc.epocanvas.com)
源码仓库：[https://github.com/shijianus/epocanvas-docs](https://github.com/shijianus/epocanvas-docs)

这是 EpoCanvas Docs 的第一个正式发布版本。文档站基于 Astro 5 和 Starlight 搭建，这个版本把界面、搜索、多语言和发布流程都理顺了，可以直接拿来维护自己的项目文档。

## 界面与阅读

- 三栏布局：左侧是分类导航，中间是正文，右侧是当前页面的目录。目录会跟随滚动，高亮正在阅读的小节。
- 切换页面时，左侧导航会记住之前的滚动位置，不用每次展开目录重新找。
- 默认深色主题，会跟随系统设置自动切换，也可以在右上角手动切换。
- 正文行宽做了限制（54rem），长文读起来不容易串行。

## 搜索

- 用 Pagefind 在构建时生成索引，搜索全部在浏览器本地完成，不调用第三方服务，内网或离线环境都能正常使用。
- `Ctrl+K`（macOS 为 `Cmd+K`）呼出搜索框，支持中英文检索，命中的关键词会高亮显示。

## 多语言

- 界面文案支持 10 种语言：简体中文、繁体中文、英语、日语、韩语、德语、法语、西班牙语、俄语、阿拉伯语。
- 切换语言不刷新页面，文字就地替换，滚动位置和阅读进度保持原样。

## 写作与排版

- 支持 Note、Tip、Important、Warning、Caution 五种提示框。
- 代码块基于 Shiki 语法高亮，支持文件名标签、指定行高亮和 diff 展示。
- 内置 Mermaid，流程图和时序图直接写在 Markdown 里，不需要外部截图。

## 部署

- 纯静态输出，托管在 Cloudflare Pages，已绑定域名 doc.epocanvas.com，HTTPS 证书自动配置。
- 本地执行 `pnpm run deploy` 即可完成构建并发布。

## 其他

- 清理了早期开发阶段遗留的测试页面和组件，文档文件名与内容重新对齐，旧地址保留了重定向，外部链接不会失效。
- 项目以 MIT 协议开源，README 补齐了界面截图、快速上手、目录结构和部署说明。

## 升级方式

之前在本地跑过旧版本的话，拉取代码后重装依赖、重新构建即可：

```bash
git pull
pnpm install
pnpm run build
```

没有配置文件变更，已有文档内容不需要修改。
