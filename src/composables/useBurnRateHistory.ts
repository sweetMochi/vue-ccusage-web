import { ref, watch, type Ref } from 'vue'
import type { CcusageBlock } from '../types/ccusage'

export interface BurnRateSample {
  /** 取樣時間 (毫秒) */
  time: number
  tokensPerMinute: number
}

/** 30 秒一筆，60 筆約涵蓋 30 分鐘 */
const MAX_SAMPLES = 60

/**
 * 累積 active block 的 burnRate 取樣供迷你趨勢線使用
 * ccusage 只回傳當下速率，歷史序列需在前端隨輪詢累積
 */
export function useBurnRateHistory(block: Ref<CcusageBlock | null>) {
  const samples = ref<BurnRateSample[]>([])
  let lastBlockId: string | null = null

  watch(block, (b) => {
    if (!b?.burnRate) {
      return
    }

    // block 重置後速率歸零重算，舊樣本不再有意義
    if (lastBlockId !== null && lastBlockId !== b.id) {
      samples.value = []
    }

    lastBlockId = b.id
    samples.value.push({
      time: Date.now(),
      tokensPerMinute: b.burnRate.tokensPerMinute,
    })

    if (samples.value.length > MAX_SAMPLES) {
      samples.value.shift()
    }
  })

  return { samples }
}
