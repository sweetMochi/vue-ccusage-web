import { computed, ref, watchEffect } from 'vue'

/** 主題模式：跟隨系統 / 亮 / 暗 */
export type ThemeMode = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'theme-mode'

function readStoredMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

// 模組層級單例：daisyUI 的 data-theme 與 ECharts 配色共用同一份狀態，
// 存活至頁面關閉，不需隨元件卸載清理
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
