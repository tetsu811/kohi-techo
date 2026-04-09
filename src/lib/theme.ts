// 珈琲手帖 theme — warm coffee palette
// Accent: 焙火橘 / Roast Orange #C75B12

export type Theme = 'light' | 'dark';

export function getColors(t: Theme) {
  return t === 'dark'
    ? {
        bg: '#1C140F',        // 深焙豆背景
        bgSoft: '#241913',    // 稍亮的背景
        card: '#2A1F18',      // 卡片
        cardHover: '#35281F',
        border: '#3E2F24',    // 邊框
        text: '#F5EBE0',      // 米白主文字
        textSub: '#BCAAA4',   // 奶咖啡次文字
        textMuted: '#8D6E63', // 淡咖啡輔助
        accent: '#D97B3C',    // 焙火橘（dark 模式稍亮）
        accentSoft: '#3E2317',
        success: '#7FB069',
        warn: '#E8A838',
      }
    : {
        bg: '#FAF7F2',        // 奸色米白背景
        bgSoft: '#F3EEE5',    // 暖米
        card: '#FFFFFF',      // 白卡片
        cardHover: '#FBF8F3',
        border: '#E8DED0',    // 米色銹
        text: '#3E2723',      // 深焙豆主文字
        textSub: '#8D6E63',   // 拿鐵咖啡次文字
        textMuted: '#BCAAA4', // 奶泡灰
        accent: '#C75B12',    // 焙火橘
        accentSoft: '#FBE9D8',
        success: '#5B8A3C',
        warn: '#D48806',
      };
}

// Font stacks
export const FONT = {
  // 標題：日式西線（宋體），優雅沉穩
  serif: '"Noto Serif TC", "Noto Serif JP", "Cormorant Garamond", serif',
  // 內文：清晰好讀
  sans: '"Noto Sans TC", "Noto Sans JP", -apple-system, "Helvetica Neue", sans-serif',
  // 可愛點綴：圓潤日系（Zen Maru Gothic / Klee One）
  cute: '"Zen Maru Gothic", "Klee One", "Noto Sans TC", sans-serif',
  // 手寫感
  hand: '"Klee One", "Zen Maru Gothic", cursive',
};
