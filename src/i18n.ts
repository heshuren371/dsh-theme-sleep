/**
 * Client locale dictionaries and the translator used by plugin components.
 *
 * The key set is Chinese-first: `zh` defines every key, and `en` mirrors it.
 * `t()` is bound by the Client entry to `ctx.locale.bind(NS)` so visible text
 * follows the active locale without re-registering.
 * @module
 */

/** Locale namespace owned by this plugin. */
export const NS = 'theme-sleep'

/** Chinese dictionary. */
export const zh = {
  'chip.label': '主题',
  'chip.light': '浅色',
  'chip.dark': '深色',
  'chip.off': '已暂停',
  'chip.title': '自动主题与睡觉提醒',
  'chip.next.light': '将于 {time} 切换浅色',
  'chip.next.dark': '将于 {time} 切换深色',
  'chip.reminder': '就寝提醒 {time}',
  'chip.reminderOff': '就寝提醒已关闭',
  'chip.override': '已手动指定主题',
  'chip.overrideUntil': '{time} 后自动接管',
  'chip.openSettings': '打开设置',

  'panel.autoTitle': '按时间自动切换主题',
  'panel.autoDescription': '浅色区间结束时自动切深色，深色区间结束时自动切浅色。',
  'panel.dayStart': '浅色开始',
  'panel.dayEnd': '浅色结束',
  'panel.notifyTitle': '睡前提醒',
  'panel.notifyDescription': '到点后在界面上弹出提醒卡片，并发送系统通知。',
  'panel.reminderTime': '提醒时间',
  'panel.snooze': '稍后再提醒',
  'panel.snoozeUnit': '分钟',
  'panel.sound': '提醒时播放提示音',
  'panel.completionTitle': '任务跑完时',
  'panel.completionDescription': '每次一轮对话结束、DSH 停下来等你时响一声。页面在后台时不响。',
  'panel.completionOff': '不响',
  'panel.completionDing': '叮（两声）',
  'panel.completionChime': '风铃（三声）',
  'panel.completionBlip': '轻点（一声）',
  'panel.enableNotifications': '允许系统通知',
  'panel.notificationsOn': '系统通知已允许',
  'panel.notificationsDenied': '系统通知被拒绝，仅显示应用内卡片',
  'panel.notificationsUnsupported': '当前环境不支持系统通知',
  'panel.save': '保存',
  'panel.saved': '已保存',
  'panel.invalidTime': '时间格式不对，请用 HH:mm',
  'panel.currentTheme': '当前主题',
  'panel.nextSwitch': '下次切换',
  'panel.now': '现在',
  'panel.reset': '恢复默认',
  'panel.overrideHint': '你手动选过主题；窗口结束后插件自动接管。',
  'panel.overrideTitle': '手动改了主题之后',
  'panel.overrideNever': '不覆盖，立刻按时间规则切回',
  'panel.overrideFive': '保留我的选择 5 分钟',
  'panel.overrideThirty': '保留我的选择 30 分钟（默认）',
  'panel.overrideTwoHours': '保留我的选择 2 小时',
  'panel.overridePeriod': '保留到下一个切换点（最长）',
  
  'reminder.title': '该睡觉了',
  'reminder.body': '现在是 {time}，超过预定就寝时间了。放下手机，去睡吧。',
  'reminder.snooze': '再 {minutes} 分钟',
  'reminder.dismiss': '今晚就睡',
  'reminder.close': '知道了',
  'reminder.snoozedBody': '已推迟到 {time}。',

  'error.render': '自动主题插件出错了：',
  'error.retry': '重试',
} as const

