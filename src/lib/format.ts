/**
 * 毫秒轉換成 `H:MM:SS` 倒數
 */
export function formatCountdown(ms: number): string {
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1_000)
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * token 數的千分位格式化
 */
export function formatTokens(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

/**
 * 美元金額，固定兩位小數
 */
export function formatUsd(n: number): string {
  return `$${n.toFixed(2)}`
}

/**
 * Unix epoch 秒轉「MM/DD (週) HH:mm」的重置時間 (本地時區)
 */
export function formatResetAt(epochSeconds: number): string {
  const d = new Date(epochSeconds * 1000)
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${mm}/${dd} (${weekday}) ${hh}:${mi}`
}
