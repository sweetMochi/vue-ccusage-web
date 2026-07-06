import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { CcusageBlock, CcusageBlocksResponse } from '../types/ccusage'

const BLOCK_DURATION_MS = 5 * 60 * 60 * 1000

/**
 * 輪詢 /api/blocks 並提供目前 active block 的狀態與衍生值。
 * @param intervalMs 輪詢間隔,預設 30 秒
 */
export function useCcusage(intervalMs = 30_000) {
  const block = ref<CcusageBlock | null>(null)
  const error = ref<string | null>(null)
  /** 首次載入中(之後的輪詢失敗只更新 error,不清掉舊資料) */
  const loading = ref(true)
  const updatedAt = ref<Date | null>(null)
  /** 每秒跳動的現在時刻,讓倒數不必等下一次輪詢 */
  const now = ref(Date.now())

  let pollTimer: ReturnType<typeof setInterval> | undefined
  let clockTimer: ReturnType<typeof setInterval> | undefined

  async function refresh() {
    try {
      const res = await fetch('/api/blocks')
      const data = (await res.json()) as CcusageBlocksResponse & { error?: string }
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      block.value = data.blocks.find((b) => b.isActive) ?? null
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

  /** 剩餘時間比例 0–1(圓環用) */
  const remainingRatio = computed(() => remainingMs.value / BLOCK_DURATION_MS)

  return { block, error, loading, updatedAt, remainingMs, remainingRatio, refresh }
}
