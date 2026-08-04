<script setup lang="ts">
import BurnRate from './components/BurnRate.vue'
import TimeRemaining from './components/TimeRemaining.vue'
import TokenBreakdown from './components/TokenBreakdown.vue'
import TokenGauge from './components/TokenGauge.vue'
import { computed } from 'vue'
import { useBurnRateHistory } from './composables/useBurnRateHistory'
import { useCcusage } from './composables/useCcusage'
import { useRateLimits } from './composables/useRateLimits'
import { useTheme } from './composables/useTheme'
import { formatResetAt, formatTokens } from './lib/format'
import { themeOptions } from './lib/theme'
import type { LimitStatus, RateLimitWindow } from './types/statusline'

const {
  block,
  tokenLimit,
  error,
  loading,
  updatedAt,
  remainingMs,
  remainingRatio,
  refresh: refreshBlocks,
} = useCcusage()
const { samples } = useBurnRateHistory(block)
const {
  fiveHour,
  sevenDay,
  fiveHourStatus,
  sevenDayStatus,
  isStatuslineIdle,
  needsTrigger,
  triggering,
  triggerError,
  refresh: refreshLimits,
  triggerUpdate,
} = useRateLimits()
const { mode } = useTheme()

/**
 * 手動重新整理：先重抓兩條資料流，官方數值仍過期時再開一個隱藏的
 * Claude Code session 逼 statusline 更新 (會消耗 5 小時配額)
 */
async function refreshAll() {
  await Promise.all([refreshBlocks(), refreshLimits()])
  if (needsTrigger.value) await triggerUpdate()
}

/** 數值仍可採用的狀態；expired / missing 則不顯示官方百分比 */
function usableOf(window: RateLimitWindow | null, status: LimitStatus) {
  return status === 'ok' || status === 'aging' ? window : null
}

/** 5 小時卡優先採官方百分比；視窗已重置或無官方資料時退回歷史最高估算 */
const fiveHourOfficial = computed(() => usableOf(fiveHour.value, fiveHourStatus.value))
const sevenDayOfficial = computed(() => usableOf(sevenDay.value, sevenDayStatus.value))

/** 數值過久未更新時的註記，並指出是 Claude Code 沒在跑還是官方尚未回報新值 */
function agingNote(status: LimitStatus) {
  if (status !== 'aging') return ''
  return isStatuslineIdle.value
    ? ' (Claude Code 未在執行或閒置中，顯示上次資料)'
    : ' (官方尚未回報新數值，顯示上次資料)'
}
</script>

<template>
  <main class="min-h-screen bg-base-200 p-4 md:p-8">
    <div class="mx-auto max-w-5xl space-y-4">
      <header class="flex flex-wrap items-center justify-between gap-2">
        <h1 class="text-xl font-bold">Claude Token Usage</h1>
        <div class="flex items-center gap-2">
          <p v-if="updatedAt" class="text-xs text-base-content/50">
            更新於 {{ updatedAt.toLocaleTimeString() }}
          </p>
          <button
            class="btn btn-ghost btn-xs"
            :disabled="triggering"
            :aria-label="triggering ? '正在開 session 更新官方數值' : '立即重新整理'"
            :title="
              triggering
                ? '正在開 Claude Code session 取得官方數值…'
                : '重新整理 (必要時更新官方數值)'
            "
            @click="refreshAll()"
          >
            <span v-if="triggering" class="loading loading-spinner loading-xs"></span>
            <template v-else>↻</template>
          </button>
          <div class="join" role="group" aria-label="主題切換">
            <button
              v-for="opt in themeOptions"
              :key="opt.value"
              class="btn btn-xs join-item"
              :class="{ 'btn-active': mode === opt.value }"
              @click="mode = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </header>

      <div v-if="loading" class="flex items-center gap-2 text-base-content/70">
        <span class="loading loading-spinner loading-sm"></span>
        讀取 ccusage 資料中…
      </div>

      <div v-else-if="error && !block" class="alert alert-error text-sm">
        <span>讀取失敗：{{ error }}</span>
      </div>

      <template v-else>
        <!-- 輪詢失敗時保留上次資料，只提示更新中斷 -->
        <div v-if="error" class="alert alert-warning text-sm">
          <span>更新失敗，顯示上次資料：{{ error }}</span>
        </div>

        <!-- 觸發官方數值更新失敗；限額卡照常顯示上次資料 -->
        <div v-if="triggerError" class="alert alert-warning text-sm">
          <span>官方數值更新失敗：{{ triggerError }}</span>
        </div>

        <!-- 沒有 active block 時仍顯示用量儀表 (0 / max)，其餘卡片隱藏 -->
        <div v-if="!block" class="alert alert-info text-sm">
          <span>最近沒有使用 AI，如果有使用紀錄才能判斷剩餘用量</span>
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TimeRemaining v-if="block" :remainingMs :remainingRatio />
          <!-- 5 小時卡牌：statusline 官方 5 小時限額，為空值或視窗已重置時退回歷史最高估算 -->
          <TokenGauge
            title="當前用量"
            :percent="fiveHourOfficial?.used_percentage"
            :totalTokens="block?.totalTokens ?? 0"
            :limit="tokenLimit"
          >
            <template #footnote>
              <template v-if="fiveHourOfficial">
                {{ formatTokens(block?.totalTokens ?? 0) }} tokens・重置於
                {{ formatResetAt(fiveHourOfficial.resets_at) }}{{ agingNote(fiveHourStatus) }}
              </template>
              <template v-else>
                {{ formatTokens(block?.totalTokens ?? 0) }} /
                {{ tokenLimit === null ? '—' : formatTokens(tokenLimit) }} (歷史最高 block 估算)
              </template>
            </template>
          </TokenGauge>
          <!-- 每週卡牌：statusline 官方每週限額，不依賴 active block -->
          <TokenGauge title="本週用量" :percent="sevenDayOfficial?.used_percentage ?? null">
            <template #footnote>
              <template v-if="sevenDayOfficial">
                重置於 {{ formatResetAt(sevenDayOfficial.resets_at)
                }}{{ agingNote(sevenDayStatus) }}
              </template>
              <template v-else-if="sevenDay && sevenDayStatus === 'expired'">
                視窗已於 {{ formatResetAt(sevenDay.resets_at) }} 重置，等待 Claude Code 更新數值
              </template>
              <template v-else>無官方資料：請確認已依 README 設定 statusline dump script</template>
            </template>
          </TokenGauge>
          <TokenBreakdown v-if="block" :tokenCounts="block.tokenCounts" />
          <BurnRate v-if="block" :burnRate="block.burnRate ?? null" :samples />
        </div>
      </template>
    </div>
  </main>
</template>
