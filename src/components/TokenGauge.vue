<script setup lang="ts">
// Token 用量面板
import type { EChartsOption } from 'echarts'
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import { VChart } from '../lib/echarts'
import { formatTokens } from '../lib/format'
import { darkTheme, lightTheme } from '../lib/theme'
import type { TokenGauge } from '../types/components'

const props = withDefaults(defineProps<TokenGauge>(), {
  title: 'Token 用量',
  percent: undefined,
  totalTokens: 0,
  limit: null,
  limitLabel: '歷史最高 block',
})

const { isDark } = useTheme()
const theme = computed(() => (isDark.value ? darkTheme : lightTheme))

/** 儀表顯示的百分比；null 表示無資料 */
const displayPercent = computed<number | null>(() => {
  if (props.percent !== undefined) {
    return props.percent === null ? null : Math.min(100, props.percent)
  }
  return props.limit ? Math.min(100, (props.totalTokens / props.limit) * 100) : 0
})

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
          formatter: (v: number) => (displayPercent.value === null ? '—' : `${Math.round(v)}%`),
          color: theme.value.ink,
          fontSize: 26,
          fontWeight: 600,
          offsetCenter: [0, '-15%'],
        },
        data: [{ value: displayPercent.value ?? 0 }],
      },
    ],
  } as EChartsOption
})
</script>

<template>
  <!-- 換算模式且無用量時放大佔滿一列 (percent 模式的無資料狀態不適用) -->
  <div
    class="card bg-base-100 shadow-md"
    :class="{ 'md:col-span-3': percent === undefined && !totalTokens }"
  >
    <div class="card-body gap-1 min-h-80">
      <h2 class="card-title text-sm font-medium text-base-content/70">{{ title }}</h2>
      <VChart :option autoresize />
      <p class="text-center text-xs text-base-content/50">
        <slot name="footnote">
          {{ formatTokens(totalTokens) }} / {{ limit === null ? '—' : formatTokens(limit) }}（{{
            limitLabel
          }}）
        </slot>
      </p>
    </div>
  </div>
</template>
