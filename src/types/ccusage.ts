// `npx ccusage blocks --json` 回傳結構的型別定義
// 欄位對照 README「ccusage 回傳資料」一節

/**
 * block 內四類 token 的用量統計
 * 加總值 (totalTokens) 不能直接代表費用，看 costUSD 才準。
 */
export interface CcusageTokenCounts {
  /** 未快取的新輸入 `input tokens` (x1) */
  inputTokens: number
  /** 模型產生的回覆 `output tokens` (x5) */
  outputTokens: number
  /** 寫入 prompt 快取的 `cache creation tokens` (x1.25 付溢價換之後的折扣) */
  cacheCreationInputTokens: number
  /** 從 prompt 快取讀取的 `cache read tokens` (x0.1 通常佔比最大) */
  cacheReadInputTokens: number
}

/**
 * 每個 block 的消耗速率 (tokens 與費用)
 */
export interface CcusageBurnRate {
  /** 每分鐘消耗 tokens (含 cache read) */
  tokensPerMinute: number
  /** 排除 cache 的指標用速率 */
  tokensPerMinuteForIndicator: number
  /** 每小時費用 (USD) */
  costPerHour: number
}

/**
 * 每個 block 的財務預測
 */
export interface CcusageProjection {
  /** 距 block 結束的分鐘數 */
  remainingMinutes: number
  /** 依目前速率預估的 block 總 tokens */
  totalTokens: number
  /** 依目前速率預估的 block 總費用 (USD) */
  totalCost: number
}

/**
 * `npx ccusage blocks --json` 回傳的每個 block 結構
 */
export interface CcusageBlock {
  /** block 起點 (ISO 8601)，同 startTime */
  id: string
  startTime: string
  /** 用量重置時間 */
  endTime: string
  /** 最後一筆記錄的時間 */
  actualEndTime?: string
  /** 是否為目前的 block */
  isActive: boolean
  /** 閒置空隙區段 (非實際用量) */
  isGap: boolean
  /** 記錄筆數 */
  entries: number
  /** 總費用 (USD) */
  costUSD: number
  /** 模型清單 */
  models: string[]
  /** token 總計 */
  tokenCounts: CcusageTokenCounts
  /** 總 token 數 */
  totalTokens: number
  /** 僅 active block 才有 */
  burnRate?: CcusageBurnRate | null
  projection?: CcusageProjection | null
}

/**
 * `npx ccusage blocks --json` 回傳的 JSON 結構
 */
export interface CcusageBlocksResponse {
  /** block 列表 */
  blocks: CcusageBlock[]
}

/**
 * middleware 執行失敗時的回應
 */
export interface CcusageApiError {
  error: string
}
