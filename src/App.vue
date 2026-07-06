<script setup lang="ts">
// 暫時的資料流驗證頁,階段 5 會替換成正式儀表板版面
import { useCcusage } from './composables/useCcusage'

const { block, error, loading, updatedAt, remainingMs } = useCcusage()

function formatRemaining(ms: number): string {
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1_000)
  return `${h} 小時 ${m} 分 ${s} 秒`
}
</script>

<template>
  <main class="min-h-screen bg-base-200 flex items-center justify-center p-4">
    <div class="card bg-base-100 shadow-md w-full max-w-md">
      <div class="card-body">
        <h1 class="card-title">Claude Token 用量面板</h1>

        <div v-if="loading" class="flex items-center gap-2 text-base-content/70">
          <span class="loading loading-spinner loading-sm"></span>
          讀取 ccusage 資料中…
        </div>

        <div v-else-if="error" class="alert alert-error text-sm">
          <span>讀取失敗:{{ error }}</span>
        </div>

        <template v-else-if="block">
          <div class="stats stats-vertical">
            <div class="stat px-0">
              <div class="stat-title">距離重置</div>
              <div class="stat-value text-2xl tabular-nums">
                {{ formatRemaining(remainingMs) }}
              </div>
            </div>
            <div class="stat px-0">
              <div class="stat-title">Token 已用</div>
              <div class="stat-value text-2xl tabular-nums">
                {{ block.totalTokens.toLocaleString() }}
              </div>
            </div>
            <div class="stat px-0">
              <div class="stat-title">費用</div>
              <div class="stat-value text-2xl tabular-nums">
                ${{ block.costUSD.toFixed(2) }}
              </div>
            </div>
          </div>
          <p class="text-xs text-base-content/50">
            更新於 {{ updatedAt?.toLocaleTimeString() }}
          </p>
        </template>

        <div v-else class="text-base-content/70">目前沒有進行中的 block。</div>
      </div>
    </div>
  </main>
</template>
