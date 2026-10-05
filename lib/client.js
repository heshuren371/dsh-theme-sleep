/* @local/dsh-theme-sleep — generated from src/ by `pnpm run build`; do not edit. */
"use strict";
(() => {
  // src/platform.ts
  var requireFn = null;
  var React = {};
  function bindPlatform(require_) {
    requireFn = require_;
    Object.assign(React, require_("react"));
  }
  function h(type, props, ...children) {
    return React.createElement(type, props ?? null, ...children);
  }

  // src/i18n.ts
  var NS = "theme-sleep";
  var zh = {
    "chip.label": "主题",
    "chip.light": "浅色",
    "chip.dark": "深色",
    "chip.off": "已暂停",
    "chip.title": "自动主题与睡觉提醒",
    "chip.next.light": "将于 {time} 切换浅色",
    "chip.next.dark": "将于 {time} 切换深色",
    "chip.reminder": "就寝提醒 {time}",
    "chip.reminderOff": "就寝提醒已关闭",
    "chip.override": "已手动指定主题",
    "chip.overrideUntil": "{time} 后自动接管",
    "chip.openSettings": "打开设置",
    "panel.autoTitle": "按时间自动切换主题",
    "panel.autoDescription": "浅色区间结束时自动切深色，深色区间结束时自动切浅色。",
    "panel.dayStart": "浅色开始",
    "panel.dayEnd": "浅色结束",
    "panel.notifyTitle": "睡前提醒",
    "panel.notifyDescription": "到点后在界面上弹出提醒卡片，并发送系统通知。",
    "panel.reminderTime": "提醒时间",
    "panel.snooze": "稍后再提醒",
    "panel.snoozeUnit": "分钟",
    "panel.sound": "提醒时播放提示音",
    "panel.completionTitle": "任务跑完时",
    "panel.completionDescription": "每次一轮对话结束、DSH 停下来等你时响一声。页面在后台时不响。",
    "panel.completionOff": "不响",
    "panel.completionDing": "叮（两声）",
    "panel.completionChime": "风铃（三声）",
    "panel.completionBlip": "轻点（一声）",
    "panel.enableNotifications": "允许系统通知",
    "panel.notificationsOn": "系统通知已允许",
    "panel.notificationsDenied": "系统通知被拒绝，仅显示应用内卡片",
    "panel.notificationsUnsupported": "当前环境不支持系统通知",
    "panel.save": "保存",
    "panel.saved": "已保存",
    "panel.invalidTime": "时间格式不对，请用 HH:mm",
    "panel.currentTheme": "当前主题",
    "panel.nextSwitch": "下次切换",
    "panel.now": "现在",
    "panel.reset": "恢复默认",
    "panel.overrideHint": "你手动选过主题；窗口结束后插件自动接管。",
    "panel.overrideTitle": "手动改了主题之后",
    "panel.overrideNever": "不覆盖，立刻按时间规则切回",
    "panel.overrideFive": "保留我的选择 5 分钟",
    "panel.overrideThirty": "保留我的选择 30 分钟（默认）",
    "panel.overrideTwoHours": "保留我的选择 2 小时",
    "panel.overridePeriod": "保留到下一个切换点（最长）",
    "reminder.title": "该睡觉了",
    "reminder.body": "现在是 {time}，超过预定就寝时间了。放下手机，去睡吧。",
    "reminder.snooze": "再 {minutes} 分钟",
    "reminder.dismiss": "今晚就睡",
    "reminder.close": "知道了",
    "reminder.snoozedBody": "已推迟到 {time}。",
    "error.render": "自动主题插件出错了：",
    "error.retry": "重试"
  };
  var en = {
    "chip.label": "Theme",
    "chip.light": "Light",
    "chip.dark": "Dark",
    "chip.off": "Paused",
    "chip.title": "Auto theme & sleep reminder",
    "chip.next.light": "Light at {time}",
    "chip.next.dark": "Dark at {time}",
    "chip.reminder": "Bedtime reminder {time}",
    "chip.reminderOff": "Bedtime reminder off",
    "chip.override": "Theme chosen manually",
    "chip.overrideUntil": "auto takes over in {time}",
    "chip.openSettings": "Open settings",
    "panel.autoTitle": "Switch theme by time",
    "panel.autoDescription": "Light during the light window, dark from its end until it starts again.",
    "panel.dayStart": "Light starts",
    "panel.dayEnd": "Light ends",
    "panel.notifyTitle": "Bedtime reminder",
    "panel.notifyDescription": "Shows a card in the app and sends a system notification.",
    "panel.reminderTime": "Reminder time",
    "panel.snooze": "Snooze for",
    "panel.snoozeUnit": "min",
    "panel.sound": "Play a chime with the reminder",
    "panel.completionTitle": "When a task finishes",
    "panel.completionDescription": "One short cue each time a turn ends and DSH stops to wait for you. Silent while the page is hidden.",
    "panel.completionOff": "Silent",
    "panel.completionDing": "Ding (two tones)",
    "panel.completionChime": "Chime (three tones)",
    "panel.completionBlip": "Blip (one tone)",
    "panel.enableNotifications": "Allow system notifications",
    "panel.notificationsOn": "System notifications allowed",
    "panel.notificationsDenied": "System notifications denied; the in-app card still shows",
    "panel.notificationsUnsupported": "System notifications are unavailable here",
    "panel.save": "Save",
    "panel.saved": "Saved",
    "panel.invalidTime": "Use HH:mm",
    "panel.currentTheme": "Current theme",
    "panel.nextSwitch": "Next switch",
    "panel.now": "now",
    "panel.reset": "Restore defaults",
    "panel.overrideHint": "You picked a theme manually; the rule takes over when that window ends.",
    "panel.overrideTitle": "After you change the theme by hand",
    "panel.overrideNever": "No override — follow the time rule right away",
    "panel.overrideFive": "Keep my choice for 5 minutes",
    "panel.overrideThirty": "Keep my choice for 30 minutes (default)",
    "panel.overrideTwoHours": "Keep my choice for 2 hours",
    "panel.overridePeriod": "Keep my choice until the next switch (max)",
    "reminder.title": "Time for bed",
    "reminder.body": "It is {time}, past your bedtime. Put the phone down and get some sleep.",
    "reminder.snooze": "Snooze {minutes} min",
    "reminder.dismiss": "Going to sleep",
    "reminder.close": "Got it",
    "reminder.snoozedBody": "Snoozed until {time}.",
    "error.render": "The auto-theme plugin crashed: ",
    "error.retry": "Retry"
  };
  var active = (key, params) => interpolate(zh[key], params);
  function bindLocale(next) {
    active = (key, params) => next(key, params);
  }
  function fallbackTranslate(key, params) {
    return active(key, params);
  }
  function interpolate(template, params) {
    if (params === void 0) return template;
    return template.replace(/\{(\w+)\}/g, (whole, name) => {
      const value = params[name];
      return value === void 0 ? whole : String(value);
    });
  }

  // src/core/types.ts
  var DEFAULT_SETTINGS = Object.freeze({
    dayStart: "06:00",
    dayEnd: "19:00",
    reminderEnabled: true,
    reminderTime: "23:30",
    snoozeMinutes: 10,
    soundEnabled: true,
    manualOverrideMinutes: 30,
    completionSound: "chime"
  });
  var DEFAULT_DAY_START_SECONDS = 6 * 60 * 60;
  var DEFAULT_DAY_END_SECONDS = 19 * 60 * 60;
  var DEFAULT_REMINDER_SECONDS = 23 * 60 * 60 + 30 * 60;
  var MIN_SNOOZE_MINUTES = 1;
  var MAX_SNOOZE_MINUTES = 120;
  var MIN_MANUAL_OVERRIDE_MINUTES = 0;
  var MAX_MANUAL_OVERRIDE_MINUTES = 24 * 60;
  var MAX_REMINDER_SECONDS = 23 * 60 * 60 + 59 * 60;

  // src/core/sound.ts
  var COMPLETION_SOUNDS = ["off", "ding", "chime", "blip"];
  function isCompletionSound(value) {
    return typeof value === "string" && COMPLETION_SOUNDS.includes(value);
  }

  // src/core/time.ts
  var DAY_MINUTES = 24 * 60;
  var DAY_SECONDS = 24 * 60 * 60;
  var MINUTE_MS = 60 * 1e3;
  var DAY_MS = DAY_SECONDS * 1e3;
  function wrapSecond(second) {
    const normalized = Math.trunc(second);
    if (!Number.isFinite(normalized)) return 0;
    return (normalized % DAY_SECONDS + DAY_SECONDS) % DAY_SECONDS;
  }
  function parseClock(text2) {
    const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(text2.trim());
    if (match === null) return void 0;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const second = match[3] === void 0 ? 0 : Number(match[3]);
    if (hour > 23 || minute > 59 || second > 59) return void 0;
    return hour * 3600 + minute * 60 + second;
  }
  function secondToHhMm(second) {
    const value = wrapSecond(second);
    const hour = Math.floor(value / 3600);
    const minute = Math.floor(value % 3600 / 60);
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }
  function formatClock(second, hour12) {
    const value = wrapSecond(second);
    const hour = Math.floor(value / 3600);
    const minute = Math.floor(value % 3600 / 60);
    if (!hour12) return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    const suffix = hour < 12 ? "AM" : "PM";
    const display = hour % 12 === 0 ? 12 : hour % 12;
    return `${display}:${String(minute).padStart(2, "0")} ${suffix}`;
  }
  function secondOfDay(nowMs) {
    const date = new Date(nowMs);
    return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
  }
  function localDayKey(nowMs) {
    const date = new Date(nowMs);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${String(date.getFullYear()).padStart(4, "0")}-${month}-${day}`;
  }
  function inWindow(second, startSecond, endSecond) {
    const at = wrapSecond(second);
    const start = wrapSecond(startSecond);
    const end = wrapSecond(endSecond);
    if (start === end) return false;
    if (start < end) return at >= start && at < end;
    return at >= start || at < end;
  }
  function secondsUntil(fromSecond, toSecond) {
    const from = wrapSecond(fromSecond);
    const to = wrapSecond(toSecond);
    const delta = to - from;
    return delta > 0 ? delta : delta + DAY_SECONDS;
  }
  function nextOccurrenceMs(nowMs, targetSecond) {
    const deltaSeconds = secondsUntil(secondOfDay(nowMs), targetSecond);
    return nowMs + deltaSeconds * 1e3;
  }

  // src/core/config.ts
  var KEYS = [
    "dayStart",
    "dayEnd",
    "reminderEnabled",
    "reminderTime",
    "snoozeMinutes",
    "soundEnabled",
    "manualOverrideMinutes",
    "completionSound"
  ];
  function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  function normalizeTime(value, fallback) {
    if (typeof value !== "string") return fallback;
    const seconds = parseClock(value);
    return seconds === void 0 ? fallback : secondToHhMm(seconds);
  }
  function normalizeBoolean(value, fallback) {
    return typeof value === "boolean" ? value : fallback;
  }
  function normalizeSnooze(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_SETTINGS.snoozeMinutes;
    const rounded = Math.round(value);
    if (rounded < MIN_SNOOZE_MINUTES || rounded > MAX_SNOOZE_MINUTES) return DEFAULT_SETTINGS.snoozeMinutes;
    return rounded;
  }
  function normalizeOverride(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_SETTINGS.manualOverrideMinutes;
    const rounded = Math.round(value);
    if (rounded < MIN_MANUAL_OVERRIDE_MINUTES || rounded > MAX_MANUAL_OVERRIDE_MINUTES) return DEFAULT_SETTINGS.manualOverrideMinutes;
    return rounded;
  }
  function normalizeSettings(value) {
    const source = isRecord(value) ? value : {};
    const present = KEYS.filter((key) => Object.hasOwn(source, key));
    if (present.length === 0) return DEFAULT_SETTINGS;
    return {
      dayStart: normalizeTime(source["dayStart"], DEFAULT_SETTINGS.dayStart),
      dayEnd: normalizeTime(source["dayEnd"], DEFAULT_SETTINGS.dayEnd),
      reminderEnabled: normalizeBoolean(source["reminderEnabled"], DEFAULT_SETTINGS.reminderEnabled),
      reminderTime: normalizeTime(source["reminderTime"], DEFAULT_SETTINGS.reminderTime),
      snoozeMinutes: normalizeSnooze(source["snoozeMinutes"]),
      soundEnabled: normalizeBoolean(source["soundEnabled"], DEFAULT_SETTINGS.soundEnabled),
      manualOverrideMinutes: normalizeOverride(source["manualOverrideMinutes"]),
      completionSound: isCompletionSound(source["completionSound"]) ? source["completionSound"] : DEFAULT_SETTINGS.completionSound
    };
  }
  function themeRuleOf(settings) {
    const dayStart = parseClock(settings.dayStart) ?? DEFAULT_DAY_START_SECONDS;
    const dayEnd = parseClock(settings.dayEnd) ?? DEFAULT_DAY_END_SECONDS;
    return { dayStart, dayEnd };
  }

  // src/core/storage.ts
  var STORAGE_KEY = "dsh-theme-sleep/v1";
  function storage() {
    try {
      const candidate = globalThis.localStorage;
      if (candidate === void 0 || candidate === null) return null;
      candidate.getItem(STORAGE_KEY);
      return candidate;
    } catch {
      return null;
    }
  }
  function loadStoredState() {
    const store = storage();
    if (store === null) return {};
    try {
      const raw = store.getItem(STORAGE_KEY);
      if (raw === null) return {};
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
      const record = parsed;
      const result = {};
      if (typeof record["firedDay"] === "string") result.firedDay = record["firedDay"];
      if (typeof record["snoozeUntil"] === "number" && Number.isFinite(record["snoozeUntil"])) {
        result.snoozeUntil = record["snoozeUntil"];
      }
      if (typeof record["overrideUntil"] === "number" && Number.isFinite(record["overrideUntil"])) {
        result.overrideUntil = record["overrideUntil"];
      }
      const settings = record["settings"];
      if (typeof settings === "object" && settings !== null && !Array.isArray(settings)) {
        result.settings = settings;
      }
      return result;
    } catch {
      return {};
    }
  }
  function saveStoredState(patch, reset = {}) {
    const store = storage();
    if (store === null) return;
    try {
      const next = { ...loadStoredState(), ...patch };
      if (reset.snoozeUntil === true) delete next["snoozeUntil"];
      if (reset.overrideUntil === true) delete next["overrideUntil"];
      store.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
    }
  }

  // src/core/theme.ts
  function periodAt(second, rule) {
    return inWindow(second, rule.dayStart, rule.dayEnd) ? "day" : "night";
  }
  function nextBoundary(nowMs, rule) {
    const start = wrapSecond(rule.dayStart);
    const end = wrapSecond(rule.dayEnd);
    if (start === end) {
      return { theme: "dark", at: nextOccurrenceMs(nowMs, end), atSecond: end };
    }
    const atStart = nextOccurrenceMs(nowMs, start);
    const atEnd = nextOccurrenceMs(nowMs, end);
    if (atStart <= atEnd) {
      return { theme: "light", at: atStart, atSecond: start };
    }
    return { theme: "dark", at: atEnd, atSecond: end };
  }
  function themePhase(nowMs, rule) {
    const period = periodAt(secondOfDay(nowMs), rule);
    const boundary = nextBoundary(nowMs, rule);
    return {
      period,
      theme: period === "day" ? "light" : "dark",
      boundary,
      remainingMs: Math.max(0, boundary.at - nowMs)
    };
  }

  // src/core/reminder.ts
  var systemClock = { now: () => Date.now() };
  var REMINDER_POLL_MS = 60 * 1e3;
  var ReminderEngine = class {
    clock;
    lastFiredDay;
    snoozeUntil;
    /** Card is dismissed/acknowledged for the current occurrence. */
    acknowledged = false;
    /**
     * Whether a reminder is currently eligible to be shown. The engine starts
     * armed so the first `setEnabled(false)` is a real transition; the Client
     * feeds it the live setting on every tick anyway.
     */
    armed = true;
    /** Startup instant; an occurrence before it never retro-fires. */
    watcherStartMs;
    /**
     * @param clock - Clock used for every decision; defaults to `Date.now`.
     * @param startMs - Instant the watcher started; defaults to the clock's now.
     */
    constructor(clock = systemClock, startMs) {
      this.clock = clock;
      this.watcherStartMs = startMs ?? clock.now();
    }
    /**
     * Re-arm the engine for a new settings snapshot.
     *
     * Disabling the reminder clears any pending snooze, closes the card, and ends
     * the watch; enabling it starts a fresh watch from now, so an occurrence that
     * passed while the feature was off is never replayed. Calling it while
     * already armed (the Client does that on every tick) changes nothing.
     * @param enabled - Whether the reminder is armed.
     */
    setEnabled(enabled) {
      if (enabled === this.armed) return;
      this.armed = enabled;
      if (enabled) {
        this.snoozeUntil = void 0;
        this.acknowledged = false;
        this.watcherStartMs = this.clock.now();
      } else {
        this.watcherStartMs = Number.POSITIVE_INFINITY;
      }
    }
    /**
     * Restore the durable part of the engine's state after a page reload.
     *
     * Only the day already fired survives a reload: a reminder the user answered
     * (or never answered) on one page must not fire again when the page is
     * refreshed that evening. An expired snooze deadline is restored too, so the
     * card comes back after a reload that happened while snoozing.
     * @param state - Restored fields; absent fields are left untouched.
     */
    hydrate(state) {
      if (state.firedDay !== void 0) this.lastFiredDay = state.firedDay;
      if (state.snoozeUntil !== void 0 && localDayKey(state.snoozeUntil) === localDayKey(this.clock.now())) {
        this.snoozeUntil = state.snoozeUntil;
        this.acknowledged = false;
      }
    }
    /**
     * Re-base the watcher start. The Client calls this after the settings scope
     * first resolves, because an occurrence before that point was not watched.
     * @param startMs - Instant the current watch began.
     */
    setWatcherStart(startMs) {
      this.watcherStartMs = startMs;
    }
    /**
     * The occurrence instant for one local day.
     * @param nowMs - Instant inside that local day.
     * @param settings - Reminder settings.
     * @returns Epoch milliseconds of that day's occurrence.
     */
    occurrenceFor(nowMs, settings) {
      const target = wrapSecond(secondsFromReminderTime(settings.reminderTime));
      const startOfDay = startOfLocalDayMs(nowMs);
      return startOfDay + target * 1e3;
    }
    /**
     * Advance the engine to `nowMs` and report what to display.
     * @param settings - Live reminder settings.
     * @param nowMs - Current epoch milliseconds.
     * @returns The reminder decision for this instant.
     */
    tick(settings, nowMs = this.clock.now()) {
      const dayKey = localDayKey(nowMs);
      if (!settings.reminderEnabled) {
        return { mode: "idle", dayKey };
      }
      if (this.snoozeUntil !== void 0) {
        if (nowMs >= this.snoozeUntil) {
          return { mode: this.acknowledged ? "idle" : "snoozed", dayKey, firedAt: this.snoozeUntil, snoozeUntil: this.snoozeUntil };
        }
        return { mode: "idle", dayKey, snoozeUntil: this.snoozeUntil };
      }
      const occurrence = this.occurrenceFor(nowMs, settings);
      const due = nowMs >= occurrence && occurrence >= this.watcherStartMs;
      if (!due) return { mode: "idle", dayKey };
      if (this.lastFiredDay === dayKey) {
        return { mode: this.acknowledged ? "idle" : "active", dayKey, firedAt: occurrence };
      }
      this.lastFiredDay = dayKey;
      this.acknowledged = false;
      return { mode: "active", dayKey, firedAt: occurrence };
    }
    /**
     * Snooze the current occurrence.
     * @param settings - Live reminder settings; the snooze delay comes from it.
     * @param nowMs - Current epoch milliseconds.
     * @returns The engine state after the snooze.
     */
    snooze(settings, nowMs = this.clock.now()) {
      const minutes = clampSnoozeMinutes(settings.snoozeMinutes);
      this.snoozeUntil = nowMs + minutes * MINUTE_MS;
      this.acknowledged = false;
      return { mode: "idle", dayKey: localDayKey(nowMs), snoozeUntil: this.snoozeUntil };
    }
    /**
     * Acknowledge the current occurrence; the card closes and does not return
     * until the next local day.
     * @param nowMs - Current epoch milliseconds.
     * @returns The idle state.
     */
    dismiss(nowMs = this.clock.now()) {
      this.snoozeUntil = void 0;
      this.acknowledged = true;
      return { mode: "idle", dayKey: localDayKey(nowMs) };
    }
    /** @returns The instant the current snooze expires, if one is pending. */
    pendingSnoozeUntil() {
      return this.snoozeUntil;
    }
    /** @returns The local day already fired, if any. */
    firedDay() {
      return this.lastFiredDay;
    }
    /**
     * Milliseconds until the engine needs another look.
     *
     * While idle it is the remaining time to the next occurrence, capped so a
     * suspended laptop or a changed system clock is noticed within a minute;
     * while the card shows it is the polling interval, because the user's answer
     * (not the clock) advances it.
     * @param settings - Live reminder settings.
     * @param nowMs - Current epoch milliseconds.
     * @returns A positive delay no longer than {@link REMINDER_POLL_MS}.
     */
    msUntilNextCheck(settings, nowMs = this.clock.now()) {
      if (!settings.reminderEnabled) return REMINDER_POLL_MS;
      if (this.snoozeUntil !== void 0) {
        return nowMs >= this.snoozeUntil ? REMINDER_POLL_MS : clampDelay(this.snoozeUntil - nowMs);
      }
      if (this.acknowledged && this.lastFiredDay === localDayKey(nowMs)) return REMINDER_POLL_MS;
      const occurrence = this.occurrenceFor(nowMs, settings);
      if (nowMs < occurrence) return clampDelay(occurrence - nowMs);
      if (occurrence >= this.watcherStartMs && this.lastFiredDay !== localDayKey(nowMs)) return 0;
      return REMINDER_POLL_MS;
    }
  };
  function clampSnoozeMinutes(minutes) {
    if (!Number.isFinite(minutes)) return MIN_SNOOZE_MINUTES;
    const rounded = Math.round(minutes);
    if (rounded < MIN_SNOOZE_MINUTES) return MIN_SNOOZE_MINUTES;
    if (rounded > MAX_SNOOZE_MINUTES) return MAX_SNOOZE_MINUTES;
    return rounded;
  }
  function clampDelay(milliseconds) {
    if (!Number.isFinite(milliseconds)) return REMINDER_POLL_MS;
    if (milliseconds < 0) return 0;
    if (milliseconds > REMINDER_POLL_MS) return REMINDER_POLL_MS;
    return Math.floor(milliseconds);
  }
  function secondsFromReminderTime(text2) {
    const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(text2.trim());
    if (match === null) return 23 * 3600 + 30 * 60;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour > 23 || minute > 59) return 23 * 3600 + 30 * 60;
    const second = hour * 3600 + minute * 60;
    return second > MAX_REMINDER_SECONDS ? MAX_REMINDER_SECONDS : second;
  }
  function startOfLocalDayMs(nowMs) {
    const date = new Date(nowMs);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }

  // src/core/completion.ts
  var CompletionWatch = class {
    /**
     * @param source - Host running-state source to fold.
     * @param onComplete - Called once per Session that stops running.
     */
    constructor(source, onComplete) {
      this.source = source;
      this.onComplete = onComplete;
    }
    source;
    onComplete;
    previous = /* @__PURE__ */ new Map();
    primed = false;
    dispose = null;
    /** Set while a callback is in flight, so a re-entrant publish is ignored. */
    inCallback = false;
    /**
     * Take the current snapshot as the baseline, then subscribe.
     *
     * The baseline is what keeps a Session that is already idle when the watch
     * starts from announcing.
     */
    start() {
      if (this.dispose !== null) return;
      this.previous = this.source.getSnapshot();
      this.primed = true;
      this.dispose = this.source.subscribe(() => {
        this.observe();
      });
    }
    /** Drop the subscription; the watch can be started again. */
    stop() {
      this.dispose?.();
      this.dispose = null;
      this.primed = false;
    }
    /** @returns Whether the watch currently holds a subscription. */
    isRunning() {
      return this.dispose !== null;
    }
    /** Announce every Session that moved from running to idle since the last snapshot. */
    observe() {
      if (!this.primed) return;
      const next = this.source.getSnapshot();
      const previous = this.previous;
      this.previous = next;
      if (this.inCallback) {
        return;
      }
      const completed = [];
      for (const [sessionId, state] of next) {
        if (previous.get(sessionId)?.running === true && state.running === false) {
          completed.push(sessionId);
        }
      }
      if (completed.length === 0) return;
      this.inCallback = true;
      try {
        for (const sessionId of completed) this.onComplete(sessionId);
      } finally {
        this.inCallback = false;
      }
    }
  };

  // src/ui/chip.tsx
  function clockTextOf(epochMs) {
    const date = new Date(epochMs);
    return formatClock(date.getHours() * 3600 + date.getMinutes() * 60, false);
  }
  function themeIcon(theme) {
    if (theme === "light") {
      return h(
        "svg",
        {
          className: "dts-chip__icon",
          viewBox: "0 0 16 16",
          width: 14,
          height: 14,
          "aria-hidden": true,
          focusable: false
        },
        h("circle", { cx: 8, cy: 8, r: 3.1, fill: "currentColor" }),
        h("path", {
          d: "M8 1.2v1.8M8 13v1.8M1.2 8h1.8M13 8h1.8M3.2 3.2l1.3 1.3M11.5 11.5l1.3 1.3M12.8 3.2l-1.3 1.3M4.5 11.5l-1.3 1.3",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 1.3,
          strokeLinecap: "round"
        })
      );
    }
    return h(
      "svg",
      {
        className: "dts-chip__icon",
        viewBox: "0 0 16 16",
        width: 14,
        height: 14,
        "aria-hidden": true,
        focusable: false
      },
      h("path", { d: "M8 2.2a5.8 5.8 0 1 0 5.8 5.8A4.6 4.6 0 0 1 8 2.2z", fill: "currentColor" })
    );
  }
  function Chip({ useView, text: text2 }) {
    const { useEffect, useRef, useState } = React;
    const expected = useView((state) => state.expected);
    const boundaryTheme = useView((state) => state.boundary.theme);
    const boundaryAt = useView((state) => state.boundary.at);
    const overridden = useView((state) => state.overridden);
    const overrideUntil = useView((state) => state.overrideUntil);
    const reminderEnabled = useView((state) => state.settings.reminderEnabled);
    const reminderTime = useView((state) => state.settings.reminderTime);
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);
    const themeLabel = text2(expected === "light" ? "chip.light" : "chip.dark");
    const nextLabel = text2(boundaryTheme === "light" ? "chip.next.light" : "chip.next.dark", {
      time: clockTextOf(boundaryAt)
    });
    const reminderLabel = reminderEnabled ? text2("chip.reminder", { time: reminderTime }) : text2("chip.reminderOff");
    const overrideLabel = text2("chip.override");
    const overrideResume = overrideUntil > 0 ? text2("chip.overrideUntil", { time: clockTextOf(overrideUntil) }) : null;
    const summary = [themeLabel, nextLabel, reminderLabel].join(" · ");
    useEffect(() => {
      if (!open) return;
      const onKeyDown = (event) => {
        if (event.key === "Escape") setOpen(false);
      };
      const onMouseDown = (event) => {
        const wrap = wrapRef.current;
        const target = event.target;
        if (wrap !== null && target instanceof Node && wrap.contains(target)) return;
        setOpen(false);
      };
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("mousedown", onMouseDown);
      return () => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("mousedown", onMouseDown);
      };
    }, [open]);
    const pill = h(
      "button",
      {
        type: "button",
        className: "dts-chip",
        "aria-haspopup": "dialog",
        "aria-expanded": open,
        "aria-label": overridden ? `${overrideLabel} · ${overrideResume ?? nextLabel}` : summary,
        title: overridden ? `${overrideLabel} · ${overrideResume ?? nextLabel}` : summary,
        onClick: () => {
          setOpen(!open);
        }
      },
      themeIcon(expected),
      h("span", { className: "dts-chip__label" }, themeLabel),
      h("span", { className: "dts-chip__sep", "aria-hidden": true }, "·"),
      h("span", { className: "dts-chip__label" }, nextLabel),
      h("span", { className: "dts-chip__sep", "aria-hidden": true }, "·"),
      h("span", { className: "dts-chip__label" }, reminderLabel),
      overridden ? h("span", { className: "dts-chip__sep", "aria-hidden": true }, "·") : null,
      overridden ? h("span", { className: "dts-chip__label" }, overrideLabel) : null,
      overridden && overrideResume !== null ? h("span", { className: "dts-chip__sep", "aria-hidden": true }, "·") : null,
      overridden && overrideResume !== null ? h("span", { className: "dts-chip__label" }, overrideResume) : null
    );
    const popover = open ? h(
      "div",
      { className: "dts-pop", role: "dialog", "aria-label": text2("chip.title") },
      h("h2", { className: "dts-pop__title" }, text2("chip.title")),
      h("div", { className: "dts-pop__line" }, `${themeLabel} · ${nextLabel}`),
      h("div", { className: "dts-pop__line" }, reminderLabel),
      overridden ? h("div", { className: "dts-pop__hint" }, `${text2("panel.overrideHint")}${overrideResume === null ? "" : ` ${overrideResume}`}`) : null
    ) : null;
    return h("div", { className: "dts-chip-wrap", ref: wrapRef }, pill, popover);
  }

  // src/ui/overlay.tsx
  function clockTextOf2(epochMs) {
    const date = new Date(epochMs);
    return formatClock(date.getHours() * 3600 + date.getMinutes() * 60, false);
  }
  function moonIcon() {
    return h(
      "svg",
      {
        className: "dts-card__icon",
        viewBox: "0 0 16 16",
        width: 16,
        height: 16,
        "aria-hidden": true,
        focusable: false
      },
      h("path", { d: "M8 2.2a5.8 5.8 0 1 0 5.8 5.8A4.6 4.6 0 0 1 8 2.2z", fill: "currentColor" })
    );
  }
  function ReminderCard({ useView, text: text2, actions, clock }) {
    const mode = useView((state) => state.reminder.mode);
    const snoozeUntil = useView((state) => state.reminder.snoozeUntil);
    const snoozeMinutes = useView((state) => state.settings.snoozeMinutes);
    if (mode === "idle") return null;
    const now = clock();
    const body = mode === "snoozed" ? text2("reminder.snoozedBody", { time: snoozeUntil === void 0 ? now : clockTextOf2(snoozeUntil) }) : text2("reminder.body", { time: now });
    return h(
      "div",
      { className: mode === "active" ? "dts-layer dts-layer--scrim" : "dts-layer" },
      h(
        "div",
        { className: "dts-card", role: "alert", "aria-live": "assertive" },
        h(
          "div",
          { className: "dts-card__head" },
          moonIcon(),
          h("h2", { className: "dts-card__title" }, text2("reminder.title"))
        ),
        h("p", { className: "dts-card__body" }, body),
        h(
          "div",
          { className: "dts-card__actions" },
          h(
            "button",
            {
              type: "button",
              className: "dts-btn dts-btn--primary",
              onClick: () => {
                actions.dismiss();
              }
            },
            text2("reminder.dismiss")
          ),
          h(
            "button",
            {
              type: "button",
              className: "dts-btn dts-btn--ghost",
              onClick: () => {
                actions.snooze();
              }
            },
            text2("reminder.snooze", { minutes: snoozeMinutes })
          ),
          h(
            "button",
            {
              type: "button",
              className: "dts-btn dts-btn--link",
              onClick: () => {
                actions.dismiss();
              }
            },
            text2("reminder.close")
          )
        )
      )
    );
  }

  // src/ui/settings.tsx
  var OVERRIDE_CHOICES = [
    { minutes: 0, key: "panel.overrideNever" },
    { minutes: 5, key: "panel.overrideFive" },
    { minutes: 30, key: "panel.overrideThirty" },
    { minutes: 120, key: "panel.overrideTwoHours" },
    { minutes: MAX_MANUAL_OVERRIDE_MINUTES, key: "panel.overridePeriod" }
  ];
  var COMPLETION_LABELS = {
    off: "panel.completionOff",
    ding: "panel.completionDing",
    chime: "panel.completionChime",
    blip: "panel.completionBlip"
  };
  var SAVED_HINT_MS = 2e3;
  function clockTextOf3(epochMs) {
    const date = new Date(epochMs);
    return formatClock(date.getHours() * 3600 + date.getMinutes() * 60, false);
  }
  function timeField(options) {
    return h(
      "label",
      { className: "dts-field" },
      h("span", { className: "dts-caption" }, options.caption),
      h("input", {
        className: "dts-input",
        type: "time",
        value: options.value,
        "aria-label": options.label,
        "aria-invalid": options.invalid,
        onChange: (event) => {
          options.onChange(event.currentTarget.value);
        },
        onBlur: () => {
          options.onBlur();
        }
      }),
      options.invalid ? h("span", { className: "dts-hint dts-hint--warn" }, options.invalidText) : null
    );
  }
  function switchButton(checked, label, onToggle) {
    return h(
      "button",
      {
        type: "button",
        className: "dts-switch",
        role: "switch",
        "aria-checked": checked,
        "aria-label": label,
        onClick: onToggle
      },
      h("span", { className: "dts-switch__knob", "aria-hidden": true })
    );
  }
  function SettingsRow(props) {
    const { useView, text: text2, persist, requestNotifications } = props;
    const { useEffect, useState } = React;
    const active2 = useView((state) => state.active);
    const overridden = useView((state) => state.overridden);
    const boundaryTheme = useView((state) => state.boundary.theme);
    const boundaryAt = useView((state) => state.boundary.at);
    const dayStart = useView((state) => state.settings.dayStart);
    const dayEnd = useView((state) => state.settings.dayEnd);
    const reminderEnabled = useView((state) => state.settings.reminderEnabled);
    const reminderTime = useView((state) => state.settings.reminderTime);
    const snoozeMinutes = useView((state) => state.settings.snoozeMinutes);
    const soundEnabled = useView((state) => state.settings.soundEnabled);
    const notification = useView((state) => state.notification);
    const manualOverrideMinutes = useView((state) => state.settings.manualOverrideMinutes);
    const completionSound = useView((state) => state.settings.completionSound);
    const [startDraft, setStartDraft] = useState(null);
    const [endDraft, setEndDraft] = useState(null);
    const [reminderDraft, setReminderDraft] = useState(null);
    const [snoozeDraft, setSnoozeDraft] = useState(null);
    const [saved, setSaved] = useState(false);
    useEffect(() => {
      if (!saved) return;
      const timer = window.setTimeout(() => {
        setSaved(false);
      }, SAVED_HINT_MS);
      return () => {
        window.clearTimeout(timer);
      };
    }, [saved]);
    const commit = (patch) => {
      persist(patch);
      setSaved(true);
    };
    const commitTime = (field, raw, setDraft) => {
      if (parseClock(raw) === void 0) {
        setDraft(raw);
        return;
      }
      setDraft(null);
      const patch = field === "dayStart" ? { dayStart: raw } : field === "dayEnd" ? { dayEnd: raw } : { reminderTime: raw };
      commit(patch);
    };
    const startInvalid = startDraft !== null && parseClock(startDraft) === void 0;
    const endInvalid = endDraft !== null && parseClock(endDraft) === void 0;
    const reminderInvalid = reminderDraft !== null && parseClock(reminderDraft) === void 0;
    const changeSnooze = (raw) => {
      setSnoozeDraft(raw);
      if (raw.trim() === "") return;
      const parsed = Number(raw);
      if (!Number.isFinite(parsed)) return;
      const clamped = Math.min(MAX_SNOOZE_MINUTES, Math.max(MIN_SNOOZE_MINUTES, Math.round(parsed)));
      commit({ snoozeMinutes: clamped });
    };
    const notificationLine = () => {
      if (notification === "granted") return h("div", { className: "dts-hint" }, text2("panel.notificationsOn"));
      if (notification === "denied") return h("div", { className: "dts-hint dts-hint--warn" }, text2("panel.notificationsDenied"));
      if (notification === "unsupported") return h("div", { className: "dts-hint" }, text2("panel.notificationsUnsupported"));
      return h(
        "div",
        { className: "dts-footer" },
        h(
          "button",
          {
            type: "button",
            className: "dts-btn dts-btn--ghost",
            onClick: () => {
              requestNotifications();
            }
          },
          text2("panel.enableNotifications")
        )
      );
    };
    return h(
      "div",
      { className: "dts-row" },
      h("div", { className: "dts-row__title" }, text2("chip.title")),
      h(
        "div",
        { className: "dts-section" },
        h("div", { className: "dts-rowtitle" }, text2("panel.autoTitle")),
        h("div", { className: "dts-caption" }, text2("panel.autoDescription")),
        h(
          "div",
          { className: "dts-fields" },
          timeField({
            caption: text2("panel.dayStart"),
            label: text2("panel.dayStart"),
            value: startDraft ?? dayStart,
            invalid: startInvalid,
            invalidText: text2("panel.invalidTime"),
            onChange: (raw) => {
              commitTime("dayStart", raw, setStartDraft);
            },
            onBlur: () => {
              setStartDraft(null);
            }
          }),
          timeField({
            caption: text2("panel.dayEnd"),
            label: text2("panel.dayEnd"),
            value: endDraft ?? dayEnd,
            invalid: endInvalid,
            invalidText: text2("panel.invalidTime"),
            onChange: (raw) => {
              commitTime("dayEnd", raw, setEndDraft);
            },
            onBlur: () => {
              setEndDraft(null);
            }
          })
        )
      ),
      h(
        "div",
        { className: "dts-summary" },
        h("span", { className: "dts-caption" }, text2("panel.currentTheme")),
        h("span", { className: "dts-summary__value" }, text2(active2 === "light" ? "chip.light" : "chip.dark")),
        h("span", { className: "dts-sep", "aria-hidden": true }, "·"),
        h("span", { className: "dts-caption" }, text2("panel.nextSwitch")),
        h(
          "span",
          { className: "dts-summary__value" },
          text2(boundaryTheme === "light" ? "chip.next.light" : "chip.next.dark", { time: clockTextOf3(boundaryAt) })
        )
      ),
      overridden ? h("div", { className: "dts-hint" }, text2("panel.overrideHint")) : null,
      h(
        "div",
        { className: "dts-section" },
        h(
          "div",
          { className: "dts-rowhead" },
          h(
            "div",
            { className: "dts-rowhead__text" },
            h("div", { className: "dts-rowtitle" }, text2("panel.notifyTitle")),
            h("div", { className: "dts-caption" }, text2("panel.notifyDescription"))
          ),
          switchButton(reminderEnabled, text2("panel.notifyTitle"), () => {
            commit({ reminderEnabled: !reminderEnabled });
          })
        ),
        h(
          "div",
          { className: "dts-fields" },
          timeField({
            caption: text2("panel.reminderTime"),
            label: text2("panel.reminderTime"),
            value: reminderDraft ?? reminderTime,
            invalid: reminderInvalid,
            invalidText: text2("panel.invalidTime"),
            onChange: (raw) => {
              commitTime("reminderTime", raw, setReminderDraft);
            },
            onBlur: () => {
              setReminderDraft(null);
            }
          }),
          h(
            "label",
            { className: "dts-field" },
            h("span", { className: "dts-caption" }, `${text2("panel.snooze")} (${text2("panel.snoozeUnit")})`),
            h("input", {
              className: "dts-input dts-input--number",
              type: "number",
              min: MIN_SNOOZE_MINUTES,
              max: MAX_SNOOZE_MINUTES,
              value: snoozeDraft ?? String(snoozeMinutes),
              "aria-label": text2("panel.snooze"),
              onChange: (event) => {
                changeSnooze(event.currentTarget.value);
              },
              onBlur: () => {
                setSnoozeDraft(null);
              }
            })
          )
        ),
        h(
          "label",
          { className: "dts-field" },
          h("span", { className: "dts-caption" }, text2("panel.overrideTitle")),
          h(
            "select",
            {
              className: "dts-input dts-input--select",
              value: String(manualOverrideMinutes),
              "aria-label": text2("panel.overrideTitle"),
              onChange: (event) => {
                const minutes = Number(event.currentTarget.value);
                if (Number.isFinite(minutes)) commit({ manualOverrideMinutes: minutes });
              }
            },
            ...OVERRIDE_CHOICES.map((choice) => h(
              "option",
              { key: choice.minutes, value: String(choice.minutes) },
              text2(choice.key)
            ))
          )
        ),
        h(
          "div",
          { className: "dts-toggle" },
          h("span", { className: "dts-caption" }, text2("panel.sound")),
          switchButton(soundEnabled, text2("panel.sound"), () => {
            commit({ soundEnabled: !soundEnabled });
          })
        ),
        h(
          "label",
          { className: "dts-field" },
          h("span", { className: "dts-caption" }, text2("panel.completionTitle")),
          h(
            "select",
            {
              className: "dts-input dts-input--select",
              value: completionSound,
              "aria-label": text2("panel.completionTitle"),
              onChange: (event) => {
                const next = event.currentTarget.value;
                if (COMPLETION_SOUNDS.includes(next)) {
                  commit({ completionSound: next });
                }
              }
            },
            ...COMPLETION_SOUNDS.map((choice) => h(
              "option",
              { key: choice, value: choice },
              text2(COMPLETION_LABELS[choice])
            ))
          ),
          h("span", { className: "dts-caption" }, text2("panel.completionDescription"))
        ),
        notificationLine()
      ),
      h(
        "div",
        { className: "dts-footer" },
        h(
          "button",
          {
            type: "button",
            className: "dts-btn dts-btn--ghost",
            onClick: () => {
              commit({ ...DEFAULT_SETTINGS });
            }
          },
          text2("panel.reset")
        ),
        saved ? h("span", { className: "dts-saved", role: "status" }, text2("panel.saved")) : null
      )
    );
  }

  // src/ui/styles.ts
  var UI_STYLES = [
    // ---- composer-dock chip -------------------------------------------------
    ".dts-chip-wrap{position:relative;display:inline-flex;align-items:center;min-width:0;max-width:100%}",
    ".dts-chip{display:inline-flex;flex:0 0 auto;align-items:center;gap:6px;box-sizing:border-box;",
    "max-width:100%;padding:4px 8px;border:0;border-radius:999px;background:transparent;",
    "color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:13px;",
    "white-space:nowrap;cursor:pointer}",
    '.dts-chip:hover,.dts-chip[aria-expanded="true"]{background:var(--dsw-alias-interactive-bg-hover)}',
    ".dts-chip__icon{display:block;flex:none}",
    ".dts-chip__label{overflow:hidden;text-overflow:ellipsis}",
    ".dts-chip__sep{color:var(--dsw-alias-label-tertiary)}",
    // ---- chip popover -------------------------------------------------------
    ".dts-pop{position:absolute;left:0;bottom:calc(100% + 8px);z-index:1200;box-sizing:border-box;",
    "width:248px;max-width:80vw;padding:12px;border-radius:var(--dsw-radius-md);",
    "background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);",
    "border:0.5px solid var(--dsw-alias-border-l2);box-shadow:0 12px 28px rgba(0,0,0,.24);",
    "display:flex;flex-direction:column;gap:6px;text-align:left;font-size:12px;line-height:1.5}",
    ".dts-pop__title{margin:0;font-size:13px;line-height:20px;font-weight:600;color:var(--dsw-alias-label-primary)}",
    ".dts-pop__line{color:var(--dsw-alias-label-secondary)}",
    ".dts-pop__hint{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1.5}",
    // ---- bedtime card -------------------------------------------------------
    ".dts-layer{position:fixed;inset:0;z-index:2147483000;box-sizing:border-box;display:flex;",
    "align-items:flex-end;justify-content:flex-end;padding:24px;pointer-events:none}",
    ".dts-layer--scrim{background:var(--dsw-alias-bg-mask-1)}",
    ".dts-card{pointer-events:auto;box-sizing:border-box;width:360px;max-width:100%;padding:18px;",
    "border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-overlay);",
    "color:var(--dsw-alias-label-primary);border:0.5px solid var(--dsw-alias-border-l2);",
    "box-shadow:0 18px 44px rgba(0,0,0,.28);display:flex;flex-direction:column;gap:10px;",
    "font-size:13px;line-height:1.5}",
    ".dts-card__head{display:flex;align-items:center;gap:8px;color:var(--dsw-alias-label-secondary)}",
    ".dts-card__icon{display:block;flex:none}",
    ".dts-card__title{margin:0;font-size:16px;line-height:1.3;font-weight:600;color:var(--dsw-alias-label-primary)}",
    ".dts-card__body{margin:0;font-size:13px;line-height:1.5;color:var(--dsw-alias-label-secondary)}",
    ".dts-card__actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:2px}",
    // ---- settings row -------------------------------------------------------
    ".dts-row{display:flex;flex-direction:column;gap:8px;padding:16px 0;box-sizing:border-box;",
    "border-bottom:0.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);",
    "font-size:13px;line-height:1.5}",
    ".dts-row__title{font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary)}",
    ".dts-section{display:flex;flex-direction:column;gap:8px}",
    ".dts-rowhead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}",
    ".dts-rowhead__text{display:flex;flex-direction:column;gap:2px;min-width:0}",
    ".dts-rowtitle{font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary)}",
    ".dts-fields{display:flex;flex-wrap:wrap;gap:12px}",
    ".dts-field{display:flex;flex-direction:column;gap:4px;min-width:0}",
    ".dts-caption{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}",
    ".dts-hint{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}",
    ".dts-hint--warn{color:var(--dsw-alias-state-warn-primary)}",
    ".dts-saved{font-size:12px;line-height:18px;color:var(--dsw-alias-state-success-primary)}",
    ".dts-summary{display:flex;align-items:center;flex-wrap:wrap;gap:6px}",
    ".dts-summary__value{font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary)}",
    ".dts-sep{color:var(--dsw-alias-label-tertiary)}",
    ".dts-footer{display:flex;align-items:center;gap:10px;flex-wrap:wrap}",
    // ---- controls -----------------------------------------------------------
    ".dts-input{box-sizing:border-box;width:112px;padding:4px 8px;border-radius:var(--dsw-radius-sm);",
    "border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);",
    "color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px}",
    ".dts-input:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}",
    ".dts-input--number{width:72px}",
    ".dts-input--select{width:auto;min-width:200px;max-width:100%}",
    ".dts-toggle{display:flex;align-items:center;gap:8px}",
    ".dts-switch{position:relative;flex:none;box-sizing:border-box;width:34px;height:20px;padding:0;",
    "border:1px solid var(--dsw-alias-border-l2);border-radius:999px;cursor:pointer;font:inherit;",
    "background:var(--dsw-alias-bg-layer-2);transition:background .15s ease}",
    '.dts-switch[aria-checked="true"]{background:var(--dsw-alias-button-primary-fill);border-color:transparent}',
    ".dts-switch__knob{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;",
    "background:var(--dsw-alias-label-secondary);transition:transform .15s ease,background .15s ease}",
    '.dts-switch[aria-checked="true"] .dts-switch__knob{transform:translateX(14px);',
    "background:var(--dsw-alias-label-primary-inverted)}",
    ".dts-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;box-sizing:border-box;",
    "padding:6px 12px;border:1px solid transparent;border-radius:var(--dsw-radius-sm);background:transparent;",
    "color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;font-size:12px;line-height:18px}",
    ".dts-btn--primary{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-inverted)}",
    ".dts-btn--primary:hover{opacity:.9}",
    ".dts-btn--ghost{border-color:var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary)}",
    ".dts-btn--ghost:hover{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-interactive-bg-hover)}",
    ".dts-btn--link{padding:6px 4px;color:var(--dsw-alias-label-secondary)}",
    ".dts-btn--link:hover{color:var(--dsw-alias-label-primary)}",
    "@media (prefers-reduced-motion: reduce){.dts-switch,.dts-switch__knob{transition:none}}"
  ].join("");

  // src/client.ts
  var MODULE_ID = "@local/dsh-theme-sleep";
  var ENTRY_ID = "theme-sleep";
  var CHIP_SLOT_ID = "theme-sleep-chip";
  var SETTINGS_SLOT_ID = "theme-sleep-row";
  var OWN_WRITE_WINDOW_MS = 5e3;
  var THEME_POLL_MS = 30 * 1e3;
  var translate = fallbackTranslate;
  function text(key, params) {
    return translate(key, params);
  }
  var ViewStore = class {
    state;
    listeners = /* @__PURE__ */ new Set();
    /** @param initial - First published state. */
    constructor(initial) {
      this.state = initial;
    }
    /** @returns The current immutable snapshot. */
    get() {
      return this.state;
    }
    /**
     * Merge a patch into the snapshot and notify listeners when anything changed.
     * @param patch - Fields to merge.
     */
    update(patch) {
      for (const key of Object.keys(patch)) {
        if (!Object.is(this.state[key], patch[key])) {
          this.state = { ...this.state, ...patch };
          for (const listener of [...this.listeners]) {
            try {
              listener();
            } catch (error) {
              logError("view listener", error);
            }
          }
          return;
        }
      }
    }
    /**
     * Observe snapshot replacements.
     * @param listener - Called after each change.
     * @returns The disposer removing the listener.
     */
    subscribe = (listener) => {
      this.listeners.add(listener);
      return () => {
        this.listeners.delete(listener);
      };
    };
  };
  function logError(where, error) {
    try {
      console.error(`[dsh-theme-sleep] ${where}:`, error);
    } catch {
    }
  }
  function makeUseView(store) {
    const { useRef, useSyncExternalStore, useState, useEffect } = React;
    return function useView(selector) {
      const cache = useRef(null);
      const getSnapshot = () => {
        const state = store.get();
        if (cache.current !== null && cache.current.state === state) return cache.current.value;
        const value2 = selector(state);
        cache.current = { state, value: value2 };
        return value2;
      };
      if (typeof useSyncExternalStore === "function") {
        return useSyncExternalStore(store.subscribe, getSnapshot);
      }
      const [value, setValue] = useState(getSnapshot());
      useEffect(() => store.subscribe(() => {
        setValue(getSnapshot());
      }), []);
      return value;
    };
  }
  function notificationPermission() {
    try {
      const permission = window.Notification?.permission;
      if (permission === "granted" || permission === "denied" || permission === "default") return permission;
      return "unsupported";
    } catch {
      return "unsupported";
    }
  }
  function requestNotificationPermission() {
    try {
      const ctor = window.Notification;
      if (ctor === void 0 || typeof ctor.requestPermission !== "function") {
        return Promise.resolve("unsupported");
      }
      return Promise.resolve(ctor.requestPermission()).then(
        () => notificationPermission(),
        () => "denied"
      );
    } catch {
      return Promise.resolve("denied");
    }
  }
  function showSystemNotification(title, body) {
    try {
      const ctor = window.Notification;
      if (ctor === void 0 || ctor.permission !== "granted") return;
      new ctor(title, { body, tag: "dsh-theme-sleep", silent: true });
    } catch {
    }
  }
  var audioContext = null;
  var TONE_SECONDS = 0.45;
  var TONES = Object.freeze({
    ding: Object.freeze([{ at: 0, hz: 880 }, { at: 0.17, hz: 1320 }]),
    chime: Object.freeze([{ at: 0, hz: 660 }, { at: 0.5, hz: 880 }, { at: 1, hz: 660 }]),
    blip: Object.freeze([{ at: 0, hz: 520 }])
  });
  function playTones(style) {
    try {
      const scope = window;
      const Ctor = scope.AudioContext ?? scope.webkitAudioContext;
      if (Ctor === void 0) return;
      audioContext ??= new Ctor();
      const audio = audioContext;
      if (audio === null) return;
      if (audio.state === "suspended") void audio.resume?.();
      for (const tone of TONES[style]) {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = tone.hz;
        const at = audio.currentTime + tone.at;
        gain.gain.setValueAtTime(1e-4, at);
        gain.gain.exponentialRampToValueAtTime(0.16, at + 0.03);
        gain.gain.exponentialRampToValueAtTime(1e-4, at + TONE_SECONDS - 0.03);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start(at);
        oscillator.stop(at + TONE_SECONDS);
      }
    } catch (error) {
      logError("cue", error);
    }
  }
  function playCompletionCue(style) {
    if (style === "off") return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    playTones(style);
  }
  function clockText() {
    const date = /* @__PURE__ */ new Date();
    const hour = date.getHours();
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${String(hour).padStart(2, "0")}:${minute}`;
  }
  var ERROR_CSS = [
    ".dts-crash{position:fixed;right:24px;bottom:24px;box-sizing:border-box;width:280px;padding:12px;",
    "border-radius:14px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);",
    "border:1px solid var(--dsw-alias-border-l1);box-shadow:0 12px 28px rgba(0,0,0,.22);",
    "font-family:inherit;font-size:12px;line-height:1.45;z-index:2147483000}",
    ".dts-crash__title{font-weight:600;color:var(--dsw-alias-label-secondary);margin-bottom:6px}",
    ".dts-crash__notice{padding:5px 8px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);",
    "color:var(--dsw-alias-state-error-primary);word-break:break-word}"
  ].join("");
  function createChipBoundary(useView) {
    const { Component } = React;
    return class ThemeSleepChipBoundary extends Component {
      state = { error: null };
      static getDerivedStateFromError(error) {
        return { error };
      }
      componentDidCatch(error) {
        logError("chip render", error);
      }
      render() {
        if (this.state.error === null) return h(Chip, { useView, text });
        const message = this.state.error instanceof Error ? this.state.error.message : String(this.state.error);
        const card = h(
          "div",
          { className: "dts-crash" },
          h("style", { dangerouslySetInnerHTML: { __html: ERROR_CSS } }),
          h("div", { className: "dts-crash__title" }, text("chip.title")),
          h("div", { className: "dts-crash__notice" }, text("error.render") + message),
          h(
            "button",
            {
              type: "button",
              className: "dts-btn",
              onClick: () => {
                this.setState({ error: null });
              }
            },
            text("error.retry")
          )
        );
        return card;
      }
    };
  }
  function createCardBoundary(useView, actions) {
    const { Component } = React;
    return class ThemeSleepCardBoundary extends Component {
      state = { error: null };
      static getDerivedStateFromError(error) {
        return { error };
      }
      componentDidCatch(error) {
        logError("reminder card render", error);
      }
      render() {
        if (this.state.error !== null) return null;
        return h(ReminderCard, { useView, text, actions, clock: clockText });
      }
    };
  }
  var sink = window.__ModuleLoader__;
  if (sink === void 0) {
    throw new Error(`${MODULE_ID}: window.__ModuleLoader__ is missing (booted outside the web shell?)`);
  }
  sink.load({
    id: MODULE_ID,
    factory(require_) {
      bindPlatform(require_);
      const module = { exports: {} };
      const exports = module.exports;
      const inject = ["slots", "locale", "theme", "configForms"];
      function apply(ctx) {
        const nowMs = () => Date.now();
        ctx.effect(
          () => ctx.locale.register(NS, { zh, en }),
          "theme-sleep: dictionaries"
        );
        try {
          const bound = ctx.locale.bind(NS);
          translate = (key, params) => String(bound(key, params));
        } catch (error) {
          logError("locale bind", error);
        }
        bindLocale(translate);
        let settings = DEFAULT_SETTINGS;
        let settingsReady = false;
        const engine = new ReminderEngine(void 0, nowMs());
        const store = new ViewStore({
          settings,
          expected: "light",
          active: "light",
          overridden: false,
          overrideUntil: 0,
          boundary: { theme: "dark", at: nowMs() },
          reminder: { mode: "idle", dayKey: localDayKey(nowMs()) },
          notification: notificationPermission(),
          settingsReady: false,
          switchInMs: 0
        });
        const useView = makeUseView(store);
        let overrideUntil;
        let overrideMinutesApplied = 0;
        let ownWriteApplied = null;
        let ownWriteAt = 0;
        const stored = loadStoredState();
        engine.hydrate({
          ...stored.firedDay === void 0 ? {} : { firedDay: stored.firedDay },
          ...stored.snoozeUntil === void 0 ? {} : { snoozeUntil: stored.snoozeUntil }
        });
        if (stored.settings !== void 0) {
          settings = normalizeSettings(stored.settings);
          store.update({ settings });
        }
        if (stored.overrideUntil !== void 0 && stored.overrideUntil > nowMs()) {
          overrideUntil = stored.overrideUntil;
          overrideMinutesApplied = settings.manualOverrideMinutes;
        }
        let applyingTheme = false;
        const readActive = () => {
          try {
            return ctx.theme.getTheme().active.colorScheme;
          } catch (error) {
            logError("theme read", error);
            return store.get().active;
          }
        };
        const overrideDeadline = (now, rule) => {
          const minutes = settings.manualOverrideMinutes;
          if (!Number.isFinite(minutes) || minutes <= 0) return void 0;
          const boundaryAt = themePhase(now, rule).boundary.at;
          if (minutes >= MAX_MANUAL_OVERRIDE_MINUTES) return boundaryAt;
          return Math.min(now + minutes * 6e4, boundaryAt);
        };
        const syncTheme = (now) => {
          const rule = themeRuleOf(settings);
          const phase = themePhase(now, rule);
          const active2 = readActive();
          const freshOwnWrite = ownWriteApplied !== null && now - ownWriteAt < OWN_WRITE_WINDOW_MS && active2 === ownWriteApplied;
          if (!freshOwnWrite) ownWriteApplied = null;
          const configuredWindow = settings.manualOverrideMinutes;
          if (overrideUntil !== void 0 && configuredWindow < overrideMinutesApplied) {
            const shortened = Math.min(now + Math.max(configuredWindow, 0) * 6e4, phase.boundary.at);
            overrideUntil = Math.min(overrideUntil, shortened);
            overrideMinutesApplied = configuredWindow;
          }
          if (overrideUntil !== void 0 && now >= overrideUntil) {
            overrideUntil = void 0;
            overrideMinutesApplied = 0;
          }
          const overridden = overrideUntil !== void 0 && active2 !== phase.theme;
          if (!overridden && active2 !== phase.theme) {
            applyingTheme = true;
            try {
              ownWriteApplied = phase.theme;
              ownWriteAt = now;
              ctx.theme.setTheme(phase.theme);
            } catch (error) {
              logError("theme write", error);
            } finally {
              applyingTheme = false;
            }
          }
          store.update({
            expected: phase.theme,
            active: readActive(),
            overridden,
            overrideUntil: overridden && overrideUntil !== void 0 ? overrideUntil : 0,
            boundary: { theme: phase.boundary.theme, at: phase.boundary.at },
            switchInMs: phase.remainingMs
          });
        };
        const onThemeChange = () => {
          try {
            if (applyingTheme) return;
            const now = nowMs();
            const snapshot = ctx.theme.getTheme();
            const rule = themeRuleOf(settings);
            const phase = themePhase(now, rule);
            if (ownWriteApplied !== null && snapshot.active.colorScheme === ownWriteApplied && Math.abs(now - ownWriteAt) <= OWN_WRITE_WINDOW_MS) {
              ownWriteApplied = null;
              syncTheme(now);
              return;
            }
            if (snapshot.active.colorScheme !== phase.theme) {
              const deadline = overrideDeadline(now, rule);
              overrideUntil = deadline ?? Number.NEGATIVE_INFINITY;
              overrideMinutesApplied = deadline === void 0 ? 0 : settings.manualOverrideMinutes;
            }
            syncTheme(now);
          } catch (error) {
            logError("theme change", error);
          }
        };
        const runningSource = (status) => {
          const read = () => typeof status.getSnapshot === "function" ? status.getSnapshot() : status;
          const subscribe = typeof status.subscribe === "function" ? (listener) => status.subscribe(listener) : () => () => {
          };
          return {
            getSnapshot: () => read(),
            subscribe
          };
        };
        let cardWasShowing = false;
        let announcedKey = null;
        const alertKeyOf = (state) => (
          // The daily occurrence is one alert per day; each snooze cycle on that
          // day is its own alert, keyed by the deadline it was postponed to.
          state.mode === "snoozed" ? `${state.dayKey}:snooze:${String(state.snoozeUntil ?? 0)}` : state.dayKey
        );
        const publishReminder = (state, celebrate) => {
          const showing = state.mode !== "idle";
          const alertKey = alertKeyOf(state);
          if (celebrate && showing && !cardWasShowing && announcedKey !== alertKey) {
            showSystemNotification(text("reminder.title"), text("reminder.body", { time: clockText() }));
            if (settings.soundEnabled) playTones("chime");
            announcedKey = alertKey;
          }
          cardWasShowing = showing;
          store.update({ reminder: state, notification: notificationPermission() });
        };
        const persistReminderState = () => {
          const snoozeUntil = engine.pendingSnoozeUntil();
          saveStoredState(
            {
              firedDay: engine.firedDay(),
              ...snoozeUntil === void 0 ? {} : { snoozeUntil },
              ...overrideUntil === void 0 ? {} : { overrideUntil }
            },
            {
              ...snoozeUntil === void 0 ? { snoozeUntil: true } : {},
              ...overrideUntil === void 0 ? { overrideUntil: true } : {}
            }
          );
        };
        const syncReminder = (now, announce) => {
          engine.setEnabled(settings.reminderEnabled);
          publishReminder(engine.tick(settings, now), announce);
          persistReminderState();
        };
        let form = null;
        const adoptSettings = (raw, ready) => {
          settings = normalizeSettings(raw);
          settingsReady = settingsReady || ready;
          store.update({ settings, settingsReady });
          if (ready) saveStoredState({ settings: { ...settings } });
        };
        const persist = (patch) => {
          settings = normalizeSettings({ ...settings, ...patch });
          store.update({ settings });
          saveStoredState({ settings: { ...settings } });
          const now = nowMs();
          syncTheme(now);
          syncReminder(now, true);
          const target = form;
          if (target === null) return;
          for (const [field, value] of Object.entries(patch)) {
            void target.set(field, value).catch((error) => {
              logError(`settings write ${field}`, error);
            });
          }
        };
        const requestNotifications = () => {
          void requestNotificationPermission().then((permission) => {
            store.update({ notification: permission });
          });
        };
        const openSettings = () => {
          try {
            ctx.layout?.selectPanel?.("settings");
          } catch (error) {
            logError("open settings", error);
          }
        };
        const actions = {
          snooze() {
            publishReminder(engine.snooze(settings, nowMs()), false);
            persistReminderState();
          },
          dismiss() {
            publishReminder(engine.dismiss(nowMs()), false);
            persistReminderState();
          },
          openSettings
        };
        ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register(
          { name: "conversation.composer.dock", id: CHIP_SLOT_ID, order: 40 },
          createChipBoundary(useView)
        ));
        ctx.slots.inject("settings.general.item", () => ctx.slots.register(
          {
            name: "settings.general.item",
            id: SETTINGS_SLOT_ID,
            order: 25,
            locale: NS,
            inject: () => ({
              useView,
              text,
              persist,
              settingsReady,
              requestNotifications
            })
          },
          SettingsRow
        ));
        ctx.effect(() => {
          const style = document.createElement("style");
          style.setAttribute("data-dsh-theme-sleep", "styles");
          style.textContent = UI_STYLES;
          document.head.appendChild(style);
          return () => {
            style.remove();
          };
        }, "theme-sleep: stylesheet");
        ctx.effect(() => {
          const host = document.createElement("div");
          host.setAttribute("data-dsh-theme-sleep", "reminder-root");
          document.body.appendChild(host);
          const { createRoot } = require_("react-dom/client");
          const root = createRoot(host);
          root.render(h(createCardBoundary(useView, actions)));
          return () => {
            try {
              root.unmount();
            } catch (error) {
              logError("reminder unmount", error);
            }
            host.remove();
          };
        }, "theme-sleep: reminder card root");
        ctx.effect(() => {
          const onResume = () => {
            const now = nowMs();
            syncTheme(now);
            syncReminder(now, true);
          };
          document.addEventListener("visibilitychange", onResume);
          window.addEventListener("focus", onResume);
          return () => {
            document.removeEventListener("visibilitychange", onResume);
            window.removeEventListener("focus", onResume);
          };
        }, "theme-sleep: resume hooks");
        ctx.effect(() => ctx.on("theme/change", onThemeChange), "theme-sleep: theme/change listener");
        ctx.inject(["uiSession"], (scope) => {
          const watch = new CompletionWatch(
            runningSource(scope.uiSession.sessionStatus),
            () => {
              playCompletionCue(settings.completionSound);
            }
          );
          watch.start();
          return () => {
            watch.stop();
          };
        });
        ctx.effect(() => {
          let disposed = false;
          let timer = null;
          const scheduleTimeout = (callback, delay) => {
            try {
              if (typeof ctx.timer?.timeout === "function") return ctx.timer.timeout(callback, delay);
            } catch (error) {
              logError("timer service", error);
            }
            const handle = setTimeout(callback, delay);
            return () => {
              clearTimeout(handle);
            };
          };
          const schedule = (delay) => {
            if (disposed) return;
            timer = scheduleTimeout(() => {
              timer = null;
              tick();
            }, Math.max(0, Math.min(delay, THEME_POLL_MS)));
          };
          const tick = () => {
            if (disposed) return;
            const now = nowMs();
            syncTheme(now);
            syncReminder(now, true);
            const themeDelay = Math.max(0, store.get().boundary.at - now);
            const reminderDelay = engine.msUntilNextCheck(settings, now);
            schedule(Math.min(themeDelay, reminderDelay, THEME_POLL_MS));
          };
          schedule(0);
          return () => {
            disposed = true;
            timer?.();
            timer = null;
          };
        }, "theme-sleep: watch timer");
        ctx.effect(() => {
          let active2 = true;
          let dispose = null;
          try {
            const acquired = ctx.configForms.get(ENTRY_ID);
            form = acquired;
            const read = () => {
              if (!active2) return;
              const snapshot = acquired.getSnapshot();
              const ready = snapshot.status === "ready";
              adoptSettings(snapshot.value, ready);
              if (ready) engine.setWatcherStart(nowMs());
              const now = nowMs();
              syncTheme(now);
              syncReminder(now, false);
            };
            read();
            dispose = acquired.subscribe(read);
            return () => {
              active2 = false;
              form = null;
              dispose?.();
            };
          } catch (error) {
            logError("settings form", error);
            adoptSettings(void 0, false);
            const now = nowMs();
            syncTheme(now);
            syncReminder(now, false);
            return () => {
              active2 = false;
            };
          }
        }, "theme-sleep: settings scope");
      }
      exports.apply = apply;
      exports.inject = inject;
      return module.exports;
    }
  });
})();
