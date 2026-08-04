#!/usr/bin/env node
// Claude Code statusline 包裝腳本
// 1. 把 stdin JSON 的 rate_limits dump 到 ~/.claude/rate_limits.json
//    (供本專案 dev server 的 GET /api/limits 讀取)
// 2. 原樣轉交 stdin 給原本的 statusline 指令，顯示內容不變
//
// 於 ~/.claude/settings.json 註冊：
//   "statusLine": { "type": "command", "command": "node \"<本檔絕對路徑>\"" }

import { spawn } from 'node:child_process'
import { readFile, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

/** 原本的 statusline 指令，dump 完後串接執行；設為空字串則改用內建精簡顯示 */
const INNER_COMMAND = 'npx -y ccstatusline@latest'

const raw = await new Promise((resolve) => {
  let buf = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', (chunk) => (buf += chunk))
  process.stdin.on('end', () => resolve(buf))
})

let data = {}
try {
  data = JSON.parse(raw)
} catch {
  // stdin 非 JSON 時仍繼續，交給內層指令自行處理
}

// rate_limits 僅 Pro/Max 且 session 有 API 回應後才有
// 為空值時保留既有數值，避免 session 剛啟動(首次 API 回應前)洗掉先前的有效資料，
// 但仍重寫檔案讓 mtime 前進——面板據此把兩件事分開判斷：
//      檔案 mtime: statusline 心跳 (Claude Code 是否還在執行)
//      captured_at: 數值本身的擷取時間 (官方百分比是否還新鮮)
const dumpPath = join(homedir(), '.claude', 'rate_limits.json')
try {
  let dump = { rate_limits: null, captured_at: null }

  if (data.rate_limits != null) {
    dump = { rate_limits: data.rate_limits, captured_at: new Date().toISOString() }
  } else {
    try {
      const [prev, info] = await Promise.all([
        readFile(dumpPath, 'utf8').then(JSON.parse),
        stat(dumpPath),
      ])
      // 舊版格式沒有 captured_at：以覆寫前的 mtime 補上 (那正是數值寫入的時刻)，
      // 否則心跳會讓這個欄位永遠是空值，面板無從判斷數值新鮮度
      const capturedAt = prev.captured_at ?? (prev.rate_limits ? info.mtime.toISOString() : null)
      dump = { rate_limits: prev.rate_limits ?? null, captured_at: capturedAt }
    } catch {
      // 檔案不存在或內容損毀：寫入空狀態，讓面板能區分「statusline 有在執行但沒資料」與「從未設定」
    }
  }

  await writeFile(dumpPath, JSON.stringify(dump))
} catch {
  // dump 失敗不能影響 statusline 顯示
}

/** 內層指令不可用時的精簡顯示：[模型] 5h x% 7d y% */
function fallbackLine() {
  const parts = []
  if (data.model?.display_name) parts.push(`[${data.model.display_name}]`)
  const pct = (w) =>
    typeof w?.used_percentage === 'number' ? `${Math.round(w.used_percentage)}%` : null
  const fiveHour = pct(data.rate_limits?.five_hour)
  const sevenDay = pct(data.rate_limits?.seven_day)
  if (fiveHour) parts.push(`5h ${fiveHour}`)
  if (sevenDay) parts.push(`7d ${sevenDay}`)
  return parts.join(' ')
}

if (!INNER_COMMAND) {
  console.log(fallbackLine())
} else {
  // Windows 上 npx 是 npx.cmd，需經由 shell 解析
  const child = spawn(INNER_COMMAND, {
    shell: true,
    windowsHide: true,
    stdio: ['pipe', 'inherit', 'inherit'],
  })
  child.on('error', () => console.log(fallbackLine()))
  child.stdin.on('error', () => {}) // 內層提早關閉 stdin 時吞掉 EPIPE
  child.stdin.write(raw)
  child.stdin.end()
  child.on('exit', (code) => process.exit(code ?? 0))
}
