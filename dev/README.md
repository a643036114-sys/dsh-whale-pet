# dev —— 开发期脚本

这些文件**不参与插件安装**，也不会被 DSH 加载；放在这里只为留档，方便以后继续改动画。

| 文件 | 用途 |
|---|---|
| `verify-bundle.mjs` | 用 `node:vm` 在无 `window` 的环境里执行 `lib/client.js`，验证 `__ModuleLoader__.load` 被调用、`factory` 返回 `apply` 且 `inject` 含 `timer`。`npm run verify` 就会跑它。 |
| `whale-preview.html` | 独立演示页：`start dev/whale-preview.html` 直接用浏览器打开，调动画参数比反复重装插件快得多。 |
| `server.js` | 本地调试服务（`node dev/server.js`）：提供 `/whale.js` 和一段注入页面，历史遗留。里面的端口 `3080`/`8799` 是早期 DSH Web 端口，按需改。 |
| `whale-gui-v2.js` | 最早的「控制台粘贴注入」版本，`server.js` 分发的就是它。 |
| `whale-plugin-client.js` | 之后的 `cordis_define` 动态插件版本（返回 `{ inject, apply }` 对象）。 |
| `_fc.js` | 一次性小工具：`node dev/_fc.js <file>` 检查一段 JS 能否被 `new Function` 解析。 |

正式插件入口是仓库根的 `package.json` → `lib/index.js`（Host 半）与 `lib/client.js`（浏览器半），改完跑一次 `npm run verify`，再到 Plugins 里重新加载 / 重装即可。
