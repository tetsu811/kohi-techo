'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getColors, Theme, FONT } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params?.get('next') ?? '/beans';
  const { locale, t } = useI18n();
  const [theme, setTheme] = useState<Theme>('light');

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTheme((localStorage.getItem('theme') as Theme) ?? 'light');
    update();
    window.addEventListener('themechange', update);
    return () => window.removeEventListener('themechange', update);
  }, []);

  const c = getColors(theme);

  const tx = {
    welcome: locale === 'ja' ? 'おかえりなさい。' : locale === 'en' ? 'Welcome back.' : '歡迎回到手帖。',
    subSignin: locale === 'ja' ? 'あなたの一杯を続けよう。' : locale === 'en' ? 'Continue your tasting journal.' : '繼續你的品茗紀錄。',
    subSignup: locale === 'ja' ? '珈琲手帖を始めよう。' : locale === 'en' ? 'Start your coffee techō.' : '開啟你的咖啡手帖。',
    email: 'Email',
    password: locale === 'ja' ? 'パスワード' : locale === 'en' ? 'Password' : '密碼',
    name: locale === 'ja' ? 'お名前' : locale === 'en' ? 'Display name' : '顯示名稱',
    signin: locale === 'ja' ? 'ログイン' : locale === 'en' ? 'Sign in' : '登入',
    signup: locale === 'ja' ? '新規登録' : locale === 'en' ? 'Sign up' : '註冊',
    switchToSignup: locale === 'ja' ? 'アカウントを作る →' : locale === 'en' ? 'Create account →' : '還沒有帳號？註冊 →',
    switchToSignin: locale === 'ja' ? '← ログインに戻る' : locale === 'en' ? '← Back to sign in' : '← 已有帳號？登入',
    checkEmail: locale === 'ja' ? 'メールをご確認ください' : locale === 'en' ? 'Check your email to confirm' : '請到信箱確認註冊信',
  };

  const handleSubmit = async () => {
    setMsg(null);
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || email.split('@')[0] },
          },
        });
        if (error) throw error;
        setMsg(tx.checkEmail);
      }
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: c.bgSoft,
    border: `1px solid ${c.border}`,
    borderRadius: 10,
    color: c.text,
    fontFamily: FONT.sans,
    fontSize: 14,
    outline: 'none',
    marginBottom: 12,
  } as const;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: c.bg,
        color: c.text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: c.card,
          border: `1px solid ${c.border}`,
          borderRadius: 16,
          padding: 40,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: FONT.hand, fontSize: 13, color: c.accent }}>— 珈琲手帖 —</div>
          <h1 style={{ fontFamily: FONT.serif, fontSize: 28, fontWeight: 600, color: c.text, margin: '6px 0 4px' }}>
            {tx.welcome}
          </h1>
          <p style={{ fontFamily: FONT.cute, fontSize: 13, color: c.textSub, margin: 0 }}>
            {mode === 'signin' ? tx.subSignin : tx.subSignup}
          </p>
        </div>

        {mode === 'signup' && (
          <input
            placeholder={tx.name}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={inputStyle}
          />
        )}
        <input
          type="email"
          placeholder={tx.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder={tx.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {msg && (
          <div
            style={{
              fontFamily: FONT.cute,
              fontSize: 12,
              color: c.accent,
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            {msg}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: c.accent,
            color: '#fff',
            borderRadius: 30,
            fontFamily: FONT.cute,
            fontSize: 14,
            fontWeight: 500,
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? t('common.loading') : mode === 'signin' ? tx.signin : tx.signup}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            style={{ fontFamily: FONT.cute, fontSize: 12, color: c.textSub }}
          >
            {mode === 'signin' ? tx.switchToSignup : tx.switchToSignin}
          </button>
        </div>
      </div>
    </div>
  );
}
