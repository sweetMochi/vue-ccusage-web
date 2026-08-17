import type { Locale } from '../types/i18n'

// Intl 物件建立成本不低，倒數每秒重繪會反覆呼叫，故依語系快取
const numberFormatters = new Map<Locale, Intl.NumberFormat>()
const resetAtFormatters = new Map<Locale, Intl.DateTimeFormat>()

function numberFormatter(locale: Locale): Intl.NumberFormat {
  let formatter = numberFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale)
    numberFormatters.set(locale, formatter)
  }
  return formatter
}

function resetAtFormatter(locale: Locale): Intl.DateTimeFormat {
  let formatter = resetAtFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      // hour12: false 在部分語系會產生 24:xx，固定用 h23
      hourCycle: 'h23',
    })
    resetAtFormatters.set(locale, formatter)
  }
  return formatter
}

/**
 * 毫秒轉換成 `H:MM:SS` 倒數
 * 純數字格式，各語系通用
 */
export function formatCountdown(ms: number): string {
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1_000)
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * token 數的千分位格式化
 */
export function formatTokens(n: number, locale: Locale): string {
  return numberFormatter(locale).format(Math.round(n))
}

/**
 * 美元金額，固定兩位小數
 * 幣別固定為 USD，不隨語系改變寫法
 */
export function formatUsd(n: number): string {
  return `$${n.toFixed(2)}`
}

/**
 * Unix epoch 秒轉重置時間 (本地時區)
 * 月日與星期的排列順序交由 Intl 依語系決定
 */
export function formatResetAt(epochSeconds: number, locale: Locale): string {
  return resetAtFormatter(locale).format(new Date(epochSeconds * 1000))
}

/**
 * 毫秒時刻轉當地時間 `HH:mm:ss`
 */
export function formatTime(ms: number, locale: Locale): string {
  return new Date(ms).toLocaleTimeString(locale)
}
