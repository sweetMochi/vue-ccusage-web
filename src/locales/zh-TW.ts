// 繁體中文 — 基準語系
// 這份字典的 key 即 MessageKey 的來源，其他語系少一個 key 會在 vue-tsc 編譯期報錯
// 模板中的 `{name}` 由 t() 以第二參數取代

export default {
  'app.title': 'Claude Token 用量面板',
  'app.heading': 'Claude Token Usage',
  'app.updatedAt': '更新於 {time}',
  'app.refresh': '重新整理 (必要時更新官方數值)',
  'app.refreshing': '正在開 Claude Code session 取得官方數值…',
  'app.refreshLabel': '立即重新整理',
  'app.refreshingLabel': '正在開 session 更新官方數值',
  'app.themeSwitch': '主題切換',
  'app.localeSwitch': '語言切換',
  'app.loading': '讀取 ccusage 資料中…',
  'app.loadFailed': '讀取失敗：{message}',
  'app.updateFailed': '更新失敗，顯示上次資料：{message}',
  'app.triggerFailed': '官方數值更新失敗：{message}',
  'app.noUsage': '最近沒有使用 AI，如果有使用紀錄才能判斷剩餘用量',

  'gauge.fiveHour': '當前用量',
  'gauge.sevenDay': '本週用量',
  'gauge.officialFootnote': '{tokens} tokens・重置於 {time}',
  'gauge.estimateFootnote': '{used} / {limit} (歷史最高 block 估算)',
  'gauge.defaultFootnote': '{used} / {limit} ({label})',
  'gauge.resetAt': '重置於 {time}',
  'gauge.windowExpired': '視窗已於 {time} 重置，等待 Claude Code 更新數值',
  'gauge.noOfficial': '無官方資料：請確認已依 README 設定 statusline dump script',
  'gauge.limitLabel': '歷史最高 block',
  'gauge.aging.idle': ' (Claude Code 未在執行或閒置中，顯示上次資料)',
  'gauge.aging.stale': ' (官方尚未回報新數值，顯示上次資料)',

  'time.title': '重置時間',
  'time.ratioLabel': 'block 剩餘時間比例',
  'time.remaining': 'block 剩餘 {percent}%',

  'breakdown.title': 'Token 組成',
  'breakdown.input': '輸入',
  'breakdown.output': '輸出',
  'breakdown.cacheRead': '快取讀取',
  'breakdown.cacheWrite': '快取寫入',
  'breakdown.tooltip': '{name}：{value} ({percent}%)',

  'burn.title': '用量趨勢',
  'burn.tokensPerMinute': 'tokens / 分鐘',
  'burn.costPerHour': '費用 / 小時',
  'burn.sampling': '趨勢線取樣累積中…',
  'burn.noData': '尚無速率資料',
  'burn.tooltip': '{time}<br/>{value} tokens/分鐘',

  'theme.system': '預設',
  'theme.light': '亮',
  'theme.dark': '暗',

  'error.ccusage-failed': 'ccusage 執行失敗：{detail}',
  'error.http': '伺服器回應 HTTP {detail}',
  'error.network': '無法連線到本機伺服器：{detail}',
  'error.script-no-output': '觸發腳本沒有回傳結果：{detail}',
  'error.method-not-allowed': '請以 POST 呼叫 /api/refresh-limits',
  'error.trigger-timeout': '{detail} 秒內未取得新的官方數值',
  'error.trigger-unsupported': '自動觸發僅支援 Windows，請自行開一個 Claude Code session',
  'error.trigger-failed': '無法啟動 Claude Code session：{detail}',
}
