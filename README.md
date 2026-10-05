<div align="center">

<img src="icon.svg" width="96" height="96" alt="dsh-theme-sleep icon">

# dsh-theme-sleep

**按你的作息切换主题，到点提醒你睡觉，跑完任务响一声。**

DSH（DeepSeek Harness）Web 插件 · [MIT](LICENSE) · 设计目标是装上之后你不需要再想起它

</div>

---

## 它做什么

| | |
| --- | --- |
| **自动主题** | 默认 `06:00–19:00` 浅色、`19:00–次日 06:00` 深色，到点自动切换，不用点任何东西 |
| **就寝提醒** | 默认每天 `23:30`：右下角常驻提醒卡 + 系统通知 + 提示音，可「再等 10 分钟」或「今晚就睡」 |
| **跑完响一声** | 每次一轮对话结束、DSH 停下来等你时响一声。四档可选，可以关掉 |

三个界面：

| 位置 | 内容 |
| --- | --- |
| 输入框下方的状态胶囊 | 当前主题（太阳/月亮）、下一次切换时间、就寝提醒时间；手动改过主题时追加「已手动指定主题 · HH:mm 后自动接管」；点开有说明 |
| 到点后的提醒卡 | 屏幕右下角常驻，`今晚就睡` / `再 10 分钟` / `知道了` |
| 设置 → 通用 → 自动主题与睡觉提醒 | 时间、开关、稍后提醒间隔、提示音、接管窗口、系统通知授权、恢复默认 |

## 装上之后会发生什么

- **主题跟着时间走，但不跟你抢方向盘。** 你在设置里手动改过主题，插件认出这是你的选择，在 `manualOverrideMinutes` 这段时间内不覆盖，状态胶囊写明「多久之后自动接管」。窗口结束与下一个切换点，两者取更早的一个，插件自动接管。
- **就寝提醒一天只响一次。** 已经响过的那天，刷新页面不会重响；当天 23:30 之后才打开页面也不会补一炮。
- **跑完响一声，但不在后台吵你。** 一轮对话结束（DSH 从「运行中」回到空闲）时响一次；页面被切到后台时不响，因为你听不见。默认沿用就寝提醒那条三音风铃，也可以在设置里换成两声「叮」、一声轻点，或直接关掉。

## 安装

前提：你在浏览器里用 `dsh web` 打开的 DSH 界面（`http://127.0.0.1:3080`）。

### 方法一：在界面上点（推荐，不需要命令行）

1. 打开 **设置 → 插件**；
2. 点 **「添加插件」**；
3. 在「包名或地址」里填这一行，然后点 **安装**：

   ```
   github:heshuren371/dsh-theme-sleep
   ```

   直接粘 GitHub 页面地址（`https://github.com/heshuren371/dsh-theme-sleep`）也可以，两种写法都认。

装完后插件会出现在「已安装」里，**立刻生效，不用重启**。

### 方法二：让 Agent 装

把下面这句话原样发给 DSH 里的 Agent，它会自己调用安装工具：

> 帮我安装这个插件：github:heshuren371/dsh-theme-sleep

### 方法三：想改代码

```sh
git clone https://github.com/heshuren371/dsh-theme-sleep.git
cd dsh-theme-sleep
pnpm install
pnpm run build          # 改完 src/ 必须重新构建
```

然后在「添加插件」里填**这个目录的绝对路径**（例如 `/Users/你/dsh-theme-sleep`）。

### 怎么确认装好了

- 「设置 → 插件」的「已安装」列表里能看到它，「运行状态」是运行中；
- 「设置 → 通用」里多出一行**「自动主题与睡觉提醒」**；
- 输入框下方多出一条主题状态胶囊。

### 装不上怎么办

| 现象 | 原因与处理 |
| --- | --- |
| 「无法访问 GitHub」或超时 | 网络到不了 GitHub。在「添加插件」的**安装源**里选「中国大陆镜像源」再试；或先克隆到本地，用方法三的本地路径装 |
| 「该插件已安装」 | 已经装过了，去「已安装」里把它启用即可 |
| 「未找到相关插件」 | 地址拼错了，应当是 `github:heshuren371/dsh-theme-sleep` |
| 装完界面没变化 | 刷新页面（Cmd/Ctrl-R） |

