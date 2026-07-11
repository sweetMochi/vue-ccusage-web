import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { RateLimits, RateLimitsResponse, RateLimitWindow } from '../types/statusline'

/** dump 檔超過此毫秒數未更新即視為過期 (Claude Code 未在執行) */
const STALE_MS = 10 * 60 * 1000

/**
 * 輪詢 /api/limits 並提供 statusline 官方限額 (rate_limits) 與衍生值。
 * @param intervalMs 輪詢間隔，預設 30 秒
 */
export function useRateLimits(intervalMs = 30_000) {
  const rateLimits = ref<RateLimits | null>(null)

  /** dump 檔最後更新時間，null 表示尚未設定 statusline script */
  const updatedAt = ref<Date | null>(null)

  const error = ref<string | null>(null)

  /** 首次載入中 (之後的輪詢失敗只更新 error，不清掉舊資料) */
  const loading = ref(true)

  /** 每秒更新的現在時刻，供重置倒數與過期判斷 */
  const now = ref(Date.now())

  let pollTimer: ReturnType<typeof setInterval> | undefined
  let clockTimer: ReturnType<typeof setInterval> | undefined

  async function refresh() {
    try {
      const res = await fetch('/api/limits')
      const data = (await res.json()) as RateLimitsResponse & { error?: string }

      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }

      rateLimits.value = data.rate_limits
      updatedAt.value = data.updated_at ? new Date(data.updated_at) : null
      error.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
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

  /** 官方資料是否過期：dump 檔不存在或過久未更新 (Claude Code 未在執行) */
  const isStale = computed(() => {
    if (!updatedAt.value) return true
    return now.value - updatedAt.value.getTime() > STALE_MS
  })

  const fiveHour = computed<RateLimitWindow | null>(() => rateLimits.value?.five_hour ?? null)
  const sevenDay = computed<RateLimitWindow | null>(() => rateLimits.value?.seven_day ?? null)

  /** 距視窗重置的毫秒數，無資料時為 0 */
  function remainingMsOf(window: RateLimitWindow | null) {
    if (!window) return 0
    return Math.max(0, window.resets_at * 1000 - now.value)
  }

  const fiveHourRemainingMs = computed(() => remainingMsOf(fiveHour.value))
  const sevenDayRemainingMs = computed(() => remainingMsOf(sevenDay.value))

  return {
    rateLimits,
    fiveHour,
    sevenDay,
    fiveHourRemainingMs,
    sevenDayRemainingMs,
    isStale,
    updatedAt,
    error,
    loading,
    refresh,
  }
}
