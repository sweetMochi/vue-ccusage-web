<script setup lang="ts">
// 剩餘時間圓餅圖：daisyUI radial-progress + 每秒倒數
import { computed } from 'vue'
import { formatCountdown } from '../lib/format'

const props = defineProps<{
  /** 距 block 重置的毫秒數 */
  remainingMs: number
  /** 剩餘時間比例 (0 – 1) */
  remainingRatio: number
}>()

const percent = computed(() => Math.round(props.remainingRatio * 100))
</script>

<template>
  <!-- TimeRemaining - start -->
  <div class="card bg-base-100 shadow-md">
    <div class="card-body items-center gap-3">
      <h2 class="card-title text-sm font-medium text-base-content/70">距離重置</h2>
      <div
        class="radial-progress text-primary"
        role="progressbar"
        :style="{ '--value': percent, '--size': '10rem', '--thickness': '0.5rem' }"
        :aria-valuenow="percent"
        aria-label="block 剩餘時間比例"
      >
        <!-- 每秒倒數使用 tabular-nums 避免位寬抖動 -->
        <span class="text-xl font-semibold tabular-nums text-base-content">
          {{ formatCountdown(remainingMs) }}
        </span>
      </div>
      <p class="text-xs text-base-content/50">block 剩餘 {{ percent }}%</p>
    </div>
  </div>
  <!-- TimeRemaining - end -->
</template>