> 给维护者：仓库里提交了构建产物 `lib/`，因为 DSH 的链接安装不跑构建步骤 —— 从 GitHub 装所以不需要你先构建，改代码后必须自己 `pnpm run build`。宿主侧改动（`src/index.ts`、`src/schema.ts`）要重启 `dsh web` 才生效，浏览器侧会热加载。
>
> 在 DSH `0.2.1-alpha.1` 上开发与验证。插件只用宿主已有的 `theme`、`slots`、`locale`、`configForms` 四个服务，加一个 npm 包 `@deepseek-ai/schemastery` 做 Host 半边的 Config 校验。

## 配置

在 **设置 → 通用 → 自动主题与睡觉提醒** 里直接改，改完立即生效。下面这张表就是那一行里每一项的含义与默认值。

| 字段 | 默认 | 说明 |
| --- | --- | --- |
| `dayStart` | `06:00` | 浅色开始 |
| `dayEnd` | `19:00` | 浅色结束，也是深色开始 |
| `reminderEnabled` | `true` | 就寝提醒开关 |
| `reminderTime` | `23:30` | 提醒时刻 |
| `snoozeMinutes` | `10` | 稍后提醒的间隔 |
| `soundEnabled` | `true` | 提醒时是否播放提示音 |
| `manualOverrideMinutes` | `30` | `0` = 立刻按规则切回；上限 `1440` = 保留到下一个切换点 |
| `completionSound` | `chime` | 跑完一轮对话的提示音：`off` 不响、`ding` 两声、`chime` 三声、`blip` 一声 |

时间一律 `HH:mm`。规则允许跨午夜：`dayStart: '22:00'`、`dayEnd: '05:00'` 表示夜里浅色。两个时间相同表示不切换。

设置页的改动即时生效：改完时间会立刻重算当前时段，改完提醒时间会立刻重排下一天的提醒。`manualOverrideMinutes` 只在「你手动改主题」之后才起作用。

### 想改默认值（可选）

界面上的改动存在用户设置里；如果你要改**新装用户的默认值**，可以在 profile 的 `cordis.patch.yml` 里覆盖同一行：

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
    completionSound: chime           # 跑完一轮对话时的提示音：off | ding | chime | blip
```

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
| `src/core/**` | 纯逻辑：时段算术、提醒状态机、完成提示音的状态折叠、配置归一化、浏览器存储、音效音名表。不碰 DOM 和定时器，依赖时钟的函数显式接收 `now` |
| `src/client.ts` | Client 入口：主题驱动、提醒驱动、完成提示音、设置读写、slot 座位、错误边界 |
| `src/ui/**` | 三个界面：状态胶囊、提醒卡、设置行。只渲染 props，不做决定 |
| `src/index.ts` / `src/schema.ts` | Host 半边：Loader 座位 + `Config` 校验 |
| `lib/` | 产物，随仓库提交 |

行为全在浏览器半边，Host 半边只占座位和校验配置，所以没有 Host 侧定时器或状态。改代码前先读 [AGENTS.md](AGENTS.md)：里面有本仓库的不变量，以及几个实际踩过的坑。

## 验证

```sh
$ pnpm run verify
build: lib/client.js (bundled) + lib/index.js, lib/schema.js, lib/core/*.js (tsc)
ℹ tests 54  ℹ pass 54  ℹ fail 0
smoke: 113 assertions passed
```

`test:core` 覆盖时段算术、跨午夜规则、提醒状态机（一天一次、稍后提醒、跨天、时钟回拨）、完成提示音的状态折叠（基线不补响、只认「运行中→空闲」）、配置归一化（坏文档不抛错）与存储语义。`test:client` 在 jsdom 里加载真实的 `lib/client.js`，用真实的 `window.__ModuleLoader__` 与 React 驱动 7 个场景：两个时段各自写入主题、手动改主题后的接管窗口、就寝提醒与卡片渲染、稍后提醒与持久化、损坏配置、刷新后不重响、以及跑完一轮对话响一声（含关掉与后台静音）。

## 已知限制

- **提醒只在浏览器页面打开时可见。** 这是 Web 插件的边界：页面在后台时靠系统通知把它送到你面前，建议在设置里点一次「允许系统通知」。
- **提示音受浏览器自动播放策略限制。** 页面还没被用户点过时，第一次提示可能静音；卡片本身不受影响。
- **手动改主题的窗口不跨刷新。** 刷新后立刻按时间规则重新接管。持久的只有「今天已经响过」和未过期的覆盖窗口。
- 不做任何网络请求、不读写文件、不启动进程。

## 贡献

欢迎 issue 和 PR。提交前请确保 `pnpm run verify` 全绿。

## License

[MIT](LICENSE) © 2026 heshuren371
