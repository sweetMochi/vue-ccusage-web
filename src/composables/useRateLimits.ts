import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { AppError } from '../types/i18n'
import type {
  LimitStatus,
  RateLimits,
  RateLimitsResponse,
  RateLimitWindow,
  RefreshLimitsResponse,
} from '../types/statusline'

/** 官方數值超過此毫秒數未更新即標示為可能不是最新 */
const AGING_MS = 10 * 60 * 1000

/**
 * 輪詢 /api/limits 並提供 statusline 官方限額 (rate_limits) 與衍生值。
 * @param intervalMs 輪詢間隔，預設 30 秒
 */
export function useRateLimits(intervalMs = 30_000) {
  const rateLimits = ref<RateLimits | null>(null)

  /** dump 檔最後更新時間 (statusline 心跳)，null 表示尚未設定 statusline script */
  const updatedAt = ref<Date | null>(null)

  /** 官方數值最後一次實際擷取的時間，null 表示從未取得或 dump 檔為舊版格式 */
  const capturedAt = ref<Date | null>(null)

  /** 錯誤代碼，文案在畫面上依當前語系解析 */
  const error = ref<AppError | null>(null)

  /** 首次載入中 (之後的輪詢失敗只更新 error，不清掉舊資料) */
  const loading = ref(true)

  /** 每秒更新的現在時刻，供重置倒數與過期判斷 */
  const now = ref(Date.now())

  let pollTimer: ReturnType<typeof setInterval> | undefined
  let clockTimer: ReturnType<typeof setInterval> | undefined

  async function refresh() {
    try {
      const res = await fetch('/api/limits')
      const data = (await res.json()) as RateLimitsResponse & { error?: AppError }

      if (!res.ok) {
        error.value = data.error ?? { code: 'http', detail: String(res.status) }
        return
      }

      rateLimits.value = data.rate_limits
      updatedAt.value = data.updated_at ? new Date(data.updated_at) : null
      capturedAt.value = data.captured_at ? new Date(data.captured_at) : null
      error.value = null
    } catch (e) {
      // fetch 或 JSON 解析失敗：dev server 沒在執行，或回應不是預期的 JSON
      error.value = { code: 'network', detail: e instanceof Error ? e.message : String(e) }
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void refresh()
    pollTimer = setInterval(() => void refresh(), intervalMs)
    clockTimer = setInterval(() => (now.value = Date.now()), 1_000)
  })

  onUnmounted(() => {
    clearInterval(pollTimer)
    clearInterval(clockTimer)
  })

  /** statusline 是否已停止更新 (Claude Code 未在執行，或閒置到不再重繪狀態列) */
  const isStatuslineIdle = computed(() => {
    if (!updatedAt.value) return true
    return now.value - updatedAt.value.getTime() > AGING_MS
  })

  /** 官方數值是否過久未更新；舊版 dump 檔無 captured_at 時退回檔案 mtime 判斷 */
  const isDataAging = computed(() => {
    const at = capturedAt.value ?? updatedAt.value
    if (!at) return true
    return now.value - at.getTime() > AGING_MS
  })

  const fiveHour = computed<RateLimitWindow | null>(() => rateLimits.value?.five_hour ?? null)
  const sevenDay = computed<RateLimitWindow | null>(() => rateLimits.value?.seven_day ?? null)

  /** 視窗的資料狀態；expired 優先於 aging (已重置的百分比一定失效) */
  function statusOf(window: RateLimitWindow | null): LimitStatus {
    if (!window) return 'missing'
    if (window.resets_at * 1000 <= now.value) return 'expired'
    return isDataAging.value ? 'aging' : 'ok'
  }

  const fiveHourStatus = computed(() => statusOf(fiveHour.value))
  const sevenDayStatus = computed(() => statusOf(sevenDay.value))

  /** 距視窗重置的毫秒數，無資料時為 0 */
  function remainingMsOf(window: RateLimitWindow | null) {
    if (!window) return 0
    return Math.max(0, window.resets_at * 1000 - now.value)
  }

  const fiveHourRemainingMs = computed(() => remainingMsOf(fiveHour.value))
  const sevenDayRemainingMs = computed(() => remainingMsOf(sevenDay.value))

  /**
   * 是否值得開 session 重取官方數值。
   * dump 檔從未出現代表 statusline 尚未設定，開了也拿不到，不觸發
   */
  const needsTrigger = computed(() => {
    if (!updatedAt.value) return false
    if (!rateLimits.value) return true
    return [fiveHourStatus.value, sevenDayStatus.value].some(
      (s) => s === 'aging' || s === 'expired'
    )
  })

  /** 觸發中 (隱藏 session 啟動到官方數值寫入，實測約 4 秒) */
  const triggering = ref(false)

  /** 觸發結果的錯誤代碼；null 表示成功或尚未觸發過 */
  const triggerError = ref<AppError | null>(null)

  /**
   * 開一個隱藏的 Claude Code session 逼 statusline 重寫官方數值。
   * 會送出一則 haiku 訊息，消耗正在被測量的 5 小時配額
   */
  async function triggerUpdate() {
    triggering.value = true
    triggerError.value = null
    try {
      const res = await fetch('/api/refresh-limits', { method: 'POST' })
      const data = (await res.json()) as RefreshLimitsResponse

      if (data.status !== 'updated') {
        triggerError.value = data.error ?? { code: 'trigger-failed' }
        return
      }

      await refresh()
    } catch (e) {
      triggerError.value = { code: 'network', detail: e instanceof Error ? e.message : String(e) }
    } finally {
      triggering.value = false
    }
  }

  return {
    rateLimits,
    fiveHour,
    sevenDay,
    fiveHourStatus,
    sevenDayStatus,
    fiveHourRemainingMs,
    sevenDayRemainingMs,
    isStatuslineIdle,
    isDataAging,
    needsTrigger,
    triggering,
    triggerError,
    updatedAt,
    capturedAt,
    error,
    loading,
    refresh,
    triggerUpdate,
  }
}
