import { ref, watchEffect } from 'vue'
import { defaultLocale, localeOptions, messages, type MessageKey } from '../locales'
import type { AppError, Locale, MessageParams } from '../types/i18n'

const STORAGE_KEY = 'locale'

/** 目前支援的語系代碼 */
const supported = localeOptions.map((o) => o.value)

function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && supported.includes(value as Locale)
}

/**
 * 將 BCP 47 語言標籤對應到支援的語系
 * 中文必須分辨字體：Hant 與港澳台地區視為繁體，其餘簡體
 */
function matchLocale(tag: string): Locale | null {
  const lower = tag.toLowerCase()

  const exact = supported.find((v) => v.toLowerCase() === lower)
  if (exact) return exact

  if (lower.startsWith('zh')) {
    return /hant|-tw|-hk|-mo/.test(lower) ? 'zh-TW' : 'zh-CN'
  }

  const primary = lower.split('-')[0]
  return supported.find((v) => v.toLowerCase().split('-')[0] === primary) ?? null
}

/** 依瀏覽器偏好順序挑第一個支援的語系 */
function detectLocale(): Locale {
  const tags = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const tag of tags) {
    const matched = matchLocale(tag)
    if (matched) return matched
  }
  return defaultLocale
}

function readStoredLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY)
  return isLocale(stored) ? stored : detectLocale()
}

// 語系與主題同為全頁面唯一的狀態 (模組層級單例)，切換時必須所有元件同步
// watchEffect 只需註冊一次，不隨元件卸載清理，故不用生命週期 hook
const locale = ref<Locale>(readStoredLocale())

/**
 * 取翻譯文字，模板中的 `{name}` 由 params 取代
 * 讀取 locale 建立響應依賴，切換語言時所有 computed 與 template 會自動重算
 */
function t(key: MessageKey, params?: MessageParams): string {
  const template = messages[locale.value][key]
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (raw, name: string) => {
    const value = params[name]
    return value === undefined ? raw : String(value)
  })
}

/** 把後端回傳的錯誤代碼解析成當前語系的文案 */
function localizeError(error: AppError): string {
  return t(`error.${error.code}`, { detail: error.detail ?? '' })
}

watchEffect(() => {
  localStorage.setItem(STORAGE_KEY, locale.value)
  // 靜態 HTML 寫死的 lang 與 title 也要跟著切換
  document.documentElement.lang = locale.value
  document.title = t('app.title')
})

/**
 * 多語系的單一真相來源
 * locale 可直接寫入以切換語言，t 與 localizeError 會隨之更新
 */
export function useI18n() {
  return { locale, t, localizeError, localeOptions }
}
