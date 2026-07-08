<script setup lang="ts">
// 儀表板版面：單一 useCcusage 資料源，五個展示元件以 props 接收
import BurnRate from './components/BurnRate.vue'
import Projection from './components/Projection.vue'
import TimeRemaining from './components/TimeRemaining.vue'
import TokenBreakdown from './components/TokenBreakdown.vue'
import TokenGauge from './components/TokenGauge.vue'

import { useBurnRateHistory } from './composables/useBurnRateHistory'
import { useCcusage } from './composables/useCcusage'

const { block, tokenLimit, error, loading, updatedAt, remainingMs, remainingRatio } = useCcusage()
const { samples } = useBurnRateHistory(block)
</script>

<template>
  <main class="min-h-screen bg-base-200 p-4 md:p-8">
    <div class="mx-auto max-w-5xl space-y-4">
      <header class="flex flex-wrap items-baseline justify-between gap-2">
        <h1 class="text-xl font-bold">Claude Token 用量面板</h1>
        <p v-if="updatedAt" class="text-xs text-base-content/50">
          更新於 {{ updatedAt.toLocaleTimeString() }}
        </p>
      </header>

      <div v-if="loading" class="flex items-center gap-2 text-base-content/70">
        <span class="loading loading-spinner loading-sm"></span>
        讀取 ccusage 資料中…
      </div>

      <div v-else-if="error && !block" class="alert alert-error text-sm">
        <span>讀取失敗：{{ error }}</span>
      </div>

      <template v-else-if="block">
        <!-- 輪詢失敗時保留上次資料，只提示更新中斷 -->
        <div v-if="error" class="alert alert-warning text-sm">
          <span>更新失敗，顯示上次資料：{{ error }}</span>
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TimeRemaining :remainingMs :remainingRatio />
          <TokenGauge :totalTokens="block.totalTokens" :limit="tokenLimit" />
          <TokenBreakdown :tokenCounts="block.tokenCounts" />
          <BurnRate :burnRate="block.burnRate ?? null" :samples />
          <Projection :projection="block.projection ?? null" />
        </div>
      </template>

      <div v-else class="text-base-content/70">目前沒有進行中的 block</div>
    </div>
  </main>
</template>
