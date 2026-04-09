// çç²æå¸ theme â warm coffee palette
// Accent: çç«æ© / Roast Orange #C75B12

export type Theme = 'light' | 'dark';

export function getColors(t: Theme) {
  return t === 'dark'
    ? {
        bg: '#1C140F',        // æ·±çè±èæ¯
        bgSoft: '#241913',    // ç¨äº®çèæ¯
        card: '#2A1F18',      // å¡ç
        cardHover: '#35281F',
        border: '#3E2F24',    // éæ¡
        text: '#F5EBE0',      // ç±³ç½ä¸»æå­
        textSub: '#BCAAA4',   // å¥¶åå¡æ¬¡æå­
        textMuted: '#8D6E63', // æ·¡åå¡è¼å©
        accent: '#D97B3C',    // çç«æ©ï¼dark æ¨¡å¼ç¨äº®ï¼
        accentSoft: '#3E2317',
        success: '#7FB069',
        warn: '#E8A838',
      }
    : {
        bg: '#FAF7F2',        // å¥¶è²ç±³ç½èæ¯
        bgSoft: '#F3EEE5',    // æç±³
        card: '#FFFFFF',      // ç½å¡ç
        cardHover: '#FBF8F3',
        border: '#E8DED0',    // ç±³è²éæ¡
        text: '#3E2723',      // æ·±çè±ä¸»æå­
        textSub: '#8D6E63',   // æ¿éµåå¡æ¬¡æå­
        textMuted: '#BCAAA4', // å¥¶æ³¡ç°
        accent: '#C75B12',    // çç«æ©
        accentSoft: '#FBE9D8',
        success: '#5B8A3C',
        warn: '#D48806',
      };
}

// Font stacks
export const FONT = {
  // æ¨é¡ï¼æ¥å¼è¥¯ç·ï¼å®é«ï¼ï¼åªéæ²ç©©
  serif: '"Noto Serif TC", "Noto Serif JP", "Cormorant Garamond", serif',
  // å§æï¼æ¸æ°å¥½è®
  sans: '"Noto Sans TC", "Noto Sans JP", -apple-system, "Helvetica Neue", sans-serif',
  // å¯æé»ç¶´ï¼åæ½¤æ¥ç³»ï¼Zen Maru Gothic / Klee Oneï¼
  cute: '"Zen Maru Gothic", "Klee One", "Noto Sans TC", sans-serif',
  // æå¯«æ
  hand: '"Klee One", "Zen Maru Gothic", cursive',
};
