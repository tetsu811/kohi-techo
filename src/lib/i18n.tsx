'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Locale = 'zh' | 'en' | 'ja';

type Dict = Record<string, { zh: string; en: string; ja: string }>;

// Core shared strings. Page-specific strings use the inline ternary pattern.
const DICT: Dict = {
  'brand.name':        { zh: 'çç²æå¸', en: 'KÅhÄ« TechÅ', ja: 'çç²æå¸' },
  'brand.tagline':     { zh: 'ä¸æä¸çã»æ¯æ¯é½å¼å¾è¨ä½', en: 'Every cup deserves to be remembered', ja: 'ä¸æä¸çã»ä¸æ¯ãã¤ã®è¨æ¶' },

  'nav.home':          { zh: 'é¦é ', en: 'Home', ja: 'ãã¼ã ' },
  'nav.beans':         { zh: 'è±è©', en: 'Beans', ja: 'è±æå¸' },
  'nav.map':           { zh: 'åå¡å°å', en: 'Map', ja: 'çç²å°å³' },
  'nav.profile':       { zh: 'æçæå¸', en: 'My Book', ja: 'ãã¤æå¸' },
  'nav.login':         { zh: 'ç»å¥', en: 'Sign in', ja: 'ã­ã°ã¤ã³' },
  'nav.logout':        { zh: 'ç»åº', en: 'Sign out', ja: 'ã­ã°ã¢ã¦ã' },
  'nav.new':           { zh: 'å¯«ä¸æ¯', en: 'New entry', ja: 'æ¸ã' },

  'common.save':       { zh: 'å²å­', en: 'Save', ja: 'ä¿å­' },
  'common.cancel':     { zh: 'åæ¶', en: 'Cancel', ja: 'ã­ã£ã³ã»ã«' },
  'common.submit':     { zh: 'éåº', en: 'Submit', ja: 'éä¿¡' },
  'common.loading':    { zh: 'è®åä¸­â¯', en: 'Loadingâ¦', ja: 'èª­ã¿è¾¼ã¿ä¸­â¯' },
  'common.saving':     { zh: 'å²å­ä¸­â¯', en: 'Savingâ¦', ja: 'ä¿å­ä¸­â¯' },
  'common.saved':      { zh: 'å·²å²å­ â', en: 'Saved â', ja: 'ä¿å­ãã¾ãã â' },
  'common.error':      { zh: 'ç¼çé¯èª¤', en: 'Something went wrong', ja: 'ã¨ã©ã¼ãçºçãã¾ãã' },
  'common.empty':      { zh: 'éæ²æä»»ä½ç´é', en: 'Nothing here yet', ja: 'ã¾ã ä½ãããã¾ãã' },

  // å­è§ç¶­åº¦ï¼è±è©ï¼
  'score.aroma':       { zh: 'é¦æ°£', en: 'Aroma', ja: 'é¦ã' },
  'score.acidity':     { zh: 'é¸å³', en: 'Acidity', ja: 'é¸å³' },
  'score.sweetness':   { zh: 'çæ', en: 'Sweetness', ja: 'çå³' },
  'score.bitterness':  { zh: 'è¦å³', en: 'Bitterness', ja: 'è¦å³' },
  'score.body':        { zh: 'éååº¦', en: 'Body', ja: 'ã³ã¯' },
  'score.aftertaste':  { zh: 'é¤é»', en: 'Aftertaste', ja: 'ä½é»' },

  // å­è§ç¶­åº¦ï¼åºè©ï¼
  'shop.flavor':       { zh: 'åå¡é¢¨å³', en: 'Flavor', ja: 'çç²ã®å³' },
  'shop.vibe':         { zh: 'æ°å', en: 'Vibe', ja: 'é°å²æ°' },
  'shop.stay':         { zh: 'ä¹ååå', en: 'Stay-friendly', ja: 'é·å±ãããã' },
  'shop.work':         { zh: 'å·¥ä½åå', en: 'Work-friendly', ja: 'ä½æ¥­ãããã' },
  'shop.dessert':      { zh: 'é¤é»çé»', en: 'Food & dessert', ja: 'ãã¼ãã»ãã¶ã¼ã' },
  'shop.value':        { zh: 'CP å¼', en: 'Value', ja: 'ã³ã¹ã' },
};

type I18nCtx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nCtx>({
  locale: 'zh',
  setLocale: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh');

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem('locale')) as Locale | null;
    if (stored === 'zh' || stored === 'en' || stored === 'ja') {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') localStorage.setItem('locale', l);
  };

  const t = (key: string): string => {
    const entry = DICT[key];
    if (!entry) return key;
    return entry[locale] ?? entry.zh;
  };

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
