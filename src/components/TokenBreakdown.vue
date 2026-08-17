<script setup lang="ts">
// Token 組成分布：四類 token 的圓餅圖
import type { EChartsOption } from 'echarts'
import { computed } from 'vue'
import { useI18n } from '../composables/useI18n'
import { useTheme } from '../composables/useTheme'
import { VChart } from '../lib/echarts'
import { formatTokens } from '../lib/format'
import { darkTheme, lightTheme } from '../lib/theme'
import type { CcusageTokenCounts } from '../types/ccusage'

const props = defineProps<{
  tokenCounts: CcusageTokenCounts
}>()

const { isDark } = useTheme()
const { locale, t } = useI18n()
const theme = computed(() => (isDark.value ? darkTheme : lightTheme))

const option = computed(() => {
  const palette = theme.value
  const c = props.tokenCounts

  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: unknown) => {
        const item = p as { name: string; value: number; percent: number }
        return t('breakdown.tooltip', {
          name: item.name,
          value: formatTokens(item.value, locale.value),
          percent: item.percent,
        })
      },
    },
    legend: {
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: palette.inkSecondary,
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
          borderColor: palette.surface,
          borderWidth: 2,
          borderRadius: 2,
        },
        label: {
          color: palette.inkSecondary,
          fontSize: 11,
          formatter: '{b} {d}%',
        },
        labelLine: {
          lineStyle: {
            color: palette.grid,
          },
        },
        labelLayout: {
          hideOverlap: true,
        },
        data: [
          {
            name: t('breakdown.input'),
            value: c.inputTokens,
            itemStyle: { color: palette.series[0] },
          },
          {
            name: t('breakdown.output'),
            value: c.outputTokens,
            itemStyle: { color: palette.series[1] },
          },
          {
            name: t('breakdown.cacheRead'),
            value: c.cacheReadInputTokens,
            itemStyle: { color: palette.series[2] },
          },
          {
            name: t('breakdown.cacheWrite'),
            value: c.cacheCreationInputTokens,
            itemStyle: { color: palette.series[3] },
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
      <h2 class="card-title text-sm font-medium text-base-content/70">
        {{ t('breakdown.title') }}
      </h2>
      <VChart :option autoresize />
    </div>
  </div>
  <!-- TokenBreakdown - end -->
</template>
