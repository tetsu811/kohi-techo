'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Locale = 'zh' | 'en' | 'ja';

type Dict = Record<string, { zh: string; en: string; ja: string }>;

// Core shared strings. Page-specific strings use the inline ternary pattern.
const DICT: Dict = {
  'brand.name':        { zh: '珈琲手帖', en: 'Kōhī Techō', ja: '珈琲手帖' },
  'brand.tagline':     { zh: '一期一珈・每杯都值得記住', en: 'Every cup deserves to be remembered', ja: '一期一珈・一杯ずつの記憶' },

  'nav.home':          { zh: '首頁', en: 'Home', ja: 'ホーム' },
  'nav.beans':         { zh: '豆評', en: 'Beans', ja: '豆手帖' },
  'nav.map':           { zh: '咖啡地圖', en: 'Map', ja: '珈琲地図' },
  'nav.profile':       { zh: '我的手帖', en: 'My Book', ja: 'マイ手帖' },
  'nav.login':         { zh: '登入', en: 'Sign in', ja: 'ログイン' },
  'nav.logout':        { zh: '登出', en: 'Sign out', ja: 'ログアウト' },
  'nav.new':           { zh: '寫一杯', en: 'New entry', ja: '書く' },

  'common.save':       { zh: '儲存', en: 'Save', ja: '保存' },
  'common.cancel':     { zh: '取消', en: 'Cancel', ja: 'キャンセル' },
  'common.submit':     { zh: '送出', en: 'Submit', ja: '送信' },
  'common.loading':    { zh: '讀取中⋯', en: 'Loading…', ja: '読み込み中⋯' },
  'common.saving':     { zh: '儲存中⋯', en: 'Saving…', ja: '保存中⋯' },
  'common.saved':      { zh: '已儲存 ✓', en: 'Saved ✓', ja: '保存しました ✓' },
  'common.error':      { zh: '發生錯誤', en: 'Something went wrong', ja: 'エラーが発生しました' },
  'common.empty':      { zh: '還沒有任何紀錄', en: 'Nothing here yet', ja: 'まだ何もありません' },

  // 六角維度（豆評）
  'score.aroma':       { zh: '香氣', en: 'Aroma', ja: '香り' },
  'score.acidity':     { zh: '酸味', en: 'Acidity', ja: '酸味' },
  'score.sweetness':   { zh: '甜感', en: 'Sweetness', ja: '甘味' },
  'score.bitterness':  { zh: '苦味', en: 'Bitterness', ja: '苦味' },
  'score.body':        { zh: '醇厚度', en: 'Body', ja: 'コク' },
  'score.aftertaste':  { zh: '餘韻', en: 'Aftertaste', ja: '余韻' },

  // 六角維度（店評）
  'shop.flavor':       { zh: '咖啡風味', en: 'Flavor', ja: '珈琲の味' },
  'shop.vibe':         { zh: '氛圍', en: 'Vibe', ja: '雰囲気' },
  'shop.stay':         { zh: '久坐友善', en: 'Stay-friendly', ja: '長居しやすさ' },
  'shop.work':         { zh: '工作友善', en: 'Work-friendly', ja: '作業しやすさ' },
  'shop.dessert':      { zh: '餐點甜點', en: 'Food & dessert', ja: 'フード・デザート' },
  'shop.value':        { zh: 'CP 值', en: 'Value', ja: 'コスパ' },
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
