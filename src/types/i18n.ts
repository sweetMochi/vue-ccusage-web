/**
 * 支援的語系
 *
 *      'zh-TW' 繁體中文 (基準語系，決定所有訊息 key)
 *      'zh-CN' 簡體中文
 *      'en' 英文
 *      'ja' 日文
 */
export type Locale = 'zh-TW' | 'zh-CN' | 'en' | 'ja'

/**
 * 語言選項
 */
export interface LocaleOption {
  /** 語系代碼 */
  value: Locale
  /** 語言名稱，一律以該語言自身書寫，不隨當前語系翻譯 */
  label: string
}

/**
 * 訊息插值參數，對應模板中的 `{name}`
 */
export type MessageParams = Record<string, string | number>

/**
 * 可本地化的錯誤
 *
 * 後端只回傳代碼，文案在前端解析，語言切換時已顯示的錯誤才會跟著重譯
 */
export interface AppError {
  /** 錯誤代碼，對應 `error.*` 訊息 key */
  code: ErrorCode
  /** 補充細節 (CLI stderr、例外訊息、逾時秒數)，為原始技術資訊不翻譯 */
  detail?: string
}

/**
 * 錯誤代碼
 *
 *      ccusage-failed: ccusage CLI 執行失敗
 *      http: 非 2xx 回應且無其他代碼可用
 *      network: fetch 本身失敗 (dev server 未執行)
 *      script-no-output: 觸發腳本沒有回傳可解析的結果
 *      method-not-allowed: 以非 POST 呼叫觸發端點
 *      trigger-timeout: session 已開啟但逾時仍未寫入新數值
 *      trigger-unsupported: 非 Windows，無法自動觸發
 *      trigger-failed: 啟動 Claude Code session 失敗
 */
export type ErrorCode =
  | 'ccusage-failed'
  | 'http'
  | 'network'
  | 'script-no-output'
  | 'method-not-allowed'
  | 'trigger-timeout'
  | 'trigger-unsupported'
  | 'trigger-failed'
