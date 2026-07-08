# vue-ccusage-web

![Built with Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-d97757)
![Human Supervised](https://img.shields.io/badge/human-supervised-2a78d6)
![Vibecoding](https://img.shields.io/badge/workflow-vibecoding-1baf7a)

Claude Code Token 用量顯示面板 — 本地執行的 Vue 應用程式，
透過 `npx ccusage blocks --json` 讀取目前 5 小時 block 的以儀表板呈現使用狀況

## 開發方式聲明

本專案為 AI 輔助開發(vibecoding)實驗:主要程式碼由 Claude Code
(Anthropic Claude Fable 5)產生,由 [@sweetmochi](https://github.com/sweetmochi)
全程監督與參與——包含需求定義、技術選型決策、逐階段程式碼審閱、
手動修改與重構,以及每階段的實際執行驗證。

分工方式:

- **架構規劃與 UI 設計方向**:人類決策,AI 提案
- **程式碼撰寫**:AI 產生初版,人類逐階段審閱並直接修改(進度見下方「開發階段」checklist)
- **型別註解與文件**:人類與 AI 共同維護
- **驗證**:每階段完成皆以 `npm run build` 型別檢查與實際執行確認

Git 記錄中由 AI 參與的 commit 皆帶有 `Co-Authored-By: Claude` 署名,
可與人類手動修改的 commit 區分。

## 功能規劃

- **剩餘時間圓環**：目前 block 距離重置 `endTime` 的倒數，daisyUI `radial-progress`
- **Token 用量儀表**：`totalTokens` 與自訂 / 歷史上限 (`--token-limit max`) 的比例，vue-echarts gauge
- **燃燒速率 (Burn Rate)**：`tokensPerMinute`、`costPerHour` 即時數值 + 迷你趨勢線
- **預估用量 (Projection)**：block 結束時的預估 token 總量與費用
- **Token 組成分布**：input / output / cache read / cache creation 圓餅圖
- **自動輪詢**：每 30 秒重新取得資料，倒數歸零時立即更新，另有手動重新整理鈕
- **主題切換**：跟隨系統 / 亮 / 暗三態，選擇記錄於 localStorage，圖表配色同步切換

## 技術架構

| 層       | 技術                                  | 說明                                                          |
| -------- | ------------------------------------- | ------------------------------------------------------------- |
| 前端框架 | Vue 3 (`<script setup>` + TypeScript) | SPA,單頁儀表板                                                |
| 建置工具 | Vite                                  | dev server 同時擔任本地 API                                   |
| 樣式     | Tailwind CSS 4 + daisyUI 5            | stat / progress / radial-progress 元件                        |
| 圖表     | vue-echarts (ECharts)                 | gauge、pie、sparkline                                         |
| 資料來源 | `npx ccusage blocks --json`           | 由 Vite middleware 在 Node 端執行(全部 blocks,供歷史上限計算) |

### 資料流

```
ccusage CLI(讀取 ~/.claude/projects/ 的 JSONL)
        │  execFile(Node 端)
        ▼
Vite dev server middleware   GET /api/blocks
        │  fetch(每 30 秒輪詢)
        ▼
Vue composable useCcusage()
        │  reactive state
        ▼
儀表板元件(圓環 / 儀表 / 統計卡 / 圓餅圖)
```

> 瀏覽器無法直接執行 CLI,因此由 Vite 插件在 dev server 內註冊
> `/api/blocks` endpoint,於 Node 端執行 `ccusage` 並回傳 JSON。
> 本專案定位為「本地開發工具」,以 `npm run dev` 啟動即可使用。

## 專案結構(規劃)

```
vue-ccusage-web/
├── vite.config.ts            # Vite 設定 + ccusage API middleware 插件
├── index.html
├── src/
│   ├── main.ts
│   ├── App.vue               # 版面配置(grid 儀表板)
│   ├── style.css             # Tailwind / daisyUI 進入點
│   ├── types/
│   │   └── ccusage.ts        # blocks JSON 的 TypeScript 型別
│   ├── lib/
│   │   ├── echarts.ts        # ECharts 按需註冊
│   │   ├── chartTheme.ts     # 圖表配色(明/暗,經 CVD 驗證)
│   │   └── format.ts         # 數字 / 時間格式化
│   ├── composables/
│   │   ├── useCcusage.ts     # 輪詢 /api/blocks、衍生值計算
│   │   ├── useBurnRateHistory.ts # burnRate 取樣累積(趨勢線)
│   │   └── useTheme.ts       # 三態主題(跟隨系統/亮/暗)單一真相來源
│   └── components/
│       ├── TimeRemaining.vue # 剩餘時間圓環
│       ├── TokenGauge.vue    # token 用量儀表
│       ├── BurnRate.vue      # 燃燒速率統計卡
│       ├── Projection.vue    # 預估用量統計卡
│       └── TokenBreakdown.vue# token 組成圓餅圖
└── README.md
```

## ccusage 回傳資料(重點欄位)

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

> 注意:ccusage 是由本機記錄推算，**沒有官方「剩餘額度」數字**

> 百分比上限採 `--token-limit max` (歷史最高 block)

## 使用方式

```bash
npm install
npm run dev      # 啟動面板(含本地 API)
```

> 已知限制:`/api/blocks` 只存在於 dev server,
> `npm run preview` 或靜態部署無法取得資料。

## 開發階段

- [x] 專案大綱(README / package.json)
- [x] Vite + Vue + Tailwind/daisyUI 腳手架
- [x] ccusage API middleware
- [x] useCcusage composable 與型別定義
- [x] 儀表板元件
- [x] 主題與細節調整
