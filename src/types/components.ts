/**
 * 燃燒速率 (tokens/minute) 取樣資料
 */
export interface BurnRateSample {
  /** 取樣時間 (毫秒) */
  time: number
  /** 每分鐘消耗的 token 數量 */
  tokensPerMinute: number
}
