<div align="center">

<img src="icon.svg" width="96" height="96" alt="dsh-theme-sleep icon">

# dsh-theme-sleep

**按你的作息切换主题，到点提醒你睡觉。**

DSH（DeepSeek Harness）Web 插件 · [MIT](LICENSE) · 设计目标是装上之后你不需要再想起它

</div>

---

## 它做什么

| | |
| --- | --- |
| **自动主题** | 默认 `06:00–19:00` 浅色、`19:00–次日 06:00` 深色，到点自动切换，不用点任何东西 |
| **就寝提醒** | 默认每天 `23:30`：右下角常驻提醒卡 + 系统通知 + 提示音，可「再等 10 分钟」或「今晚就睡」 |

三个界面：

| 位置 | 内容 |
| --- | --- |
| 输入框下方的状态胶囊 | 当前主题（太阳/月亮）、下一次切换时间、就寝提醒时间；手动改过主题时追加「已手动指定主题 · HH:mm 后自动接管」；点开有说明 |
| 到点后的提醒卡 | 屏幕右下角常驻，`今晚就睡` / `再 10 分钟` / `知道了` |
| 设置 → 通用 → 自动主题与睡觉提醒 | 时间、开关、稍后提醒间隔、提示音、接管窗口、系统通知授权、恢复默认 |

## 装上之后会发生什么

- **主题跟着时间走，但不跟你抢方向盘。** 你在设置里手动改过主题，插件认出这是你的选择，在 `manualOverrideMinutes` 这段时间内不覆盖，状态胶囊写明「多久之后自动接管」。窗口结束与下一个切换点，两者取更早的一个，插件自动接管。
- **就寝提醒一天只响一次。** 已经响过的那天，刷新页面不会重响；当天 23:30 之后才打开页面也不会补一炮。
- **设置存两份。** 浏览器本地一份让刷新后立刻按你的规则走；Host 设置文档一份保证跨会话一致。

## 安装

从 GitHub 装（推荐，插件按 DSH bundle 的形式自带 Loader 行与展示元数据）：

```
plugin_manager({ action: 'install_bundle', target: 'github:heshuren371/dsh-theme-sleep' })
```

从本地 checkout 装，或者你想改代码时：

```sh
git clone https://github.com/heshuren371/dsh-theme-sleep.git
cd dsh-theme-sleep
pnpm install
pnpm run build
```

```
plugin_manager({ action: 'install_bundle', target: '/绝对路径/dsh-theme-sleep' })
```

`install_bundle` 负责写 profile 的 `package.json` 与 bundle 选择，**不要手改这两处**。

> 仓库提交了构建产物 `lib/`：DSH 的链接安装不跑构建步骤，`lib/client.js` 就是浏览器实际加载的那份文件。所以从 GitHub 装不需要你先构建。
>
> 在 DSH `0.2.1-alpha.1` 上开发与验证。插件只用宿主已有的 `theme`、`slots`、`locale`、`configForms` 四个服务，加一个 npm 包 `@deepseek-ai/schemastery` 做 Host 半边的 Config 校验。

## 配置

profile 的 `cordis.patch.yml` 可以覆盖任意字段，设置页的改动写在同一行的用户层。

```yaml
- id: theme-sleep
  config:
    dayStart: '06:00'                # 浅色区间的第一分钟（含）
    dayEnd: '19:00'                  # 深色区间的第一分钟；浅色区间是 [dayStart, dayEnd)
    reminderEnabled: true            # 是否启用就寝提醒
    reminderTime: '23:30'            # 每天提醒的时刻
    snoozeMinutes: 10                # 「再等 N 分钟」的 N（1–120）
    soundEnabled: true               # 提醒时是否播放提示音
    manualOverrideMinutes: 30        # 手动改主题后，等你多久再按规则接管
```

