import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { CcusageBlock, CcusageBlocksResponse } from '../types/ccusage'

/**
 * 輪詢 /api/blocks 並提供目前 active block 的狀態與衍生值。
 * @param intervalMs 輪詢間隔，預設 30 秒
 */
export function useCcusage(intervalMs = 30_000) {
  const block = ref<CcusageBlock | null>(null)

  /** token 用量上限：歷史最高 block 的 totalTokens (對應 ccusage --token-limit max) */
  const tokenLimit = ref<number | null>(null)

  const error = ref<string | null>(null)

  /** 首次載入中 (之後的輪詢失敗只更新 error，不清掉舊資料) */
  const loading = ref(true)

  const updatedAt = ref<Date | null>(null)

  /** 每秒更新的現在時刻，讓倒數不必等下一次輪詢 */
  const now = ref(Date.now())

  let pollTimer: ReturnType<typeof setInterval> | undefined
  let clockTimer: ReturnType<typeof setInterval> | undefined

  async function refresh() {
    try {
      const res = await fetch('/api/blocks')
      const data = (await res.json()) as CcusageBlocksResponse & { error?: string }

      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }

      const blocks = data.blocks.filter((b) => !b.isGap)

      block.value = blocks.find((b) => b.isActive) ?? null

      tokenLimit.value = blocks.length ? Math.max(...blocks.map((b) => b.totalTokens)) : null

      updatedAt.value = new Date()
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

  /** 距 block 重置的毫秒數 */
  const remainingMs = computed(() => {
    if (!block.value) return 0
    return Math.max(0, new Date(block.value.endTime).getTime() - now.value)
  })

  /** 剩餘時間比例 (0 – 1)，分母取 block 實際時間 */
  const remainingRatio = computed(() => {
    if (!block.value) return 0

    const durationMs =
      new Date(block.value.endTime).getTime() - new Date(block.value.startTime).getTime()

    return durationMs > 0 ? remainingMs.value / durationMs : 0
  })

  return { block, tokenLimit, error, loading, updatedAt, remainingMs, remainingRatio, refresh }
}
