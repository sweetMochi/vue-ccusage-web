import en from './en'
import ja from './ja'
import zhCN from './zh-CN'
import zhTW from './zh-TW'
import type { Locale, LocaleOption } from '../types/i18n'

/**
 * 訊息 key，以 zh-TW 為唯一來源
 */
export type MessageKey = keyof typeof zhTW

/**
 * 語系字典表
 *
 * 型別標註即完整性檢查：任一語系少了 key，這裡就會編譯失敗
 */
export const messages: Record<Locale, Record<MessageKey, string>> = {
  'zh-TW': zhTW,
  'zh-CN': zhCN,
  en,
  ja,
}

/**
 * 無法從瀏覽器偵測時採用的語系
 */
export const defaultLocale: Locale = 'zh-TW'

/**
 * 語言選項，label 一律使用該語言的自稱
 */
export const localeOptions: LocaleOption[] = [
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
]
