'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getColors, Theme, FONT } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';

export default function HomePage() {
  const { locale } = useI18n();
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const update = () => setTheme((localStorage.getItem('theme') as Theme) ?? 'light');
    update();
    window.addEventListener('themechange', update);
    return () => window.removeEventListener('themechange', update);
  }, []);

  const c = getColors(theme);

  const t = {
    hero1: locale === 'ja' ? 'ä¸æä¸çã' : locale === 'en' ? 'Every cup,' : 'ä¸æä¸çï¼',
    hero2: locale === 'ja' ? 'ä¸æ¯ãã¤ããæ¸ãçãã¦ã' : locale === 'en' ? 'worth remembering.' : 'æ¯ä¸æ¯é½å¼å¾è¢«è¨ä½ã',
    sub: locale === 'ja'
      ? 'çç²ãé£²ããã³ã«ãå­è§ã®ã¹ã³ã¢ã¨å°ããªç©èªãç¶´ããã'
      : locale === 'en'
      ? 'Log every coffee with a hex-score and a little story.'
      : 'ç¨å­è§é·éåèä¸æ®µå°æ­è¨ï¼ææ¯ä¸æ¯åå¡å­é²ä½ çæå¸ã',
    ctaWrite: locale === 'ja' ? 'ä¸æ¯æ¸ã' : locale === 'en' ? 'Write a cup' : 'å¯«ä¸æ¯',
    ctaMap:   locale === 'ja' ? 'çç²å°å³ãéã' : locale === 'en' ? 'Open the map' : 'æéåå¡å°å',

    feat1Title: locale === 'ja' ? 'å­è§ã®å³ãã' : locale === 'en' ? 'Six-axis tasting' : 'å­è§é¢¨å³',
    feat1Desc:  locale === 'ja' ? 'é¦ããé¸å³ãçå³ãè¦å³ãã³ã¯ãä½é»ã' : locale === 'en' ? 'Aroma, acidity, sweetness, bitterness, body, aftertaste.' : 'é¦æ°£ãé¸å³ãçæãè¦å³ãéåãé¤é»ã',

    feat2Title: locale === 'ja' ? 'ä¸æ®µã®ç©èª' : locale === 'en' ? 'Three-line story' : 'ä¸æ®µå¼æ­è¨',
    feat2Desc:  locale === 'ja' ? 'ç¬¬ä¸å£ãæãåºãé¢¨å³ãåã¸ã®ä¸è¨ã' : locale === 'en' ? 'First sip, flavor memory, a note for a friend.' : 'ç¬¬ä¸å£å°è±¡ãè¯æ³é¢¨å³ãæ¨è¦çµ¦æåçä¸å¥è©±ã',

    feat3Title: locale === 'ja' ? 'å°æ¹¾ã®çç²å°å³' : locale === 'en' ? 'Taiwan coffee map' : 'å°ç£åå¡å°å',
    feat3Desc:  locale === 'ja' ? 'ç¾å³ããããå±å¿å°ããé·å±ã§ããæéãã' : locale === 'en' ? 'Flavor, vibe, and how long you can stay.' : 'é¢¨å³ãæ°åãéæå¯ä»¥å¾å¤ä¹ã',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: c.bg, color: c.text }}>
      {/* HERO */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '80px 24px 60px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 60,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: FONT.hand,
              fontSize: 14,
              color: c.accent,
              letterSpacing: '0.15em',
              marginBottom: 16,
            }}
          >
            â KÅhÄ« TechÅ ã» çç²æå¸ â
          </div>
          <h1
            style={{
              fontFamily: FONT.serif,
              fontSize: 56,
              fontWeight: 600,
              lineHeight: 1.25,
              margin: 0,
              color: c.text,
            }}
          >
            {t.hero1}
            <br />
            {t.hero2}
          </h1>
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 16,
              color: c.textSub,
              marginTop: 24,
              maxWidth: 480,
              lineHeight: 1.9,
            }}
          >
            {t.sub}
          </p>

          <div style={{ display: 'flex', gap: 14, marginTop: 36 }}>
            <Link
              href="/beans/new"
              style={{
                fontFamily: FONT.cute,
                fontSize: 15,
                fontWeight: 500,
                backgroundColor: c.accent,
                color: '#fff',
                padding: '14px 28px',
                borderRadius: 30,
                transition: 'all 0.15s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              â {t.ctaWrite}
            </Link>
            <Link
              href="/map"
              style={{
                fontFamily: FONT.cute,
                fontSize: 15,
                fontWeight: 500,
                color: c.text,
                border: `1.5px solid ${c.border}`,
                padding: '14px 28px',
                borderRadius: 30,
                transition: 'all 0.15s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              â {t.ctaMap}
            </Link>
          </div>
        </div>

        {/* Decorative card stack */}
        <div style={{ position: 'relative', height: 420 }}>
          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 40,
              width: 280,
              height: 360,
              backgroundColor: c.card,
              border: `1px solid ${c.border}`,
              borderRadius: 12,
              transform: 'rotate(-4deg)',
              boxShadow: '0 20px 40px rgba(62,39,35,0.08)',
              padding: 28,
            }}
          >
            <div style={{ fontFamily: FONT.hand, fontSize: 13, color: c.accent, marginBottom: 6 }}>
              No.042
            </div>
            <div style={{ fontFamily: FONT.serif, fontSize: 22, fontWeight: 600, color: c.text, marginBottom: 4 }}>
              è¶å éªè²
            </div>
            <div style={{ fontFamily: FONT.cute, fontSize: 12, color: c.textSub, marginBottom: 20 }}>
              Yirgacheffe Â· æ·ºç Â· ææ²
            </div>
            <div
              style={{
                fontFamily: FONT.hand,
                fontSize: 14,
                color: c.text,
                lineHeight: 1.9,
                borderTop: `1px dashed ${c.border}`,
                paddingTop: 16,
              }}
            >
              ãææ¡ä¹¾çé¸çï¼
              <br />
              å°¾é»æä¸é»é»ç³çæº«æãã
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              width: 260,
              height: 320,
              backgroundColor: c.accentSoft,
              border: `1px solid ${c.border}`,
              borderRadius: 12,
              transform: 'rotate(3deg)',
              boxShadow: '0 20px 40px rgba(62,39,35,0.08)',
              padding: 28,
            }}
          >
            <div style={{ fontFamily: FONT.hand, fontSize: 13, color: c.accent, marginBottom: 6 }}>
              Shop Log
            </div>
            <div style={{ fontFamily: FONT.serif, fontSize: 20, fontWeight: 600, color: c.text, marginBottom: 4 }}>
              æ°çç¤¾åã»å°åº
            </div>
            <div style={{ fontFamily: FONT.cute, fontSize: 12, color: c.textSub, marginBottom: 18 }}>
              ä¹ååå âââââ
            </div>
            <div
              style={{
                fontFamily: FONT.hand,
                fontSize: 13,
                color: c.text,
                lineHeight: 1.9,
              }}
            >
              é©åä¸åä¸é»ï¼
              <br />
              ä¸åäººç¼åçå°æ¹ã
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '40px 24px 100px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
        }}
      >
        {[
          { title: t.feat1Title, desc: t.feat1Desc, icon: 'â' },
          { title: t.feat2Title, desc: t.feat2Desc, icon: 'â' },
          { title: t.feat3Title, desc: t.feat3Desc, icon: 'â' },
        ].map((f, i) => (
          <div
            key={i}
            style={{
              backgroundColor: c.card,
              border: `1px solid ${c.border}`,
              borderRadius: 12,
              padding: 32,
            }}
          >
            <div style={{ fontSize: 24, color: c.accent, marginBottom: 16 }}>{f.icon}</div>
            <h3 style={{ fontFamily: FONT.cute, fontSize: 18, fontWeight: 600, color: c.text, margin: 0, marginBottom: 10 }}>
              {f.title}
            </h3>
            <p style={{ fontFamily: FONT.sans, fontSize: 13, color: c.textSub, lineHeight: 1.8, margin: 0 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </section>
    </div>
  DEuRI¦öâ
