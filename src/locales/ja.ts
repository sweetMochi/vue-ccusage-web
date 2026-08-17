// 日本語
// key 由 zh-TW 決定，缺漏會在 locales/index.ts 的型別標註上報錯

export default {
  'app.title': 'Claude トークン使用量ダッシュボード',
  'app.heading': 'Claude Token Usage',
  'app.updatedAt': '{time} に更新',
  'app.refresh': '更新（必要に応じて公式値も取得）',
  'app.refreshing': 'Claude Code セッションを開いて公式値を取得しています…',
  'app.refreshLabel': '今すぐ更新',
  'app.refreshingLabel': 'セッションを開いて公式値を更新中',
  'app.themeSwitch': 'テーマ切り替え',
  'app.localeSwitch': '言語切り替え',
  'app.loading': 'ccusage のデータを読み込んでいます…',
  'app.loadFailed': '読み込みに失敗しました：{message}',
  'app.updateFailed': '更新に失敗したため、前回のデータを表示しています：{message}',
  'app.triggerFailed': '公式値の更新に失敗しました：{message}',
  'app.noUsage': '最近の使用記録がありません。使用記録があれば残量を判定できます',

  'gauge.fiveHour': '現在の使用量',
  'gauge.sevenDay': '今週の使用量',
  'gauge.officialFootnote': '{tokens} トークン・{time} にリセット',
  'gauge.estimateFootnote': '{used} / {limit}（過去最大 block からの推定）',
  'gauge.defaultFootnote': '{used} / {limit}（{label}）',
  'gauge.resetAt': '{time} にリセット',
  'gauge.windowExpired': '{time} にウィンドウがリセットされました。Claude Code の更新待ちです',
  'gauge.noOfficial': '公式データなし：README の statusline dump script の設定をご確認ください',
  'gauge.limitLabel': '過去最大 block',
  'gauge.aging.idle': '（Claude Code が未実行またはアイドル状態のため、前回のデータを表示）',
  'gauge.aging.stale': '（公式値がまだ更新されていないため、前回のデータを表示）',

  'time.title': 'リセットまで',
  'time.ratioLabel': 'block の残り時間の割合',
  'time.remaining': 'block 残り {percent}%',

  'breakdown.title': 'トークン構成',
  'breakdown.input': '入力',
  'breakdown.output': '出力',
  'breakdown.cacheRead': 'キャッシュ読み取り',
  'breakdown.cacheWrite': 'キャッシュ書き込み',
  'breakdown.tooltip': '{name}：{value}（{percent}%）',

  'burn.title': '消費ペース',
  'burn.tokensPerMinute': 'トークン / 分',
  'burn.costPerHour': '料金 / 時',
  'burn.sampling': 'トレンド線のサンプルを収集中…',
  'burn.noData': '消費ペースのデータがありません',
  'burn.tooltip': '{time}<br/>{value} トークン/分',

  'theme.system': '自動',
  'theme.light': 'ライト',
  'theme.dark': 'ダーク',

  'error.ccusage-failed': 'ccusage の実行に失敗しました：{detail}',
  'error.http': 'サーバーが HTTP {detail} を返しました',
  'error.network': 'ローカルサーバーに接続できません：{detail}',
  'error.script-no-output': 'トリガースクリプトが結果を返しませんでした：{detail}',
  'error.method-not-allowed': '/api/refresh-limits は POST で呼び出してください',
  'error.trigger-timeout': '{detail} 秒以内に新しい公式値を取得できませんでした',
  'error.trigger-unsupported':
    '自動トリガーは Windows のみ対応です。ご自身で Claude Code セッションを開いてください',
  'error.trigger-failed': 'Claude Code セッションを起動できませんでした：{detail}',
}
