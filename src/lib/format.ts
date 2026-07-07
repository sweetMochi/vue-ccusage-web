/** 毫秒 → `H:MM:SS` 倒數字串 */
export function formatCountdown(ms: number): string {
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1_000)
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** token 數的千分位字串 */
export function formatTokens(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

/** 美元金額,固定兩位小數 */
export function formatUsd(n: number): string {
  return `$${n.toFixed(2)}`
}
