import { execFile } from 'node:child_process'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// 於 dev server 註冊 GET /api/blocks:
// 瀏覽器無法執行 CLI,由 Node 端跑 ccusage 並把 JSON 轉交給前端
function ccusageApi(): Plugin {
  return {
    name: 'ccusage-api',
    configureServer(server) {
      server.middlewares.use('/api/blocks', (_req, res) => {
        execFile(
          'npx',
          ['ccusage', 'blocks', '--json', '--active'],
          // Windows 上 npx 是 npx.cmd,需經由 shell 解析
          { shell: true, windowsHide: true, timeout: 30_000 },
          (err, stdout, stderr) => {
            res.setHeader('Content-Type', 'application/json')
            if (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: stderr.trim() || err.message }))
              return
            }
            res.end(stdout)
          },
        )
      })
    },
  }
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), ccusageApi()],
})
