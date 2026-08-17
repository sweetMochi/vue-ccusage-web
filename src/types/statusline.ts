import type { AppError } from './i18n'

/**
 * 單一限額視窗 (five_hour / seven_day)
 */
export interface RateLimitWindow {
  /** 官方用量百分比 (0 – 100) */
  used_percentage: number
  /** 視窗重置時間 (Unix epoch 秒) */
  resets_at: number
}

/**
 * statusline JSON 的 rate_limits
 * 僅 Pro / Max 訂閱且 session 有 API 回應後才有值，以上欄位皆可能為空值
 */
export interface RateLimits {
  five_hour?: RateLimitWindow
  seven_day?: RateLimitWindow
}

/**
 * 官方限額視窗的資料狀態
 *
 *      ok: 數值新鮮，直接採用
 *      aging: 數值超過門檻未更新 (Claude Code 未在執行或閒置中)，仍顯示但標示可能不是最新
 *      expired: 已過 resets_at，視窗重新計算，百分比不再有效
 *      missing: 無官方資料 (未設定 statusline、非 Pro/Max 或 session 尚無 API 回應)
 */
export type LimitStatus = 'ok' | 'aging' | 'expired' | 'missing'

/**
 * GET /api/limits 回應
 */
export interface RateLimitsResponse {
  /**
   * dump 檔最後更新時間 (ISO 8601)，即 statusline 心跳
   *
   *      string: 檔案 mtime，可據此判斷 statusline 是否還在執行
   *      null: dump 檔不存在 (尚未設定 statusline script)
   */
  updated_at: string | null
  /**
   * 官方數值最後一次實際擷取的時間 (ISO 8601)
   *
   *      string: rate_limits 寫入當下的時刻，可據此判斷數值新鮮度
   *      null: 從未取得官方數值，或 dump 檔為舊版格式 (無此欄位)
   */
  captured_at: string | null
  /** 官方限額；null 表示無資料 (非 Pro/Max、session 尚無 API 回應或 dump 檔不存在) */
  rate_limits: RateLimits | null
}

/**
 * POST /api/refresh-limits 回應
 *
 *      updated: 已開 session 並取得新的官方數值
 *      failed: 未取得新數值，error 帶有原因代碼
 */
export interface RefreshLimitsResponse {
  status: 'updated' | 'failed'
  /** 非 updated 時的原因；只帶代碼，文案由前端依當前語系解析 */
  error?: AppError
}
