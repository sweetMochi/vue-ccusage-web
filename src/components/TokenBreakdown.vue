<script setup lang="ts">
// Token 組成分布：四類 token 的圓餅圖
import type { EChartsOption } from 'echarts'
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import { VChart } from '../lib/echarts'
import { formatTokens } from '../lib/format'
import { darkTheme, lightTheme } from '../lib/theme'
import type { CcusageTokenCounts } from '../types/ccusage'

const props = defineProps<{
  tokenCounts: CcusageTokenCounts
}>()

const { isDark } = useTheme()
const theme = computed(() => (isDark.value ? darkTheme : lightTheme))

const option = computed(() => {
  const t = theme.value
  const c = props.tokenCounts

  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: unknown) => {
        const item = p as { name: string; value: number; percent: number }
        return `${item.name}：${formatTokens(item.value)} (${item.percent}%)`
      },
    },
    legend: {
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: t.inkSecondary,
        fontSize: 11,
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '44%'],
        // 區段間以 2px 表面色間隔取代邊框
        itemStyle: {
          borderColor: t.surface,
          borderWidth: 2,
          borderRadius: 2,
        },
        label: {
          color: t.inkSecondary,
          fontSize: 11,
          formatter: '{b} {d}%',
        },
        labelLine: {
          lineStyle: {
            color: t.grid,
          },
        },
        labelLayout: {
          hideOverlap: true,
        },
        data: [
          { name: '輸入', value: c.inputTokens, itemStyle: { color: t.series[0] } },
          { name: '輸出', value: c.outputTokens, itemStyle: { color: t.series[1] } },
          {
            name: '快取讀取',
            value: c.cacheReadInputTokens,
            itemStyle: { color: t.series[2] },
          },
          {
            name: '快取寫入',
            value: c.cacheCreationInputTokens,
            itemStyle: { color: t.series[3] },
          },
        ],
      },
    ],
  } as EChartsOption
})
</script>

<template>
  <!-- TokenBreakdown - start -->
  <div class="card bg-base-100 shadow-md">
    <div class="card-body gap-1 min-h-80">
      <h2 class="card-title text-sm font-medium text-base-content/70">Token 組成</h2>
      <VChart :option autoresize />
    </div>
  </div>
  <!-- TokenBreakdown - end -->
</template>
