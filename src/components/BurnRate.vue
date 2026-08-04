<script setup lang="ts">
// 燃燒速率：即時數值 + 隨輪詢累積的迷你趨勢線
import type { EChartsOption } from 'echarts'
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import { darkTheme, lightTheme } from '../lib/theme'
import { VChart } from '../lib/echarts'
import { formatTokens, formatUsd } from '../lib/format'
import type { CcusageBurnRate } from '../types/ccusage'
import type { BurnRateSample } from '../types/components'

const props = defineProps<{
  /** 僅 active block 才有回傳值 */
  burnRate: CcusageBurnRate | null
  /** 趨勢線取樣資料 */
  samples: BurnRateSample[]
}>()

const { isDark } = useTheme()
const theme = computed(() => (isDark.value ? darkTheme : lightTheme))

const option = computed(() => {
  return {
    animation: false,
    grid: { left: 2, right: 2, top: 6, bottom: 2 },
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const p = (Array.isArray(params) ? params[0] : params) as {
          value: [number, number]
        }
        const [time, value] = p.value
        return `${new Date(time).toLocaleTimeString()}<br/>${formatTokens(value)} tokens/min`
      },
    },
    xAxis: { type: 'time', show: false },
    yAxis: { type: 'value', show: false, min: 'dataMin', max: 'dataMax' },
    series: [
      {
        type: 'line',
        showSymbol: false,
        lineStyle: { width: 2, color: theme.value.series[0] },
        data: props.samples.map((s) => [s.time, Math.round(s.tokensPerMinute)]),
      },
    ],
  } as EChartsOption
})
</script>

<template>
  <!-- BurnRate - start -->
  <div class="card bg-base-100 shadow-md md:col-span-2">
    <div class="card-body gap-3">
      <h2 class="card-title text-sm font-medium text-base-content/70">用量趨勢</h2>
      <template v-if="burnRate">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <div class="text-xs text-base-content/50">tokens / 分鐘</div>
            <div class="text-2xl font-semibold">
              {{ formatTokens(burnRate.tokensPerMinute) }}
            </div>
          </div>
          <div>
            <div class="text-xs text-base-content/50">費用 / 小時</div>
            <div class="text-2xl font-semibold">
              {{ formatUsd(burnRate.costPerHour) }}
            </div>
          </div>
        </div>
        <VChart v-if="samples.length >= 2" class="h-14 w-full" :option="option" autoresize />
        <p v-else class="text-xs text-base-content/40">趨勢線取樣累積中…</p>
      </template>
      <p v-else class="text-sm text-base-content/50">尚無速率資料</p>
    </div>
  </div>
  <!-- BurnRate - end -->
</template>
