#!/usr/bin/env node
// 開一個隱藏的 Claude Code session 逼 statusline 重寫官方 rate_limits
//
// 背景：statusline 只由互動式 TUI 觸發，print 模式 (claude -p) 不會執行；
// 而 TUI 沒有可用的 console 就會直接結束 (Node spawn + stdio ignore 實測 exit 0 且不寫檔)，
// 因此改用 PowerShell 的 Start-Process -WindowStyle Hidden 配一個隱藏的 console。
// 以最低成本組合觸發：haiku + MAX_THINKING_TOKENS=0 + 一則 "Hi"。
//
// 實測官方數值在 session 啟動後約 3 秒就寫入，因此一偵測到 captured_at 變動
// 就把行程樹收掉，不等回應跑完。
//
// 代價：每次觸發等於送出一則 haiku 訊息，會消耗正在被測量的 5 小時配額。

import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

const DUMP_PATH = join(homedir(), '.claude', 'rate_limits.json')

/** 等待官方數值更新的上限；實測約 3 秒，留餘裕給冷啟動 */
const TIMEOUT_MS = 60_000

const POLL_MS = 500

/** 目前 dump 檔的 captured_at，讀不到時為 null */
async function readCapturedAt() {
  try {
    const dump = JSON.parse(await readFile(DUMP_PATH, 'utf8'))
    return typeof dump.captured_at === 'string' ? dump.captured_at : null
  } catch {
    return null
  }
}

/** 收掉整棵行程樹 (/T 連同子行程)；絕不能以行程名稱全砍，那會誤殺使用者當下的 session */
function killTree(pid) {
  return new Promise((resolve) => {
    execFile('taskkill', ['/PID', String(pid), '/T', '/F'], { windowsHide: true }, () => resolve())
  })
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 以隱藏視窗開一個 Claude Code session，回傳該行程的 PID。
 * 提示詞刻意用不含空白的單字，省去 Start-Process 的引號處理。
 */
function startHiddenSession() {
  const script =
    "$p = Start-Process -FilePath 'cmd.exe' " +
    "-ArgumentList '/c','claude','--model','haiku','Hi' " +
    '-WindowStyle Hidden -PassThru; $p.Id'

  return new Promise((resolve, reject) => {
    execFile(
      'powershell',
      ['-NoProfile', '-NonInteractive', '-Command', script],
      { windowsHide: true, env: { ...process.env, MAX_THINKING_TOKENS: '0' } },
      (err, stdout) => {
        if (err) return reject(err)
        const pid = Number(stdout.trim())
        Number.isInteger(pid) && pid > 0 ? resolve(pid) : reject(new Error(`未取得 PID：${stdout}`))
      }
    )
  })
}

async function main() {
  if (process.platform !== 'win32') {
    return {
      status: 'unsupported',
      message: '自動觸發僅支援 Windows，請自行開一個 Claude Code session',
    }
  }

  const before = await readCapturedAt()

  let pid
  try {
    pid = await startHiddenSession()
  } catch (e) {
    return { status: 'error', message: `無法啟動 claude session：${e.message}` }
  }

  try {
    const deadline = Date.now() + TIMEOUT_MS
    while (Date.now() < deadline) {
      await sleep(POLL_MS)
      if ((await readCapturedAt()) !== before) return { status: 'updated' }
    }
    return { status: 'timeout', message: `${TIMEOUT_MS / 1000} 秒內未取得新的官方數值` }
  } finally {
    await killTree(pid)
  }
}

const result = await main()
console.log(JSON.stringify(result))
process.exit(result.status === 'updated' ? 0 : 1)
