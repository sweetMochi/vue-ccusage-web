import { computed, ref, watchEffect } from 'vue'
import type { ThemeMode } from '../types/theme'

const STORAGE_KEY = 'theme-mode'

function readStoredMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

// 主題是全頁面唯一的狀態 (模組層級單例)：data-theme、localStorage、ECharts
// 切換主題時必須保持全部共用，故不宣告在函式內
// matchMedia 的監聽器和 watchEffect 只需要註冊一次
// 不需要隨某個元件卸載而清理，所以不用生命週期 hook
const query = window.matchMedia('(prefers-color-scheme: dark)')
const systemDark = ref(query.matches)
query.addEventListener('change', (e) => (systemDark.value = e.matches))

const mode = ref<ThemeMode>(readStoredMode())

/** 目前實際生效是否為深色，圖表配色依此選擇 */
const isDark = computed(() => (mode.value === 'system' ? systemDark.value : mode.value === 'dark'))

watchEffect(() => {
  // system 模式移除 data-theme 與記錄，交還 daisyUI 的 --prefersdark 行為
  if (mode.value === 'system') {
    document.documentElement.removeAttribute('data-theme')
    localStorage.removeItem(STORAGE_KEY)
  } else {
    document.documentElement.setAttribute('data-theme', mode.value)
    localStorage.setItem(STORAGE_KEY, mode.value)
  }
})

/**
 * 三態主題的單一真相來源
 * mode 可直接寫入以切換，isDark 為衍生的實際深淺色
 */
export function useTheme() {
  return { mode, isDark }
}
