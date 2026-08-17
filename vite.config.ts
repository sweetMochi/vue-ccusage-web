import { execFile } from 'node:child_process'
import { readFile, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
// 前後端共用同一份回應型別，錯誤代碼不會兩邊各寫一套
import type { RefreshLimitsResponse } from './src/types/statusline'

// 於 dev server 註冊 GET /api/blocks
// 瀏覽器無法執行 CLI，由 Node 端跑 ccusage 並把 JSON 轉交給前端
function ccusageApi(): Plugin {
  return {
    name: 'ccusage-api',
    configureServer(server) {
      server.middlewares.use('/api/blocks', (_req, res) => {
        execFile(
          'npx',
          // 不加 --active
          // 需要全部 blocks 才能算 token 上限
          ['ccusage', 'blocks', '--json'],
          // Windows 上 npx 是 npx.cmd，需經由 shell 解析
          { shell: true, windowsHide: true, timeout: 30_000 },
          (err, stdout, stderr) => {
            res.setHeader('Content-Type', 'application/json')
            if (err) {
              res.statusCode = 500
              // 只回代碼，文案由前端依當前語系解析；detail 為 CLI 原文不翻譯
              res.end(
                JSON.stringify({
                  error: { code: 'ccusage-failed', detail: stderr.trim() || err.message },
                })
              )
              return
            }
            res.end(stdout)
          }
        )
      })
    },
  }
}

// 於 dev server 註冊 GET /api/limits
// 讀取 scripts/statusline.mjs 寫入的 dump 檔，回傳官方 rate_limits、
// 檔案 mtime (statusline 心跳) 與 captured_at (數值擷取時間)
function limitsApi(): Plugin {
  return {
    name: 'limits-api',
    configureServer(server) {
      server.middlewares.use('/api/limits', (_req, res) => {
        void (async () => {
          res.setHeader('Content-Type', 'application/json')
          const file = join(homedir(), '.claude', 'rate_limits.json')
          try {
            const [text, info] = await Promise.all([readFile(file, 'utf8'), stat(file)])
            const dump = JSON.parse(text) as { rate_limits?: unknown; captured_at?: unknown }
            res.end(
              JSON.stringify({
                updated_at: info.mtime.toISOString(),
                // 舊版 dump 檔沒有此欄位，一律回 null 由前端退回 mtime 判斷
                captured_at: typeof dump.captured_at === 'string' ? dump.captured_at : null,
                rate_limits: dump.rate_limits ?? null,
              })
            )
          } catch {
            // 檔案不存在或內容損毀：視為尚未設定 statusline，回傳空狀態而非 500
            res.end(JSON.stringify({ updated_at: null, captured_at: null, rate_limits: null }))
          }
        })()
      })
    },
  }
}

// 於 dev server 註冊 POST /api/refresh-limits
// 開一個隱藏的 Claude Code session 逼 statusline 重寫官方數值 (詳見 scripts/refresh-limits.mjs)
//
// 路徑刻意不放在 /api/limits 底下：connect 的 use() 以路徑前綴比對，
// /api/limits/refresh 會先被上面的 limitsApi 接走
function refreshLimitsApi(): Plugin {
  /** 進行中的觸發；重複點擊時共用同一次，避免開出多個 session 重複消耗配額 */
  let inFlight: Promise<RefreshLimitsResponse> | null = null

  function runScript() {
    return new Promise<RefreshLimitsResponse>((resolve) => {
      const script = fileURLToPath(new URL('scripts/refresh-limits.mjs', import.meta.url))
      execFile(
        process.execPath,
        [script],
        { windowsHide: true, timeout: 90_000 },
        (err, stdout) => {
          try {
            // 腳本失敗時以非 0 結束，但 stdout 仍是可解析的結果
            resolve(JSON.parse(stdout.trim()) as RefreshLimitsResponse)
          } catch {
            resolve({
              status: 'failed',
              error: { code: 'script-no-output', detail: err?.message ?? '' },
            })
          }
        }
      )
    })
  }

  return {
    name: 'refresh-limits-api',
    configureServer(server) {
      server.middlewares.use('/api/refresh-limits', (req, res) => {
        res.setHeader('Content-Type', 'application/json')

        // 限定 POST：避免瀏覽器預抓等 GET 行為意外消耗配額
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ status: 'failed', error: { code: 'method-not-allowed' } }))
          return
        }

        inFlight ??= runScript().finally(() => (inFlight = null))

        void inFlight.then((result) => res.end(JSON.stringify(result)))
      })
    },
  }
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), ccusageApi(), limitsApi(), refreshLimitsApi()],
  server: {
    open: true,
  },
})
