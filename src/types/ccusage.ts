// `npx ccusage blocks --json` 回傳結構的型別定義
// 欄位對照 README「ccusage 回傳資料」一節

/**
 * block 內四類 token 的用量統計。
 * 四類計費差異極大 (以 input 基本價為 1x)
 * cache read 約 0.1x、cache creation 約 1.25x、output 約 5x,
 * 因此加總值 (totalTokens) 不能直接代表費用，看 costUSD 才準。
 */
export interface CcusageTokenCounts {
  /** 未快取的新輸入 tokens (全價) */
  inputTokens: number
  /** 模型產生的回覆 tokens (最貴，約 input 的 5 倍價) */
  outputTokens: number
  /** 寫入 prompt 快取的 tokens (約 1.25x，付溢價換之後的折扣) */
  cacheCreationInputTokens: number
  /** 從 prompt 快取讀取的 tokens (約 0.1x，通常佔比最大) */
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
  /** startTime + 5 小時，即用量重置時間 */
  endTime: string
  /** block 內最後一筆記錄的時間 */
  actualEndTime?: string
  isActive: boolean
  /** 閒置空隙區段 (非實際用量) */
  isGap: boolean
  /** 記錄筆數 */
  entries: number
  /** block 內的總費用 (USD) */
  costUSD: number
  /** block 內的模型清單 */
  models: string[]
  /** block 內四類 token 的加總統計 */
  tokenCounts: CcusageTokenCounts
  /** tokenCounts 四項加總 */
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