| 字段 | 默认 | 说明 |
| --- | --- | --- |
| `dayStart` | `06:00` | 浅色开始 |
| `dayEnd` | `19:00` | 浅色结束，也是深色开始 |
| `reminderEnabled` | `true` | 就寝提醒开关 |
| `reminderTime` | `23:30` | 提醒时刻 |
| `snoozeMinutes` | `10` | 稍后提醒的间隔 |
| `soundEnabled` | `true` | 提示音 |
| `manualOverrideMinutes` | `30` | `0` = 立刻按规则切回；上限 `1440` = 保留到下一个切换点 |

时间一律 `HH:mm`。规则允许跨午夜：`dayStart: '22:00'`、`dayEnd: '05:00'` 表示夜里浅色。两个时间相同表示不切换。

设置页的改动即时生效：改完时间会立刻重算当前时段，改完提醒时间会立刻重排下一天的提醒。`manualOverrideMinutes` 只在「你手动改主题」之后才起作用。

## 开发

```sh
pnpm install           # pnpm 11 需要 pnpm-workspace.yaml 里 allowBuilds 放行 esbuild
pnpm run typecheck     # tsc --noEmit
pnpm run build         # esbuild 出 lib/client.js，tsc 出 Host 与 core
pnpm run test:core     # 纯逻辑单测（node --test "tests/**/*.test.mjs"）
pnpm run test:client   # jsdom 里加载真实 lib/client.js 的端到端测试
pnpm run check:fresh   # 重新构建并断言 lib/ 没有漂移
pnpm run verify        # typecheck + build + 两个测试
```

`verify` 与 `check:fresh` 就是 CI 的全部内容，任何一条红了都不要合。

| 路径 | 职责 |
| --- | --- |
| `src/core/**` | 纯逻辑：时段算术、提醒状态机、配置归一化、浏览器存储。不碰 DOM 和定时器，依赖时钟的函数显式接收 `now` |
| `src/client.ts` | Client 入口：主题驱动、提醒驱动、设置读写、slot 座位、错误边界 |
| `src/ui/**` | 三个界面：状态胶囊、提醒卡、设置行。只渲染 props，不做决定 |
| `src/index.ts` / `src/schema.ts` | Host 半边：Loader 座位 + `Config` 校验 |
| `lib/` | 产物，随仓库提交 |

行为全在浏览器半边，Host 半边只占座位和校验配置，所以没有 Host 侧定时器或状态。改代码前先读 [AGENTS.md](AGENTS.md)：里面有本仓库的不变量，以及几个实际踩过的坑。

## 验证

```sh
$ pnpm run verify
build: lib/client.js (bundled) + lib/index.js, lib/schema.js, lib/core/*.js (tsc)
ℹ tests 45  ℹ pass 45  ℹ fail 0
smoke: 95 assertions passed
```

`test:core` 覆盖时段算术、跨午夜规则、提醒状态机（一天一次、稍后提醒、跨天、时钟回拨）、配置归一化（坏文档不抛错）与存储语义。`test:client` 在 jsdom 里加载真实的 `lib/client.js`，用真实的 `window.__ModuleLoader__` 与 React 驱动 6 个场景：两个时段各自写入主题、手动改主题后的接管窗口、就寝提醒与卡片渲染、稍后提醒与持久化、损坏配置、刷新后不重响。

## 已知限制

- **提醒只在浏览器页面打开时可见。** 这是 Web 插件的边界：页面在后台时靠系统通知把它送到你面前，建议在设置里点一次「允许系统通知」。
- **提示音受浏览器自动播放策略限制。** 页面还没被用户点过时，第一次提醒可能静音；卡片本身不受影响。
- **手动改主题的窗口不跨刷新。** 刷新后立刻按时间规则重新接管。持久的只有「今天已经响过」和未过期的覆盖窗口。
- 不做任何网络请求、不读写文件、不启动进程。

## 贡献

欢迎 issue 和 PR。提交前请确保 `pnpm run verify` 全绿。

## License

[MIT](LICENSE) © 2026 heshuren371
