/**
 * 燃燒速率取樣資料
 */
export interface BurnRateSample {
  /** 取樣時間 (毫秒) */
  time: number
  /** 每分鐘消耗的 token 數量 */
  tokensPerMinute: number
}

/**
 * Token 用量面板
 */
export interface TokenGauge {
  /** 卡片標題 */
  title?: string
  /**
   * 直接指定的用量百分比 (0 – 100)
   *
   *      undefined: 改用 totalTokens / limit 換算
   *      null: 百分比模式但無資料，儀表顯示「—」
   */
  percent?: number | null
  /** token 用量 (totalTokens / limit 換算模式的分子) */
  totalTokens?: number
  /**
   * 用量上限 (totalTokens / limit 換算模式的分母)
   *
   *      number: 歷史最高 block
   *      null: 表示尚無足夠資料
   */
  limit?: number | null
  /** 預設註腳中上限的說明文字；無值時取當前語系的 `gauge.limitLabel` */
  limitLabel?: string
}
