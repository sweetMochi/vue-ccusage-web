import { execFile } from 'node:child_process'
import { readFile, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

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
              res.end(JSON.stringify({ error: stderr.trim() || err.message }))
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
// 讀取 scripts/statusline.mjs 寫入的 dump 檔，回傳官方 rate_limits 與檔案 mtime
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
            const dump = JSON.parse(text) as { rate_limits?: unknown }
            res.end(
              JSON.stringify({
                updated_at: info.mtime.toISOString(),
                rate_limits: dump.rate_limits ?? null,
              })
            )
          } catch {
            // 檔案不存在或內容損毀：視為尚未設定 statusline，回傳空狀態而非 500
            res.end(JSON.stringify({ updated_at: null, rate_limits: null }))
          }
        })()
      })
    },
  }
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), ccusageApi(), limitsApi()],
  server: {
    open: true,
  },
})
