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
    hero1: locale === 'ja' ? '一期一珈。' : locale === 'en' ? 'Every cup,' : '一期一珈，',
    hero2: locale === 'ja' ? '一杯ずつを、書き留めて。' : locale === 'en' ? 'worth remembering.' : '每一杯都值得被記住。',
    sub: locale === 'ja'
      ? '珈琲を飲むたびに、六角のスコアと小さな物語を綴ろう。'
      : locale === 'en'
      ? 'Log every coffee with a hex-score and a little story.'
      : '用六角雷達圖與三段小札記，把每一杯咖啡存進你的手帖。',
    ctaWrite: locale === 'ja' ? '一杯書く' : locale === 'en' ? 'Write a cup' : '寫一杯',
    ctaMap:   locale === 'ja' ? '珈琲地図を開く' : locale === 'en' ? 'Open the map' : '打開咆啡地圖',

    feat1Title: locale === 'ja' ? '六角の味わい' : locale === 'en' ? 'Six-axis tasting' : '六角風味',
    feat1Desc:  locale === 'ja' ? '香り、酸味、甘味、苦味、コク、余韻。' : locale === 'en' ? 'Aroma, acidity, sweetness, bitterness, body, aftertaste.' : '香氣、酸味、甜感、苦味、醇厚、餘韻。',

    feat2Title: locale === 'ja' ? '三段の物語' : locale === 'en' ? 'Three-line story' : '三段式札記',
    feat2Desc:  locale === 'ja' ? '第一口、思い出す風味、友への一言。' : locale === 'en' ? 'First sip, flavor memory, a note for a friend.' : '第一口印象、聯想風味、推薦給朋友的一句話。',

    feat3Title: locale === 'ja' ? '台湾の珈琲地図' : locale === 'en' ? 'Taiwan coffee map' : '台灣咖啡地圖',
    feat3Desc:  locale === 'ja' ? '美味しさも、居心地も、長居できる時間も。' : locale === 'en' ? 'Flavor, vibe, and how long you can stay.' : '風味、氛圍、還有可以待多久。',
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
            — Kōhī Techō ・ 珈琲手帖 —
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
              ✎ {t.ctaWrite}
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
              ☕ {t.ctaMap}
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
              耶加雪菲
            </div>
            <div style={{ fontFamily: FONT.cute, fontSize: 12, color: c.textSub, marginBottom: 20 }}>
              Yirgacheffe · 淺焙 · 手沖
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
              「杏桃乾的酸甜，
              <br />
              尾韻有一黝黑糖的溫柔。」
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
              民生社區・小店
            </div>
            <div style={{ fontFamily: FONT.cute, fontSize: 12, color: c.textSub, marginBottom: 18 }}>
              久坐友善 ★★★★☆
            </div>
            <div
              style={{
                fontFamily: FONT.hand,
                fontSize: 13,
                color: c.text,
                lineHeight: 1.9,
              }}
            >
              適合下午三點，
              <br />
              一個人發呆的地方。
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
          { title: t.feat1Title, desc: t.feat1Desc, icon: '◆' },
          { title: t.feat2Title, desc: t.feat2Desc, icon: '✎' },
          { title: t.feat3Title, desc: t.feat3Desc, icon: '◉' },
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
  );
}
