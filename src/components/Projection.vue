<script setup lang="ts">
// 預估用量：依目前速率推算 block 結束時的總量與費用
import type { CcusageProjection } from '../types/ccusage'
import { formatTokens, formatUsd } from '../lib/format'

defineProps<{
  /** 僅 active block 才有 */
  projection: CcusageProjection | null
}>()
</script>

<template>
  <!-- Projection - start -->
  <div class="card bg-base-100 shadow-md">
    <div class="card-body gap-3">
      <h2 class="card-title text-sm font-medium text-base-content/70">預估用量</h2>
      <template v-if="projection">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <div class="text-xs text-base-content/50">預估總 tokens</div>
            <div class="text-2xl font-semibold">
              {{ formatTokens(projection.totalTokens) }}
            </div>
          </div>
          <div>
            <div class="text-xs text-base-content/50">預估總費用</div>
            <div class="text-2xl font-semibold">
              {{ formatUsd(projection.totalCost) }}
            </div>
          </div>
        </div>
        <p class="text-xs text-base-content/40">依目前速率推算至 block 結束</p>
      </template>
      <p v-else class="text-sm text-base-content/50">尚無預估資料</p>
    </div>
  </div>
  <!-- Projection - end -->
</template>
