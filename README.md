# vue-ccusage-web

![Built with Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-d97757)
![Human Supervised](https://img.shields.io/badge/human-supervised-2a78d6)
![Vibecoding](https://img.shields.io/badge/workflow-vibecoding-1baf7a)

Claude Code Token 用量顯示面板 — 本地執行的 Vue 應用程式，
透過 `npx ccusage blocks --json` 讀取目前 5 小時 block 的以儀表板呈現使用狀況

## 開發方式聲明

本專案為 AI 輔助開發 (vibecoding) 實驗：主要程式碼由 Claude Code
(Anthropic Claude Fable 5) 產生，由 [@sweetmochi](https://github.com/sweetmochi)
全程監督與參與——包含需求定義、技術選型決策、逐階段程式碼審閱、
手動修改與重構，以及每階段的實際執行驗證。

分工方式：

- **架構規劃與 UI 設計方向**：人類決策，AI 提案
- **程式碼撰寫**：AI 產生初版，人類逐階段審閱並直接修改 (逐階段紀錄見 [CHANGELOG.md](CHANGELOG.md))
- **型別註解與文件**：人類與 AI 共同維護
- **驗證**：每階段完成皆以 `npm run build` 型別檢查與實際執行確認

Git 記錄中由 AI 參與的 commit 皆帶有 `Co-Authored-By: Claude` 署名，
可與人類手動修改的 commit 區分。

## 功能規劃

- **剩餘時間圓環**：目前 block 距離重置 `endTime` 的倒數，daisyUI `radial-progress`
- **Token 用量儀表**：`totalTokens` 與自訂 / 歷史上限 (`--token-limit max`) 的比例，vue-echarts gauge
- **燃燒速率 (Burn Rate)**：`tokensPerMinute`、`costPerHour` 即時數值 + 迷你趨勢線
- **Token 組成分布**：input / output / cache read / cache creation 圓餅圖
- **自動輪詢**：每 30 秒重新取得資料，倒數歸零時立即更新，另有手動重新整理鈕
- **主題切換**：跟隨系統 / 亮 / 暗三態，選擇記錄於 localStorage，圖表配色同步切換

![儀表板版面預覽](docs/dashboard-preview.svg)

## 技術架構

| 層       | 技術                                  | 說明                                                             |
| -------- | ------------------------------------- | ---------------------------------------------------------------- |
| 前端框架 | Vue 3 (`<script setup>` + TypeScript) | SPA，單頁儀表板                                                  |
| 建置工具 | Vite                                  | dev server 同時擔任本地 API                                      |
| 樣式     | Tailwind CSS 4 + daisyUI 5            | stat / progress / radial-progress 元件                           |
| 圖表     | vue-echarts (ECharts)                 | gauge、pie、sparkline                                            |
| 資料來源 | `npx ccusage blocks --json`           | 由 Vite middleware 在 Node 端執行 (全部 blocks，供估算 fallback) |
| 官方限額 | Claude Code statusline `rate_limits`  | `scripts/statusline.mjs` dump 至 `~/.claude/rate_limits.json`    |

### 資料流

```
ccusage CLI (讀取 ~/.claude/projects/ 的 JSONL)
        │  execFile (Node 端)
        ▼
Vite dev server middleware   GET /api/blocks
        │  fetch (每 30 秒輪詢)
        ▼
Vue composable useCcusage()
        │  reactive state
        ▼
儀表板元件 (圓環 / 儀表 / 統計卡 / 圓餅圖)
```

> 瀏覽器無法直接執行 CLI，因此由 Vite 插件在 dev server 內註冊
> `/api/blocks` endpoint，於 Node 端執行 `ccusage` 並回傳 JSON。
> 本專案定位為「本地開發工具」，以 `npm run dev` 啟動即可使用。

官方 `rate_limits` (Weekly 卡牌與 5 小時卡牌官方百分比) 另走一條資料流：

```
Claude Code statusline (每次狀態列更新觸發)
        │  scripts/statusline.mjs (dump 後串接原 statusline 指令，顯示不變)
        ▼
~/.claude/rate_limits.json
        │  讀檔 + 檔案 mtime (心跳) + captured_at (數值擷取時間)
        ▼
Vite dev server middleware   GET /api/limits
        │  fetch (每 30 秒輪詢，手動 ↻ 亦一併重抓)
        ▼
Vue composable useRateLimits()
        │  reactive state(fiveHour / sevenDay / 各自的 LimitStatus)
        ▼
5 小時卡牌 (官方百分比優先) / Weekly 卡牌
```

> statusline 與儀表板是兩個獨立行程，以 dump 檔為交換介質。
> statusline 每次執行都會重寫檔案，即使該次 `rate_limits` 為空值也保留既有數值，
> 因此 **檔案 mtime 代表「Claude Code 還在跑」，`captured_at` 代表「數值本身多新」**，
> 兩者分開判斷，避免閒置的 session 被誤判為未執行。

面板據此把每個限額視窗分成四種狀態 (`LimitStatus`)：

| 狀態      | 條件                         | 面板行為                             |
| --------- | ---------------------------- | ------------------------------------ |
| `ok`      | 數值 10 分鐘內更新過         | 直接採用官方百分比                   |
| `aging`   | 數值超過 10 分鐘未更新       | 仍顯示官方百分比，註腳標示可能非最新 |
| `expired` | 已過 `resets_at`，視窗已重置 | 不採用；5 小時卡退回歷史最高估算     |
| `missing` | 無官方資料 (未設定 / 非 Pro) | 顯示無資料提示；5 小時卡退回估算     |

> `aging` 的註腳會再依 mtime 區分是「Claude Code 未在執行或閒置中」
> 還是「statusline 有在跑但官方尚未回報新數值」

### 手動重新整理會做什麼

↻ 先重抓 `/api/blocks` 與 `/api/limits`；若官方數值仍是 `aging` 或 `expired`，
再呼叫 `POST /api/refresh-limits` 開一個隱藏的 Claude Code session 逼 statusline 重寫：

```
↻  ─→ 重抓兩條資料流 (免費)
       └─ 數值仍過期 ─→ POST /api/refresh-limits
                          └─ scripts/refresh-limits.mjs
                               隱藏視窗開 claude --model haiku Hi
                               輪詢 captured_at 變動 (實測約 4 秒) → 收掉行程樹
```

> **每次觸發等於送出一則 haiku 訊息，會消耗正在被測量的 5 小時配額。**
> 數值狀態為 `ok` 時不觸發；dump 檔從未出現 (statusline 尚未設定) 時也不觸發

觸發過程中 ↻ 會轉為 spinner 並停用，經由 endpoint 全程約 10–15 秒
(多出來的是 node 與 powershell 冷啟動)。也可不透過面板直接執行：

```bash
npm run refresh-limits
```

為什麼要繞這一圈：

| 做法                                       | 結果                                            |
| ------------------------------------------ | ----------------------------------------------- |
| `claude -p "Hi"` (print 模式)              | ✗ 不執行 statusline，回傳 JSON 也無 rate_limits |
| Node `spawn` + `stdio: ignore`             | ✗ TUI 沒有可用的 console，立刻 exit 0 且不寫檔  |
| 不帶訊息只開 TUI                           | ✗ 同上，行程直接結束                            |
| `Start-Process -WindowStyle Hidden` + 訊息 | ✓ 約 3 秒寫入新數值                             |

> 因此此功能僅支援 Windows；其他平台 endpoint 會回 `unsupported`，
> 面板保留 `aging` 標示，請自行開一個 Claude Code session

## 專案結構

```
vue-ccusage-web/
├── vite.config.ts            # Vite 設定 + /api/blocks、/api/limits、/api/refresh-limits 插件
├── index.html
├── scripts/
│   ├── statusline.mjs        # statusline 包裝腳本 (dump rate_limits 後串接原指令)
│   ├── refresh-limits.mjs    # 開隱藏 session 逼 statusline 重寫官方數值 (↻ 觸發)
│   └── dev-with-claude.mjs   # dev server + 另開 Claude 視窗觸發 statusline
├── src/
│   ├── main.ts
│   ├── App.vue               # 版面配置 (grid 儀表板)、卡牌資料來源切換
│   ├── style.css             # Tailwind / daisyUI 進入點
│   ├── types/
│   │   ├── ccusage.ts        # blocks JSON 的 TypeScript 型別
│   │   ├── statusline.ts     # statusline rate_limits 與 /api/limits 型別
│   │   ├── components.ts     # 元件 props 型別
│   │   └── theme.ts          # 主題型別
│   ├── lib/
│   │   ├── echarts.ts        # ECharts 按需註冊
│   │   ├── theme.ts          # 圖表配色 (明/暗，經 CVD 驗證) 與主題選項
│   │   └── format.ts         # 數字 / 時間格式化
│   ├── composables/
│   │   ├── useCcusage.ts     # 輪詢 /api/blocks、衍生值計算
│   │   ├── useRateLimits.ts  # 輪詢 /api/limits、官方限額衍生值與四態新鮮度判斷
│   │   ├── useBurnRateHistory.ts # burnRate 取樣累積 (趨勢線)
│   │   └── useTheme.ts       # 三態主題 (跟隨系統/亮/暗) 單一真相來源
│   └── components/
│       ├── TimeRemaining.vue # 剩餘時間圓環
│       ├── TokenGauge.vue    # token 用量儀表 (換算 / 直接百分比雙模式)
│       ├── BurnRate.vue      # 燃燒速率統計卡
│       └── TokenBreakdown.vue# token 組成圓餅圖
└── README.md
```

## ccusage 回傳資料欄位

```jsonc
{
  "blocks": [
    {
      "isActive": true,
      "startTime": "2026-07-06T14:00:00.000Z",
      "endTime": "2026-07-06T19:00:00.000Z", // block 重置時間
      "totalTokens": 532518,
      "costUSD": 0.3,
      "tokenCounts": {
        "inputTokens": 28,
        "outputTokens": 6372,
        "cacheReadInputTokens": 491495,
        "cacheCreationInputTokens": 34623,
      },
      "burnRate": { "tokensPerMinute": 24522, "costPerHour": 0.83 },
      "projection": { "remainingMinutes": 258, "totalTokens": 6859329, "totalCost": 3.87 },
      "models": ["claude-sonnet-5"],
    },
  ],
}
```

> 注意：ccusage 是由本機記錄推算，**沒有官方「剩餘額度」數字**；
> 官方百分比由 statusline `rate_limits` 資料流補足 (見上方資料流)

> 估算 fallback 的百分比上限採 `--token-limit max` (歷史最高 block)

## 使用方式

```bash
npm install
npm run dev              # 啟動面板 (含本地 API)
npm run dev:with-claude  # 啟動面板 + 另開 Claude Code 視窗觸發 statusline 更新
```

> `dev:with-claude` 會以最低成本組合 (haiku + `MAX_THINKING_TOKENS=0` + 一則 "Say ok")
> 另開互動 session；視窗保持開啟期間官方 `rate_limits` 持續更新 (僅支援 Windows)

> 已知限制：`/api/blocks` 與 `/api/limits` 只存在於 dev server，
> `npm run preview` 或靜態部署無法取得資料。

### 啟用官方 rate_limits (Weekly 卡牌與 5 小時官方百分比)

1. 於 `~/.claude/settings.json` 將 statusline 指令指向本專案的包裝腳本 (路徑改為你的專案位置)：

   ```json
   "statusLine": {
     "type": "command",
     "command": "node \"<專案絕對路徑>/scripts/statusline.mjs\""
   }
   ```

2. 原本使用的 statusline 指令改填在 `scripts/statusline.mjs` 開頭的 `INNER_COMMAND`
   (預設為 `npx -y ccstatusline@latest`)，dump 完成後會原樣串接執行，顯示內容不變
3. 開新的 Claude Code session 後，statusline 每次更新都會把官方 `rate_limits`
   寫入 `~/.claude/rate_limits.json`，面板即自動採用官方百分比

> `rate_limits` 僅 Pro / Max 訂閱者可用；未完成設定或欄位為空值時，
> Weekly 卡牌顯示無資料提示，5 小時卡牌退回歷史最高估算

> statusline 只在 Claude Code 有對話更新時重繪，閒置期間 dump 檔不會前進；
> 數值超過 10 分鐘未更新即標為 `aging`，但仍會顯示上次的官方百分比

## 開發紀錄

各版本的變更內容、版面預覽圖與逐階段開發紀錄見 [CHANGELOG.md](CHANGELOG.md)
