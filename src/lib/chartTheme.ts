/**
 * 圖表配色:經 CVD / 對比驗證的四色類別調色盤(依固定順序對應四類 token,不得循環產生新色)。
 * light 對 #fcfcfb、dark 對 #1a1a19 表面驗證;與 daisyUI base-100 表面足夠接近。
 * 淺色模式的 slot 2、3 對比低於 3:1,依 relief 規則必須搭配直接標籤或圖例。
 */
export interface ChartTheme {
  /** 類別色 slot 1–4(藍 / 水綠 / 黃 / 綠),順序即 CVD 安全機制 */
  series: [string, string, string, string]
  /** 主要文字 */
  ink: string
  /** 次要文字(軸標籤、圖例) */
  inkSecondary: string
  /** 淡色刻度 / 隱性格線 */
  grid: string
  /** gauge / 圓環的底軌 */
  track: string
  /** 圖表表面色(圓餅圖 2px 間隔用) */
  surface: string
}

export const lightTheme: ChartTheme = {
  series: ['#2a78d6', '#1baf7a', '#eda100', '#008300'],
  ink: '#0b0b0b',
  inkSecondary: '#52514e',
  grid: '#e1e0d9',
  track: '#e1e0d9',
  surface: '#fcfcfb',
}

export const darkTheme: ChartTheme = {
  series: ['#3987e5', '#199e70', '#c98500', '#008300'],
  ink: '#ffffff',
  inkSecondary: '#c3c2b7',
  grid: '#2c2c2a',
  track: '#2c2c2a',
  surface: '#1a1a19',
}
