# 更新紀錄

本檔案記錄 vue-ccusage-web 的所有重要變更，格式參考
[Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/)，
版本規則遵循 [語意化版本](https://semver.org/lang/zh-TW/)。

由於本專案為本地執行的儀表板而非發佈套件，版本位元判準如下：

- **主版本(x)**：使用者必須重新設定環境才能繼續使用，例如 statusline 設定方式、
  dump 檔路徑或格式改變、資料來源不再是 `ccusage blocks`、Node 或指令需求變更
- **次版本(y)**：新增或移除面板功能，使用者端設定不需調整
- **修訂版本(z)**：使用者感知不到結構變化的調整，例如修正錯誤、文案與標點、
  樣式微調、型別整理、重構、格式化與純文件更新

純規劃或文件的 commit 不單獨發版，併入實作完成的該版本。

## [1.2.0] - 2026-07-29

### 移除

- 移除「預估用量(Projection)」統計卡與 `Projection.vue` 元件

### 變更

- 燃燒速率卡改為橫跨兩欄(`md:col-span-2`)，補上移除預估用量卡後的版面空缺
- favicon 由 📊 改為 🌟
- 新增 CHANGELOG.md 並補上 v1.0.0、v1.0.1、v1.1.0 歷史標籤，README 加入更新紀錄連結

## [1.1.0] - 2026-07-19

第一期開發：Weekly limits 卡牌與官方 rate_limits 資料來源

### 新增

- `scripts/statusline.mjs`：自 statusline stdin JSON 抽出 `rate_limits` 寫入
  `~/.claude/rate_limits.json`，並串接原 statusline 指令(ccstatusline)，
  內層指令不可用時退回內建精簡顯示
- vite dev server 新增 `GET /api/limits` middleware：回傳 dump 檔內容與檔案 mtime，
  檔案不存在時回傳空狀態而非 500
- `useRateLimits` composable：每 30 秒輪詢、重置倒數與 mtime 過期判斷
- Weekly 卡牌：顯示官方 7 日限額百分比與重置時間，無資料時提示 statusline 設定步驟，
  資料過期時標示
- `formatResetAt`：epoch 秒轉本地時區「MM/DD(週)HH:mm」
- `scripts/dev-with-claude.mjs` 與 `npm run dev:with-claude`：另開最低成本 Claude 視窗
  持續觸發 statusline 更新(僅支援 Windows)
- `docs/` 版面預覽圖(開發階段與 Weekly limits)

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

## [1.0.1] - 2026-07-10

### 變更

- 主題模組重組：刪除 `lib/chartTheme.ts`，配色值與主題選項移至 `lib/theme.ts`，
  型別獨立至 `types/theme.ts`
- 卡片版面統一 `min-h-80`，預估用量橫跨兩欄，剩餘時間圓環放大

### 修正

- 沒有 active block 時改為顯示提示與 0 用量儀表(滿版)，不再整頁隱藏

## [1.0.0] - 2026-07-08

首個功能完整、可日常使用的版本

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

[1.2.0]: https://github.com/sweetMochi/vue-ccusage-web/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/sweetMochi/vue-ccusage-web/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/sweetMochi/vue-ccusage-web/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/sweetMochi/vue-ccusage-web/releases/tag/v1.0.0
