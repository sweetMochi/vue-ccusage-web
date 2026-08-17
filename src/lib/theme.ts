import type { ChartTheme, ThemeMode } from '../types/theme'

/**
 * 明亮配色
 */
export const lightTheme: ChartTheme = {
  series: ['#2a78d6', '#1baf7a', '#eda100', '#008300'],
  ink: '#0b0b0b',
  inkSecondary: '#52514e',
  grid: '#e1e0d9',
  track: '#e1e0d9',
  surface: '#fcfcfb',
}

/**
 * 暗色配色
 */
export const darkTheme: ChartTheme = {
  series: ['#3987e5', '#199e70', '#c98500', '#008300'],
  ink: '#ffffff',
  inkSecondary: '#c3c2b7',
  grid: '#2c2c2a',
  track: '#2c2c2a',
  surface: '#1a1a19',
}

/**
 * 主題選項的顯示順序
 * 名稱不放在這裡，由 `theme.*` 訊息 key 依當前語系提供
 */
export const themeModes: ThemeMode[] = ['system', 'light', 'dark']
