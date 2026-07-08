<script setup lang="ts">
// Token 用量面板
import type { EChartsOption } from 'echarts'
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import { darkTheme, lightTheme } from '../lib/chartTheme'
import { VChart } from '../lib/echarts'
import { formatTokens } from '../lib/format'

const props = defineProps<{
  /** 相對歷史最高 block 的比例 */
  totalTokens: number
  /**
   * 用量上限
   *
   *      number: 歷史最高 block
   *      null: 表示尚無足夠資料
   */
  limit: number | null
}>()

const { isDark } = useTheme()
const theme = computed(() => (isDark.value ? darkTheme : lightTheme))

const percent = computed(() =>
  props.limit ? Math.min(100, (props.totalTokens / props.limit) * 100) : 0
)

const option = computed(() => {
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        progress: {
          show: true,
          width: 10,
          roundCap: true,
          itemStyle: { color: theme.value.series[0] },
        },
        axisLine: {
          roundCap: true,
          lineStyle: { width: 10, color: [[1, theme.value.track]] as [number, string][] },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        detail: {
          valueAnimation: true,
          formatter: (v: number) => `${Math.round(v)}%`,
          color: theme.value.ink,
          fontSize: 26,
          fontWeight: 600,
          offsetCenter: [0, '-15%'],
        },
        data: [{ value: percent.value }],
      },
    ],
  } as EChartsOption
})
</script>

<template>
  <div class="card bg-base-100 shadow-md">
    <div class="card-body gap-1">
      <h2 class="card-title text-sm font-medium text-base-content/70">Token 用量</h2>
      <VChart class="h-40 w-full" :option autoresize />
      <p class="text-center text-xs text-base-content/50">
        {{ formatTokens(totalTokens) }} / {{ limit === null ? '—' : formatTokens(limit) }}(歷史最高
        block)
      </p>
    </div>
  </div>
</template>
