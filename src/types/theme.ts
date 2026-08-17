/**
 * 圖表配色：經 CVD / 對比驗證的四色
 * light 對 #fcfcfb、dark 對 #1a1a19 表面驗證；與 daisyUI base-100 表面足夠接近。
 * 淺色模式的 slot 2、3 對比低於 3:1，依 relief 規則必須搭配直接標籤或圖例。
 */
export interface ChartTheme {
  /**
   * 類別色 (順序即 CVD 安全機制)
   *
   *      1: 藍
   *      2: 水綠
   *      3: 黃
   *      4: 綠
   */
  series: [string, string, string, string]
  /** 主要文字 */
  ink: string
  /** 次要文字 (軸標籤、圖例) */
  inkSecondary: string
  /** 隱形格線 */
  grid: string
  /** 圓環底色 */
  track: string
  /** 圖表表面色(圓餅圖 2px 間隔用) */
  surface: string
}

/**
 * 主題模式
 *
 *      'system' 系統設定
 *      'light' 亮
 *      'dark' 暗
 */
export type ThemeMode = 'system' | 'light' | 'dark'
