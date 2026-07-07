import { onMounted, onUnmounted, ref } from 'vue'

/**
 * 是否為深色模式
 * daisyUI 設定為 dark --prefersdark
 * 主題跟隨系統偏好，因此以 prefers-color-scheme 為準
 */
export function useIsDark() {
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  const isDark = ref(query.matches)

  const onChange = (e: MediaQueryListEvent) => (isDark.value = e.matches)

  onMounted(() => query.addEventListener('change', onChange))
  onUnmounted(() => query.removeEventListener('change', onChange))

  return isDark
}
