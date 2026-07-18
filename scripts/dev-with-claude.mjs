#!/usr/bin/env node
// 啟動儀表板 dev server，並另開一個 Claude Code 視窗觸發 statusline 更新
//
// statusline 只在互動式 TUI session 執行，且 rate_limits 要等 session
// 第一次 API 回應後才出現，因此以最低成本組合觸發：
// haiku 模型 + MAX_THINKING_TOKENS=0 + 一則 "Say ok"。
// 視窗保持開啟期間，statusline 會持續把官方 rate_limits 寫入 dump 檔。

import { spawn } from 'node:child_process'

if (process.platform === 'win32') {
  // start 另開終端機視窗；env 會一路繼承到新視窗內的 claude
  spawn('start "Claude usage session" cmd /k claude --model haiku "Say ok"', {
    shell: true,
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, MAX_THINKING_TOKENS: '0' },
  }).unref()
} else {
  console.warn('dev:with-claude 的自動觸發僅支援 Windows，請自行另開終端機執行 claude')
}

// 於目前終端機接手執行 vite
const vite = spawn('npx vite', { shell: true, stdio: 'inherit' })
vite.on('exit', (code) => process.exit(code ?? 0))
