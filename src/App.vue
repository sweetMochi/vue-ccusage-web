<script setup lang="ts">
import BurnRate from './components/BurnRate.vue'
import Projection from './components/Projection.vue'
import TimeRemaining from './components/TimeRemaining.vue'
import TokenBreakdown from './components/TokenBreakdown.vue'
import TokenGauge from './components/TokenGauge.vue'
import { useBurnRateHistory } from './composables/useBurnRateHistory'
import { useCcusage } from './composables/useCcusage'
import { useTheme } from './composables/useTheme'
import { themeOptions } from './lib/theme'

const { block, tokenLimit, error, loading, updatedAt, remainingMs, remainingRatio, refresh } =
  useCcusage()
const { samples } = useBurnRateHistory(block)
const { mode } = useTheme()
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
          <button class="btn btn-ghost btn-xs" aria-label="立即重新整理" @click="refresh()">
            ↻
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

        <!-- 沒有 active block 時仍顯示用量儀表 (0 / 歷史上限)，其餘卡片隱藏 -->
        <div v-if="!block" class="alert alert-info text-sm">
          <span>最近沒有使用 AI，如果有使用紀錄才能判斷剩餘用量</span>
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TimeRemaining v-if="block" :remainingMs :remainingRatio />
          <TokenGauge :totalTokens="block?.totalTokens ?? 0" :limit="tokenLimit" />
          <TokenBreakdown v-if="block" :tokenCounts="block.tokenCounts" />
          <BurnRate v-if="block" :burnRate="block.burnRate ?? null" :samples />
          <Projection v-if="block" :projection="block.projection ?? null" />
        </div>
      </template>
    </div>
  </main>
</template>
