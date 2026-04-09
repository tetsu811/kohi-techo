'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getColors, Theme, FONT } from '@/lib/theme';
import { useI18n, Locale } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';

export default function Nav() {
  const { locale, setLocale, t } = useI18n();
  const { isLoggedIn, signOut } = useAuth();
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Theme | null) ?? 'light';
    setTheme(stored);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    window.dispatchEvent(new Event('themechange'));
  };

  const c = getColors(theme);

  const links = [
    { href: '/', label: t('nav.home') },
    { href: '/beans', label: t('nav.beans') },
    { href: '/map', label: t('nav.map') },
    { href: '/profile', label: t('nav.profile') },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: c.bg,
          borderBottom: `1px solid ${c.border}`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          {/* Brand */}
          <Link href="/" style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexShrink: 0 }}>
            <span
              style={{
                fontFamily: FONT.serif,
                fontSize: 22,
                fontWeight: 600,
                color: c.text,
                letterSpacing: '0.05em',
              }}
            >
              珈琲手帖
            </span>
            <span
              style={{
                fontFamily: FONT.hand,
                fontSize: 12,
                color: c.accent,
                fontWeight: 400,
              }}
            >
              Kōhī Techō
            </span>
          </Link>

          {/* Desktop links */}
          <div className="nav-desktop" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontFamily: FONT.cute,
                  fontSize: 14,
                  fontWeight: 500,
                  color: isActive(l.href) ? c.accent : c.textSub,
                  borderBottom: isActive(l.href) ? `2px solid ${c.accent}` : '2px solid transparent',
                  paddingBottom: 2,
                  transition: 'all 0.15s',
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop right */}
          <div className="nav-desktop" style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
            <Link
              href="/beans/new"
              style={{
                fontFamily: FONT.cute,
                fontSize: 13,
                fontWeight: 500,
                backgroundColor: c.accent,
                color: '#fff',
                padding: '7px 14px',
                borderRadius: 20,
                transition: 'all 0.15s',
              }}
            >
              ✎ {t('nav.new')}
            </Link>

            {mounted && (
              <button
                onClick={toggleTheme}
                title="theme"
                style={{
                  fontSize: 16,
                  color: c.textSub,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  transition: 'all 0.15s',
                }}
              >
                {theme === 'light' ? '☾' : '☀'}
              </button>
            )}

            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              style={{
                fontFamily: FONT.cute,
                fontSize: 12,
                color: c.textSub,
                backgroundColor: 'transparent',
                border: `1px solid ${c.border}`,
                borderRadius: 12,
                padding: '4px 8px',
                cursor: 'pointer',
              }}
            >
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
              <option value="en">EN</option>
            </select>

            {isLoggedIn ? (
              <button
                onClick={signOut}
                style={{
                  fontFamily: FONT.cute,
                  fontSize: 12,
                  color: c.textSub,
                  border: `1px solid ${c.border}`,
                  borderRadius: 12,
                  padding: '5px 12px',
                }}
              >
                {t('nav.logout')}
              </button>
            ) : (
              <Link
                href="/login"
                style={{
                  fontFamily: FONT.cute,
                  fontSize: 12,
                  color: c.textSub,
                  border: `1px solid ${c.border}`,
                  borderRadius: 12,
                  padding: '5px 12px',
                }}
              >
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-mobile-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none', // overridden by CSS media query
              fontSize: 22,
              color: c.text,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="nav-mobile-drawer"
          style={{
            position: 'fixed',
            top: 56,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 49,
            backgroundColor: c.bg,
            padding: 24,
            display: 'none', // overridden by CSS
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontFamily: FONT.cute,
                  fontSize: 20,
                  fontWeight: 500,
                  color: isActive(l.href) ? c.accent : c.text,
                }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/beans/new"
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: FONT.cute,
                fontSize: 16,
                fontWeight: 500,
                backgroundColor: c.accent,
                color: '#fff',
                padding: '12px 24px',
                borderRadius: 30,
                textAlign: 'center',
              }}
            >
              ✎ {t('nav.new')}
            </Link>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
              {mounted && (
                <button onClick={toggleTheme} style={{ fontSize: 18, color: c.textSub }}>
                  {theme === 'light' ? '☾ Dark' : '☀ Light'}
                </button>
              )}
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                style={{
                  fontFamily: FONT.cute,
                  fontSize: 14,
                  color: c.textSub,
                  backgroundColor: 'transparent',
                  border: `1px solid ${c.border}`,
                  borderRadius: 12,
                  padding: '4px 12px',
                }}
              >
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
                <option value="en">EN</option>
              </select>
            </div>
            {isLoggedIn ? (
              <button
                onClick={() => { signOut(); setMobileOpen(false); }}
                style={{ fontFamily: FONT.cute, fontSize: 14, color: c.textSub }}
              >
                {t('nav.logout')}
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                style={{ fontFamily: FONT.cute, fontSize: 14, color: c.textSub }}
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Responsive CSS injected via style tag */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
          .nav-mobile-drawer { display: block !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-btn { display: none !important; }
          .nav-mobile-drawer { display: none !important; }
        }
      `}</style>
    </>
  );
}
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getColors, Theme, FONT } from '@/lib/theme';
import { useI18n, Locale } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';

export default function Nav() {
  const { locale, setLocale, t } = useI18n();
  const { isLoggedIn, signOut } = useAuth();
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Theme | null) ?? 'light';
    setTheme(stored);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    window.dispatchEvent(new Event('themechange'));
  };

  const c = getColors(theme);

  const links = [
    { href: '/', label: t('nav.home') },
    { href: '/beans', label: t('nav.beans') },
    { href: '/map', label: t('nav.map') },
    { href: '/profile', label: t('nav.profile') },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: c.bg,
          borderBottom: `1px solid ${c.border}`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          {/* Brand */}
          <Link href="/" style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexShrink: 0 }}>
            <span
              style={{
                fontFamily: FONT.serif,
                fontSize: 22,
                fontWeight: 600,
                color: c.text,
                letterSpacing: '0.05em',
              }}
            >
              çç²æå¸
            </span>
            <span
              style={{
                fontFamily: FONT.hand,
                fontSize: 12,
                color: c.accent,
                fontWeight: 400,
              }}
            >
              KÅhÄ« TechÅ
            </span>
          </Link>

          {/* Desktop links */}
          <div className="nav-desktop" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontFamily: FONT.cute,
                  fontSize: 14,
                  fontWeight: 500,
                  color: isActive(l.href) ? c.accent : c.textSub,
                  borderBottom: isActive(l.href) ? `2px solid ${c.accent}` : '2px solid transparent',
                  paddingBottom: 2,
                  transition: 'all 0.15s',
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop right */}
          <div className="nav-desktop" style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
            <Link
              href="/beans/new"
              style={{
                fontFamily: FONT.cute,
                fontSize: 13,
                fontWeight: 500,
                backgroundColor: c.accent,
                color: '#fff',
                padding: '7px 14px',
                borderRadius: 20,
                transition: 'all 0.15s',
              }}
            >
              â {t('nav.new')}
            </Link>

            {mounted && (
              <button
                onClick={toggleTheme}
                title="theme"
                style={{
                  fontSize: 16,
                  color: c.textSub,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  transition: 'all 0.15s',
                }}
              >
                {theme === 'light' ? 'â¾' : 'â'}
              </button>
            )}

            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              style={{
                fontFamily: FONT.cute,
                fontSize: 12,
                color: c.textSub,
                backgroundColor: 'transparent',
                border: `1px solid ${c.border}`,
                borderRadius: 12,
                padding: '4px 8px',
                cursor: 'pointer',
              }}
            >
              <option value="zh">ä¸­æ</option>
              <option value="ja">æ¥æ¬èª</option>
              <option value="en">EN</option>
            </select>

            {isLoggedIn ? (
              <button
                onClick={signOut}
                style={{
                  fontFamily: FONT.cute,
                  fontSize: 12,
                  color: c.textSub,
                  border: `1px solid ${c.border}`,
                  borderRadius: 12,
                  padding: '5px 12px',
                }}
              >
                {t('nav.logout')}
              </button>
            ) : (
              <Link
                href="/login"
                style={{
                  fontFamily: FONT.cute,
                  fontSize: 12,
                  color: c.textSub,
                  border: `1px solid ${c.border}`,
                  borderRadius: 12,
                  padding: '5px 12px',
                }}
              >
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-mobile-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none', // overridden by CSS media query
              fontSize: 22,
              color: c.text,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {mobileOpen ? 'â' : 'â°'}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="nav-mobile-drawer"
          style={{
            position: 'fixed',
            top: 56,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 49,
            backgroundColor: c.bg,
            padding: 24,
            display: 'none', // overridden by CSS
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontFamily: FONT.cute,
                  fontSize: 20,
                  fontWeight: 500,
                  color: isActive(l.href) ? c.accent : c.text,
                }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/beans/new"
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: FONT.cute,
                fontSize: 16,
                fontWeight: 500,
                backgroundColor: c.accent,
                color: '#fff',
                padding: '12px 24px',
                borderRadius: 30,
                textAlign: 'center',
              }}
            >
              â {t('nav.new')}
            </Link>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
              {mounted && (
                <button onClick={toggleTheme} style={{ fontSize: 18, color: c.textSub }}>
                  {theme === 'light' ? 'â¾ Dark' : 'â Light'}
                </button>
              )}
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                style={{
                  fontFamily: FONT.cute,
                  fontSize: 14,
                  color: c.textSub,
                  backgroundColor: 'transparent',
                  border: `1px solid ${c.border}`,
                  borderRadius: 12,
                  padding: '4px 12px',
                }}
              >
                <option value="zh">ä¸­æ</option>
                <option value="ja">æ¥æ¬èª</option>
                <option value="en">EN</option>
              </select>
            </div>
            {isLoggedIn ? (
              <button
                onClick={() => { signOut(); setMobileOpen(false); }}
                style={{ fontFamily: FONT.cute, fontSize: 14, color: c.textSub }}
              >
                {t('nav.logout')}
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                style={{ fontFamily: FONT.cute, fontSize: 14, color: c.textSub }}
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Responsive CSS injected via style tag */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
          .nav-mobile-drawer { display: block !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-btn { display: none !important; }
          .nav-mobile-drawer { display: none !important; }
        }
      `}</style>
    </>
  
  DåuRI¦öâ
