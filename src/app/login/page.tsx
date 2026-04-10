'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getColors, Theme, FONT } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params?.get('next') ?? '/beans';
  const { locale } = useI18n();
  const [theme, setTheme] = useState<Theme>('light');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTheme((localStorage.getItem('theme') as Theme) ?? 'light');
    update();
    window.addEventListener('themechange', update);
    return () => window.removeEventListener('themechange', update);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push(next);
    });
  }, [router, next]);

  const c = getColors(theme);

  const tx = {
    welcome: locale === 'ja' ? 'おかえりなさい。' : locale === 'en' ? 'Welcome back.' : '歡迎回到手帖。',
    sub: locale === 'ja' ? 'Googleアカウントで始めよう。' : locale === 'en' ? 'Sign in with your Google account.' : '使用 Google 帳號登入。',
    google: locale === 'ja' ? 'Googleでログイン' : locale === 'en' ? 'Continue with Google' : '使用 Google 登入',
    error: locale === 'ja' ? 'エラーが発生しました' : locale === 'en' ? 'Something went wrong' : '發生錯誤',
  };

  const handleGoogleLogin = async () => {
    setMsg(null);
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : tx.error);
      setSubmitting(false);
    }
  };

  const [hover, setHover] = useState(false);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: c.bg, color: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: FONT.hand, fontSize: 13, color: c.accent }}>— 珈琲手帖 —</div>
          <h1 style={{ fontFamily: FONT.serif, fontSize: 28, fontWeight: 600, color: c.text, margin: '6px 0 4px' }}>{tx.welcome}</h1>
          <p style={{ fontFamily: FONT.cute, fontSize: 13, color: c.textSub, margin: 0 }}>{tx.sub}</p>
        </div>
        {msg && (<div style={{ fontFamily: FONT.cute, fontSize: 12, color: '#d32f2f', textAlign: 'center', marginBottom: 16, padding: '8px 12px', backgroundColor: theme === 'dark' ? '#3e1a1a' : '#fde8e8', borderRadius: 8 }}>{msg}</div>)}
        <button onClick={handleGoogleLogin} disabled={submitting} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ width: '100%', padding: '12px 20px', backgroundColor: hover ? (theme === 'dark' ? '#333' : '#f1f1f1') : (theme === 'dark' ? '#2a2a2a' : '#fff'), color: c.text, border: `1px solid ${c.border}`, borderRadius: 30, fontFamily: FONT.cute, fontSize: 14, fontWeight: 500, cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.15s ease', transform: hover && !submitting ? 'scale(1.02)' : 'scale(1)' }}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          {submitting ? (<span>{locale === 'ja' ? '接続中...' : locale === 'en' ? 'Connecting...' : '連線中...'}</span>) : (<span>{tx.google}</span>)}
        </button>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ fontFamily: FONT.cute, fontSize: 11, color: c.textMuted, margin: 0 }}>{locale === 'ja' ? '安全なGoogle認証を使用しています' : locale === 'en' ? 'Secured by Google Authentication' : '使用安全的 Google 驗證'}</p>
        </div>
      </div>
    </div>
  );
}
