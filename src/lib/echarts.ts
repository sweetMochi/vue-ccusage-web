// ECharts 按需註冊:只打包本專案用到的圖表類型與元件
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GaugeChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'

use([
  CanvasRenderer,
  GaugeChart,
  LineChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
])

export { default as VChart } from 'vue-echarts'