/** English dictionary with the same key set as {@link zh}. */
export const en: Record<keyof typeof zh, string> = {
  'chip.label': 'Theme',
  'chip.light': 'Light',
  'chip.dark': 'Dark',
  'chip.off': 'Paused',
  'chip.title': 'Auto theme & sleep reminder',
  'chip.next.light': 'Light at {time}',
  'chip.next.dark': 'Dark at {time}',
  'chip.reminder': 'Bedtime reminder {time}',
  'chip.reminderOff': 'Bedtime reminder off',
  'chip.override': 'Theme chosen manually',
  'chip.overrideUntil': 'auto takes over in {time}',
  'chip.openSettings': 'Open settings',

  'panel.autoTitle': 'Switch theme by time',
  'panel.autoDescription': 'Light during the light window, dark from its end until it starts again.',
  'panel.dayStart': 'Light starts',
  'panel.dayEnd': 'Light ends',
  'panel.notifyTitle': 'Bedtime reminder',
  'panel.notifyDescription': 'Shows a card in the app and sends a system notification.',
  'panel.reminderTime': 'Reminder time',
  'panel.snooze': 'Snooze for',
  'panel.snoozeUnit': 'min',
  'panel.sound': 'Play a chime with the reminder',
  'panel.completionTitle': 'When a task finishes',
  'panel.completionDescription': 'One short cue each time a turn ends and DSH stops to wait for you. Silent while the page is hidden.',
  'panel.completionOff': 'Silent',
  'panel.completionDing': 'Ding (two tones)',
  'panel.completionChime': 'Chime (three tones)',
  'panel.completionBlip': 'Blip (one tone)',
  'panel.enableNotifications': 'Allow system notifications',
  'panel.notificationsOn': 'System notifications allowed',
  'panel.notificationsDenied': 'System notifications denied; the in-app card still shows',
  'panel.notificationsUnsupported': 'System notifications are unavailable here',
  'panel.save': 'Save',
  'panel.saved': 'Saved',
  'panel.invalidTime': 'Use HH:mm',
  'panel.currentTheme': 'Current theme',
  'panel.nextSwitch': 'Next switch',
  'panel.now': 'now',
  'panel.reset': 'Restore defaults',
  'panel.overrideHint': 'You picked a theme manually; the rule takes over when that window ends.',
  'panel.overrideTitle': 'After you change the theme by hand',
  'panel.overrideNever': 'No override — follow the time rule right away',
  'panel.overrideFive': 'Keep my choice for 5 minutes',
  'panel.overrideThirty': 'Keep my choice for 30 minutes (default)',
  'panel.overrideTwoHours': 'Keep my choice for 2 hours',
  'panel.overridePeriod': 'Keep my choice until the next switch (max)',
  
  'reminder.title': 'Time for bed',
  'reminder.body': 'It is {time}, past your bedtime. Put the phone down and get some sleep.',
  'reminder.snooze': 'Snooze {minutes} min',
  'reminder.dismiss': 'Going to sleep',
  'reminder.close': 'Got it',
  'reminder.snoozedBody': 'Snoozed until {time}.',

  'error.render': 'The auto-theme plugin crashed: ',
  'error.retry': 'Retry',
}

/** Every key this namespace defines. */
export type ThemeSleepKey = keyof typeof zh

/** One dictionary value; `en` guarantees the same key set. */
export type Dictionary = Record<ThemeSleepKey, string>

/** Translator bound by the Client entry; accepts a plain key string. */
export type Translate = (key: string, params?: Record<string, string | number>) => string

/** Translator over the typed key set. */
export type TranslateKey = (key: ThemeSleepKey, params?: Record<string, string | number>) => string

/** The active translator; Chinese copy until the Client entry binds one. */
let active: TranslateKey = (key, params) => interpolate(zh[key], params)

/**
 * Bind the translator supplied by the Client locale service.
 * @param next - Translator for the active locale.
 */
export function bindLocale(next: Translate): void {
  active = (key, params) => next(key, params)
}

/**
 * Fallback translator over the Chinese dictionary, usable before binding.
 * @param key - Dictionary key.
 * @param params - Optional placeholder values.
 * @returns Chinese copy with placeholders rendered.
 */
export function fallbackTranslate(key: string, params?: Record<string, string | number>): string {
  return active(key as ThemeSleepKey, params)
}

/**
 * Translate one key through the bound translator.
 * @param key - Dictionary key.
 * @param params - Optional placeholder values.
 * @returns Localized copy.
 */
export function t(key: ThemeSleepKey, params?: Record<string, string | number>): string {
  return active(key, params)
}

/**
 * Replace `{name}` placeholders in one template.
 * @param template - Dictionary string.
 * @param params - Values by placeholder name.
 * @returns The rendered string; unknown placeholders are left as written.
 */
export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (params === undefined) return template
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => {
    const value = params[name]
    return value === undefined ? whole : String(value)
  })
}
