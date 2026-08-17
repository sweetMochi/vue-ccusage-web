// English
// key 由 zh-TW 決定，缺漏會在 locales/index.ts 的型別標註上報錯

export default {
  'app.title': 'Claude Token Usage',
  'app.heading': 'Claude Token Usage',
  'app.updatedAt': 'Updated {time}',
  'app.refresh': 'Refresh (updates official figures if needed)',
  'app.refreshing': 'Opening a Claude Code session to fetch official figures…',
  'app.refreshLabel': 'Refresh now',
  'app.refreshingLabel': 'Opening a session to update official figures',
  'app.themeSwitch': 'Switch theme',
  'app.localeSwitch': 'Switch language',
  'app.loading': 'Loading ccusage data…',
  'app.loadFailed': 'Failed to load: {message}',
  'app.updateFailed': 'Update failed, showing last known data: {message}',
  'app.triggerFailed': 'Could not update official figures: {message}',
  'app.noUsage': 'No recent AI usage — remaining quota can only be estimated from usage records',

  'gauge.fiveHour': 'Current usage',
  'gauge.sevenDay': 'This week',
  'gauge.officialFootnote': '{tokens} tokens・resets {time}',
  'gauge.estimateFootnote': '{used} / {limit} (estimated from peak block)',
  'gauge.defaultFootnote': '{used} / {limit} ({label})',
  'gauge.resetAt': 'Resets {time}',
  'gauge.windowExpired': 'Window reset at {time}, waiting for Claude Code to report new figures',
  'gauge.noOfficial': 'No official data — check the statusline dump script setup in the README',
  'gauge.limitLabel': 'peak block',
  'gauge.aging.idle': ' (Claude Code is not running or is idle, showing last known data)',
  'gauge.aging.stale': ' (no new official figures reported yet, showing last known data)',

  'time.title': 'Block reset',
  'time.ratioLabel': 'Share of block time remaining',
  'time.remaining': '{percent}% of block left',

  'breakdown.title': 'Token breakdown',
  'breakdown.input': 'Input',
  'breakdown.output': 'Output',
  'breakdown.cacheRead': 'Cache read',
  'breakdown.cacheWrite': 'Cache write',
  'breakdown.tooltip': '{name}: {value} ({percent}%)',

  'burn.title': 'Burn rate',
  'burn.tokensPerMinute': 'tokens / min',
  'burn.costPerHour': 'cost / hour',
  'burn.sampling': 'Collecting samples for the trend line…',
  'burn.noData': 'No burn rate data yet',
  'burn.tooltip': '{time}<br/>{value} tokens/min',

  'theme.system': 'Auto',
  'theme.light': 'Light',
  'theme.dark': 'Dark',

  'error.ccusage-failed': 'ccusage failed: {detail}',
  'error.http': 'Server responded with HTTP {detail}',
  'error.network': 'Cannot reach the local dev server: {detail}',
  'error.script-no-output': 'The trigger script returned no result: {detail}',
  'error.method-not-allowed': '/api/refresh-limits must be called with POST',
  'error.trigger-timeout': 'No new official figures within {detail} seconds',
  'error.trigger-unsupported':
    'Automatic triggering is Windows-only — please open a Claude Code session yourself',
  'error.trigger-failed': 'Could not start a Claude Code session: {detail}',
}
