<script setup lang="ts">
import BurnRate from './components/BurnRate.vue'
import TimeRemaining from './components/TimeRemaining.vue'
import TokenBreakdown from './components/TokenBreakdown.vue'
import TokenGauge from './components/TokenGauge.vue'
import { computed } from 'vue'
import { useBurnRateHistory } from './composables/useBurnRateHistory'
import { useCcusage } from './composables/useCcusage'
import { useI18n } from './composables/useI18n'
import { useRateLimits } from './composables/useRateLimits'
import { useTheme } from './composables/useTheme'
import { formatResetAt, formatTime, formatTokens } from './lib/format'
import { themeModes } from './lib/theme'
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
const { locale, t, localizeError, localeOptions } = useI18n()

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
  return isStatuslineIdle.value ? t('gauge.aging.idle') : t('gauge.aging.stale')
}
</script>

<template>
  <main class="min-h-screen bg-base-200 p-4 md:p-8">
    <div class="mx-auto max-w-5xl space-y-4">
      <header class="flex flex-wrap items-center justify-between gap-2">
        <h1 class="text-xl font-bold">{{ t('app.heading') }}</h1>
        <div class="flex items-center gap-2">
          <p v-if="updatedAt" class="text-xs text-base-content/50">
            {{ t('app.updatedAt', { time: formatTime(updatedAt.getTime(), locale) }) }}
          </p>
          <button
            class="btn btn-ghost btn-xs"
            :disabled="triggering"
            :aria-label="triggering ? t('app.refreshingLabel') : t('app.refreshLabel')"
            :title="triggering ? t('app.refreshing') : t('app.refresh')"
            @click="refreshAll()"
          >
            <span v-if="triggering" class="loading loading-spinner loading-xs"></span>
            <template v-else>↻</template>
          </button>
          <div class="join" role="group" :aria-label="t('app.themeSwitch')">
            <button
              v-for="m in themeModes"
              :key="m"
              class="btn btn-xs join-item"
              :class="{ 'btn-active': mode === m }"
              @click="mode = m"
            >
              {{ t(`theme.${m}`) }}
            </button>
          </div>
          <!-- 語言以自身書寫呈現，選單不隨當前語系翻譯 -->
          <select
            v-model="locale"
            class="select select-xs w-auto"
            :aria-label="t('app.localeSwitch')"
          >
            <option v-for="opt in localeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </header>

      <div v-if="loading" class="flex items-center gap-2 text-base-content/70">
        <span class="loading loading-spinner loading-sm"></span>
        {{ t('app.loading') }}
      </div>

      <div v-else-if="error && !block" class="alert alert-error text-sm">
        <span>{{ t('app.loadFailed', { message: localizeError(error) }) }}</span>
      </div>

      <template v-else>
        <!-- 輪詢失敗時保留上次資料，只提示更新中斷 -->
        <div v-if="error" class="alert alert-warning text-sm">
          <span>{{ t('app.updateFailed', { message: localizeError(error) }) }}</span>
        </div>

        <!-- 觸發官方數值更新失敗；限額卡照常顯示上次資料 -->
        <div v-if="triggerError" class="alert alert-warning text-sm">
          <span>{{ t('app.triggerFailed', { message: localizeError(triggerError) }) }}</span>
        </div>

        <!-- 沒有 active block 時仍顯示用量儀表 (0 / max)，其餘卡片隱藏 -->
        <div v-if="!block" class="alert alert-info text-sm">
          <span>{{ t('app.noUsage') }}</span>
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TimeRemaining v-if="block" :remainingMs :remainingRatio />
          <!-- 5 小時卡牌：statusline 官方 5 小時限額，為空值或視窗已重置時退回歷史最高估算 -->
          <TokenGauge
            :title="t('gauge.fiveHour')"
            :percent="fiveHourOfficial?.used_percentage"
            :totalTokens="block?.totalTokens ?? 0"
            :limit="tokenLimit"
          >
            <template #footnote>
              <template v-if="fiveHourOfficial">
                {{
                  t('gauge.officialFootnote', {
                    tokens: formatTokens(block?.totalTokens ?? 0, locale),
                    time: formatResetAt(fiveHourOfficial.resets_at, locale),
                  })
                }}{{ agingNote(fiveHourStatus) }}
              </template>
              <template v-else>
                {{
                  t('gauge.estimateFootnote', {
                    used: formatTokens(block?.totalTokens ?? 0, locale),
                    limit: tokenLimit === null ? '—' : formatTokens(tokenLimit, locale),
                  })
                }}
              </template>
            </template>
          </TokenGauge>
          <!-- 每週卡牌：statusline 官方每週限額，不依賴 active block -->
          <TokenGauge
            :title="t('gauge.sevenDay')"
            :percent="sevenDayOfficial?.used_percentage ?? null"
          >
            <template #footnote>
              <template v-if="sevenDayOfficial">
                {{ t('gauge.resetAt', { time: formatResetAt(sevenDayOfficial.resets_at, locale) })
                }}{{ agingNote(sevenDayStatus) }}
              </template>
              <template v-else-if="sevenDay && sevenDayStatus === 'expired'">
                {{ t('gauge.windowExpired', { time: formatResetAt(sevenDay.resets_at, locale) }) }}
              </template>
              <template v-else>{{ t('gauge.noOfficial') }}</template>
            </template>
          </TokenGauge>
          <TokenBreakdown v-if="block" :tokenCounts="block.tokenCounts" />
          <BurnRate v-if="block" :burnRate="block.burnRate ?? null" :samples />
        </div>
      </template>
    </div>
  </main>
</template>
