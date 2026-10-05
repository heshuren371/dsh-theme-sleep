# Repository instructions · dsh-theme-sleep

面向第一次接手本仓库的人与 agent。改代码前先读完本文件。

## 这是什么

DSH（DeepSeek Harness）的 Web 插件，v1.0.0，MIT，仓库
https://github.com/heshuren371/dsh-theme-sleep。

它做三件事：按本地时间在浅色/深色主题之间自动切换；每天 23:30 提醒睡觉；
每轮对话跑完响一声。三件事都是浏览器行为，所以行为几乎全在 Client 半边，
Host 半边只提供 Loader 座位和 Config 校验。

唯一真源是 `src/`；`lib/` 是构建产物，**提交进仓库**（DSH 从 GitHub 链接安装，
不跑构建步骤）。

## 仓库地图

| 路径 | 职责 |
| --- | --- |
| `src/core/**` | 纯逻辑：时段算术、提醒状态机、完成提示音的状态折叠、配置归一化、浏览器存储、音效音名表。不碰 DOM、定时器、`ctx`；依赖时钟的函数显式接收 `now`，所以全部可单测 |
| `src/ui/**` | 三个界面：状态胶囊 `chip`、提醒卡 `overlay`、设置行 `settings`，加一份纯 CSS 字符串 `styles.ts`。只渲染 props，不做决定 |
| `src/platform.ts` | 浏览器模块表桥：运行时取 `react` / `react-dom` |
| `src/ui/h.ts` | 桥的转发层，界面文件只从这里拿 React |
| `src/i18n.ts` | 中英字典（键集以中文为准）+ `t()` |
| `src/client.ts` | Client 入口：注册 bundle、主题驱动、提醒驱动、完成提示音、设置读写、slot 座位、错误边界 |
| `src/index.ts` / `src/schema.ts` | Host 半边：空 `apply` + Config schema |
| `lib/` | 产物：`client.js`（esbuild 单文件 IIFE）+ `index.js`、`schema.js`、`core/*.js`（tsc） |
| `scripts/build.mjs` | esbuild 打 Client bundle + tsc 出 Host 与核心 |
| `scripts/smoke.mjs` | jsdom 里加载真实 `lib/client.js` 的端到端测试（`test:client`） |
| `scripts/check-fresh.mjs` | 重新构建并断言 `lib/` 与 `src/` 一致（`check:fresh`） |
| `tests/core/**` | 纯逻辑单测，跑在构建产物上（`test:core`） |
| `cordis.patch.yml` | 插入 Loader 行 `theme-sleep` → `@local/dsh-theme-sleep` |
| `locale/*.json` / `icon.svg` | Plugin Manager 与设置页读的展示元数据 |

## 命令

```sh
pnpm install           # 直接装；pnpm-workspace.yaml 已允许 esbuild 的安装脚本
pnpm run typecheck     # tsc --noEmit
pnpm run build         # esbuild + tsc
pnpm run check:fresh   # 重新构建并断言 lib/ 未漂移
pnpm run test:core     # node --test tests/
pnpm run test:client   # scripts/smoke.mjs
pnpm run verify        # typecheck + build + 两个测试
```

CI（`.github/workflows/ci.yml`）跑的就是 `verify` 加一次 `check:fresh`。

## 不变量

- **`lib/` 是产物，提交进仓库，永不手改。** 改完 `src/` 必须 `pnpm run build`，
  并把 `lib/` 一起提交；`check:fresh` 会抓住漂移。
- **Client bundle 必须无静态 import。** `lib/client.js` 是单个 IIFE，由宿主在浏览器里
  eval；`react` / `react-dom` 只能经 `src/platform.ts` 从模块表取。加静态
  `import 'react'` 会让整份 bundle 在浏览器里加载失败。
- **`src/core/**` 保持纯。** 不引用 DOM、定时器、`ctx`、`window`；需要时间就传入
  `now`。这样才能在 Node 里直接单测，也才能在不改测试的前提下替换时钟。
- **类型是门禁。** `tsconfig.json` 开着 `strict`、`noUncheckedIndexedAccess`、
  `noUnusedLocals`、`noUnusedParameters`。不要为了变绿放宽开关，清掉死代码。
- **持久化数据不可信。** `localStorage` 的 `dsh-theme-sleep/v1` 可能被改坏或来自旧版本，
  一律经 `core/config.ts` 与 `core/storage.ts` 归一化，不抛错。
- **主题写入只有一个入口。** `ctx.theme.setTheme()`；设置写入只有一个入口
  （设置行的 `persist`）。别新增绕过它们的写路径。
- **界面样式只用宿主 token。** `--dsw-alias-*` / `--dsw-static-*` / `--dsw-radius-*`，
  类名统一 `dts-` 前缀。硬编码颜色会在主题切换时露馅。
- **UI 文案必须同时补 `zh` 与 `en`**（`src/i18n.ts`），键集以中文为准。

## 容易踩的坑

这几条都是实际踩过的，改相关代码前先读：

- `ReminderEngine.watcherStartMs` 只在「挂载」和「从 disabled 变回 enabled」时重置。
  在 tick 里重置会让当天的提醒永不触发；不重置又会让关掉再打开时补一炮过去的提醒。
- `msUntilNextCheck` 不能返回 0，除非确实需要立刻重算。返回 0 会变成 `setTimeout(…, 0)`
  的紧密循环，每次都写一次 `localStorage`。
- `core/storage.ts` 的 `saveStoredState` 是**合并**语义，清不掉字段；要删的字段必须
  在第二个参数 `reset` 里点名。
- 主题归属靠「这次写入实际生效的配色」判断，不是靠「最后请求的偏好」：用户很可能在
  插件自己写完主题后马上手动改一次，按请求值判断会吞掉用户操作。
- 手动改主题后的接管窗口是**有限**的，且取「窗口结束」与「下一个切换点」中更早的一个。
  给一个永不过期的截止时间会把主题永久卡死。
- 设置行只写设置；改设置会触发一次主题重算，但不会绕过归属判断。
- `ctx.uiSession` 刻意**不在** `exports.inject` 里：缺了它插件仍要能提供主题与就寝提醒。它只能经
  `ctx.inject(['uiSession'], …)` 取用——Cordis 对未声明的服务读取直接抛错，`?.` 挡不住，会让整条 entry
  起不来；服务缺席时完成提示音静默跳过，不要改成硬依赖。
- 完成提示音只在页面可见时响：后台标签页用户听不见，部分浏览器还会挂起它的音频上下文。
- 会话完成判据是**运行中→空闲**这一个转换。首次看到的空闲会话是基线，不算完成；从快照里消失的会话也不算完成（那代表会话没了，不是活干完了）。

## 不要动

- `lib/`（产物）、`node_modules/`、`pnpm-lock.yaml`（除非确实改了依赖）
- 不要为了让 CI 变绿删断言或放宽 `tsconfig`
- 不要手改 profile 的 `package.json` 或 `cordis.patch.yml`：安装与 bundle 选择由 DSH
  的 plugin manager 负责
