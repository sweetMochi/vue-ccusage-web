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
 * GET /api/limits 回應
 */
export interface RateLimitsResponse {
  /**
   * dump 檔最後更新時間 (ISO 8601)
   *
   *      string: 檔案 mtime，可據此判斷資料是否過期
   *      null: dump 檔不存在 (尚未設定 statusline script)
   */
  updated_at: string | null
  /** 官方限額；null 表示無資料 (非 Pro/Max、session 尚無 API 回應或 dump 檔不存在) */
  rate_limits: RateLimits | null
}
