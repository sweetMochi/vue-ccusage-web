# 更新紀錄

本檔案記錄 vue-ccusage-web 的所有重要變更，格式參考
[Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/)，
版本規則遵循 [語意化版本](https://semver.org/lang/zh-TW/)。

由於本專案為本地執行的儀表板而非發佈套件，版本位元判準如下：

- **主版本 (x)**：使用者必須重新設定環境才能繼續使用，例如 statusline 設定方式、
  dump 檔路徑或格式改變、資料來源不再是 `ccusage blocks`、Node 或指令需求變更
- **次版本 (y)**：新增或移除面板功能，使用者端設定不需調整
- **修訂版本 (z)**：使用者感知不到結構變化的調整，例如修正錯誤、文案與標點、
  樣式微調、型別整理、重構、格式化與純文件更新

純規劃或文件的 commit 不單獨發版，併入實作完成的該版本。

## [1.3.0] - 2026-08-04

第二期開發：把「Claude Code 是否還在執行」與「官方數值是否還新鮮」拆成兩件事判斷，
並讓 ↻ 在數值過期時能主動開一個隱藏 session 逼 statusline 重寫

> statusline 只由互動式 TUI 觸發，閒置期間不會重繪，
> 因此舊版單看 dump 檔 mtime 會把閒置中的 session 誤判為未執行

### 新增

- `scripts/refresh-limits.mjs` 與 `POST /api/refresh-limits`：以 PowerShell
  `Start-Process -WindowStyle Hidden` 開一個 `claude --model haiku` session 逼 statusline
  重寫官方數值，偵測 `captured_at` 變動後 (實測約 3 秒) 以 `taskkill /T` 收掉行程樹；
  同時只保留一次觸發，僅支援 Windows，其他平台回傳 `unsupported`
- `npm run refresh-limits`：不透過面板直接觸發更新
- dump 檔新增 `captured_at` 欄位並由 `/api/limits` 一併回傳，
  舊版格式以覆寫前的 mtime 補上，面板無需等待即可判斷新鮮度
- `LimitStatus` 四態 (`ok` / `aging` / `expired` / `missing`)：各限額視窗獨立判斷，
  `expired` 優先於 `aging` (已過 `resets_at` 的百分比一定失效)
- `docs/dashboard-preview.svg`：反映現行版面的預覽圖

### 變更

- statusline dump 改為每次執行都重寫檔案：`rate_limits` 為空值時保留既有數值但推進 mtime，
  檔案 mtime 自此代表 statusline 心跳、`captured_at` 代表數值擷取時間
- ↻ 改為先重抓 `/api/blocks` 與 `/api/limits`，官方數值仍為 `aging` 或 `expired`
  時才觸發 session (會消耗正在被測量的 5 小時配額)，觸發中顯示 spinner 並停用按鈕
- `aging` 的註腳依 mtime 區分「Claude Code 未在執行或閒置中」與「官方尚未回報新數值」
- 卡牌標題：燃燒速率改為用量趨勢、距離重置改為重置時間、5 小時卡加上「當前用量」
- 中文全形括號（）統一改為半形 () 並補上空白，
  `formatResetAt` 輸出同步改為「MM/DD (週) HH:mm」
- README 補上四態表格、手動重新整理流程與各觸發做法的比較，
  開發階段紀錄移入本檔僅保留連結

### 移除

- `useRateLimits` 的 `isStale`：由 `isStatuslineIdle`、`isDataAging`
  與各視窗的 `LimitStatus` 取代

## [1.2.0] - 2026-07-29

### 移除

- 移除「預估用量 (Projection)」統計卡與 `Projection.vue` 元件

### 變更

- 燃燒速率卡改為橫跨兩欄 (`md:col-span-2`)，補上移除預估用量卡後的版面空缺
- favicon 由 📊 改為 🌟
- 新增 CHANGELOG.md 並補上 v1.0.0、v1.0.1、v1.1.0 歷史標籤，
  README 的開發階段紀錄移入本檔，僅保留指向連結
- 新增 `docs/dashboard-preview.svg`：反映 1.2.0 現行版面的預覽圖，置於 README 功能規劃區
  (`docs/weekly-limits-preview.svg` 保留為 1.1.0 當時的規劃圖)

## [1.1.0] - 2026-07-19

第一期開發：新增 Weekly 卡牌，導入 Claude Code statusline JSON 的官方 `rate_limits` 資料，
並讓 5 小時卡牌的用量百分比改採官方數據 (取代歷史最高估算)

> `rate_limits` 僅 Pro / Max 訂閱者可用，含 `five_hour` / `seven_day` 兩視窗，
> 各提供 `used_percentage` (0–100) 與 `resets_at` (Unix epoch 秒)，以上欄位有可能為空

![Weekly limits 版面預覽](docs/weekly-limits-preview.svg)

### 新增

- `scripts/statusline.mjs`：自 statusline stdin JSON 抽出 `rate_limits` 寫入
  `~/.claude/rate_limits.json`，並串接原 statusline 指令 (ccstatusline)，
  內層指令不可用時退回內建精簡顯示
- vite dev server 新增 `GET /api/limits` middleware：回傳 dump 檔內容與檔案 mtime，
  檔案不存在時回傳空狀態而非 500
- `useRateLimits` composable：每 30 秒輪詢、重置倒數與 mtime 過期判斷
- Weekly 卡牌：顯示官方 7 日限額百分比與重置時間，無資料時提示 statusline 設定步驟，
  資料過期時標示
- `formatResetAt`：epoch 秒轉本地時區「MM/DD (週) HH:mm」
- `scripts/dev-with-claude.mjs` 與 `npm run dev:with-claude`：另開最低成本 Claude 視窗
  持續觸發 statusline 更新 (僅支援 Windows)
- `docs/` 版面預覽圖 (開發階段與 Weekly limits)

### 變更

- 5 小時卡牌優先採用官方 `five_hour.used_percentage`，官方資料為空值或過期時
  退回歷史最高估算，註腳區分資料來源
- TokenGauge 參數化：新增 `title`、`limitLabel` props 與 percent 直傳模式
  (為空值時顯示「—」)，註腳改為可覆寫的 slot，props 型別移至 `src/types/components.ts`
- README 補上官方 rate_limits 資料流圖、statusline 設定步驟與技術架構表
- 統一中文全形標點，「缺席」措辭改為「無資料」

### 修正

- statusline dump 在 `rate_limits` 為空值時不覆寫既有檔案，
  避免 session 剛啟動就洗掉先前的有效資料

### 開發階段

**階段一：建立資料來源 (兩張卡共用)**

- statusline dump script (`scripts/statusline.mjs`)：讓 node stdin JSON 抽出 `rate_limits` 建立檔案 `~/.claude/rate_limits.json`，串接原 statusline 指令 (於 `~/.claude/settings.json` 註冊)
- Vite middleware 新增 `GET /api/limits`：讀 dump 檔回傳 JSON 附檔案 mtime；檔案不存在時回傳空狀態而非 500
- 型別定義 `src/types/statusline.ts`：`RateLimitWindow { used_percentage, resets_at }`，`five_hour` / `seven_day` 可能回傳空值
- `useRateLimits` composable：每 30 秒輪詢，衍生各視窗百分比、重置倒數、資料過期判斷 (mtime 逾時則顯示「Claude Code 未在執行」)

**階段二：建立 Weekly 卡牌**

- TokenGauge 參數化：新增 `title`、`limitLabel` props 與「直接傳百分比」模式 (`percent`，`null` 表示無資料顯示「—」)，預設值維持現行為，註腳改為可覆寫的 slot
- App.vue 新增 Weekly 卡牌：`seven_day.used_percentage` 儀表版 + `resets_at` 重置時間 (`formatResetAt`)；無資料時顯示 statusline 設定提示；資料過期時標示「Claude Code 未在執行」；不依賴 active block

**階段三：修改 5 小時上限改用官方回傳數據**

- 儀表百分比改用 `five_hour.used_percentage`，ccusage 的 `totalTokens` 降為註腳補充資訊
- fallback：官方資料為空值或過期時退回「totalTokens / 歷史最高」估算，註腳標明目前資料來源
- `tokenLimit` 僅保留作 fallback 分母，註腳文案以「官方 5 小時限額」/「歷史最高 block 估算」區分資料來源

**階段四：撰寫文件與驗證**

- README 資料流圖補上 statusline → dump 檔 → `/api/limits` 路徑與設定步驟 (另更新技術架構表、專案結構、ccusage 註記)
- `npm run build` 型別檢查；手動驗證三情境：無 dump 檔 (首次)、資料齊全、mtime 過期 (Claude Code 未執行)

## [1.0.1] - 2026-07-10

### 變更

- 主題模組重組：刪除 `lib/chartTheme.ts`，配色值與主題選項移至 `lib/theme.ts`，
  型別獨立至 `types/theme.ts`
- 卡片版面統一 `min-h-80`，預估用量橫跨兩欄，剩餘時間圓環放大

### 修正

- 沒有 active block 時改為顯示提示與 0 用量儀表 (滿版)，不再整頁隱藏

## [1.0.0] - 2026-07-08

首個功能完整、可日常使用的版本

![初始開發階段版面預覽](docs/dev-stage-preview.svg)

### 新增

- Vite + Vue 3 + TypeScript + Tailwind CSS 4 + daisyUI 專案骨架
- `useCcusage`：透過 `npx ccusage blocks --json` 取得全部 blocks，
  以歷史最高 `totalTokens` 作為用量上限，`remainingRatio` 以 block 實際時長為分母
- 統計卡牌：剩餘時間圓環、Token 用量儀表、Token 組成圓餅圖、燃燒速率、預估用量，
  App.vue 採 grid 儀表板版面
- `lib`：ECharts 按需註冊、明暗圖表配色、數字與時間格式化
- `useBurnRateHistory`：燃燒速率趨勢線取樣
- `useTheme`：跟隨系統／亮／暗三態切換，選擇記錄於 localStorage，
  以 `data-theme` 同步 daisyUI 與 ECharts 配色
- header 主題切換鈕與手動重新整理鈕
- Prettier 設定與 `format`、`format:check` scripts
- `.editorconfig`、VSCode 擴充建議與 favicon

### 變更

- 每 30 秒自動輪詢，倒數歸零時立即更新而不等下一輪
- 輪詢失敗時保留上次資料，僅顯示更新中斷警示
- vite dev server 啟動時自動開啟瀏覽器

[1.3.0]: https://github.com/sweetMochi/vue-ccusage-web/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/sweetMochi/vue-ccusage-web/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/sweetMochi/vue-ccusage-web/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/sweetMochi/vue-ccusage-web/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/sweetMochi/vue-ccusage-web/releases/tag/v1.0.0
